import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Text,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

// Components
import ChatHeader from './ChatHeader';
import ResultCreateMessage from './ResultCreateMessage';
import MarkSheetForm from './MarkSheetForm';
import ResultForm from './ResultForm';
import ScreenLoadingOverlay from '../splash/ScreenLoadingOverlay';

import {
    createTeacherResultSheet,
    batchUpsertTeacherResultEntries,
    getTeacherResultSheetById,
    updateTeacherResultSheet,
} from '../../services/teacherResultSheetService';

const ResultCreateScreen = ({ onResultsShouldRefresh }) => {
    const navigation = useNavigation();
    const route = useRoute();

    const sheetId = useMemo(() => {
        const id = route?.params?.sheetId;
        const cleaned = id == null ? '' : String(id).trim();
        return cleaned || null;
    }, [route?.params?.sheetId]);

    const isEditing = Boolean(sheetId);

    const scrollViewRef = useRef();
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);

    const [initialMeta, setInitialMeta] = useState(null);

    // --- LIFTED STATE (Master Data) ---
    const [startRoll, setStartRoll] = useState('');
    const [endRoll, setEndRoll] = useState('');
    const [generatedRolls, setGeneratedRolls] = useState([]); // Array of { roll, marks }

    const handleUploadSuccess = () => {
        setUploadSuccess(true);
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const handleCreateNew = () => {
        setUploadSuccess(false);
        setStartRoll('');
        setEndRoll('');
        setGeneratedRolls([]);
        setInitialMeta(null);
        try {
            navigation.setParams({ sheetId: undefined });
        } catch (e) { }
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }, 100);
    };

    useEffect(() => {
        let cancelled = false;

        const toFormSection = (value) => {
            if (value == null) return 'None';
            const cleaned = String(value).trim();
            if (!cleaned) return 'None';
            return cleaned;
        };

        const loadForEdit = async () => {
            if (!isEditing) {
                setInitialMeta(null);
                setInitialLoading(false);
                return;
            }

            try {
                setInitialLoading(true);
                const sheet = await getTeacherResultSheetById(sheetId);
                if (cancelled) return;

                const meta = {
                    ctNo: sheet?.ct_no != null ? String(sheet.ct_no) : '',
                    courseCode: sheet?.course_code != null ? String(sheet.course_code) : '',
                    courseName: sheet?.course_name != null ? String(sheet.course_name) : '',
                    department: sheet?.dept != null ? String(sheet.dept) : '',
                    section: toFormSection(sheet?.section),
                    series: sheet?.series != null ? String(sheet.series) : '',
                };
                setInitialMeta(meta);

                const entries = Array.isArray(sheet?.entries) ? sheet.entries : [];
                const entryRolls = entries
                    .map((e) => parseInt(String(e?.roll_no ?? '').trim(), 10))
                    .filter((n) => Number.isFinite(n));

                const startFromSheet = sheet?.starting_roll != null ? String(sheet.starting_roll).trim() : '';
                const endFromSheet = sheet?.ending_roll != null ? String(sheet.ending_roll).trim() : '';

                let nextStart = startFromSheet;
                let nextEnd = endFromSheet;

                if ((!nextStart || !nextEnd) && entryRolls.length > 0) {
                    const minRoll = Math.min(...entryRolls);
                    const maxRoll = Math.max(...entryRolls);
                    nextStart = nextStart || String(minRoll);
                    nextEnd = nextEnd || String(maxRoll);
                }

                setStartRoll(nextStart);
                setEndRoll(nextEnd);

                const startInt = parseInt(nextStart, 10);
                const endInt = parseInt(nextEnd, 10);

                if (Number.isFinite(startInt) && Number.isFinite(endInt) && endInt >= startInt && endInt - startInt + 1 <= 70) {
                    const marksByRoll = new Map();
                    for (const e of entries) {
                        const r = String(e?.roll_no ?? '').trim();
                        const m = String(e?.marks ?? '').trim().toUpperCase();
                        // Stored 'A' means absent; UI uses empty string
                        marksByRoll.set(r, m === 'A' ? '' : m);
                    }

                    const rolls = [];
                    for (let i = startInt; i <= endInt; i++) {
                        const rollStr = String(i);
                        rolls.push({ roll: rollStr, marks: marksByRoll.get(rollStr) ?? '' });
                    }
                    setGeneratedRolls(rolls);
                } else {
                    setGeneratedRolls([]);
                }

                setUploadSuccess(false);
                setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                }, 100);
            } catch (e) {
                // Keep screen usable even if load fails
                setInitialMeta(null);
            } finally {
                if (!cancelled) setInitialLoading(false);
            }
        };

        loadForEdit();
        return () => {
            cancelled = true;
        };
    }, [isEditing, sheetId, navigation]);

    // --- FINAL SUBMISSION HANDLER ---
    const normalizeSection = (value) => {
        if (value == null) return null;
        const cleaned = String(value).trim();
        if (cleaned === '' || cleaned.toLowerCase() === 'none' || cleaned.toLowerCase() === 'null') return null;
        return cleaned;
    };

    const normalizeMarks = (value) => {
        const cleaned = value == null ? '' : String(value).trim();
        if (cleaned === '') return 'A';
        return cleaned.toUpperCase();
    };

    const handleFinalSubmit = async (metaData) => {
        if (isSubmitting) return;

        if (!startRoll || !endRoll) {
            Alert.alert('Missing Range', 'Please enter starting and ending roll and generate the form.');
            return;
        }

        if (!Array.isArray(generatedRolls) || generatedRolls.length === 0) {
            Alert.alert('No Marks', 'Please generate the marks form first.');
            return;
        }

        const seriesInt = parseInt(metaData?.series, 10);
        if (Number.isNaN(seriesInt)) {
            Alert.alert('Invalid Series', 'Series must be a number (19–25).');
            return;
        }

        // CT no is required by backend; ensure it's provided and valid
        if (!metaData?.ctNo && metaData?.ctNo !== 0) {
            Alert.alert('Missing CT', 'CT no. is required');
            return;
        }
        const ctNoInt = parseInt(String(metaData.ctNo).trim(), 10);
        if (Number.isNaN(ctNoInt) || ctNoInt < 1) {
            Alert.alert('Invalid CT', 'CT no must be a positive integer.');
            return;
        }

        const sheetPayload = {
            ct_no: ctNoInt,
            course_code: String(metaData?.courseCode ?? '').trim(),
            course_name: String(metaData?.courseName ?? '').trim(),
            dept: String(metaData?.department ?? '').trim(),
            section: normalizeSection(metaData?.section),
            series: seriesInt,
            starting_roll: String(startRoll).trim(),
            ending_roll: String(endRoll).trim(),
        };

        const entriesPayload = {
            entries: generatedRolls.map((item) => ({
                roll_no: String(item?.roll ?? '').trim(),
                marks: normalizeMarks(item?.marks),
            })),
        };

        setIsSubmitting(true);
        try {
            const effectiveSheetId = isEditing ? sheetId : null;

            if (isEditing) {
                await updateTeacherResultSheet(effectiveSheetId, sheetPayload);
                await batchUpsertTeacherResultEntries(effectiveSheetId, entriesPayload);
            } else {
                const sheet = await createTeacherResultSheet(sheetPayload);
                const createdId = sheet?.id;
                if (!createdId) {
                    throw new Error('Create sheet did not return id');
                }
                await batchUpsertTeacherResultEntries(createdId, entriesPayload);
            }

            try {
                onResultsShouldRefresh?.();
            } catch (e) { }
            handleUploadSuccess();
        } catch (e) {
            const message = e?.message || 'Failed to upload result sheet.';
            Alert.alert('Upload Failed', message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />

            <View style={styles.container}>
                {initialLoading && <ScreenLoadingOverlay />}
                <View style={styles.headerContainer}>
                    <ChatHeader />
                </View>

                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 60}
                >
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <ResultCreateMessage />

                        {!uploadSuccess ? (
                            <>
                                {/* Pass State & Setters Down */}
                                <MarkSheetForm
                                    startRoll={startRoll}
                                    setStartRoll={setStartRoll}
                                    endRoll={endRoll}
                                    setEndRoll={setEndRoll}
                                    generatedRolls={generatedRolls}
                                    setGeneratedRolls={setGeneratedRolls}
                                />

                                {/* Pass Submit Handler Down */}
                                <ResultForm
                                    onFormSubmit={handleFinalSubmit}
                                    isSubmitting={isSubmitting}
                                    initialValues={initialMeta}
                                    isEditing={isEditing}
                                />
                            </>
                        ) : (
                            <View style={styles.successSection}>
                                <View style={styles.assistantWrapper}>
                                    <View style={styles.assistantBubble}>
                                        <Text style={styles.assistantText}>
                                            {isEditing ? 'Updated successfully!' : 'Uploaded successfully!'}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={styles.createNewButton}
                                    activeOpacity={0.8}
                                    onPress={handleCreateNew}
                                >
                                    <Text style={styles.createNewText}>Create New</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#000000' },
    container: { flex: 1, backgroundColor: '#000000' },
    headerContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
    scrollView: { flex: 1, marginTop: 0 },
    scrollContent: { paddingTop: 100, paddingBottom: 40 },
    successSection: { paddingHorizontal: 20 },
    assistantWrapper: { alignItems: 'flex-start', marginBottom: 20 },
    assistantBubble: { backgroundColor: '#212121', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, borderTopLeftRadius: 4 },
    assistantText: { fontFamily: 'Poppins-Regular', fontSize: 13, color: '#FFFFFF' },
    createNewButton: { backgroundColor: '#99EF5E', borderRadius: 24, height: 48, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', paddingHorizontal: 32 },
    createNewText: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: '#000000' },
});

export default ResultCreateScreen;