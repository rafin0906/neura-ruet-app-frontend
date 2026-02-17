// src/components/utils/TeacherCustomTabBar.jsx
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

// Icon Assets
const ICONS = {
    ChatBotScreen: require('../../../assets/icons/chat_bot_tab_icon.png'),
    NoticeUpScreen: require('../../../assets/icons/notice_up_tab_icon.png'),
    ResultCreateScreen: require('../../../assets/icons/result_create_tab_icon.png'),
};

// Labels with Explicit Newlines for Stacking
const LABELS = {
    ChatBotScreen: 'ChatBot',       // Single Line
    NoticeUpScreen: 'Notice\n   Up',   // Stacked
    ResultCreateScreen: ' Result\nCreate', // Stacked
};

const TabItem = ({ isFocused, onPress, routeName, label }) => {
    // Animations from your provided code
    const scaleAnim = useRef(new Animated.Value(isFocused ? 1.08 : 0.92)).current;
    const pillAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
    const iconSizeAnim = useRef(new Animated.Value(isFocused ? 1.15 : 1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: isFocused ? 1.08 : 0.92,
                useNativeDriver: true,
                friction: 6,
            }),
            Animated.timing(pillAnim, {
                toValue: isFocused ? 1 : 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.spring(iconSizeAnim, {
                toValue: isFocused ? 1.15 : 1,
                useNativeDriver: true,
                friction: 5,
            })
        ]).start();
    }, [isFocused]);

    const iconSource = ICONS[routeName];

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={styles.tabItemContainer}
        >
            <Animated.View
                style={[
                    // Use activePill style for base layout, background is handled by interpolate
                    styles.itemWrapper, 
                    {
                        transform: [{ scale: scaleAnim }],
                        backgroundColor: isFocused
                            ? pillAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['transparent', '#99EF5E'] // Animate to Green
                            })
                            : 'transparent',
                        
                        // --- THE GLOW EFFECT (Animated Shadow) ---
                        shadowColor: '#99EF5E',
                        shadowOpacity: isFocused ? 0.6 : 0,
                        shadowRadius: isFocused ? 12 : 0,
                        elevation: isFocused ? 10 : 0,
                        shadowOffset: { width: 0, height: 0 },
                    },
                ]}
            >
                <Animated.Image
                    source={iconSource}
                    style={[
                        isFocused ? styles.iconActive : styles.iconInactive,
                        {
                            tintColor: isFocused ? '#000000' : '#FFFFFF',
                            transform: [{ scale: iconSizeAnim }],
                        },
                    ]}
                    resizeMode="contain"
                />
                {/* Render label directly to allow \n stacking */}
                <Text style={isFocused ? styles.labelActive : styles.labelInactive}>
                    {label}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

const TeacherCustomTabBar = ({ state, descriptors, navigation }) => {
    return (
        <View style={styles.overlayWrapper}>
            <LinearGradient
                colors={['rgba(31,33,36,0.95)', 'rgba(13,13,13,0.95)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.capsuleContainer}
            >
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;
                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };
                    return (
                        <TabItem
                            key={route.key}
                            isFocused={isFocused}
                            onPress={onPress}
                            routeName={route.name}
                            label={LABELS[route.name]}
                        />
                    );
                })}
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    overlayWrapper: {
        position: 'absolute',
        bottom: 25,
        left: 20,
        right: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 18,
        elevation: 18,
        zIndex: 100,
    },
    capsuleContainer: {
        flexDirection: 'row',
        width: '100%',
        height: 68,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    tabItemContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    
    // Wrapper for both active and inactive states to ensure alignment matches
    itemWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 30,
        height: 50,      // Fixed height for consistency
        minWidth: 100,   // Min width to prevent cramping
        
        // --- GAP FIX --- 
        // This ensures the icon and text are always 10px apart 
        // fixing the "Result Create" spacing issue.
        gap: 10, 
    },

    iconActive: {
        width: 20, // Slightly smaller base size so animation scales up nicely
        height: 20,
        // No margin right, Gap handles it
    },
    labelActive: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 11,
        color: '#000000',
        includeFontPadding: false,
        textAlign: 'left', // Aligns stacked text properly next to icon
        lineHeight: 13,    // Tight line height for stacked text
    },

    iconInactive: {
        width: 20,
        height: 20,
        // No margin right, Gap handles it
    },
    labelInactive: {
        fontFamily: 'Poppins-Medium',
        fontSize: 10,
        color: '#FFFFFF',
        textAlign: 'left',
        lineHeight: 12,
    },
});

export default TeacherCustomTabBar;