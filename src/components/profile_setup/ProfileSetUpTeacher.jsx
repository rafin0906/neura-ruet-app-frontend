// src/components/profile_setup/ProfileSetUpTeacher.jsx
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
    Alert,
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

const ProfileSetUpTeacher = () => {
    const { setAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);

    const { control, handleSubmit, setValue, formState: { errors } } = useForm({
        defaultValues: {
            fullName: '',
            designation: '',
            department: '',
            joiningYear: '',
            mobileNumber: '',
            email: ''
        }
    });

    const [designationModalVisible, setDesignationModalVisible] = useState(false);
    const [deptModalVisible, setDeptModalVisible] = useState(false);

    // Data Lists
    const designations = [
        "Professor",
        "Associate Professor",
        "Assistant Professor",
        "Lecturer"
    ];

    const departments = [
        "EEE", "CSE", "ETE", "ECE", "CE", "URP",
        "ARCH", "BECM", "ME", "IPE", "CME", "MTE", "MSE", "CHE"
    ];

    // Prefill form from backend using setup_token (stored during login).
    // Backend: GET /api/v1/teachers/profile-setup/me
    useEffect(() => {
        let isMounted = true;

        const loadProfileSetupMe = async () => {
            try {
                const response = await API.get('/api/v1/teachers/profile-setup/me');
                const profile = response?.data;
                if (!isMounted || !profile) return;

                setValue('fullName', profile.full_name ?? '');
                // Backend stores designation as lowercase; UI list uses capitalized labels.
                // Sending capitalized values is OK (backend validator lowercases).
                const designationFromApi = profile.designation;
                if (typeof designationFromApi === 'string' && designationFromApi.length) {
                    const normalized = designationFromApi
                        .split(' ')
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ');
                    setValue('designation', normalized);
                }

                setValue('department', profile.dept ?? '');
                setValue('joiningYear', profile.joining_year != null ? String(profile.joining_year) : '');
                setValue('mobileNumber', profile.mobile_no ?? '');
                setValue('email', profile.email ?? '');
            } catch (e) {
                Alert.alert('Error', e?.message || 'Failed to load profile setup data');
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
                designation: (data.designation || '').trim(),
                dept: (data.department || '').trim(),
                joining_year: data.joiningYear ? Number(data.joiningYear) : null,
                mobile_no: (data.mobileNumber || '').trim(),
                email: (data.email || '').trim(),
            };

            const response = await API.post('/api/v1/teachers/profile-setup', payload);
            const accessToken = response?.data?.access_token;
            const refreshToken = response?.data?.refresh_token;
            const refreshTokenId = response?.data?.refresh_token_id;
            if (accessToken) {
                const pairs = [
                    [AUTH_TOKEN_STORAGE_KEY, accessToken],
                    [LAST_ACCESS_TOKEN_STORAGE_KEY, accessToken],
                    [AUTH_TOKEN_KIND_STORAGE_KEY, 'access'],
                    [AUTH_ROLE_STORAGE_KEY, 'teacher'],
                ];

                if (typeof refreshToken === 'string' && refreshToken.length > 0) {
                    pairs.push([REFRESH_TOKEN_STORAGE_KEY, refreshToken]);
                }
                if (typeof refreshTokenId === 'string' && refreshTokenId.length > 0) {
                    pairs.push([REFRESH_TOKEN_ID_STORAGE_KEY, refreshTokenId]);
                }

                await AsyncStorage.multiSet(pairs);
                setAuthenticated({ role: 'teacher', accessToken });
            }
        } catch (error) {
            Alert.alert('Error', error?.message || 'Failed to save profile. Please try again.');
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
                                source={require('../../../assets/icons/teacher_profile_icon.png')}
                                style={styles.profileIcon}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.profileLabel}>Teacher Profile</Text>
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
                                    editable={!loading}
                                />
                            )}
                        />
                        {errors.fullName && <Text style={styles.errorText}>{errors.fullName.message}</Text>}
                    </View>

                    {/* Designation Dropdown */}
                    <Controller
                        control={control}
                        name="designation"
                        rules={{ required: "Designation is required" }}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <CustomDropDown
                                label="Designation"
                                value={value}
                                isVisible={designationModalVisible}
                                setVisible={setDesignationModalVisible}
                                options={designations}
                                onSelect={onChange}
                                error={error?.message}
                                disabled={loading}
                            />
                        )}
                    />

                    {/* Department Dropdown */}
                    <Controller
                        control={control}
                        name="department"
                        rules={{ required: "Department is required" }}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <CustomDropDown
                                label="Department"
                                value={value}
                                isVisible={deptModalVisible}
                                setVisible={setDeptModalVisible}
                                options={departments}
                                onSelect={onChange}
                                error={error?.message}
                                disabled={loading}
                            />
                        )}
                    />

                    {/* Joining Year */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Joining Year</Text>
                        <Controller
                            control={control}
                            name="joiningYear"
                            rules={{
                                required: "Joining year is required",
                                pattern: { value: /^\d{4}$/, message: "Must be a valid 4-digit year" }
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={styles.input}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    placeholder="e.g. 2018"
                                    placeholderTextColor="#4e4e4e"
                                    keyboardType="number-pad"
                                    maxLength={4}
                                    editable={!loading}
                                />
                            )}
                        />
                        {errors.joiningYear && <Text style={styles.errorText}>{errors.joiningYear.message}</Text>}
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
                                    maxLength={11}
                                    editable={!loading}
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
                                    placeholder="teacher@ruet.ac.bd"
                                    placeholderTextColor="#4e4e4e"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!loading}
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
                        <Text style={styles.buttonText}>
                            {loading ? 'Completing...' : 'Complete'}
                        </Text>
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
    iconCircle: {

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
});

export default ProfileSetUpTeacher;