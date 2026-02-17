import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import CustomDropDown from '../profile_setup/CustomDropDown';

// Accepts onFormSubmit from parent
const ResultForm = ({ onFormSubmit, isSubmitting = false, initialValues, isEditing = false }) => {
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            ctNo: '',
            courseCode: '',
            courseName: '',
            department: '',
            section: '',
            series: '',
        }
    });

    const safeInitial = useMemo(() => {
        if (!initialValues) return null;
        return {
            ctNo: initialValues?.ctNo ?? '',
            courseCode: initialValues?.courseCode ?? '',
            courseName: initialValues?.courseName ?? '',
            department: initialValues?.department ?? '',
            section: initialValues?.section ?? '',
            series: initialValues?.series ?? '',
        };
    }, [initialValues]);

    useEffect(() => {
        if (!safeInitial) return;
        reset(safeInitial);
    }, [safeInitial, reset]);

    const [deptVisible, setDeptVisible] = useState(false);
    const [secVisible, setSecVisible] = useState(false);

    const departments = ["EEE", "CSE", "ETE", "ECE", "CE", "URP", "ARCH", "BECM", "ME", "IPE", "CME", "MTE", "MSE", "CHE"];
    const sections = ["A", "B", "C", "None"];

    const onSubmit = (data) => {
        // Send data to parent for aggregation and API call
        if (onFormSubmit) {
            onFormSubmit(data);
        }
        if (!isEditing) {
            reset(); // Clear form fields
        }
    };

    const InputField = ({ label, name, placeholder, required = true }) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <Controller
                control={control}
                rules={{ required: required ? `${label} is required` : false }}
                name={name}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={[styles.inputContainer, errors[name] && styles.inputError]}
                        placeholder={placeholder}
                        placeholderTextColor="#4e4e4e"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                    />
                )}
            />
            {errors[name] && <Text style={styles.errorText}>{errors[name].message}</Text>}
        </View>
    );

    return (
        <View style={styles.container}>
            <InputField label="CT no." name="ctNo" placeholder="e.g. 1" required={true} />
            <InputField label="Course Code" name="courseCode" placeholder="e.g. CSE-2100" />
            <InputField label="Course Name" name="courseName" placeholder="e.g. Data Structure and Algorithm" />

            <Controller
                control={control}
                name="department"
                rules={{ required: "Department is required" }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <CustomDropDown
                        label="Department"
                        value={value}
                        options={departments}
                        isVisible={deptVisible}
                        setVisible={setDeptVisible}
                        onSelect={onChange}
                        error={error?.message}
                    />
                )}
            />

            <Controller
                control={control}
                name="section"
                rules={{ required: "Section is required" }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <CustomDropDown
                        label="Section"
                        value={value}
                        options={sections}
                        isVisible={secVisible}
                        setVisible={setSecVisible}
                        onSelect={onChange}
                        error={error?.message}
                    />
                )}
            />

            <InputField label="Series" name="series" placeholder="e.g. 23" />

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => (safeInitial ? reset(safeInitial) : reset())}
                    activeOpacity={0.8}
                    disabled={isSubmitting}
                >
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.uploadButton, isSubmitting && styles.buttonDisabled]}
                    onPress={handleSubmit(onSubmit)}
                    activeOpacity={0.8}
                    disabled={isSubmitting}
                >
                    <Text style={styles.uploadText}>
                        {isSubmitting ? (isEditing ? 'Updating...' : 'Uploading...') : (isEditing ? 'Update' : 'Upload')}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 100 }} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { paddingHorizontal: 20 },
    inputGroup: { marginBottom: 16 },
    label: { fontFamily: 'Poppins-Regular', fontSize: 13, color: '#FFFFFF', marginBottom: 8, marginLeft: 4 },
    inputContainer: { backgroundColor: '#212121', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 16, fontFamily: 'Poppins-Regular', fontSize: 13, color: '#FFFFFF', borderWidth: 1, borderColor: 'transparent' },
    inputError: { borderColor: '#C1B748' },
    errorText: { fontFamily: 'Poppins-Regular', fontSize: 12, color: '#C1B748', marginTop: 6, marginLeft: 4 },
    buttonRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 20 },
    cancelButton: { backgroundColor: '#1A1814', borderRadius: 24, width: 120, height: 48, justifyContent: 'center', alignItems: 'center' },
    cancelText: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: '#FFFFFF' },
    uploadButton: { backgroundColor: '#99EF5E', borderRadius: 24, width: 120, height: 48, justifyContent: 'center', alignItems: 'center' },
    // Added buttonDisabled style
    buttonDisabled: { opacity: 0.5 },
    uploadText: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: '#000000' },
});

export default ResultForm;