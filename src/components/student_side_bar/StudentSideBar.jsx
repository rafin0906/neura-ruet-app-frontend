import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Imports
import SideBarHeader from '../utils_components/SideBarHeader';
import UserInfoCard from '../utils_components/UserInfoCard';
// Use the new Student-specific list component
import CustomSectionListStudent from '../utils_components/CustomSectionListStudent';

const StudentSideBar = ({
    drawerProps,
    searchText,
    setSearchText,
    rooms,
    selectedRoomId,
    onPressNewChat,
    onPressRoom,
    onDrawerOpen,
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
                    <View style={styles.divider} />
                </View>

                {/* Main Content Area: FIXED VIEW (Not ScrollView) */}
                <View style={styles.mainContent}>
                    <View style={styles.sectionsWrapper}>

                        {/* 1. Chats Section */}
                        {/* We use the new component which has flex:1 internally */}
                        <CustomSectionListStudent
                            title="Your chats"
                            items={rooms}
                            activeId={selectedRoomId}
                            onPressItem={onPressRoom}
                            showDivider={false}
                        />

                        {/* Add more sections here if needed, they will share height automatically */}

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
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginHorizontal: 18,
        marginTop: 8,
        marginBottom: 0,
    },
    // Main Content fills the space between header and footer
    mainContent: {
        flex: 1,
        marginTop: 10,
        marginBottom: 10,
    },
    // Wrapper provides the flex context for the children lists
    sectionsWrapper: {
        flex: 1,
        paddingHorizontal: 18,
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

export default StudentSideBar;