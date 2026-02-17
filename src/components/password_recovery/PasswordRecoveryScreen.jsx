import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PasswordRecoveryHeader from './PasswordRecoveryHeader';
import EmailSendForm from './EmailSendForm';
import PasswordResetForm from './PasswordResetForm';

const PasswordRecovery = ({ route }) => {
  // Step 1 = Email Form, Step 2 = Reset Form
  const [step, setStep] = useState(1);
  const [emailError, setEmailError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Role passed from Login -> PasswordRecovery.
  // Determines which backend endpoint to hit.
  const role = route?.params?.role || 'student';

  // Called by EmailSendForm after OTP is successfully sent.
  const handleOtpSent = (email) => {
    setEmailError('');
    setUserEmail(email);
    setStep(2);
  };

  // Clear email error when user starts typing
  const clearEmailError = () => {
    setEmailError('');
  };

  // Handler for resetting password (Step 2)
  const handleResetPassword = () => {
    // API is handled inside PasswordResetForm.
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <PasswordRecoveryHeader />

            {step === 1 ? (
              <EmailSendForm
                role={role}
                onOtpSent={handleOtpSent}
                emailError={emailError}
                setEmailError={setEmailError}
                onClearError={clearEmailError}
              />
            ) : (
              <PasswordResetForm
                onSubmit={handleResetPassword}
                email={userEmail} // Pass email to reset form if needed
                role={role}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
});

export default PasswordRecovery;