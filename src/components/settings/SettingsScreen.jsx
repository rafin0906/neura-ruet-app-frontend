import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Image, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import UpdatePasswordForm from './UpdatePasswordForm';
import QuickSettingsToggles from './QuickSettingsToggles';
import API from '../../utils/api/apiClient';
import { useAuth } from '../../context/AuthContext';

const SettingsScreen = () => {
    const navigation = useNavigation();
    const { role, clearAllAuth } = useAuth();
    const [notificationOn, setNotificationOn] = useState(true);
    const [lightMode, setLightMode] = useState(false);
    const [loadingLogout, setLoadingLogout] = useState(false);

    // --- Success/Error Modal State ---
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        type: 'success',
        title: '',
        message: '',
        onClose: () => setModalVisible(false),
    });

    // --- Logout Confirmation Modal State ---
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

    // Helper to show success/error modal
    const showModal = (type, title, message, onCloseAction) => {
        setModalConfig({
            type,
            title,
            message,
            onClose: () => {
                setModalVisible(false);
                if (onCloseAction) onCloseAction();
            },
        });
        setModalVisible(true);
    };

    const getLogoutEndpoint = (r) => {
        if (r === 'teacher') return '/api/v1/teachers/logout';
        if (r === 'cr') return '/api/v1/crs/logout';
        return '/api/v1/students/logout';
    };

    // --- LOGOUT HANDLER ---
    const confirmLogout = async () => {
        setLogoutModalVisible(false); // Close confirmation modal
        setLoadingLogout(true);
        try {
            // 1) Tell backend to revoke tokens (best-effort)
            try {
                await API.post(getLogoutEndpoint(role), {});
            } catch (e) {
                // Even if network fails, proceed with local logout.
            }

            // 2) Clear all auth state locally (access/setup + refresh credentials)
            await clearAllAuth();

            // 3) Navigation is driven by auth state.
            // Clearing auth will cause RootNavigator to switch to the auth stack.
        } catch (error) {
            console.log('Logout Error:', error);
            showModal('error', 'Logout Failed', error?.message || 'Failed to log out. Please try again.');
        } finally {
            setLoadingLogout(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />

            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Image source={require('../../../assets/icons/back_arrow_icon.png')} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.title}>Settings</Text>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                <UpdatePasswordForm
                    onSuccess={() => showModal(
                        'success',
                        'Password Updated',
                        'Your password has been changed successfully.',
                        () => navigation.goBack()
                    )}
                    onError={(msg) => showModal('error', 'Update Failed', msg)}
                />

                <QuickSettingsToggles
                    notificationOn={notificationOn}
                    setNotificationOn={setNotificationOn}
                    lightMode={lightMode}
                    setLightMode={setLightMode}
                />

                {/* --- LOGOUT BUTTON (Triggers Confirmation) --- */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => setLogoutModalVisible(true)}
                    activeOpacity={0.8}
                    disabled={loadingLogout}
                >
                    <Text style={styles.logoutText}>
                        {loadingLogout ? "Logging out..." : "Log Out"}
                    </Text>
                </TouchableOpacity>

            </ScrollView>

            {/* --- SUCCESS/ERROR MODAL --- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={modalConfig.onClose}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={[
                            styles.modalIconContainer,
                            modalConfig.type === 'success' ? styles.iconSuccess : styles.iconError
                        ]}>
                            <Text style={styles.modalIconText}>
                                {modalConfig.type === 'success' ? '✓' : '!'}
                            </Text>
                        </View>

                        <Text style={styles.modalTitle}>{modalConfig.title}</Text>
                        <Text style={styles.modalMessage}>{modalConfig.message}</Text>

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

            {/* --- LOGOUT CONFIRMATION MODAL --- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={logoutModalVisible}
                onRequestClose={() => setLogoutModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>

                        {/* Warning Icon */}
                        <View style={[styles.modalIconContainer, styles.iconError]}>
                            <Text style={styles.modalIconText}>!</Text>
                        </View>

                        <Text style={styles.modalTitle}>Log Out</Text>
                        <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>

                        {/* Buttons Row */}
                        <View style={styles.modalButtonRow}>
                            {/* Cancel */}
                            <TouchableOpacity
                                style={[styles.modalButtonHalf, styles.cancelButton]}
                                onPress={() => setLogoutModalVisible(false)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            {/* Confirm */}
                            <TouchableOpacity
                                style={[styles.modalButtonHalf, styles.confirmButton]}
                                onPress={confirmLogout}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.confirmButtonText}>Log Out</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#000000' },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 10,
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
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 10,
        paddingBottom: 40,
    },

    // Logout Button Styles
    logoutButton: {
        marginTop: 40,
        marginHorizontal: 24,
        height: 55,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#FF453A', // Red border
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoutText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 16,
        color: '#FF453A',
    },

    // --- Modal Styles ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
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
        backgroundColor: 'rgba(153, 239, 94, 0.2)',
        borderWidth: 2,
        borderColor: '#99EF5E',
    },
    iconError: {
        backgroundColor: 'rgba(255, 69, 58, 0.2)',
        borderWidth: 2,
        borderColor: '#FF453A',
    },
    modalIconText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
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

    // --- Confirmation Modal Button Row ---
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 12,
    },
    modalButtonHalf: {
        flex: 1,
        borderRadius: 25,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#333333',
    },
    cancelButtonText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 15,
        color: '#FFFFFF',
    },
    confirmButton: {
        backgroundColor: '#FF453A', // Red for logout action
    },
    confirmButtonText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 15,
        color: '#FFFFFF',
    },
});

export default SettingsScreen;