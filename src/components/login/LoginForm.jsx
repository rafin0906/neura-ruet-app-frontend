import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../../utils/api/apiClient';
import {
  AUTH_ROLE_STORAGE_KEY,
  AUTH_TOKEN_KIND_STORAGE_KEY,
  AUTH_TOKEN_STORAGE_KEY,
} from '../../utils/api/apiConfig';

const LoginForm = ({ role }) => {
  const { control, handleSubmit } = useForm();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({
    userId: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // Dynamic content based on role
  const getLabel = () => {
    if (role === 'teacher') return 'Neura Teacher ID';
    if (role === 'cr') return 'Neura CR ID';
    return 'Neura ID';
  };

  const getPlaceholder = () => {
    if (role === 'teacher') return 'e.g. NEURAT1001';
    if (role === 'cr') return 'e.g. NEURACR3037';
    return 'e.g. NEURA2303137';
  };

  const onSubmit = async (data) => {
    setLoading(true);
    // Clear previous errors
    setFieldErrors({ userId: '', password: '' });

    try {
      // ✅ AUTH (Backend: /api/v1/{students|teachers|crs}/login)
      // Backend returns: { login_ok: true, setup_token: "..." }
      // We store setup_token as the "auth_token" so the Axios interceptor automatically
      // attaches it for profile-setup endpoints.

      const userId = (data.userId || '').trim();
      const password = data.password;

      let endpoint = null;
      let payload = null;
      let nextScreen = null;

      if (role === 'student') {
        endpoint = '/api/v1/students/login';
        payload = { neura_id: userId, password };
        nextScreen = 'ProfileSetUpStudent';
      } else if (role === 'teacher') {
        endpoint = '/api/v1/teachers/login';
        payload = { neura_teacher_id: userId, password };
        nextScreen = 'ProfileSetUpTeacher';
      } else if (role === 'cr') {
        endpoint = '/api/v1/crs/login';
        payload = { neura_cr_id: userId, password };
        nextScreen = 'ProfileSetUpCr';
      }

      if (!endpoint || !payload || !nextScreen) {
        setFieldErrors({ userId: 'Invalid role', password: '' });
        return;
      }

      const response = await API.post(endpoint, payload);
      const setupToken = response?.data?.setup_token;
      if (setupToken) {
        await AsyncStorage.multiSet([
          [AUTH_TOKEN_STORAGE_KEY, setupToken],
          [AUTH_TOKEN_KIND_STORAGE_KEY, 'setup'],
          [AUTH_ROLE_STORAGE_KEY, role],
        ]);
      }

      navigation.navigate(nextScreen);
    } catch (error) {
      // `API` throws a formatted error from src/utils/api/errorHandler.js
      const detail = error?.data?.detail;
      if (error?.status === 400 && typeof detail === 'string') {
        const lower = detail.toLowerCase();
        if (lower.includes('password')) {
          setFieldErrors({ userId: '', password: detail });
        } else {
          // Handles: Neura ID invalid / Neura Teacher ID invalid / Neura CR ID invalid
          setFieldErrors({ userId: detail, password: '' });
        }
        return;
      }

      // FastAPI validation errors (missing fields, min length, etc.)
      // Example shape: [{ loc: ['body','neura_id'], msg: 'Field required', ... }]
      if (error?.status === 422 && Array.isArray(detail)) {
        const idField =
          role === 'teacher'
            ? 'neura_teacher_id'
            : role === 'cr'
              ? 'neura_cr_id'
              : 'neura_id';

        let userIdMsg = '';
        let passwordMsg = '';

        for (const item of detail) {
          const loc = Array.isArray(item?.loc) ? item.loc : [];
          const field = loc[loc.length - 1];
          const msg = typeof item?.msg === 'string' ? item.msg : 'Invalid input';

          if (field === idField) userIdMsg = msg;
          if (field === 'password') passwordMsg = msg;
        }

        setFieldErrors({
          userId: userIdMsg || '',
          password: passwordMsg || (!userIdMsg ? 'Invalid input' : ''),
        });
        return;
      }

      setFieldErrors({
        userId: 'Network error',
        password: typeof error?.message === 'string' ? error.message : 'Try again',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFieldError = (field) => {
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <View style={styles.container}>
      {/* ID Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{getLabel()}</Text>
        <Controller
          control={control}
          name="userId"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, fieldErrors.userId && styles.inputError]}
              onBlur={onBlur}
              onChangeText={(text) => {
                onChange(text);
                clearFieldError('userId');
              }}
              value={value}
              placeholder={getPlaceholder()}
              placeholderTextColor="#A6A6A6"
              autoCapitalize="none"
              editable={!loading}
            />
          )}
        />
        {fieldErrors.userId ? (
          <Text style={styles.errorText}>{fieldErrors.userId}</Text>
        ) : null}
      </View>

      {/* Password Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, styles.passwordInput, fieldErrors.password && styles.inputError]}
                onBlur={onBlur}
                onChangeText={(text) => {
                  onChange(text);
                  clearFieldError('password');
                }}
                value={value}
                placeholder="password"
                placeholderTextColor="#A6A6A6"
                secureTextEntry={secureTextEntry}
                editable={!loading}
              />
            )}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setSecureTextEntry(!secureTextEntry)}
            activeOpacity={0.8}
            disabled={loading}
          >
            {secureTextEntry ? (
              <Image
                source={require('../../../assets/icons/password_hide_icon.png')}
                style={{ width: 20, height: 20, tintColor: '#A6A6A6' }}
                resizeMode="contain"
              />
            ) : (
              <Image
                source={require('../../../assets/icons/password_show_icon.png')}
                style={{ width: 20, height: 20, tintColor: '#FFFFFF' }}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </View>
        {fieldErrors.password ? (
          <Text style={styles.errorText}>{fieldErrors.password}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.forgotContainer}
          // Pass the currently selected role so PasswordRecovery knows
          // which backend endpoint to call (students/teachers/crs).
          onPress={() => navigation.navigate('PasswordRecovery', { role })}
          activeOpacity={0.8}
          disabled={loading}
        >
          <Text style={styles.forgotText}>Forget Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <View style={{ marginTop: 20 }}>
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          activeOpacity={0.8}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#212121',
    borderRadius: 14,
    height: 54,
    paddingHorizontal: 20,
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#FFFFFF',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#C1B748',
  },
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 20,
    height: '100%',
    justifyContent: 'center',
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#C1B748',
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#C1B748',
    marginTop: 4,
    marginLeft: 4,
  },
  loginButton: {
    backgroundColor: '#99EF5E',
    borderRadius: 30,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#000000',
  },
});

export default LoginForm;