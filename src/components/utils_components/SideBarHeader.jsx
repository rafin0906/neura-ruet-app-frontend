// src/components/student_side_bar/SideBarHeader.jsx
import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';

const SideBarHeader = ({ searchText, setSearchText, onPressNewChat }) => {
    return (
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <Image
                    source={require('../../../assets/icons/search_icon.png')}
                    style={styles.searchIcon}
                    resizeMode="contain"
                />
                <TextInput
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="Search"
                    placeholderTextColor="#A6A6A6"
                    style={styles.searchInput}
                />
            </View>

            <TouchableOpacity activeOpacity={0.85} style={styles.newChatRow} onPress={onPressNewChat}>
                <Image
                    source={require('../../../assets/icons/new_chat_icon.png')}
                    style={styles.newChatIcon}
                    resizeMode="contain"
                />
                <Text style={styles.newChatText}>New Chat</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 18,
        paddingTop: 14,
    },
    searchBar: {
        height: 44,
        borderRadius: 22,
        backgroundColor: '#111113',
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchIcon: {
        width: 18,
        height: 18,
        tintColor: '#A6A6A6',
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
        color: '#FFFFFF',
        paddingTop: 0,
        paddingBottom: 0,
    },
    newChatRow: {
        marginTop: 14,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    newChatIcon: {
        width: 18,
        height: 18,
        tintColor: '#A6A6A6',
        marginRight: 12,
    },
    newChatText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
        color: '#FFFFFF',
    },
});

export default SideBarHeader;
