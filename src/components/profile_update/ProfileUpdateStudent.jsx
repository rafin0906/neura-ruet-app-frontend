import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal, // Imported Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import CustomDropDown from './CustomDropDown';

import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../../utils/api/apiClient';
import {
  AUTH_ROLE_STORAGE_KEY,
  AUTH_TOKEN_KIND_STORAGE_KEY,
  AUTH_TOKEN_STORAGE_KEY,
  LAST_ACCESS_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_ID_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
} from '../../utils/api/apiConfig';
import { useAuth } from '../../context/AuthContext';

const ProfileUpdateStudent = () => {
  const navigation = useNavigation();
  const { setAuthenticated, refreshProfile } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const busy = loadingProfile || submitting;

  // --- Modal State ---
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'success', // 'success' or 'error'
    title: '',
    message: '',
    onClose: () => setModalVisible(false),
  });

  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      fullName: '',
      rollNumber: '',
      department: '',
      section: '',
      series: '',
      mobileNumber: '',
      email: ''
    }
  });

  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const sections = ["A", "B", "C", "None"];

  // --- Helper to show Custom Modal ---
  const showModal = (type, title, message, onCloseAction) => {
    setModalConfig({
      type,
      title,
      message,
      onClose: () => {
        setModalVisible(false);
        if (onCloseAction) onCloseAction();
      }
    });
    setModalVisible(true);
  };

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const response = await API.get('/api/v1/students/profile-setup/me');
        const profile = response?.data;
        if (cancelled || !profile) return;

        setValue('fullName', profile.full_name ?? '');
        setValue('rollNumber', profile.roll_no ?? '');
        setValue('department', profile.dept ?? '');
        setValue('section', profile.section ?? '');
        setValue('series', profile.series != null ? String(profile.series) : '');
        setValue('mobileNumber', profile.mobile_no ?? '');
        setValue('email', profile.email ?? '');
      } catch (err) {
        showModal('error', 'Load Failed', err?.message || 'Failed to load profile data.');
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [setValue]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        full_name: (data.fullName || '').trim(),
        roll_no: data.rollNumber ? String(data.rollNumber).trim() : null,
        dept: (data.department || '').trim(),
        section: data.section === 'None' ? null : data.section,
        series: data.series ? Number(data.series) : null,
        mobile_no: (data.mobileNumber || '').trim(),
        email: (data.email || '').trim(),
      };

      const response = await API.post('/api/v1/students/profile-setup', payload);

      const accessToken = response?.data?.access_token;
      const refreshToken = response?.data?.refresh_token;
      const refreshTokenId = response?.data?.refresh_token_id;

      // Backend rotates tokens on profile update; persist them if provided.
      const pairs = [
        [AUTH_ROLE_STORAGE_KEY, 'student'],
        [AUTH_TOKEN_KIND_STORAGE_KEY, 'access'],
      ];
      if (typeof accessToken === 'string' && accessToken.length > 0) {
        pairs.push([AUTH_TOKEN_STORAGE_KEY, accessToken]);
        pairs.push([LAST_ACCESS_TOKEN_STORAGE_KEY, accessToken]);
      }
      if (typeof refreshToken === 'string' && refreshToken.length > 0) {
        pairs.push([REFRESH_TOKEN_STORAGE_KEY, refreshToken]);
      }
      if (typeof refreshTokenId === 'string' && refreshTokenId.length > 0) {
        pairs.push([REFRESH_TOKEN_ID_STORAGE_KEY, refreshTokenId]);
      }

      await AsyncStorage.multiSet(pairs);

      // Keep in-memory auth header in sync if tokens rotate.
      if (typeof accessToken === 'string' && accessToken.length > 0) {
        setAuthenticated({ role: 'student', accessToken });
      }

      // Refresh drawer/user card name immediately.
      await refreshProfile('student');

      showModal(
        'success',
        'Profile Updated',
        'Your profile has been updated successfully.',
        () => navigation.goBack()
      );
    } catch (err) {
      showModal('error', 'Update Failed', err?.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={10}
      >

        <StatusBar barStyle="light-content" backgroundColor="#000000" />

        {/* --- Header Row (Unchanged) --- */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Image source={require('../../../assets/icons/back_arrow_icon.png')} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.title}>Profile Update</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* Profile Icon */}
          <View style={styles.profileIconWrapper}>
            <View style={styles.iconCircle}>
              <Image
                source={require('../../../assets/icons/student_profile_icon.png')}
                style={styles.profileIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.profileLabel}>Student Profile</Text>
          </View>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <Controller
              control={control}
              name="fullName"
              rules={{ required: "Full name is required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder=""
                  placeholderTextColor="#4e4e4e"
                  editable={!busy}
                />
              )}
            />
            {errors.fullName && <Text style={styles.errorText}>{errors.fullName.message}</Text>}
          </View>

          {/* Roll Number (Read Only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Roll Number</Text>
            <Controller
              control={control}
              name="rollNumber"
              render={({ field: { value } }) => (
                <TextInput
                  style={[styles.input, styles.readOnlyInput]}
                  value={value}
                  editable={false}
                />
              )}
            />
          </View>

          {/* Department (Read Only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Department</Text>
            <Controller
              control={control}
              name="department"
              render={({ field: { value } }) => (
                <TextInput
                  style={[styles.input, styles.readOnlyInput]}
                  value={value}
                  editable={false}
                />
              )}
            />
          </View>

          {/* Section Dropdown */}
          <Controller
            control={control}
            name="section"
            rules={{ required: "Section is required" }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <CustomDropDown
                label="Section"
                value={value}
                isVisible={sectionModalVisible}
                setVisible={setSectionModalVisible}
                options={sections}
                onSelect={onChange}
                error={error?.message}
                required={true}
                disabled={busy}
              />
            )}
          />

          {/* Series (Read Only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Series</Text>
            <Controller
              control={control}
              name="series"
              render={({ field: { value } }) => (
                <TextInput
                  style={[styles.input, styles.readOnlyInput]}
                  value={value}
                  editable={false}
                />
              )}
            />
          </View>

          {/* Mobile Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <Controller
              control={control}
              name="mobileNumber"
              rules={{
                required: "Mobile number is required",
                pattern: {
                  value: /^01\d{9}$/,
                  message: "Invalid Bangladeshi mobile number"
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="e.g. 01XXXXXXXXX"
                  placeholderTextColor="#4e4e4e"
                  keyboardType="phone-pad"
                  editable={!busy}
                />
              )}
            />
            {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber.message}</Text>}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <Controller
              control={control}
              name="email"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Invalid Email"
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder=""
                  placeholderTextColor="#4e4e4e"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!busy}
                />
              )}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          </View>

          {/* Complete Button */}
          <TouchableOpacity
            style={[styles.button, busy && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.8}
            disabled={busy}
          >
            <Text style={styles.buttonText}>
              {loadingProfile ? 'Loading...' : submitting ? 'Updating...' : 'Update'}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- Custom Status Modal --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={modalConfig.onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Icon */}
            <View style={[
              styles.modalIconContainer,
              modalConfig.type === 'success' ? styles.iconSuccess : styles.iconError
            ]}>
              <Text style={styles.modalIconText}>
                {modalConfig.type === 'success' ? '✓' : '!'}
              </Text>
            </View>

            {/* Text Content */}
            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <Text style={styles.modalMessage}>{modalConfig.message}</Text>

            {/* Button */}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={modalConfig.onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  // Header Styles
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backIcon: { width: 18, height: 18, tintColor: '#99EF5E' },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: 24,
    color: '#99EF5E',
  },

  // Content Styles
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  profileIconWrapper: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  profileIcon: {
    width: 120,
    height: 120,
    tintColor: '#99EF5E',
  },
  profileLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 16,
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
  readOnlyInput: {
    color: '#A6A6A6',
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
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#000000',
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // --- Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Dark dim background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    elevation: 5,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconSuccess: {
    backgroundColor: 'rgba(153, 239, 94, 0.2)', // Light Green bg
    borderWidth: 2,
    borderColor: '#99EF5E',
  },
  iconError: {
    backgroundColor: 'rgba(255, 69, 58, 0.2)', // Light Red bg
    borderWidth: 2,
    borderColor: '#FF453A',
  },
  modalIconText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF', // White symbol
  },
  modalTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#A6A6A6',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#99EF5E',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#000000',
  },
});

export default ProfileUpdateStudent;