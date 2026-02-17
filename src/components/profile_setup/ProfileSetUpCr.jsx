// src/components/profile_setup/ProfileSetUpCr.jsx
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
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
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

const ProfileSetUpCr = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthenticated } = useAuth();
  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      fullName: '',
      rollNumber: '',
      crNo: 'CR-1',
      department: '',
      section: 'A',
      series: '',
      mobileNumber: '',
      email: '',
    }
  });

  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [crModalVisible, setCrModalVisible] = useState(false);

  const sections = ["A", "B", "C", "None"];
  const crOptions = ["CR-1", "CR-2"];

  // Prefill from backend.
  // Backend: GET /api/v1/crs/profile-setup/me
  useEffect(() => {
    let isMounted = true;

    const loadProfileSetupMe = async () => {
      try {
        const response = await API.get('/api/v1/crs/profile-setup/me');
        const profile = response?.data;
        if (!isMounted || !profile) return;

        setValue('fullName', profile.full_name ?? '');
        setValue('rollNumber', profile.roll_no ?? '');
        setValue('department', profile.dept ?? '');
        setValue('section', profile.section ?? 'A');
        setValue('series', profile.series != null ? String(profile.series) : '');
        setValue('mobileNumber', profile.mobile_no ?? '');
        setValue('email', profile.email ?? '');

        // Backend stores cr_no as lowercase 'cr-1'; UI uses 'CR-1'.
        if (typeof profile.cr_no === 'string' && profile.cr_no.length) {
          setValue('crNo', profile.cr_no.toUpperCase());
        }
      } catch (e) {
        // 401 will clear token via interceptor; show a simple message.
        alert(e?.message || 'Failed to load profile setup data');
      }
    };

    loadProfileSetupMe();
    return () => {
      isMounted = false;
    };
  }, [setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        full_name: (data.fullName || '').trim(),
        roll_no: data.rollNumber ? String(data.rollNumber).trim() : null,
        dept: (data.department || '').trim(),
        section: data.section === 'None' ? null : data.section,
        series: data.series ? Number(data.series) : null,
        mobile_no: (data.mobileNumber || '').trim(),
        email: (data.email || '').trim(),
        cr_no: (data.crNo || '').toLowerCase(),
      };

      const response = await API.post('/api/v1/crs/profile-setup', payload);
      const accessToken = response?.data?.access_token;
      const refreshToken = response?.data?.refresh_token;
      const refreshTokenId = response?.data?.refresh_token_id;
      if (accessToken) {
        const pairs = [
          [AUTH_TOKEN_STORAGE_KEY, accessToken],
          [LAST_ACCESS_TOKEN_STORAGE_KEY, accessToken],
          [AUTH_TOKEN_KIND_STORAGE_KEY, 'access'],
          [AUTH_ROLE_STORAGE_KEY, 'cr'],
        ];

        if (typeof refreshToken === 'string' && refreshToken.length > 0) {
          pairs.push([REFRESH_TOKEN_STORAGE_KEY, refreshToken]);
        }
        if (typeof refreshTokenId === 'string' && refreshTokenId.length > 0) {
          pairs.push([REFRESH_TOKEN_ID_STORAGE_KEY, refreshTokenId]);
        }

        await AsyncStorage.multiSet(pairs);
        setAuthenticated({ role: 'cr', accessToken });
      }
    } catch (error) {
      alert(error?.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
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

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Title */}
          <Text style={styles.headerTitle}>Profile Setup</Text>

          {/* Profile Icon */}
          <View style={styles.profileIconWrapper}>
            <View style={styles.iconCircle}>
              <Image
                source={require('../../../assets/icons/cr_profile_icon.png')}
                style={styles.profileIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.profileLabel}>CR Profile</Text>
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

          {/* CR No. Dropdown - New Field */}
          <Controller
            control={control}
            name="crNo"
            rules={{ required: "CR No. is required" }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <CustomDropDown
                label="CR No."
                value={value}
                isVisible={crModalVisible}
                setVisible={setCrModalVisible}
                options={crOptions}
                onSelect={onChange}
                error={error?.message}
              />
            )}
          />

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
                />
              )}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          </View>

          {/* Complete Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Completing...' : 'Complete'}</Text>
          </TouchableOpacity>

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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 24,
    color: '#99EF5E',
    marginBottom: 30,
  },
  profileIconWrapper: {
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonDisabled: {
    opacity: 0.6,
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
    color: '#A6A6A6', // Slightly dimmed to indicate read-only/fetched state
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
});

export default ProfileSetUpCr;