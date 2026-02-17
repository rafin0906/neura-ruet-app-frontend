import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import NotificationList from './NotificationList';

import { useAuth } from '../../context/AuthContext';
import { listCrNoticeFeed } from '../../services/crNoticeService';
import { listStudentNoticesFeed } from '../../services/studentNoticeService';

const NotificationScreen = () => {
    const navigation = useNavigation();
    const { role } = useAuth();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const parseBackendDate = useCallback((value) => {
        if (!value) return null;
        if (value instanceof Date) return value;
        if (typeof value !== 'string') return null;

        let iso = value.trim();
        if (!iso) return null;

        // Accept common SQL-style timestamps: "YYYY-MM-DD HH:mm:ss(.ffffff)"
        if (/^\d{4}-\d{2}-\d{2} /.test(iso)) iso = iso.replace(' ', 'T');

        // Backend often returns naive datetimes (no timezone). Assume UTC in that case.
        const hasTimezone = /[zZ]$|[+-]\d{2}:\d{2}$/.test(iso);
        if (!hasTimezone) iso = `${iso}Z`;

        const dt = new Date(iso);
        const ts = dt.getTime();
        if (!Number.isFinite(ts)) return null;
        return dt;
    }, []);

    const toRelativeTime = useCallback(
        (value) => {
            try {
                const dt = parseBackendDate(value);
                const ts = dt?.getTime();
                if (!Number.isFinite(ts)) return '';

                const ms = Date.now() - ts;
                // If clock skew / future timestamp, treat as just now
                if (!Number.isFinite(ms) || ms < 0) return 'just now';
                const sec = Math.floor(ms / 1000);
                if (sec < 60) return 'just now';
                const min = Math.floor(sec / 60);
                if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`;
                const hr = Math.floor(min / 60);
                if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
                const day = Math.floor(hr / 24);
                return `${day} day${day === 1 ? '' : 's'} ago`;
            } catch {
                return '';
            }
        },
        [parseBackendDate]
    );

    const mapNoticesToItems = useCallback(
        (notices) => {
            if (!Array.isArray(notices)) return [];
            return notices
                .map((n) => {
                    const createdByRole = String(n?.created_by_role ?? '').toLowerCase();
                    const sender = createdByRole === 'teacher' ? 'Teacher' : createdByRole === 'cr' ? 'CR' : 'Notice';
                    const initial = sender ? sender[0] : 'N';

                    const updatedAt = n?.updated_at;
                    const createdAt = n?.created_at;
                    const timeSource = updatedAt || createdAt;
                    return {
                        id: String(n?.id ?? ''),
                        sender,
                        title: n?.title ?? 'Untitled',
                        description: n?.notice_message ?? '',
                        time: toRelativeTime(timeSource),
                        initial,
                        color: '#5C8D34',
                    };
                })
                .filter((x) => x.id);
        },
        [toRelativeTime]
    );

    useFocusEffect(
        useCallback(() => {
            let cancelled = false;

            const load = async () => {
                setLoading(true);
                try {
                    let notices = [];
                    if (role === 'cr') {
                        notices = await listCrNoticeFeed({ skip: 0, limit: 50 });
                    } else if (role === 'student') {
                        notices = await listStudentNoticesFeed({ skip: 0, limit: 50 });
                    } else {
                        notices = [];
                    }

                    if (!cancelled) setItems(mapNoticesToItems(notices));
                } catch {
                    if (!cancelled) setItems([]);
                } finally {
                    if (!cancelled) setLoading(false);
                }
            };

            load();
            return () => {
                cancelled = true;
            };
        }, [role, mapNoticesToItems])
    );

    const emptyText = useMemo(() => {
        if (role === 'cr') return 'No notices for your class yet.';
        if (role === 'student') return 'No notices for your class yet.';
        return 'No notifications.';
    }, [role]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />

            {/* --- Screen Header --- */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                    activeOpacity={0.8}
                >
                    <Image
                        source={require('../../../assets/icons/back_arrow_icon.png')}
                        style={styles.backIcon}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
            </View>

            {/* --- List Content --- */}
            <View style={styles.content}>
                <NotificationList visible={true} items={items} loading={loading} emptyText={emptyText} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000', // Matches your App Theme
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        backgroundColor: '#000000',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        // Optional: darker circle behind back button if desired, currently transparent
    },
    backIcon: {
        width: 20,
        height: 20,
        tintColor: '#99EF5E', // Green Accent
    },
    headerTitle: {
        fontFamily: 'Poppins-Medium',
        fontSize: 24,
        color: '#99EF5E',
    },
    content: {
        flex: 1,
    },
});

export default NotificationScreen;