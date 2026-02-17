import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const PasswordRecoveryHeader = () => {
  return (
    <View style={styles.container}>
      {/* App Branding */}
      <Text style={styles.title}>
        Welcome to <Text style={styles.highlight}>NeuraRUET</Text>
      </Text>
      <Text style={styles.subtitle}>
        RUET intelligence at{'\n'}your service.
      </Text>

      {/* Screen Specific Icon & Title */}
      <View style={styles.iconContainer}>
        <Image 
          source={require('../../../assets/icons/password_recovery_icon.png')}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text style={styles.screenTitle}>Password Recovery</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  highlight: {
    color: '#99EF5E',
  },
  subtitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    color: '#808080',
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 22,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 40,
    gap: 10,
  },
  icon: {
    width: 40, // Adjust based on actual icon aspect ratio
    height: 40, 
    tintColor: '#FFFFFF', // Assuming icon is white in the screenshot
  },
  screenTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: 5,
  },
});

export default PasswordRecoveryHeader;