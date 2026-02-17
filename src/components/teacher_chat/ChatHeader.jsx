// src/components/teacher_chat/ChatHeader.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const ChatHeader = () => {
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={['#000000', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0)']}
      style={styles.container}
    >
      {/* Left Section: Menu Button + Title */}
      <View style={styles.leftSection}>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          activeOpacity={0.8}
          style={styles.circleButton}
        >
          <Image
            source={require('../../../assets/icons/side_bar_icon.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          <Text style={styles.greenText}>Neura</Text>
          <Text style={styles.whiteText}>RUET</Text>
        </Text>
      </View>

      {/* Right Section intentionally removed for teachers (no notifications) */}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 40,
    width: '100%',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#212121',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
  },
  greenText: {
    color: '#99EF5E',
  },
  whiteText: {
    color: '#FFFFFF',
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#A6A6A6',
  },
});

export default ChatHeader;