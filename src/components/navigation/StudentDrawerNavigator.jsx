import React, { useCallback, useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

import StudentChatScreen from '../student_chat/StudentChatScreen';
import StudentSideBar from '../student_side_bar/StudentSideBar';

import {
    listStudentChatRooms,
} from '../../services/studentChatService';

import { useAuth } from '../../context/AuthContext';

const Drawer = createDrawerNavigator();

const StudentDrawerNavigator = () => {
    const { profile } = useAuth();
    const fullName = profile?.fullName || '';

    const [searchText, setSearchText] = useState('');
    const [userMenuVisible, setUserMenuVisible] = useState(false);

    const [chatRooms, setChatRooms] = useState([]);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [roomsLoading, setRoomsLoading] = useState(false);

    const handleMenuItem = (id, nav) => {
        // Close menu and drawer first
        setUserMenuVisible(false);
        try {
            nav?.closeDrawer?.();
        } catch (e) { }

        // If 'profile' selected navigate to ProfileSetUpStudent on parent stack so back works
        if (id === 'profile') {
            // drawer nav's parent should be the stack navigator
            nav?.getParent()?.navigate?.('ProfileUpdateStudent');
            return;
        }

        if (id === 'settings') {
            nav?.getParent()?.navigate?.('Settings');
            return;
        }

        // For other menu items, just close drawer (or extend behavior later)
    };

    const fetchRooms = useCallback(async () => {
        setRoomsLoading(true);
        try {
            const data = await listStudentChatRooms();
            const built = Array.isArray(data)
                ? data
                    .map((r) => ({
                        id: String(r?.id ?? ''),
                        title: r?.title ?? 'New Chat',
                    }))
                    .filter((r) => r.id)
                : [];
            setChatRooms(built);
        } catch (e) {
            // keep silent to avoid noisy UI
        } finally {
            setRoomsLoading(false);
        }
    }, []);

    // Initial load: load chat room history only (do NOT auto-create a room).
    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    const handlePressRoom = (roomId, navigation) => {
        setCurrentRoomId(roomId);
        setUserMenuVisible(false);
        try {
            navigation.navigate('Chat', { roomId });
        } catch (e) { }
        navigation.closeDrawer();
    };

    const handleNewChat = (navigation) => {
        setUserMenuVisible(false);
        setCurrentRoomId(null);
        try {
            // Explicitly set roomId to null to force an empty screen.
            navigation.navigate('Chat', { roomId: null });
        } catch (e) { }
        navigation.closeDrawer();
    };

    return (
        <Drawer.Navigator
            screenOptions={{
                headerShown: false,
                drawerStyle: { backgroundColor: '#202125', width: 310 },
                sceneContainerStyle: { backgroundColor: '#000000' },
            }}
            drawerContent={(drawerProps) => (
                <StudentSideBar
                    drawerProps={drawerProps}
                    searchText={searchText}
                    setSearchText={setSearchText}
                    rooms={chatRooms}
                    selectedRoomId={currentRoomId}
                    onPressNewChat={() => handleNewChat(drawerProps.navigation)}
                    onPressRoom={(roomId) => handlePressRoom(roomId, drawerProps.navigation)}
                    onDrawerOpen={fetchRooms}
                    fullName={fullName}
                    userMenuVisible={userMenuVisible}
                    onToggleUserMenu={() => setUserMenuVisible((v) => !v)}
                    onPressMenuItem={(id) => handleMenuItem(id, drawerProps.navigation)}
                />
            )}
        >
            <Drawer.Screen name="Chat">
                {(props) => (
                    <StudentChatScreen
                        {...props}
                        roomId={currentRoomId}
                        onRoomCreated={(id) => setCurrentRoomId(id)}
                        onRoomsShouldRefresh={fetchRooms}
                    />
                )}
            </Drawer.Screen>
        </Drawer.Navigator>
    );
};

export default StudentDrawerNavigator;
