import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';

import API from '../../utils/api/apiClient';

const PasswordResetForm = ({ onSubmit, email, role }) => {
  const { control, handleSubmit, watch } = useForm();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  
  // State for password visibility toggles
  const [secureNewPassword, setSecureNewPassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);

  const [fieldErrors, setFieldErrors] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  const newPassword = watch('newPassword');

  const handleFormSubmit = async (data) => {
    setLoading(true);
    // Clear previous errors
    setFieldErrors({ otp: '', newPassword: '', confirmPassword: '' });

    try {
      // Client-side validation for password match
      if (data.newPassword !== data.confirmPassword) {
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match'
        }));
        setLoading(false);
        return;
      }

      // Call mock API - Replace with your actual API call
      const endpoint =
        role === 'teacher'
          ? '/api/v1/teachers/reset-password'
          : role === 'cr'
            ? '/api/v1/crs/reset-password'
            : '/api/v1/students/reset-password';

      const payload = {
        email,
        otp: String(data.otp || '').trim(),
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      };

      console.log('Resetting password for email:', email);
      const response = await API.post(endpoint, payload);

      console.log('Password reset successful:', response);

      // Call parent onSubmit if provided
      if (onSubmit) {
        await onSubmit(data, response);
      }

      // Navigate back to login after successful reset
      navigation.goBack();

    } catch (error) {
      console.log('Password reset error:', error);

      const detail = error?.data?.detail;
      if (error?.status === 400 && typeof detail === 'string') {
        const lower = detail.toLowerCase();
        if (lower.includes('otp')) {
          setFieldErrors(prev => ({ ...prev, otp: detail }));
          return;
        }
        if (lower.includes('confirm password')) {
          setFieldErrors(prev => ({ ...prev, confirmPassword: detail }));
          return;
        }

        setFieldErrors(prev => ({ ...prev, otp: detail }));
        return;
      }

      // Validation errors (422)
      if (error?.status === 422 && Array.isArray(detail)) {
        const next = { otp: '', newPassword: '', confirmPassword: '' };
        for (const item of detail) {
          const loc = Array.isArray(item?.loc) ? item.loc : [];
          const field = loc[loc.length - 1];
          const msg = typeof item?.msg === 'string' ? item.msg : 'Invalid input';

          if (field === 'otp') next.otp = msg;
          if (field === 'new_password') next.newPassword = msg;
          if (field === 'confirm_password') next.confirmPassword = msg;
          if (field === 'email') next.otp = msg;
        }
        setFieldErrors(next);
        return;
      }

      setFieldErrors({
        otp: typeof error?.message === 'string' ? error.message : 'Failed to reset password. Please try again.',
        newPassword: '',
        confirmPassword: '',
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
      {/* OTP Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>OTP</Text>
        <Controller
          control={control}
          name="otp"
          rules={{
            required: "OTP is required",
            pattern: {
              value: /^\d+$/,
              message: "OTP must contain only numbers"
            },
            minLength: {
              value: 4,
              message: "OTP must be 4 digits"
            }
          }}
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <>
              <TextInput
                style={[
                  styles.input,
                  (fieldErrors.otp || error) && styles.inputError
                ]}
                onBlur={onBlur}
                onChangeText={(text) => {
                  onChange(text);
                  clearFieldError('otp');
                }}
                value={value}
                placeholder="Enter OTP to reset the password"
                placeholderTextColor="#A6A6A6"
                keyboardType="number-pad"
                editable={!loading}
              />
              {/* Show validation error first, then API error */}
              {error && !fieldErrors.otp && (
                <Text style={styles.errorText}>{error.message}</Text>
              )}
            </>
          )}
        />
        {fieldErrors.otp ? (
          <Text style={styles.errorText}>{fieldErrors.otp}</Text>
        ) : null}
      </View>

      {/* New Password Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>New Password  *</Text>
        <View style={styles.passwordContainer}>
          <Controller
            control={control}
            name="newPassword"
            rules={{
              required: "New password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters"
              }
            }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    (fieldErrors.newPassword || error) && styles.inputError
                  ]}
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    onChange(text);
                    clearFieldError('newPassword');
                    // Also clear confirm password error when new password changes
                    if (fieldErrors.confirmPassword) {
                      setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  value={value}
                  placeholder="Enter new password"
                  placeholderTextColor="#A6A6A6"
                  secureTextEntry={secureNewPassword}
                  editable={!loading}
                />
                {/* Show validation error first, then API error */}
                {error && !fieldErrors.newPassword && (
                  <Text style={styles.errorText}>{error.message}</Text>
                )}
              </>
            )}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setSecureNewPassword(!secureNewPassword)}
            activeOpacity={0.8}
            disabled={loading}
          >
            {secureNewPassword ? (
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
        {fieldErrors.newPassword ? (
          <Text style={styles.errorText}>{fieldErrors.newPassword}</Text>
        ) : null}
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm New Password  *</Text>
        <View style={styles.passwordContainer}>
          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: "Please confirm your password",
              validate: value => value === newPassword || "Passwords do not match"
            }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    (fieldErrors.confirmPassword || error) && styles.inputError
                  ]}
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    onChange(text);
                    clearFieldError('confirmPassword');
                  }}
                  value={value}
                  placeholder="Re-enter new password"
                  placeholderTextColor="#A6A6A6"
                  secureTextEntry={secureConfirmPassword}
                  editable={!loading}
                />
                {/* Show validation error first, then API error */}
                {error && !fieldErrors.confirmPassword && (
                  <Text style={styles.errorText}>{error.message}</Text>
                )}
              </>
            )}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setSecureConfirmPassword(!secureConfirmPassword)}
            activeOpacity={0.8}
            disabled={loading}
          >
            {secureConfirmPassword ? (
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
        {fieldErrors.confirmPassword ? (
          <Text style={styles.errorText}>{fieldErrors.confirmPassword}</Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit(handleFormSubmit)}
        activeOpacity={0.8}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </Text>
      </TouchableOpacity>
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
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#C1B748',
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#99EF5E',
    borderRadius: 30,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#000000',
  },
  // Added Styles for Password Hide/Show
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
    // Align eye vertically centered
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    height: 54, // Match input height for easy centering
  },
});

export default PasswordResetForm;