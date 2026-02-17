import React from 'react';
import { StyleSheet, View } from 'react-native';

const Line = ({ width, variant }) => {
    return (
        <View 
            style={[
                styles.line, 
                variant === 'assistant' ? styles.assistantLine : styles.userLine, 
                { width }
            ]} 
        />
    );
};

const Bubble = ({ variant }) => {
    const isUser = variant === 'user';

    return (
        <View style={[styles.bubbleWrap, isUser ? styles.userWrap : styles.assistantWrap]}>
            <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
                {/* Line 1 (Both) */}
                <Line variant={variant} width={isUser ? '92%' : '92%'} />
                <View style={{ height: 10 }} />
                
                {/* Line 2 (Both - User is short here) */}
                <Line variant={variant} width={isUser ? '65%' : '92%'} />

                {/* Line 3 (Assistant Only - Short ending) */}
                {!isUser && (
                    <>
                        <View style={{ height: 10 }} />
                        <Line variant={variant} width="65%" />
                    </>
                )}
            </View>
        </View>
    );
};

const ChatLoadingSplash = ({ style }) => {
    return (
        <View style={[styles.container, style]}>
            <Bubble variant="user" />
            <View style={{ height: 24 }} />
            <Bubble variant="assistant" />
            <View style={{ height: 24 }} />
            <Bubble variant="user" />
            <View style={{ height: 24 }} />
            <Bubble variant="assistant" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    bubbleWrap: {
        width: '100%',
        flexDirection: 'row',
    },
    userWrap: {
        justifyContent: 'flex-end',
    },
    assistantWrap: {
        justifyContent: 'flex-start',
    },
    bubble: {
        width: '80%', // Fixed relative width to match image chunky look
        paddingVertical: 16,
        paddingHorizontal: 18,
        borderRadius: 18,
    },
    userBubble: {
        backgroundColor: '#99EF5E',
        borderTopRightRadius: 4,
    },
    assistantBubble: {
        backgroundColor: '#1A1A1A',
        borderTopLeftRadius: 4,
    },
    line: {
        height: 12, // Slightly thicker lines to match image
        borderRadius: 6,
    },
    userLine: {
        backgroundColor: 'rgba(0,0,0,0.15)', // Darker green line
    },
    assistantLine: {
        backgroundColor: 'rgba(255,255,255,0.08)', // Faint grey line
    },
});

export default ChatLoadingSplash;