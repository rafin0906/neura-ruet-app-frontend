import React from 'react';
import { StyleSheet, View } from 'react-native';
import ChatLoadingSplash from './ChatLoadingSplash';

const ScreenLoadingOverlay = () => {
    return (
        <View style={styles.overlay} pointerEvents="auto">
            <ChatLoadingSplash />
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        elevation: 9999,
    },
});

export default ScreenLoadingOverlay;
