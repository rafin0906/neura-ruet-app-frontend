import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Imports
import SideBarHeader from '../utils_components/SideBarHeader';
import UserInfoCard from '../utils_components/UserInfoCard';
import CustomSectionList from '../utils_components/CustomSectionList';

const TeacherSideBar = ({
    drawerProps,
    searchText,
    setSearchText,
    onPressNewChat,
    onDrawerOpen,
    // Data Props
    chats = [],
    notices = [],
    marksSheets = [],
    // Selection Props
    selectedChatId,
    selectedNoticeId,
    selectedMarksId,
    // Handlers
    onPressChat,
    onPressNotice,
    onPressMarks,
    // User Info
    fullName,
    userMenuVisible,
    onToggleUserMenu,
    onPressMenuItem,
}) => {
    useEffect(() => {
        const nav = drawerProps?.navigation;
        if (!nav?.addListener || !onDrawerOpen) return;

        const unsubscribe = nav.addListener('drawerOpen', () => {
            onDrawerOpen();
        });

        return unsubscribe;
    }, [drawerProps, onDrawerOpen]);

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <View style={styles.container}>

                {/* Fixed Header */}
                <View style={styles.headerFixed}>
                    <SideBarHeader
                        searchText={searchText}
                        setSearchText={setSearchText}
                        onPressNewChat={onPressNewChat}
                    />
                    <View style={styles.headerDivider} />
                </View>

                {/* Main Content Area */}
                <View style={styles.mainContent}>
                    <View style={styles.sectionsWrapper}>

                        {/* 1. Chats Section */}
                        <View style={styles.sectionContainer}>
                            <CustomSectionList
                                title="Your Chats"
                                items={chats}
                                activeId={selectedChatId}
                                onPressItem={onPressChat}
                                // FIX: Disable internal divider
                                showDivider={false}
                            />
                        </View>

                        {/* --- Horizontal Line --- */}
                        <View style={styles.sectionSeparator} />

                        {/* 2. Notices Section */}
                        <View style={styles.sectionContainer}>
                            <CustomSectionList
                                title="Uploaded Notices"
                                items={notices}
                                activeId={selectedNoticeId}
                                onPressItem={onPressNotice}
                                // FIX: Disable internal divider
                                showDivider={false}
                            />
                        </View>

                        {/* --- Horizontal Line --- */}
                        <View style={styles.sectionSeparator} />

                        {/* 3. Marks Section */}
                        <View style={styles.sectionContainer}>
                            <CustomSectionList
                                title="Uploaded Marks Sheet"
                                items={marksSheets}
                                activeId={selectedMarksId}
                                onPressItem={onPressMarks}
                                showDivider={false}
                            />
                        </View>

                    </View>
                </View>

                {/* Fixed Footer */}
                <View style={styles.userCardFixed}>
                    <View style={styles.bottomDivider} />
                    <UserInfoCard
                        fullName={fullName}
                        menuVisible={userMenuVisible}
                        onToggleMenu={onToggleUserMenu}
                        onPressMenuItem={onPressMenuItem}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#202125',
    },
    container: {
        flex: 1,
        backgroundColor: '#202125',
    },
    headerFixed: {
        zIndex: 50,
        backgroundColor: '#202125',
        paddingTop: 8,
    },
    // Header specific divider
    headerDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginHorizontal: 18,
        marginTop: 8,
        marginBottom: 0,
    },
    mainContent: {
        flex: 1,
        marginTop: 10,
        marginBottom: 90,
    },
    sectionsWrapper: {
        paddingHorizontal: 18,
        flex: 1,
    },
    // Ensures sections share vertical space evenly
    sectionContainer: {
        flex: 1,
        overflow: 'hidden',
    },
    // Visual separator between sections
    sectionSeparator: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginVertical: 0,
    },
    userCardFixed: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#202125',
        zIndex: 50,
        paddingBottom: 8,
    },
    bottomDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginHorizontal: 18,
    },
});

export default TeacherSideBar;