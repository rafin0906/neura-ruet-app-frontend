// src/components/student_side_bar/UserInfoCard.jsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const MENU = [
    {
        id: 'upgrade',
        label: 'Upgrade Plan',
        icon: require('../../../assets/icons/upgrade_plan_icon.png'),
    },
    {
        id: 'profile',
        label: 'Profile',
        icon: require('../../../assets/icons/profile_option_icon.png'),
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: require('../../../assets/icons/settings_icon.png'),
    },
];

const getInitial = (fullName) => {
    if (!fullName) return 'U';
    const trimmed = String(fullName).trim();
    if (!trimmed) return 'U';
    return trimmed.charAt(0).toUpperCase();
};

const UserInfoCard = ({ fullName, menuVisible, onToggleMenu, onPressMenuItem }) => {
    const initial = getInitial(fullName);

    return (
        <View style={styles.container}>
            {menuVisible && (
                <View style={styles.popup}>
                    {MENU.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            activeOpacity={0.85}
                            style={styles.popupRow}
                            onPress={() => onPressMenuItem?.(item.id)}
                        >
                            <Image source={item.icon} style={styles.popupIcon} resizeMode="contain" />
                            <Text
                                style={item.id === 'upgrade' ? styles.popupTextUpgrade : styles.popupText}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <TouchableOpacity activeOpacity={0.85} style={styles.userRow} onPress={onToggleMenu}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initial}</Text>
                </View>

                <Text style={styles.fullName} numberOfLines={1}>
                    {fullName}
                </Text>

                <Image
                    source={require('../../../assets/icons/up_arrow_icon.png')}
                    style={[styles.caretIcon, menuVisible ? styles.caretDown : styles.caretUp]}
                    resizeMode="contain"
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 18,
        paddingBottom: 14,
        paddingTop: 10,
    },
    popup: {
        position: 'absolute',
        right: 18,
        bottom: 64,
        width: 210,
        backgroundColor: '#282B2E',
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    popupRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 6,
    },
    popupIcon: {
        width: 18,
        height: 18,
        tintColor: '#A6A6A6',
        marginRight: 10,
    },
    popupText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 15,
        color: '#A6A6A6',
    },
    popupTextUpgrade: {
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
        color: '#A6A6A6',
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(123,175,86,0.51)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
        color: '#9DFF00',
    },
    fullName: {
        flex: 1,
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
        color: '#FFFFFF',
    },
    caret: {
        fontFamily: 'Poppins-Medium',
        fontSize: 18,
        color: '#A6A6A6',
        marginLeft: 10,
    },
    caretIcon: {
        width: 18,
        height: 18,
        tintColor: '#A6A6A6',
        marginLeft: 10,
    },
    caretUp: {
        transform: [{ rotate: '0deg' }],
    },
    caretDown: {
        transform: [{ rotate: '180deg' }],
    },
});

export default UserInfoCard;
