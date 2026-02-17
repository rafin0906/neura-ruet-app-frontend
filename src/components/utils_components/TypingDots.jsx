import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const Dot = ({ anim }) => {
    const opacity = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.35, 1],
    });

    const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -3],
    });

    return <Animated.View style={[styles.dot, { opacity, transform: [{ translateY }] }]} />;
};

const TypingDots = () => {
    const a1 = useRef(new Animated.Value(0)).current;
    const a2 = useRef(new Animated.Value(0)).current;
    const a3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const make = (v, delay) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(v, { toValue: 1, duration: 240, useNativeDriver: true }),
                    Animated.timing(v, { toValue: 0, duration: 240, useNativeDriver: true }),
                    Animated.delay(420),
                ])
            );

        const l1 = make(a1, 0);
        const l2 = make(a2, 140);
        const l3 = make(a3, 280);

        l1.start();
        l2.start();
        l3.start();

        return () => {
            l1.stop();
            l2.stop();
            l3.stop();
            a1.setValue(0);
            a2.setValue(0);
            a3.setValue(0);
        };
    }, [a1, a2, a3]);

    return (
        <View style={styles.row}>
            <Dot anim={a1} />
            <Dot anim={a2} />
            <Dot anim={a3} />
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FFFFFF',
        marginRight: 6,
    },
});

export default TypingDots;
