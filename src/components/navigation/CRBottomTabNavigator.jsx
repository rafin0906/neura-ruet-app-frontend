import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import Screens (CR Specific)
import CRChatScreen from '../cr_chat/CRChatScreen';
import NoticeUpScreen from '../cr_chat/NoticeUpScreen';
import MaterialUpScreen from '../cr_chat/MaterialUpScreen';

// Import Custom Tab Bar
import CRCustomTabBar from '../utils_components/CRCustomTabBar';

const Tab = createBottomTabNavigator();

const CRBottomTabNavigator = ({ roomId, onRoomCreated, onRoomsShouldRefresh, onNoticesShouldRefresh, onMaterialsShouldRefresh }) => {
    return (
        <Tab.Navigator
            // Pass the custom component to the tabBar prop
            tabBar={(props) => <CRCustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                // Make the default background transparent so our floating bar looks correct
                tabBarStyle: { position: 'absolute' },
            }}
        >
            <Tab.Screen name="ChatBotScreen">
                {(props) => (
                    <CRChatScreen
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

            <Tab.Screen name="MaterialUpScreen">
                {(props) => (
                    <MaterialUpScreen
                        {...props}
                        onMaterialsShouldRefresh={onMaterialsShouldRefresh}
                    />
                )}
            </Tab.Screen>
        </Tab.Navigator>
    );
};

export default CRBottomTabNavigator;