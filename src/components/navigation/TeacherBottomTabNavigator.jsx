// src/components/navigation/TeacherBottomTabNavigator.jsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import Screens
import TeacherChatScreen from '../teacher_chat/TeacherChatScreen';
import NoticeUpScreen from '../teacher_chat/NoticeUpScreen';
import ResultCreateScreen from '../teacher_chat/ResultCreateScreen';

// Import Custom Tab Bar
import TeacherCustomTabBar from '../utils_components/TeacherCustomTabBar';

const Tab = createBottomTabNavigator();

const TeacherBottomTabNavigator = ({
    roomId,
    onRoomCreated,
    onRoomsShouldRefresh,
    onNoticesShouldRefresh,
    onResultsShouldRefresh,
}) => {
    return (
        <Tab.Navigator
            // Pass the custom component to the tabBar prop
            tabBar={(props) => <TeacherCustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                // Make the default background transparent so our floating bar looks correct
                tabBarStyle: { position: 'absolute' },
            }}
        >
            <Tab.Screen name="ChatBotScreen">
                {(props) => (
                    <TeacherChatScreen
                        {...props}
                        roomId={roomId}
                        onRoomCreated={onRoomCreated}
                        onRoomsShouldRefresh={onRoomsShouldRefresh}
                    />
                )}
            </Tab.Screen>

            <Tab.Screen name="NoticeUpScreen">
                {(props) => (
                    <NoticeUpScreen
                        {...props}
                        onNoticesShouldRefresh={onNoticesShouldRefresh}
                    />
                )}
            </Tab.Screen>

            <Tab.Screen
                name="ResultCreateScreen"
            >
                {(props) => (
                    <ResultCreateScreen
                        {...props}
                        onResultsShouldRefresh={onResultsShouldRefresh}
                    />
                )}
            </Tab.Screen>
        </Tab.Navigator>
    );
};

export default TeacherBottomTabNavigator;