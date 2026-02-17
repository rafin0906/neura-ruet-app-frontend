// src/components/teacher_chat/ResultCreateMessage.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ResultCreateMessage = () => {
    return (
        <View style={styles.container}>
            {/* User Message (Right) */}
            <View style={styles.userWrapper}>
                <View style={styles.userBubble}>
                    <Text style={styles.userText}>Create a Marksheet</Text>
                </View>
            </View>

            {/* Assistant Message (Left) */}
            <View style={styles.assistantWrapper}>
                <View style={styles.assistantBubble}>
                    <Text style={styles.assistantText}>
                        To create a marksheet , you have to fill following options
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    userWrapper: {
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    userBubble: {
        backgroundColor: '#99EF5E',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 14,
        borderTopRightRadius: 4,
    },
    userText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 13,
        color: '#000000',
    },
    assistantWrapper: {
        alignItems: 'flex-start',
    },
    assistantBubble: {
        backgroundColor: '#212121',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 14,
        borderTopLeftRadius: 4,
        maxWidth: '85%',
    },
    assistantText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 13,
        color: '#FFFFFF',
        lineHeight: 20,
    },
});

export default ResultCreateMessage;