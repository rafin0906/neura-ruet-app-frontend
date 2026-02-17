import React, { useRef } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Alert 
} from 'react-native';

const MarkSheetForm = ({ 
    startRoll, 
    setStartRoll, 
    endRoll, 
    setEndRoll, 
    generatedRolls, 
    setGeneratedRolls 
}) => {
    
    // Ref to store input refs for auto-focus
    const inputRefs = useRef([]);

    const handleGenerate = () => {
        const start = parseInt(startRoll);
        const end = parseInt(endRoll);
        
        if (isNaN(start) || isNaN(end)) {
            Alert.alert("Invalid Input", "Please enter valid numbers.");
            return;
        }

        if (end < start) {
            Alert.alert("Invalid Range", "Ending roll must be greater than starting roll.");
            return;
        }

        const totalRolls = end - start + 1;

        if (totalRolls > 70) {
            Alert.alert("Limit Exceeded", "You can only generate up to 70 rolls at a time.");
            return;
        }

        const rolls = [];
        for (let i = start; i <= end; i++) {
            // Initialize with empty marks
            rolls.push({ roll: i.toString(), marks: '' });
        }
        setGeneratedRolls(rolls);
        
        // Reset refs
        inputRefs.current = new Array(rolls.length).fill(null);
    };

    // Update marks for a specific student
    const handleMarkChange = (text, index) => {
        const updatedRolls = [...generatedRolls];
        updatedRolls[index].marks = text;
        setGeneratedRolls(updatedRolls);
    };

    const focusNextInput = (index) => {
        if (index < generatedRolls.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const renderColumnWise = () => {
        if (generatedRolls.length === 0) return null;

        const numColumns = 3;
        const itemsPerCol = Math.ceil(generatedRolls.length / numColumns);
        
        const column1 = generatedRolls.slice(0, itemsPerCol).map((item, i) => ({...item, originalIndex: i}));
        const column2 = generatedRolls.slice(itemsPerCol, itemsPerCol * 2).map((item, i) => ({...item, originalIndex: itemsPerCol + i}));
        const column3 = generatedRolls.slice(itemsPerCol * 2).map((item, i) => ({...item, originalIndex: (itemsPerCol * 2) + i}));

        const renderItem = (item) => (
            <View key={item.roll} style={styles.gridItem}>
                <View style={styles.rollSquare}>
                    <Text style={styles.rollText}>{item.roll}</Text>
                </View>
                <Text style={styles.colon}>:</Text>
                <TextInput 
                    ref={el => inputRefs.current[item.originalIndex] = el}
                    style={styles.marksInput} 
                    
                    // Controlled Input
                    value={generatedRolls[item.originalIndex].marks} 
                    onChangeText={(text) => handleMarkChange(text, item.originalIndex)}
                    
                    placeholder="" 
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    returnKeyType={item.originalIndex < generatedRolls.length - 1 ? "next" : "done"}
                    blurOnSubmit={false}
                    onSubmitEditing={() => focusNextInput(item.originalIndex)}
                />
            </View>
        );

        return (
            <View style={styles.columnsContainer}>
                <View style={styles.columnWrapper}>{column1.map(renderItem)}</View>
                <View style={styles.columnWrapper}>{column2.map(renderItem)}</View>
                <View style={styles.columnWrapper}>{column3.map(renderItem)}</View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Roll Range Inputs */}
            <View style={styles.rangeRow}>
                <View style={styles.rangeInputWrapper}>
                    <Text style={styles.rangeLabel}>Starting Roll :</Text>
                    <TextInput 
                        style={styles.rangeInput} 
                        value={startRoll}
                        onChangeText={setStartRoll}
                        keyboardType="numeric"
                        placeholder='e.g. 2303121'
                        placeholderTextColor="#4e4e4e"
                    />
                </View>
                <View style={styles.rangeInputWrapper}>
                    <Text style={styles.rangeLabel}>Ending Roll :</Text>
                    <TextInput 
                        style={styles.rangeInput} 
                        value={endRoll}
                        onChangeText={setEndRoll}
                        keyboardType="numeric"
                        placeholder='e.g. 2303181'
                        placeholderTextColor="#4e4e4e"
                    />
                </View>
            </View>

            {/* Generate Button */}
            <View style={styles.buttonWrapper}>
                <TouchableOpacity 
                    style={styles.generateButton} 
                    activeOpacity={0.8}
                    onPress={handleGenerate}
                >
                    <Text style={styles.generateButtonText}>Generate Form</Text>
                </TouchableOpacity>
            </View>

            {/* Grid Headers */}
            {generatedRolls.length > 0 && (
                <View style={styles.gridHeaderRow}>
                    <View style={styles.colHeader}><Text style={styles.headerText}>Roll</Text><Text style={styles.headerText}>Marks</Text></View>
                    <View style={styles.colHeader}><Text style={styles.headerText}>Roll</Text><Text style={styles.headerText}>Marks</Text></View>
                    <View style={styles.colHeader}><Text style={styles.headerText}>Roll</Text><Text style={styles.headerText}>Marks</Text></View>
                </View>
            )}

            {/* Render Columns */}
            {renderColumnWise()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { paddingHorizontal: 20, marginBottom: 20 },
    rangeRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 15, marginBottom: 20 },
    rangeInputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    rangeLabel: { fontFamily: 'Poppins-Regular', fontSize: 12, color: '#FFFFFF' },
    rangeInput: { backgroundColor: '#212121', borderRadius: 8, width: 80, height: 30, textAlign: 'center', color: '#FFFFFF', fontFamily: 'Poppins-Medium', fontSize: 12, padding: 0 },
    buttonWrapper: { alignItems: 'center', marginBottom: 24 },
    generateButton: { backgroundColor: '#99EF5E', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 20 },
    generateButtonText: { fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#000000' },
    gridHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    colHeader: { flexDirection: 'row', gap: 20, width: '32%', justifyContent: 'center' },
    headerText: { fontFamily: 'Poppins-Medium', fontSize: 12, color: '#FFFFFF' },
    columnsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    columnWrapper: { width: '32%', alignItems: 'center' },
    gridItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'center' },
    rollSquare: { width: 52, height: 32, borderRadius: 8, backgroundColor: '#99EF5E', justifyContent: 'center', alignItems: 'center' },
    rollText: { fontFamily: 'Poppins-SemiBold', fontSize: 11, color: '#000000' },
    colon: { color: '#FFFFFF', marginHorizontal: 5, fontSize: 12, fontFamily: 'Poppins-Bold' },
    marksInput: { backgroundColor: '#212121', width: 36, height: 32, borderRadius: 8, textAlign: 'center', color: '#FFFFFF', fontFamily: 'Poppins-Medium', fontSize: 12, padding: 0 },
});

export default MarkSheetForm;