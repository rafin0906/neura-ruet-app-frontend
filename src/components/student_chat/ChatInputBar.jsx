import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Text,
  Modal,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const tools = [
  { id: 'check_marks', label: 'Check Marks', icon: require('../../../assets/icons/check_marks_icon.png') },
  { id: 'view_notices', label: 'View Notices', icon: require('../../../assets/icons/view_notices_icon.png') },
  { id: 'generate_cover_page', label: 'Generate Cover Page', icon: require('../../../assets/icons/generate_cover_page_icon.png') },
  { id: 'find_materials', label: 'Find Materials', icon: require('../../../assets/icons/find_materials_icon.png') },
];

const ChatInputBar = ({ onSend, currentTool, setCurrentTool }) => {
  const [inputText, setInputText] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [showToolError, setShowToolError] = useState(false); 

  // REMOVED: The useEffect that auto-set the default tool was removed here 
  // to prevent overriding the user's selection during message sending.

  const handleSend = () => {
    // Double check input exists (though button is disabled otherwise)
    if (inputText.trim()) {
      // Validation: Check if a tool is selected
      if (!currentTool) {
        setShowToolError(true); 
        setMenuVisible(true);   
        Keyboard.dismiss();
        return; 
      }

      onSend(inputText);
      setInputText('');
      Keyboard.dismiss();
      setShowToolError(false); 
    }
  };

  const selectTool = (tool) => {
    setCurrentTool(tool);
    setMenuVisible(false);
    setShowToolError(false);
  };

  // Determine if input is empty to toggle disabled state
  const isInputEmpty = !inputText.trim();

  return (
    <LinearGradient
      colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)', '#000000']}
      style={styles.container}
    >

      {/* Tool Pill (Selected Tool) */}
      {currentTool && (
        <View style={styles.toolPillContainer}>
          <View style={styles.toolPill}>
            <Image source={currentTool.icon} style={styles.pillIcon} resizeMode="contain" />
            <Text style={styles.pillText}>{currentTool.label}</Text>
          </View>
        </View>
      )}

      {/* Tool Menu Popup */}
      {menuVisible && (
        <Modal transparent animationType="fade" visible={menuVisible} onRequestClose={() => setMenuVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.menuContainer}>
                
                {/* Validation Text */}
                {showToolError && (
                  <Text style={styles.toolErrorText}>
                    Please select a tool
                  </Text>
                )}

                {tools.map((tool) => (
                  <TouchableOpacity
                    key={tool.id}
                    style={styles.menuItem}
                    onPress={() => selectTool(tool)}
                  >
                    <Image source={tool.icon} style={styles.menuIcon} resizeMode="contain" />
                    <Text style={styles.menuText}>{tool.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      <View style={styles.inputRow}>
        {/* Plus Button */}
        <TouchableOpacity
          style={styles.plusButton}
          onPress={() => {
            setMenuVisible(!menuVisible);
            setShowToolError(false);
          }}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../../assets/icons/tool_select_plus_icon.png')}
            style={styles.plusIcon}
          />
        </TouchableOpacity>

        {/* Text Input Wrapper */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Write here..."
            placeholderTextColor="#A6A6A6"
            value={inputText}
            onChangeText={setInputText}
            multiline
            scrollEnabled={true}
          />

          {/* Send Button */}
          <TouchableOpacity
            style={[styles.sendButton, isInputEmpty && styles.sendButtonDisabled]} // Dynamic Style
            onPress={handleSend}
            activeOpacity={0.8}
            disabled={isInputEmpty} // Block interaction
          >
            <Image
              source={require('../../../assets/icons/message_send_icon.png')}
              style={[styles.sendIcon, isInputEmpty && styles.sendIconDisabled]} // Dynamic Tint
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    width: '100%',
  },
  toolPillContainer: {
    position: 'absolute',
    top: -30,
    left: 20,
    zIndex: 10,
  },
  toolPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3d6125',
    borderColor: '#99EF5E',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pillIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
    tintColor: '#FFFFFF',
  },
  pillText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 10,
    width: 220,
    borderWidth: 1,
    borderColor: '#333',
  },
  toolErrorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#FF453A',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  menuIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: '#FFFFFF',
  },
  menuText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  plusButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#212121',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  plusIcon: {
    width: 20,
    height: 20,
    tintColor: '#808080',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#212121',
    borderRadius: 26,
    paddingLeft: 20,
    paddingRight: 6,
    paddingVertical: 6,
    minHeight: 50,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#FFFFFF',
    paddingTop: 8,
    paddingBottom: 8,
    marginRight: 10,
  },
  // Default Send Button (Active)
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#99EF5E', // Green
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  // Disabled Send Button (Blocked)
  sendButtonDisabled: {
    backgroundColor: '#333333', // Dark Grey
  },
  // Default Icon (Black)
  sendIcon: {
    width: 18,
    height: 18,
    tintColor: '#000000',
    marginLeft: 3,
  },
  // Disabled Icon (Grey)
  sendIconDisabled: {
    tintColor: '#666666',
  },
});

export default ChatInputBar;