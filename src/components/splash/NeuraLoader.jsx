import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const NeuraLoader = () => {
    return (
        <View style={styles.wrapper} pointerEvents="none">
            <View style={styles.container}>
                <View style={styles.titleRow} accessible accessibilityLabel="NeuraRUET">
                    <Text style={styles.neura}>Neura</Text>
                    <Text style={styles.ruet}>RUET</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        elevation: 9999,
    },
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    neura: {
        color: '#99EF5E',
        fontSize: 36,
        fontFamily: 'Poppins-SemiBold',
        letterSpacing: 0.4,
        textShadowColor: 'rgba(153,239,94,0.18)',
        textShadowOffset: { width: 0, height: 6 },
        textShadowRadius: 18,
    },
    ruet: {
        color: '#FFFFFF',
        fontSize: 36,
        fontFamily: 'Poppins-SemiBold',
        letterSpacing: 0.4,
        marginLeft: 4,
    },
});

export default NeuraLoader;
