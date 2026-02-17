// src/components/navigation/TeacherDrawerNavigator.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

import TeacherBottomTabNavigator from './TeacherBottomTabNavigator';
import TeacherSideBar from '../teacher_side_bar/TeacherSideBar';

import { listTeacherChatRooms } from '../../services/teacherChatService';
import { listTeacherNotices } from '../../services/teacherNoticeService';
import { listTeacherResultSheetsHistory } from '../../services/teacherResultSheetService';

import { useAuth } from '../../context/AuthContext';

const Drawer = createDrawerNavigator();

const TeacherDrawerNavigator = () => {
    const { profile } = useAuth();
    const fullName = profile?.fullName || '';

    const [searchText, setSearchText] = useState('');
    const [userMenuVisible, setUserMenuVisible] = useState(false);

    const [chatRooms, setChatRooms] = useState([]);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [roomsLoading, setRoomsLoading] = useState(false);

    const [notices, setNotices] = useState([]);

    const [marksSheets, setMarksSheets] = useState([]);

    // Selection States
    const [selectedNoticeId, setSelectedNoticeId] = useState(null);
    const [selectedMarksId, setSelectedMarksId] = useState(null);

    const fetchNotices = useCallback(async () => {
        try {
            const data = await listTeacherNotices({ skip: 0, limit: 50 });
            const built = Array.isArray(data)
                ? data
                    .map((n) => ({ id: String(n?.id ?? ''), title: n?.title ?? 'Untitled notice' }))
                    .filter((n) => n.id)
                : [];
            setNotices(built);
        } catch (e) {
            // keep silent
            setNotices([]);
        }
    }, []);

    const fetchMarksSheets = useCallback(async () => {
        try {
            const data = await listTeacherResultSheetsHistory();
            const built = Array.isArray(data)
                ? data
                    .map((s) => ({ id: String(s?.id ?? ''), title: s?.title ?? 'Untitled result sheet' }))
                    .filter((s) => s.id)
                : [];
            setMarksSheets(built);
        } catch (e) {
            setMarksSheets([]);
        }
    }, []);
    const fetchRooms = useCallback(async () => {
        setRoomsLoading(true);
        try {
            const data = await listTeacherChatRooms();
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
            // keep silent
        } finally {
            setRoomsLoading(false);
        }
    }, []);

    // ... (Keep existing menu and room handlers) ...
    const handleMenuItem = (id, nav) => {
        setUserMenuVisible(false);
        try { nav?.closeDrawer?.(); } catch (e) { }
        if (id === 'profile') { nav?.getParent()?.navigate?.('ProfileUpdateTeacher'); return; }
        if (id === 'settings') { nav?.getParent()?.navigate?.('Settings'); return; }
    };

    // Initial load: load chat room history + notices.
    useEffect(() => {
        fetchRooms();
        fetchNotices();
        fetchMarksSheets();
    }, [fetchRooms, fetchNotices, fetchMarksSheets]);

    const handleDrawerOpen = useCallback(() => {
        fetchRooms();
        fetchNotices();
        fetchMarksSheets();
    }, [fetchRooms, fetchNotices, fetchMarksSheets]);

    const handlePressRoom = (roomId, navigation) => {
        const nextId = roomId ? String(roomId) : null;
        setCurrentRoomId(nextId);
        // Deselect others to show visual focus on Chats
        setSelectedNoticeId(null);
        setSelectedMarksId(null);

        setUserMenuVisible(false);
        try {
            navigation.navigate('TeacherTabs', {
                screen: 'ChatBotScreen',
                params: { roomId: nextId },
            });
        } catch (e) { }
        navigation.closeDrawer();
    };

    const handlePressNotice = (noticeId, navigation) => {
        const nextId = noticeId ? String(noticeId) : null;
        setSelectedNoticeId(nextId);
        // Deselect others
        setCurrentRoomId(null);
        setSelectedMarksId(null);

        try {
            navigation.navigate('TeacherTabs', {
                screen: 'NoticeUpScreen',
                params: { noticeId: nextId },
            });
        } catch (e) { }
        navigation.closeDrawer();
    };

    const handlePressMarks = (marksId, navigation) => {
        const nextId = marksId ? String(marksId) : null;
        setSelectedMarksId(nextId);
        // Deselect others
        setCurrentRoomId(null);
        setSelectedNoticeId(null);

        try {
            navigation.navigate('TeacherTabs', {
                screen: 'ResultCreateScreen',
                params: { sheetId: nextId },
            });
        } catch (e) { }
        navigation.closeDrawer();
    };

    const handleNewChat = (navigation) => {
        setUserMenuVisible(false);
        setCurrentRoomId(null);
        // Explicitly pass roomId: null so chat screen clears selection
        try {
            navigation.navigate('TeacherTabs', {
                screen: 'ChatBotScreen',
                params: { roomId: null },
            });
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
                <TeacherSideBar
                    drawerProps={drawerProps}
                    searchText={searchText}
                    setSearchText={setSearchText}

                    // --- 2. Pass Data ---
                    chats={chatRooms}
                    notices={notices}
                    marksSheets={marksSheets}

                    // --- 3. Pass Active State ---
                    selectedChatId={currentRoomId}
                    selectedNoticeId={selectedNoticeId}
                    selectedMarksId={selectedMarksId}

                    // --- 4. Pass Handlers ---
                    onPressChat={(id) => handlePressRoom(id, drawerProps.navigation)}
                    onPressNotice={(id) => handlePressNotice(id, drawerProps.navigation)}
                    onPressMarks={(id) => handlePressMarks(id, drawerProps.navigation)}
                    onPressNewChat={() => handleNewChat(drawerProps.navigation)}
                    onDrawerOpen={handleDrawerOpen}

                    fullName={fullName}
                    userMenuVisible={userMenuVisible}
                    onToggleUserMenu={() => setUserMenuVisible((v) => !v)}
                    onPressMenuItem={(id) => handleMenuItem(id, drawerProps.navigation)}
                />
            )}
        >
            <Drawer.Screen name="TeacherTabs">
                {(props) => (
                    <TeacherBottomTabNavigator
                        {...props}
                        roomId={currentRoomId}
                        onRoomCreated={(id) => setCurrentRoomId(String(id))}
                        onRoomsShouldRefresh={handleDrawerOpen}
                        onNoticesShouldRefresh={handleDrawerOpen}
                        onResultsShouldRefresh={handleDrawerOpen}
                    />
                )}
            </Drawer.Screen>
        </Drawer.Navigator>
    );
};

export default TeacherDrawerNavigator;