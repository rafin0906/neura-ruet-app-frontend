// src/components/utils/CustomSectionList.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const CustomSectionList = ({ title, items, activeId, onPressItem, showDivider }) => {
    // If no items, do not render this section
    if (!items || items.length === 0) return null;

    const renderItem = ({ item }) => {
        const isActive = item.id === activeId;
        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => onPressItem(item.id)}
                style={styles.itemRow}
            >
                <Text 
                    style={[styles.itemText, isActive && styles.itemTextActive]} 
                    numberOfLines={1}
                >
                    {item.title}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>{title}</Text>
            
            {/* Use FlatList with a maxHeight to make this section 
                independently scrollable.
            */}
            <View style={styles.listWrapper}>
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={(item) => String(item.id)}
                    showsVerticalScrollIndicator={true} // Show scrollbar so user knows it scrolls
                    nestedScrollEnabled={true}
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                />
            </View>

            {/* Conditionally render the horizontal divider */}
            {showDivider && <View style={styles.divider} />}
        </View>
    );
};

const styles = StyleSheet.create({
    sectionContainer: {
        marginBottom: 16, 
        marginTop: 12,
    },
    sectionLabel: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        color: '#A6A6A6',
        marginBottom: 10,
        paddingHorizontal: 4, // Align with text
    },
    listWrapper: {
        // Constrain height to allow scrolling within this box
        maxHeight: 180, 
    },
    list: {
        flexGrow: 0,
    },
    listContent: {
        paddingBottom: 4,
    },
    itemRow: {
        paddingVertical: 6,
        paddingHorizontal: 4,
    },
    itemText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.8,
    },
    itemTextActive: {
        color: '#FFFFFF',
        opacity: 1,
        fontFamily: 'Poppins-Medium',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)', // Subtle grey line
        marginTop: 16,
        width: '100%',
    },
});

export default CustomSectionList;