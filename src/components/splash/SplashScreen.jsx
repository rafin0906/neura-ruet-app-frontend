import React from 'react';
import { StyleSheet, View } from 'react-native';

import NeuraLoader from './NeuraLoader';

const SplashScreen = () => {
    return (
        <View style={styles.container}>
            <NeuraLoader />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default SplashScreen;
