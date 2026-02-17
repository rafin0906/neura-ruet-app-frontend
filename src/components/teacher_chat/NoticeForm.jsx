// src/components/teacher_chat/NoticeForm.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import CustomDropDown from '../profile_setup/CustomDropDown';

import { createTeacherNotice, getTeacherNoticeById, updateTeacherNotice } from '../../services/teacherNoticeService';

const ALLOWED_DEPTS = [
    'CSE', 'EEE', 'ME', 'CE', 'IPE', 'ETE',
    'URP', 'ARCH', 'BME', 'MTE', 'GCE', 'WRE',
];

const NoticeForm = ({ noticeId, onUploadSuccess, onInitialLoading }) => {
    const isEditing = useMemo(() => {
        const id = String(noticeId ?? '').trim();
        return id.length > 0;
    }, [noticeId]);

    const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
        defaultValues: {
            title: '',
            description: '',
            department: '',
            section: '',
            series: '',
        },
    });

    const [initialValues, setInitialValues] = useState(null);

    const [deptModalVisible, setDeptModalVisible] = useState(false);
    const [sectionModalVisible, setSectionModalVisible] = useState(false);

    const sections = ['A', 'B', 'C', 'None'];
    const SECTION_ALLOWED = ['A', 'B', 'C', 'NONE'];

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!isEditing) {
                const empty = { title: '', description: '', department: '', section: '', series: '' };
                setInitialValues(empty);
                reset(empty);
                return;
            }

            try {
                const notice = await getTeacherNoticeById(noticeId);
                if (cancelled) return;

                const next = {
                    title: notice?.title ?? '',
                    description: notice?.notice_message ?? '',
                    department: notice?.dept ?? '',
                    section: notice?.sec ? String(notice.sec).toUpperCase() : 'None',
                    series: notice?.series != null ? String(notice.series) : '',
                };
                setInitialValues(next);
                reset(next);
            } catch (e) {
                if (!cancelled) {
                    Alert.alert('Failed to load notice', e?.message || 'Could not load notice details');
                }
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [isEditing, noticeId, reset]);

    const onSubmit = async (data) => {
        try {
            const rawSection = String(data?.section ?? '').trim();
            const normalizedSection = rawSection.toUpperCase();

            const payload = {
                title: String(data?.title ?? '').trim(),
                notice_message: String(data?.description ?? '').trim(),
                dept: String(data?.department ?? '').trim().toUpperCase(),
                sec: normalizedSection === 'NONE' ? null : normalizedSection,
                series: String(data?.series ?? '').trim(),
            };

            // Match backend constraints in TeacherNoticeCreate
            if (!payload.title || payload.title.length > 200) {
                throw new Error('Title must be between 1 and 200 characters');
            }
            if (!payload.notice_message) {
                throw new Error('Description is required');
            }
            if (!ALLOWED_DEPTS.includes(payload.dept)) {
                throw new Error('Department must be one of: ' + ALLOWED_DEPTS.join(', '));
            }
            if (!(payload.sec === null || ['A', 'B', 'C'].includes(payload.sec))) {
                throw new Error('Section must be A, B, C or None');
            }
            const seriesInt = Number.parseInt(payload.series, 10);
            if (!Number.isFinite(seriesInt) || seriesInt < 19 || seriesInt > 25) {
                throw new Error('Series must be a number between 19 and 25');
            }

            const saved = isEditing
                ? await updateTeacherNotice(noticeId, payload)
                : await createTeacherNotice(payload);

            onUploadSuccess?.(saved);
            if (!isEditing) {
                reset();
            } else {
                const nextInit = {
                    title: payload.title,
                    description: payload.notice_message,
                    department: payload.dept,
                    section: payload.sec === null ? 'None' : payload.sec,
                    series: payload.series,
                };
                setInitialValues(nextInit);
                reset(nextInit);
            }
        } catch (e) {
            Alert.alert('Upload failed', e?.message || 'Failed to upload notice');
        }
    };

    return (
        <View style={styles.formContainer}>
            {/* Title Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Title</Text>
                <Controller
                    control={control}
                    rules={{
                        required: 'Title is required',
                        maxLength: { value: 200, message: 'Max 200 characters' },
                    }}
                    name="title"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={[styles.inputContainer, errors.title && styles.inputError]}
                            placeholder="Give a suitable title..."
                            placeholderTextColor="#4e4e4e"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                        />
                    )}
                />
                {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <Controller
                    control={control}
                    rules={{ required: 'Description is required' }}
                    name="description"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={[styles.inputContainer, styles.textArea, errors.description && styles.inputError]}
                            placeholder="Write your notice here..."
                            placeholderTextColor="#4e4e4e"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            multiline
                            textAlignVertical="top"
                        />
                    )}
                />
                {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}
            </View>

            {/* Department Dropdown */}
            <Controller
                control={control}
                rules={{
                    required: 'Department is required',
                    validate: (v) => ALLOWED_DEPTS.includes(String(v || '').toUpperCase()) || 'Invalid department',
                }}
                name="department"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <CustomDropDown
                        label="Department"
                        value={value}
                        isVisible={deptModalVisible}
                        setVisible={setDeptModalVisible}
                        options={ALLOWED_DEPTS}
                        onSelect={onChange}
                        error={error?.message}
                    />
                )}
            />

            {/* Section Dropdown */}
            <Controller
                control={control}
                rules={{
                    required: 'Section is required',
                    validate: (v) => {
                        const normalized = String(v || '').trim().toUpperCase();
                        return SECTION_ALLOWED.includes(normalized) || 'Invalid section';
                    },
                }}
                name="section"
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <CustomDropDown
                        label="Section"
                        value={value}
                        isVisible={sectionModalVisible}
                        setVisible={setSectionModalVisible}
                        options={sections}
                        onSelect={onChange}
                        error={error?.message}
                    />
                )}
            />

            {/* Series Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Series</Text>
                <Controller
                    control={control}
                    rules={{
                        required: 'Series is required',
                        validate: (v) => {
                            const n = Number.parseInt(String(v || ''), 10);
                            if (!Number.isFinite(n)) return 'Series must be a number';
                            if (n < 19 || n > 25) return 'Series must be between 19 and 25';
                            return true;
                        },
                    }}
                    name="series"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={[styles.inputContainer, errors.series && styles.inputError]}
                            placeholder="e.g. 23"
                            placeholderTextColor="#4e4e4e"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            keyboardType="default"
                        />
                    )}
                />
                {errors.series && <Text style={styles.errorText}>{errors.series.message}</Text>}
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => (initialValues ? reset(initialValues) : reset())}
                    activeOpacity={0.8}
                    disabled={isSubmitting}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.uploadButton, isSubmitting && styles.buttonDisabled]}
                    onPress={handleSubmit(onSubmit)}
                    activeOpacity={0.8}
                    disabled={isSubmitting}
                >
                    <Text style={styles.uploadButtonText}>
                        {isSubmitting ? (isEditing ? 'Updating...' : 'Uploading...') : (isEditing ? 'Update' : 'Upload')}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 100 }} />
        </View>
    );
};

const styles = StyleSheet.create({
    formContainer: { paddingHorizontal: 20 },
    inputGroup: { marginBottom: 20 },
    label: { fontFamily: 'Poppins-Regular', fontSize: 13, color: '#FFFFFF', marginBottom: 8, marginLeft: 4 },
    inputContainer: { backgroundColor: '#212121', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 16, fontFamily: 'Poppins-Regular', fontSize: 13, color: '#FFFFFF', borderWidth: 1, borderColor: 'transparent' },
    textArea: { height: 120, paddingTop: 16 },
    inputError: { borderColor: '#C1B748' },
    errorText: { fontFamily: 'Poppins-Regular', fontSize: 12, color: '#C1B748', marginTop: 6, marginLeft: 4 },
    buttonRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 10 },
    cancelButton: { backgroundColor: '#1A1814', borderRadius: 24, width: 120, height: 48, alignItems: 'center', justifyContent: 'center' },
    cancelButtonText: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: '#FFFFFF' },
    uploadButton: { backgroundColor: '#99EF5E', borderRadius: 24, width: 120, height: 48, alignItems: 'center', justifyContent: 'center' },
    // Added buttonDisabled style
    buttonDisabled: { opacity: 0.5 },
    uploadButtonText: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: '#000000' },
});

export default NoticeForm;