import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Imports
import SideBarHeader from '../utils_components/SideBarHeader';
import UserInfoCard from '../utils_components/UserInfoCard';
import CustomSectionList from '../utils_components/CustomSectionList';

const CRSideBar = ({
    drawerProps,
    searchText,
    setSearchText,
    onPressNewChat,
    onDrawerOpen,
    // Data Props
    chats = [],
    notices = [],
    uploadedMaterials = [],
    // Selection Props
    selectedChatId,
    selectedNoticeId,
    selectedMaterialId,
    // Handlers
    onPressChat,
    onPressNotice,
    onPressMaterial,
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
                                // FIX: Disable internal divider to prevent double lines
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

                        {/* 3. Materials Section */}
                        <View style={styles.sectionContainer}>
                            <CustomSectionList
                                title="Uploaded Materials"
                                items={uploadedMaterials}
                                activeId={selectedMaterialId}
                                onPressItem={onPressMaterial}
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
                        role="CR"
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
    sectionContainer: {
        flex: 1,
        overflow: 'hidden',
    },
    sectionSeparator: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginVertical: 0, // Tight spacing
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

export default CRSideBar;