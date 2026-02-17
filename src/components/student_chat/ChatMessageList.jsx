import React from 'react';
import { View, Text, StyleSheet, FlatList, Linking, TouchableOpacity, Image } from 'react-native';
import TypingDots from '../utils_components/TypingDots';
import ChatLoadingSplash from '../splash/ChatLoadingSplash';

// --- Helper: Render Text with Clickable Links ---
const renderTextWithLinks = (text, baseStyle) => {
  // Regex to find URLs (http/https)
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <Text style={baseStyle}>
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
          return (
            <Text
              key={index}
              style={[baseStyle, styles.linkText]}
              onPress={() => Linking.openURL(part)}
              suppressHighlighting={true} // Prevents grey background on press
            >
              {part}
            </Text>
          );
        }
        return <Text key={index} style={baseStyle}>{part}</Text>;
      })}
    </Text>
  );
};

// --- 1. UPDATED Typewriter Component with Link Support ---
const Typewriter = ({ text, style }) => {
  const [displayedText, setDisplayedText] = React.useState('');

  React.useEffect(() => {
    setDisplayedText(''); 
    let currentIndex = 0;

    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        currentIndex++;
        setDisplayedText(text.slice(0, currentIndex));
      } else {
        clearInterval(timer);
      }
    }, 15);

    return () => clearInterval(timer);
  }, [text]);

  // Use the helper to render the sliced text with links
  return renderTextWithLinks(displayedText, style);
};
// -------------------------------

const ChatMessageList = ({ messages, loading = false, contentContainerStyle }) => {

  const reversedMessages = [...messages].reverse();

  const renderItem = ({ item, index }) => {
    const isUser = item.sender === 'user';
    const isTyping = Boolean(item?.isTyping);
    const isLastMessage = index === 0;

    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userContainer : styles.assistantContainer
      ]}>
        <View style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble
        ]}>
          
          {/* --- NEW: Assistant Header --- */}
          {!isUser && (
            <View style={styles.assistantHeader}>
              <View style={styles.botIconPlaceholder}>
                 <Text style={styles.botIconText}>AI</Text>
              </View>
              <Text style={styles.botName}>Neura AI</Text>
            </View>
          )}

          {/* Message Content */}
          {!isUser && isTyping ? (
            <TypingDots />
          ) : !isUser && isLastMessage ? (
            <Typewriter
              text={item.text}
              style={styles.assistantText}
            />
          ) : (
            // Use helper for static text too
            renderTextWithLinks(
                item.text, 
                isUser ? styles.userText : styles.assistantText
            )
          )}
        </View>
      </View>
    );
  };

  if (loading && messages.length === 0) {
    return <ChatLoadingSplash />;
  }

  if (messages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Hi! RUET intelligence at work...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={reversedMessages}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      inverted={true}
      contentContainerStyle={[styles.listContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 16,
    width: '100%',
    flexDirection: 'row',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '85%', // Slightly wider for the header
    padding: 14,
    borderRadius: 14,
  },
  userBubble: {
    backgroundColor: '#99EF5E',
    borderTopRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#333', // Subtle border for definition
  },
  
  // --- New Assistant Header Styles ---
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // Spacing between header and text
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 6,
  },
  botIconPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#99EF5E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  botIconText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    color: '#000000',
  },
  botName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#99EF5E',
    letterSpacing: 0.5,
  },
  // -----------------------------------

  messageText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  assistantText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    lineHeight: 22, // Slightly increased for readability
    color: '#E0E0E0', // Softer white
  },
  userText: {
    color: '#000000',
  },
  // --- Link Style ---
  linkText: {
    color: '#99EF5E', // Theme Green
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
});

export default ChatMessageList;