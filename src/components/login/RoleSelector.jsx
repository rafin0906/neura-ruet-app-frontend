import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const RoleSelector = ({ selectedRole, onSelect }) => {
  const roles = [
    { id: 'student', label: 'Student Login' },
    { id: 'teacher', label: 'Teacher Login' },
  ];

  const renderButton = (role, isFullWidth = false) => {
    const isActive = selectedRole === role.id;
    return (
      <TouchableOpacity
        key={role.id}
        style={[
          styles.button,
          isActive ? styles.activeButton : styles.inactiveButton,
          isFullWidth && styles.crButton,
        ]}
        onPress={() => onSelect(role.id)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.text,
            isActive ? styles.activeText : styles.inactiveText,
          ]}
        >
          {role.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {roles.map((role) => renderButton(role))}
      </View>
      <View style={styles.centerRow}>
        {renderButton({ id: 'cr', label: 'CR Login' }, true)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },
  centerRow: {
    alignItems: 'center',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crButton: {
    paddingHorizontal: 40, // Specific width control for CR button
    flex: 0, 
    minWidth: 140,
  },
  activeButton: {
    backgroundColor: '#99EF5E',
  },
  inactiveButton: {
    backgroundColor: '#212121',
  },
  text: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
  activeText: {
    color: '#000000',
  },
  inactiveText: {
    color: '#FFFFFF',
  },
});

export default RoleSelector;