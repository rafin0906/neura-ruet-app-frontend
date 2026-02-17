import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';

import API from '../../utils/api/apiClient';
import { useAuth } from '../../context/AuthContext';

const UpdatePasswordForm = ({ onSuccess, onError }) => {
    const [loading, setLoading] = useState(false);
    const { role } = useAuth();

    // Toggle States for Password Visibility
    const [secureCurrent, setSecureCurrent] = useState(true);
    const [secureNew, setSecureNew] = useState(true);
    const [secureConfirm, setSecureConfirm] = useState(true);

    // Destructure setError from useForm
    const { control, handleSubmit, watch, reset, setError, formState: { errors } } = useForm({
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        }
    });

    const newPassword = watch('newPassword');

    const getUpdatePasswordEndpoint = (r) => {
        if (r === 'teacher') return '/api/v1/update-password/teachers';
        if (r === 'cr') return '/api/v1/update-password/crs';
        return '/api/v1/update-password/students';
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const endpoint = getUpdatePasswordEndpoint(role);
            const payload = {
                current_password: data.currentPassword,
                new_password: data.newPassword,
                confirm_new_password: data.confirmPassword,
            };

            await API.put(endpoint, payload);

            reset();
            if (onSuccess) onSuccess();

        } catch (err) {
            // err is normalized by apiClient/errorHandler
            const status = err?.status;
            const message = err?.message || 'Something went wrong. Please try again.';

            if (status === 401) {
                setError('currentPassword', {
                    type: 'manual',
                    message: 'Current password is incorrect',
                });
            } else if (status === 400 && typeof message === 'string' && message.toLowerCase().includes('match')) {
                setError('confirmPassword', {
                    type: 'manual',
                    message: message,
                });
            } else {
                if (onError) onError(message);
            }
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Update Password</Text>

            {/* Current Password */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Password *</Text>
                <View style={styles.passwordContainer}>
                    <Controller
                        control={control}
                        name="currentPassword"
                        rules={{ required: 'Current password is required' }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={[styles.input, styles.passwordInput]}
                                placeholder="Enter current password"
                                placeholderTextColor="#4e4e4e"
                                secureTextEntry={secureCurrent}
                                value={value}
                                onChangeText={onChange}
                                editable={!loading}
                            />
                        )}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setSecureCurrent(!secureCurrent)}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        {secureCurrent ? (
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
                {errors.currentPassword && <Text style={styles.errorText}>{errors.currentPassword.message}</Text>}
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password *</Text>
                <View style={styles.passwordContainer}>
                    <Controller
                        control={control}
                        name="newPassword"
                        rules={{ required: 'New password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={[styles.input, styles.passwordInput]}
                                placeholder="Enter new password"
                                placeholderTextColor="#4e4e4e"
                                secureTextEntry={secureNew}
                                value={value}
                                onChangeText={onChange}
                                editable={!loading}
                            />
                        )}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setSecureNew(!secureNew)}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        {secureNew ? (
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
                {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword.message}</Text>}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm New Password *</Text>
                <View style={styles.passwordContainer}>
                    <Controller
                        control={control}
                        name="confirmPassword"
                        rules={{ required: 'Please confirm your password', validate: (v) => v === newPassword || 'Passwords must match' }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={[styles.input, styles.passwordInput]}
                                placeholder="Re-enter new password"
                                placeholderTextColor="#4e4e4e"
                                secureTextEntry={secureConfirm}
                                value={value}
                                onChangeText={onChange}
                                editable={!loading}
                            />
                        )}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setSecureConfirm(!secureConfirm)}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        {secureConfirm ? (
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
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
            </View>

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSubmit(onSubmit)}
                activeOpacity={0.85}
                disabled={loading}
            >
                <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Update'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
        color: '#99EF5E',
        marginBottom: 12,
    },
    inputGroup: {
        marginBottom: 8,
    },
    label: {
        fontFamily: 'Poppins-Regular',
        fontSize: 13,
        color: '#FFFFFF',
        marginBottom: 8,
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
    // New Styles for Password Logic
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
    // End New Styles
    button: {
        backgroundColor: '#99EF5E',
        borderRadius: 30,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 18,
    },
    buttonText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 16,
        color: '#000000',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    errorText: {
        color: '#C1B748',
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        marginBottom: 8,
        marginTop: 4,
    },
});

export default UpdatePasswordForm;