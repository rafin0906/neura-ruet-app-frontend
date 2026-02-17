import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, ActivityIndicator } from 'react-native';

const NotificationItem = ({ item, expanded, onToggle }) => {
    return (
        <View style={styles.itemContainer}>
            {/* Clickable Header Row */}
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onToggle(item.id)}
                style={styles.rowTop}
            >
                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: item.color || '#5C8D34' }]}>
                    <Text style={styles.avatarText}>{item.initial}</Text>
                </View>

                {/* Middle Text */}
                <View style={styles.meta}>
                    <Text style={styles.sender}>{item.sender}</Text>
                    <Text style={styles.title}>{item.title}</Text>
                </View>

                {/* Right Side (Time + Arrow) */}
                <View style={styles.rightCol}>
                    <Text style={styles.time}>{item.time}</Text>
                    <Image
                        source={require('../../../assets/icons/down_arrow_icon.png')}
                        style={[styles.arrow, expanded && styles.arrowUp]}
                        resizeMode="contain"
                    />
                </View>
            </TouchableOpacity>

            {/* Expanded Description */}
            {expanded && (
                <View style={styles.descContainer}>
                    <View style={styles.descBox}>
                        <Text style={styles.descText}>{item.description}</Text>
                    </View>
                </View>
            )}
        </View>
    );
};

const NotificationList = ({ visible, items = [], loading = false, emptyText = 'No notifications.' }) => {
    const [expandedId, setExpandedId] = useState(null);

    const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

    useEffect(() => {
        if (!visible) return;
        // Always reset expandedId to null when items change or screen opens
        setExpandedId(null);
    }, [visible, safeItems]);

    const toggle = (id) => setExpandedId((cur) => (cur === id ? null : id));

    if (!visible) return null;

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="small" color="#99EF5E" />
            </View>
        );
    }

    if (safeItems.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={styles.emptyText}>{emptyText}</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={safeItems}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
                <NotificationItem
                    item={item}
                    expanded={expandedId === item.id}
                    onToggle={toggle}
                />
            )}
        />
    );
};

const styles = StyleSheet.create({
    listContent: {
        paddingTop: 10,
        paddingBottom: 40,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 13,
        color: '#A6A6A6',
        textAlign: 'center',
        paddingHorizontal: 24,
    },
    itemContainer: {
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    rowTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    // Avatar
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        marginTop: 2,
    },
    avatarText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
        color: '#99EF5E',
    },
    // Meta Data
    meta: {
        flex: 1,
        marginRight: 8,
    },
    sender: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: '#FFFFFF',
        opacity: 0.9,
        marginBottom: 2,
    },
    title: {
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
        color: '#FFFFFF',
        lineHeight: 22,
    },
    // Right Column
    rightCol: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 40,
    },
    time: {
        fontFamily: 'Poppins-Regular',
        fontSize: 11,
        color: '#A6A6A6',
        marginBottom: 4,
    },
    arrow: {
        width: 14,
        height: 14,
        tintColor: '#FFFFFF',
        marginTop: 4,
    },
    arrowUp: {
        transform: [{ rotate: '180deg' }],
    },
    // Description
    descContainer: {
        paddingLeft: 54, // Aligns with text start (40px avatar + 14px margin)
        marginTop: 10,
    },
    descBox: {
        backgroundColor: '#202125', // Slightly lighter card background
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#333',
    },
    descText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: '#CCCCCC',
        lineHeight: 18,
    },
});

export default NotificationList;