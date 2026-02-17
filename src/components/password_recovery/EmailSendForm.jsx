import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';

import API from '../../utils/api/apiClient';

const EmailSendForm = ({ role, onOtpSent, emailError, setEmailError, onClearError }) => {
  const { control, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (data) => {
    setLoading(true);

    try {
      const endpoint =
        role === 'teacher'
          ? '/api/v1/teachers/forget-password'
          : role === 'cr'
            ? '/api/v1/crs/forget-password'
            : '/api/v1/students/forget-password';

      // Backend expects: { email }
      await API.post(endpoint, { email: (data.email || '').trim() });

      if (setEmailError) setEmailError('');
      if (onOtpSent) onOtpSent((data.email || '').trim());
    } catch (error) {
      // `API` throws a formatted error from src/utils/api/errorHandler.js
      const msg = typeof error?.message === 'string' ? error.message : 'Failed to send OTP. Please try again.';
      if (setEmailError) setEmailError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (text, onChange) => {
    onChange(text);
    if (onClearError) onClearError();
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <Controller
          control={control}
          name="email"
          rules={{
            required: "Email is required",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Invalid email format"
            }
          }}
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <>
              <TextInput
                style={[
                  styles.input,
                  (emailError || error) && styles.inputError
                ]}
                onBlur={onBlur}
                onChangeText={(text) => handleEmailChange(text, onChange)}
                value={value}
                placeholder="Enter your app-linked email to get OTP"
                placeholderTextColor="#A6A6A6"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
              {/* Show validation error first, then server error */}
              {error && !emailError && (
                <Text style={styles.errorText}>{error.message}</Text>
              )}
            </>
          )}
        />

        {/* Show server error from parent */}
        {emailError && (
          <Text style={styles.errorText}>{emailError}</Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit(handleSendOTP)}
        activeOpacity={0.8}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Sending...' : 'Send OTP'}
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
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#000000',
  },
});

export default EmailSendForm;