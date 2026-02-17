// src/components/profile_update/CustomDropDown.jsx
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  Modal, 
  TouchableWithoutFeedback, 
  StyleSheet 
} from 'react-native';

const CustomDropDown = ({ 
  label, 
  value, 
  isVisible, 
  setVisible, 
  options, 
  onSelect,
  error,
  required = false
}) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label}{required && <Text style={styles.requiredStar}></Text>}
      </Text>
      
      <TouchableOpacity 
        style={[styles.dropdownButton, error && styles.inputError]} 
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.inputText, !value && styles.placeholderText]}>
          {value || `Select ${label}`}
        </Text>
        <Image 
          source={require('../../../assets/icons/down_arrow_icon.png')} 
          style={styles.arrowIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {options.map((item, index) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.modalItem,
                    index < options.length - 1 && styles.modalItemBorder
                  ]}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {item === value && (
                    <Image 
                      source={require('../../../assets/icons/down_arrow_icon.png')} 
                      style={[styles.arrowIcon, { transform: [{ rotate: '-90deg' }], width: 12, height: 12 }]} 
                      resizeMode="contain"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 8,
    marginLeft: 4,
  },
  requiredStar: {
    color: '#C1B748',
  },
  dropdownButton: {
    backgroundColor: '#212121',
    borderRadius: 14,
    height: 54,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#C1B748',
  },
  inputText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#FFFFFF',
  },
  placeholderText: {
    color: '#4e4e4e',
  },
  arrowIcon: {
    width: 14,
    height: 14,
    tintColor: '#FFFFFF',
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#C1B748',
    marginTop: 4,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#212121',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalItemText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#FFFFFF',
  },
});

export default CustomDropDown;