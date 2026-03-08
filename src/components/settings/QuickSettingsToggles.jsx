// src/components/settings/QuickSettingsToggles.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Toggle = ({ label, value, onToggle }) => {
    return (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity activeOpacity={0.85} onPress={onToggle} style={[styles.switch, value ? styles.switchOn : styles.switchOff]}>
                <View style={[styles.knob, value ? styles.knobOn : styles.knobOff]} />
            </TouchableOpacity>
        </View>
    );
};

const QuickSettingsToggles = ({ lightMode, setLightMode }) => {
    return (
        <View style={styles.container}>
            <Toggle label="Light Mode" value={lightMode} onToggle={() => setLightMode((v) => !v)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        marginTop: 18,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
        borderBottomWidth: 0,
    },
    label: {
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
        color: '#FFFFFF',
    },
    switch: {
        width: 56,
        height: 30,
        borderRadius: 16,
        justifyContent: 'center',
        padding: 4,
    },
    switchOn: {
        backgroundColor: '#99EF5E',
    },
    switchOff: {
        backgroundColor: '#393939',
    },
    knob: {
        width: 22,
        height: 22,
        borderRadius: 11,
    },
    knobOn: {
        backgroundColor: '#000000',
        alignSelf: 'flex-end',
    },
    knobOff: {
        backgroundColor: '#99EF5E',
        alignSelf: 'flex-start',
    },
});

export default QuickSettingsToggles;
