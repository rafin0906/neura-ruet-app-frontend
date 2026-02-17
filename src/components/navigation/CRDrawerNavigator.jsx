import React, { useCallback, useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

import CRBottomTabNavigator from './CRBottomTabNavigator';
import CRSideBar from '../cr_side_bar/CRSideBar';

import { listCrChatRooms } from '../../services/crChatService';
import { listCrNotices } from '../../services/crNoticeService';
import {
    CR_MATERIAL_TYPE,
    listCrClassNotes,
    listCrCtQuestions,
    listCrLectureSlides,
    listCrSemesterQuestions,
} from '../../services/crMaterialUploadService';

import { useAuth } from '../../context/AuthContext';

const Drawer = createDrawerNavigator();

const CRDrawerNavigator = () => {
    // 1. CR User Info
    const { profile } = useAuth();
    const fullName = profile?.fullName || '';

    // 2. Search & Menu State
    const [searchText, setSearchText] = useState('');
    const [userMenuVisible, setUserMenuVisible] = useState(false);

    const [chatRooms, setChatRooms] = useState([]);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [roomsLoading, setRoomsLoading] = useState(false);

    const [notices, setNotices] = useState([]);

    const [uploadedMaterials, setUploadedMaterials] = useState([]);

    // --- 4. Selection States ---
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [selectedNoticeId, setSelectedNoticeId] = useState(null);
    const [selectedMaterialId, setSelectedMaterialId] = useState(null); // Renamed

    const fetchNotices = useCallback(async () => {
        try {
            const data = await listCrNotices({ skip: 0, limit: 50 });
            const built = Array.isArray(data)
                ? data
                    .map((n) => ({ id: String(n?.id ?? ''), title: n?.title ?? 'Untitled notice' }))
                    .filter((n) => n.id)
                : [];
            setNotices(built);
        } catch (e) {
            setNotices([]);
        }
    }, []);

    const fetchRooms = useCallback(async () => {
        setRoomsLoading(true);
        try {
            const data = await listCrChatRooms();
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

    const buildMaterialTitle = useCallback((materialType, item) => {
        const code = (item?.course_code ?? '').toString().trim();
        if (materialType === CR_MATERIAL_TYPE.CLASS_NOTE) {
            const topic = (item?.topic ?? '').toString().trim();
            return [code, topic].filter(Boolean).join(' - ') || 'Class Note';
        }
        if (materialType === CR_MATERIAL_TYPE.CT_QUESTION) {
            const ctNo = item?.ct_no != null ? String(item.ct_no) : '';
            return [code, ctNo ? `CT-${ctNo}` : 'CT Question'].filter(Boolean).join(' - ') || 'CT Question';
        }
        if (materialType === CR_MATERIAL_TYPE.LECTURE_SLIDE) {
            const topic = (item?.topic ?? '').toString().trim();
            return [code, topic].filter(Boolean).join(' - ') || 'Lecture Slide';
        }
        if (materialType === CR_MATERIAL_TYPE.SEMESTER_QUESTION) {
            const year = item?.year != null ? String(item.year) : '';
            return [code, year].filter(Boolean).join(' - ') || 'Semester Question';
        }
        return code || 'Material';
    }, []);

    const fetchMaterials = useCallback(async () => {
        try {
            const [classNotes, ctQuestions, lectureSlides, semesterQuestions] = await Promise.all([
                listCrClassNotes(),
                listCrCtQuestions(),
                listCrLectureSlides(),
                listCrSemesterQuestions(),
            ]);

            const items = [];

            for (const n of Array.isArray(classNotes) ? classNotes : []) {
                const id = String(n?.id ?? '').trim();
                if (!id) continue;
                items.push({
                    id: `${CR_MATERIAL_TYPE.CLASS_NOTE}:${id}`,
                    title: buildMaterialTitle(CR_MATERIAL_TYPE.CLASS_NOTE, n),
                });
            }
            for (const n of Array.isArray(ctQuestions) ? ctQuestions : []) {
                const id = String(n?.id ?? '').trim();
                if (!id) continue;
                items.push({
                    id: `${CR_MATERIAL_TYPE.CT_QUESTION}:${id}`,
                    title: buildMaterialTitle(CR_MATERIAL_TYPE.CT_QUESTION, n),
                });
            }
            for (const n of Array.isArray(lectureSlides) ? lectureSlides : []) {
                const id = String(n?.id ?? '').trim();
                if (!id) continue;
                items.push({
                    id: `${CR_MATERIAL_TYPE.LECTURE_SLIDE}:${id}`,
                    title: buildMaterialTitle(CR_MATERIAL_TYPE.LECTURE_SLIDE, n),
                });
            }
            for (const n of Array.isArray(semesterQuestions) ? semesterQuestions : []) {
                const id = String(n?.id ?? '').trim();
                if (!id) continue;
                items.push({
                    id: `${CR_MATERIAL_TYPE.SEMESTER_QUESTION}:${id}`,
                    title: buildMaterialTitle(CR_MATERIAL_TYPE.SEMESTER_QUESTION, n),
                });
            }

            setUploadedMaterials(items);
        } catch (e) {
            setUploadedMaterials([]);
        }
    }, [buildMaterialTitle]);

    const parseMaterialKey = useCallback((materialKey) => {
        const key = String(materialKey ?? '').trim();
        const idx = key.indexOf(':');
        if (idx <= 0) return { materialType: null, materialId: null };
        const materialType = key.slice(0, idx).trim();
        const materialId = key.slice(idx + 1).trim();
        return { materialType: materialType || null, materialId: materialId || null };
    }, []);

    // --- 7. Handlers ---
    const handleMenuItem = (id, nav) => {
        setUserMenuVisible(false);
        try { nav?.closeDrawer?.(); } catch (e) { }
        if (id === 'profile') { nav?.getParent()?.navigate?.('ProfileUpdateCr'); return; }
        if (id === 'settings') { nav?.getParent()?.navigate?.('Settings'); return; }
    };

    const handlePressRoom = (roomId, navigation) => {
        const nextId = roomId ? String(roomId) : null;
        setSelectedRoomId(nextId);
        setCurrentRoomId(nextId);
        // Deselect others
        setSelectedNoticeId(null);
        setSelectedMaterialId(null);

        setUserMenuVisible(false);
        try {
            navigation.navigate('CRTabs', {
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
        setSelectedRoomId(null);
        setCurrentRoomId(null);
        setSelectedMaterialId(null);

        try {
            navigation.navigate('CRTabs', {
                screen: 'NoticeUpScreen',
                params: { noticeId: nextId },
            });
        } catch (e) { }
        navigation.closeDrawer();
    };

    const handlePressMaterial = (materialId, navigation) => {
        const key = materialId ? String(materialId) : null;
        setSelectedMaterialId(key);
        // Deselect others
        setSelectedRoomId(null);
        setCurrentRoomId(null);
        setSelectedNoticeId(null);

        const parsed = parseMaterialKey(key);
        try {
            navigation.navigate('CRTabs', {
                screen: 'MaterialUpScreen',
                params: {
                    materialKey: key,
                    materialType: parsed.materialType,
                    materialId: parsed.materialId,
                },
            });
        } catch (e) { }
        navigation.closeDrawer();
    };

    const handleNewChat = (navigation) => {
        setUserMenuVisible(false);
        setSelectedRoomId(null);
        setCurrentRoomId(null);
        try {
            navigation.navigate('CRTabs', {
                screen: 'ChatBotScreen',
                params: { roomId: null },
            });
        } catch (e) { }
        navigation.closeDrawer();
    };

    // Initial load: load chat room history + notices + materials.
    useEffect(() => {
        fetchRooms();
        fetchNotices();
        fetchMaterials();
    }, [fetchRooms, fetchNotices, fetchMaterials]);

    const handleDrawerOpen = useCallback(() => {
        fetchRooms();
        fetchNotices();
        fetchMaterials();
    }, [fetchRooms, fetchNotices, fetchMaterials]);

    return (
        <Drawer.Navigator
            screenOptions={{
                headerShown: false,
                drawerStyle: { backgroundColor: '#202125', width: 310 },
                sceneContainerStyle: { backgroundColor: '#000000' },
            }}
            drawerContent={(drawerProps) => (
                <CRSideBar
                    drawerProps={drawerProps}
                    searchText={searchText}
                    setSearchText={setSearchText}

                    // --- Pass Data ---
                    chats={chatRooms}
                    notices={notices}
                    uploadedMaterials={uploadedMaterials} // Updated prop name

                    // --- Pass Active State ---
                    selectedChatId={currentRoomId}
                    selectedNoticeId={selectedNoticeId}
                    selectedMaterialId={selectedMaterialId} // Updated state

                    // --- Pass Handlers ---
                    onPressChat={(id) => handlePressRoom(id, drawerProps.navigation)}
                    onPressNotice={(id) => handlePressNotice(id, drawerProps.navigation)}
                    onPressMaterial={(id) => handlePressMaterial(id, drawerProps.navigation)} // Updated handler
                    onPressNewChat={() => handleNewChat(drawerProps.navigation)}
                    onDrawerOpen={handleDrawerOpen}

                    fullName={fullName}
                    userMenuVisible={userMenuVisible}
                    onToggleUserMenu={() => setUserMenuVisible((v) => !v)}
                    onPressMenuItem={(id) => handleMenuItem(id, drawerProps.navigation)}
                />
            )}
        >
            <Drawer.Screen name="CRTabs">
                {(props) => (
                    <CRBottomTabNavigator
                        {...props}
                        roomId={currentRoomId}
                        onRoomCreated={(id) => setCurrentRoomId(String(id))}
                        onRoomsShouldRefresh={handleDrawerOpen}
                        onNoticesShouldRefresh={handleDrawerOpen}
                        onMaterialsShouldRefresh={handleDrawerOpen}
                    />
                )}
            </Drawer.Screen>
        </Drawer.Navigator>
    );
};

export default CRDrawerNavigator;