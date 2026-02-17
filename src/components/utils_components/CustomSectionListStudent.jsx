import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const CustomSectionListStudent = ({ title, items, activeId, onPressItem, showDivider }) => {
    // If no items, render nothing
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
            
            {/* The List Wrapper expands to fill the flex space provided by the parent */}
            <View style={styles.listWrapper}>
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={(item) => String(item.id)}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                />
            </View>

            {showDivider && <View style={styles.divider} />}
        </View>
    );
};

const styles = StyleSheet.create({
    sectionContainer: {
        // Vital: Allows this section to grow and share space with other sections
        flex: 1, 
        marginBottom: 8, 
        marginTop: 12,
        overflow: 'hidden', // Keeps the list contained
    },
    sectionLabel: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        color: '#A6A6A6',
        marginBottom: 10,
        paddingHorizontal: 4,
    },
    listWrapper: {
        // Vital: Fills the remaining height in the sectionContainer
        flex: 1, 
    },
    list: {
        flex: 1,
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
        backgroundColor: 'rgba(255,255,255,0.1)', 
        marginTop: 16,
        width: '100%',
    },
});

export default CustomSectionListStudent;