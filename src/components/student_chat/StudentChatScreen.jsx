import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    View,
    StyleSheet,
    StatusBar,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import ChatHeader from './ChatHeader';
import ChatMessageList from './ChatMessageList';
import ChatInputBar from './ChatInputBar';

import {
    createStudentChatRoom,
    listStudentRoomMessages,
    sendStudentRoomMessage,
} from '../../services/studentChatService';

const StudentChatScreen = ({ roomId: propRoomId, route, onRoomCreated, onRoomsShouldRefresh }) => {
    const navigation = useNavigation();
    const [currentTool, setCurrentTool] = useState(null);
    const [inputHeight, setInputHeight] = useState(100);

    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);

    const createRoomPromiseRef = useRef(null);

    // Clear selected tool when room changes
    useEffect(() => {
        setCurrentTool(null);
    }, [propRoomId, route?.params?.roomId]);

    // Determine active room id.
    // Important: if route.params has a roomId key with value null, treat it as an explicit override
    // so "New Chat" can clear the selection.
    useEffect(() => {
        const hasRouteRoomId =
            route?.params && Object.prototype.hasOwnProperty.call(route.params, 'roomId');
        const routeRoomId = hasRouteRoomId ? route.params.roomId : undefined;
        const next = hasRouteRoomId ? routeRoomId : (propRoomId ?? null);
        setCurrentRoomId(next);
    }, [propRoomId, route?.params?.roomId]);

    // Fetch messages for the active room
    useEffect(() => {
        let cancelled = false;

        const loadMessages = async () => {
            if (!currentRoomId) {
                setMessages([]);
                return;
            }

            setLoadingMessages(true);
            try {
                const data = await listStudentRoomMessages(currentRoomId);
                if (cancelled) return;

                const built = Array.isArray(data)
                    ? data.map((m) => ({
                        id: String(m?.id ?? ''),
                        text: m?.content ?? '',
                        sender: m?.sender_role === 'assistant' ? 'assistant' : 'user',
                    })).filter((m) => m.id)
                    : [];

                setMessages(built);
            } catch (e) {
                if (!cancelled) setMessages([]);
            } finally {
                if (!cancelled) setLoadingMessages(false);
            }
        };

        loadMessages();
        return () => {
            cancelled = true;
        };
    }, [currentRoomId]);

    const handleSendMessage = async (text) => {
        if (sending) return;

        if (!currentTool?.id) {
            Alert.alert('Select a tool', 'Please select a tool to continue.');
            return;
        }

        const trimmed = (text ?? '').trim();
        if (!trimmed) return;

        // If no room is selected, lazily create one on the first send.
        let activeRoomId = currentRoomId;
        if (!activeRoomId) {
            try {
                if (!createRoomPromiseRef.current) {
                    createRoomPromiseRef.current = createStudentChatRoom({});
                }
                const room = await createRoomPromiseRef.current;
                createRoomPromiseRef.current = null;

                const newRoomId = room?.id ? String(room.id) : null;
                if (!newRoomId) {
                    throw new Error('Failed to create chat room');
                }

                activeRoomId = newRoomId;
                setCurrentRoomId(newRoomId);
                onRoomCreated?.(newRoomId);
                onRoomsShouldRefresh?.();

                // Keep route params in sync so back/forward keeps the room context.
                try {
                    navigation.navigate('Chat', { roomId: newRoomId });
                } catch (e) { }
            } catch (e) {
                createRoomPromiseRef.current = null;
                Alert.alert('Error', e?.message || 'Failed to start a new chat');
                return;
            }
        }

        const now = Date.now();
        const typingId = `${now}-t`;

        const userMsg = {
            id: `${now}-u`,
            text: trimmed,
            sender: 'user',
        };

        const typingMsg = {
            id: typingId,
            text: '',
            sender: 'assistant',
            isTyping: true,
        };

        setMessages((prev) => [...prev, userMsg, typingMsg]);
        setSending(true);

        try {
            const assistant = await sendStudentRoomMessage(activeRoomId, {
                tool_name: currentTool.id,
                content: trimmed,
            });

            const assistantMsg = {
                id: String(assistant?.id ?? `${Date.now()}-a`),
                text: assistant?.content ?? '',
                sender: assistant?.sender_role === 'assistant' ? 'assistant' : 'assistant',
            };

            setMessages((prev) => {
                const idx = prev.findIndex((m) => m.id === typingId);
                if (idx === -1) return [...prev, assistantMsg];
                const next = [...prev];
                next[idx] = assistantMsg;
                return next;
            });
            onRoomsShouldRefresh?.();
        } catch (e) {
            console.error('Send message failed:', e);
            setMessages((prev) => prev.filter((m) => m.id !== typingId));
            Alert.alert('Error', e?.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />

            <View style={styles.container}>

                {/* Header (Absolute Top) */}
                <View style={styles.absoluteHeaderContainer}>
                    <ChatHeader onPressNotification={() => navigation.navigate('Notifications')} />
                </View>

                <KeyboardAvoidingView
                    style={styles.keyboardAvoidingView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 20}
                >
                    <View style={styles.contentContainer}>

                        {/* Chat List */}
                        <View style={styles.chatArea}>
                            <ChatMessageList
                                messages={messages}
                                loading={loadingMessages}
                                contentContainerStyle={{
                                    // FIX: Swapped logic for Inverted List
                                    paddingBottom: 100,          // Visual Top (Clear the Header)
                                    paddingTop: inputHeight + 20 // Visual Bottom (Clear the Input Bar dynamically)
                                }}
                            />
                        </View>

                        {/* Input Bar (Absolute Bottom) */}
                        <View
                            style={styles.absoluteInputContainer}
                            onLayout={(event) => {
                                const { height } = event.nativeEvent.layout;
                                setInputHeight(height);
                            }}
                        >
                            <ChatInputBar
                                onSend={handleSendMessage}
                                currentTool={currentTool}
                                setCurrentTool={setCurrentTool}
                            />
                        </View>

                    </View>
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
        position: 'relative',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        position: 'relative',
    },
    chatArea: {
        flex: 1,
        backgroundColor: '#000000',
        marginBottom: 0
    },
    absoluteHeaderContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
    },
    absoluteInputContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 20,
    },
});

export default StudentChatScreen;