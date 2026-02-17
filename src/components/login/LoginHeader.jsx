import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// import custom fonts from ../../assets/fonts/ --- IGNORE ---
// import  poppins from Poppins-Medium.ttf'; 

const LoginHeader = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Welcome to <Text style={styles.highlight}>NeuraRUET</Text>
      </Text>
      <Text style={styles.subtitle}>
        RUET intelligence at{'\n'}your service.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 60, // Adjust based on status bar
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
});

export default LoginHeader;