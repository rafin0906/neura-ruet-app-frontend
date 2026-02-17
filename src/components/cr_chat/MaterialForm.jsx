import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';

// Import your existing CustomDropDown
import CustomDropDown from '../profile_setup/CustomDropDown';

import {
    CR_MATERIAL_TYPE,
    getCrMaterialByTypeAndId,
    updateCrMaterial,
    uploadCrMaterial,
} from '../../services/crMaterialUploadService';

const MaterialForm = ({ materialKey, materialType, materialId, onUploadSuccess, onInitialLoading }) => {
    const { control, handleSubmit, formState: { errors }, reset, watch } = useForm({
        defaultValues: {
            driveLink: '',
            materialType: '', // Default
            courseCode: '',
            courseName: '',
            topic: '',
            writtenBy: '',
            ctNo: '',
            year: '',
        }
    });

    const isEditing = useMemo(() => {
        const t = String(materialType ?? '').trim();
        const id = String(materialId ?? '').trim();
        return Boolean(t && id);
    }, [materialType, materialId]);

    const [initialValues, setInitialValues] = useState(null);

    const selectedMaterialType = watch('materialType');

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Dropdown Visibility States
    const [typeVisible, setTypeVisible] = useState(false);

    const onInitialLoadingRef = useRef(onInitialLoading);
    useEffect(() => {
        onInitialLoadingRef.current = onInitialLoading;
    }, [onInitialLoading]);

    // Data
    const materialTypes = useMemo(
        () => [
            CR_MATERIAL_TYPE.CLASS_NOTE,
            CR_MATERIAL_TYPE.CT_QUESTION,
            CR_MATERIAL_TYPE.LECTURE_SLIDE,
            CR_MATERIAL_TYPE.SEMESTER_QUESTION,
        ],
        []
    );

    const setTypeVisibleSafe = (visible) => {
        if (isEditing) return;
        setTypeVisible(visible);
    };

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                try { onInitialLoadingRef.current?.(true); } catch { }

                if (!isEditing) {
                    const empty = {
                        driveLink: '',
                        materialType: materialType && materialTypes.includes(materialType) ? materialType : '',
                        courseCode: '',
                        courseName: '',
                        topic: '',
                        writtenBy: '',
                        ctNo: '',
                        year: '',
                    };
                    setInitialValues(empty);
                    reset(empty);
                    return;
                }

                try {
                    const data = await getCrMaterialByTypeAndId(materialType, materialId);
                    if (cancelled) return;

                    const next = {
                        driveLink: data?.drive_url != null ? String(data.drive_url) : '',
                        materialType: materialType,
                        courseCode: data?.course_code != null ? String(data.course_code) : '',
                        courseName: data?.course_name != null ? String(data.course_name) : '',
                        topic: data?.topic != null ? String(data.topic) : '',
                        writtenBy: data?.written_by != null ? String(data.written_by) : '',
                        ctNo: data?.ct_no != null ? String(data.ct_no) : '',
                        year: data?.year != null ? String(data.year) : '',
                    };

                    setInitialValues(next);
                    reset(next);
                } catch (e) {
                    // Keep UI simple (same style as other forms)
                    setSubmitError(e?.message || 'Failed to load material');
                }
            } finally {
                try { onInitialLoadingRef.current?.(false); } catch { }
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [isEditing, materialType, materialId, materialTypes, reset]);

    const onSubmit = async (data) => {
        setSubmitError('');
        setSubmitting(true);
        try {
            const effectiveMaterialType = isEditing ? materialType : selectedMaterialType;
            if (!effectiveMaterialType) {
                throw new Error('Material Type is required');
            }

            const driveUrl = (data.driveLink || '').trim();
            const courseCode = (data.courseCode || '').trim();
            const courseName = (data.courseName || '').trim();
            const topic = (data.topic || '').trim();
            const writtenBy = (data.writtenBy || '').trim();
            const ctNoRaw = (data.ctNo || '').trim();
            const yearRaw = (data.year || '').trim();

            let payload = null;

            if (effectiveMaterialType === CR_MATERIAL_TYPE.CLASS_NOTE) {
                payload = {
                    drive_url: driveUrl,
                    course_code: courseCode,
                    course_name: courseName,
                    topic,
                    written_by: writtenBy,
                };
            } else if (effectiveMaterialType === CR_MATERIAL_TYPE.CT_QUESTION) {
                payload = {
                    drive_url: driveUrl,
                    course_code: courseCode,
                    course_name: courseName,
                    ct_no: Number(ctNoRaw),
                };
            } else if (effectiveMaterialType === CR_MATERIAL_TYPE.LECTURE_SLIDE) {
                payload = {
                    drive_url: driveUrl,
                    course_code: courseCode,
                    course_name: courseName,
                    topic,
                };
            } else if (effectiveMaterialType === CR_MATERIAL_TYPE.SEMESTER_QUESTION) {
                payload = {
                    drive_url: driveUrl,
                    course_code: courseCode,
                    course_name: courseName,
                    year: Number(yearRaw),
                };
            }

            const saved = isEditing
                ? await updateCrMaterial(effectiveMaterialType, materialId, payload)
                : await uploadCrMaterial(effectiveMaterialType, payload);

            if (onUploadSuccess) onUploadSuccess(saved);

            if (!isEditing) {
                reset({
                    driveLink: '',
                    materialType: effectiveMaterialType || CR_MATERIAL_TYPE.CLASS_NOTE,
                    courseCode: '',
                    courseName: '',
                    topic: '',
                    writtenBy: '',
                    ctNo: '',
                    year: '',
                });
            } else {
                const nextInit = {
                    driveLink: driveUrl,
                    materialType: effectiveMaterialType,
                    courseCode: courseCode,
                    courseName: courseName,
                    topic: topic,
                    writtenBy: writtenBy,
                    ctNo: ctNoRaw,
                    year: yearRaw,
                };
                setInitialValues(nextInit);
                reset(nextInit);
            }
        } catch (err) {
            setSubmitError(err?.message || 'Upload failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Reusable Input Component
    const InputField = ({ label, name, placeholder, required = true }) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <Controller
                control={control}
                rules={{ required: required ? `${label} is required` : false }}
                name={name}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={[
                            styles.inputContainer,
                            errors[name] && styles.inputError
                        ]}
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
        <View style={styles.formContainer}>

            {/* Drive Link (Common) */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Upload material drive link here</Text>
                <Controller
                    control={control}
                    rules={{ required: "Link is required" }}
                    name="driveLink"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={[
                                styles.inputContainer,
                                styles.textArea,
                                errors.driveLink && styles.inputError
                            ]}
                            placeholder="Paste your link here..."
                            placeholderTextColor="#4e4e4e"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            multiline
                            textAlignVertical="top"
                        />
                    )}
                />
                {errors.driveLink && <Text style={styles.errorText}>{errors.driveLink.message}</Text>}
            </View>

            {/* Material Type Dropdown (Common) */}
            <Controller
                control={control}
                name="materialType"
                rules={{ required: true }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <CustomDropDown
                        label="Material Type"
                        value={value}
                        options={materialTypes}
                        isVisible={typeVisible}
                        setVisible={setTypeVisibleSafe}
                        onSelect={onChange}
                        error={error?.message}
                    />
                )}
            />

            {/* --- Conditional Form Fields --- */}

            {/* 1. Class Note */}
            {selectedMaterialType === 'Class Note' && (
                <>
                    <InputField label="Course Code" name="courseCode" placeholder="e.g. CSE-2100" />
                    <InputField label="Course Name" name="courseName" placeholder="e.g. Data Structure and Algorithm" />
                    <InputField label="Topic" name="topic" placeholder="Array" />
                    <InputField label="Written By" name="writtenBy" placeholder="Taieb Mahmud Rafin" />
                </>
            )}

            {/* 2. CT Question */}
            {selectedMaterialType === 'CT Question' && (
                <>
                    <InputField label="Course Code" name="courseCode" placeholder="e.g. CSE-2100" />
                    <InputField label="Course Name" name="courseName" placeholder="e.g. Data Structure and Algorithm" />
                    <InputField label="CT No" name="ctNo" placeholder="1" />
                </>
            )}

            {/* 3. Lecture Slide */}
            {selectedMaterialType === 'Lecture Slide' && (
                <>
                    <InputField label="Course Code" name="courseCode" placeholder="e.g. CSE-2100" />
                    <InputField label="Course Name" name="courseName" placeholder="e.g. Data Structure and Algorithm" />
                    <InputField label="Topic" name="topic" placeholder="Tree" />
                </>
            )}

            {/* 4. Semester Question */}
            {selectedMaterialType === 'Semester Question' && (
                <>
                    <InputField label="Course Code" name="courseCode" placeholder="e.g. CSE-2100" />
                    <InputField label="Course Name" name="courseName" placeholder="e.g. Data Structure and Algorithm" />
                    <InputField label="Year" name="year" placeholder="2021" />
                </>
            )}

            {/* Buttons */}
            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => (initialValues ? reset(initialValues) : reset())}
                    activeOpacity={0.8}
                    disabled={submitting}
                >
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.uploadButton, submitting && styles.buttonDisabled]}
                    onPress={handleSubmit(onSubmit)}
                    activeOpacity={0.8}
                    disabled={submitting}
                >
                    <Text style={styles.uploadText}>
                        {submitting ? (isEditing ? 'Updating...' : 'Uploading...') : (isEditing ? 'Update' : 'Upload')}
                    </Text>
                </TouchableOpacity>
            </View>

            {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

            {/* Spacer */}
            <View style={{ height: 100 }} />
        </View>
    );
};

const styles = StyleSheet.create({
    formContainer: {
        paddingHorizontal: 20,
    },
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
    inputContainer: {
        backgroundColor: '#212121',
        borderRadius: 14,
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontFamily: 'Poppins-Regular',
        fontSize: 13,
        color: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    textArea: {
        height: 80,
    },
    inputError: {
        borderColor: '#C1B748',
    },
    errorText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: '#C1B748',
        marginTop: 6,
        marginLeft: 4,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginTop: 20,
    },
    cancelButton: {
        backgroundColor: '#1A1814',
        borderRadius: 24,
        width: 120,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 16,
        color: '#FFFFFF',
    },
    uploadButton: {
        backgroundColor: '#99EF5E',
        borderRadius: 24,
        width: 120,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    uploadText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 16,
        color: '#000000',
    },
    submitError: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: '#C1B748',
        marginTop: 12,
        marginLeft: 4,
        textAlign: 'center',
    },
});

export default MaterialForm;