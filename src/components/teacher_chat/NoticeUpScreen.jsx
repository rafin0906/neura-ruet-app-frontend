// src/components/teacher_chat/NoticeUpScreen.jsx
import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Text // Imported Text for the inline message
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

// Components
import ChatHeader from './ChatHeader';
import NoticeUploaderMessage from './NoticeUploaderMessage';
import NoticeForm from './NoticeForm';

const NoticeUpScreen = ({ onNoticesShouldRefresh }) => {
    const navigation = useNavigation();
    const route = useRoute();
    const noticeId = useMemo(() => {
        const raw = route?.params?.noticeId;
        const trimmed = typeof raw === 'string' ? raw.trim() : raw != null ? String(raw).trim() : '';
        return trimmed || null;
    }, [route?.params?.noticeId]);

    const [uploadSuccess, setUploadSuccess] = useState(false);
    const scrollViewRef = useRef();

    useEffect(() => {
        // When switching between notices (or create vs edit), always show the form.
        setUploadSuccess(false);
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }, 50);
    }, [noticeId]);

    const handleUploadSuccess = (savedNotice) => {
        setUploadSuccess(true);
        try {
            onNoticesShouldRefresh?.();
        } catch (e) { }
        // Automatically scroll to bottom to show the success message
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const handleCreateNew = () => {
        setUploadSuccess(false);
        try {
            navigation.setParams({ noticeId: null });
        } catch (e) { }
        // Scroll back to top to show the form again
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }, 100);
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />

            <View style={styles.container}>
                {/* Header */}
                <View style={styles.headerContainer}>
                    <ChatHeader />
                </View>

                {/* Scrollable Content */}
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 60}
                >
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* 1. Initial Chat Messages */}
                        <NoticeUploaderMessage />

                        {/* 2. Show Form OR Success Message + Button */}
                        {!uploadSuccess ? (
                            <NoticeForm noticeId={noticeId} onUploadSuccess={handleUploadSuccess} />
                        ) : (
                            <View style={styles.successContainer}>
                                {/* Inline Success Message Bubble */}
                                <View style={styles.assistantWrapper}>
                                    <View style={styles.assistantBubble}>
                                        <Text style={styles.assistantText}>
                                            Uploaded successfully!
                                        </Text>
                                    </View>
                                </View>

                                {/* Create New Button */}
                                <TouchableOpacity
                                    style={styles.createNewButton}
                                    activeOpacity={0.8}
                                    onPress={handleCreateNew}
                                >
                                    <Text style={styles.createNewText}>Create New</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000000',
    },
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    scrollView: {
        flex: 1,
        marginTop: 0,
    },
    scrollContent: {
        paddingTop: 100,
        paddingBottom: 40,
    },

    // --- Success View Styles ---
    successContainer: {
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    assistantWrapper: {
        alignItems: 'flex-start',
        width: '100%', // Ensure bubble aligns left relative to container width
        marginBottom: 20,
    },
    assistantBubble: {
        backgroundColor: '#212121',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 14,
        borderTopLeftRadius: 4,
    },
    assistantText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 13,
        color: '#FFFFFF',
    },
    createNewButton: {
        backgroundColor: '#99EF5E',
        borderRadius: 24,
        paddingHorizontal: 32,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    createNewText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 16,
        color: '#000000',
    },
});

export default NoticeUpScreen;