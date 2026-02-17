import API from '../utils/api/apiClient';

export const CR_MATERIAL_TYPE = {
    CLASS_NOTE: 'Class Note',
    CT_QUESTION: 'CT Question',
    LECTURE_SLIDE: 'Lecture Slide',
    SEMESTER_QUESTION: 'Semester Question',
};

export const CR_MATERIAL_TYPE_KEY = {
    CLASS_NOTE: 'class_note',
    CT_QUESTION: 'ct_question',
    LECTURE_SLIDE: 'lecture_slide',
    SEMESTER_QUESTION: 'semester_question',
};

function encodeId(id) {
    return encodeURIComponent(String(id ?? '').trim());
}

export async function uploadCrClassNote(payload) {
    // POST /crs/materials/class-notes
    const response = await API.post('/api/v1/crs/materials/class-notes', payload);
    return response?.data;
}

export async function uploadCrCtQuestion(payload) {
    // POST /crs/materials/ct-questions
    const response = await API.post('/api/v1/crs/materials/ct-questions', payload);
    return response?.data;
}

export async function uploadCrLectureSlide(payload) {
    // POST /crs/materials/lecture-slides
    const response = await API.post('/api/v1/crs/materials/lecture-slides', payload);
    return response?.data;
}

export async function uploadCrSemesterQuestion(payload) {
    // POST /crs/materials/semester-questions
    const response = await API.post('/api/v1/crs/materials/semester-questions', payload);
    return response?.data;
}

export async function listCrClassNotes() {
    const response = await API.get('/api/v1/crs/materials/class-notes');
    return Array.isArray(response?.data) ? response.data : [];
}

export async function listCrCtQuestions() {
    const response = await API.get('/api/v1/crs/materials/ct-questions');
    return Array.isArray(response?.data) ? response.data : [];
}

export async function listCrLectureSlides() {
    const response = await API.get('/api/v1/crs/materials/lecture-slides');
    return Array.isArray(response?.data) ? response.data : [];
}

export async function listCrSemesterQuestions() {
    const response = await API.get('/api/v1/crs/materials/semester-questions');
    return Array.isArray(response?.data) ? response.data : [];
}

export async function getCrClassNoteById(noteId) {
    const response = await API.get(`/api/v1/crs/materials/class-notes/${encodeId(noteId)}`);
    return response?.data;
}

export async function getCrCtQuestionById(ctId) {
    const response = await API.get(`/api/v1/crs/materials/ct-questions/${encodeId(ctId)}`);
    return response?.data;
}

export async function getCrLectureSlideById(slideId) {
    const response = await API.get(`/api/v1/crs/materials/lecture-slides/${encodeId(slideId)}`);
    return response?.data;
}

export async function getCrSemesterQuestionById(sqId) {
    const response = await API.get(`/api/v1/crs/materials/semester-questions/${encodeId(sqId)}`);
    return response?.data;
}

export async function updateCrClassNote(noteId, payload) {
    const response = await API.patch(`/api/v1/crs/materials/class-notes/${encodeId(noteId)}`, payload);
    return response?.data;
}

export async function updateCrCtQuestion(ctId, payload) {
    const response = await API.patch(`/api/v1/crs/materials/ct-questions/${encodeId(ctId)}`, payload);
    return response?.data;
}

export async function updateCrLectureSlide(slideId, payload) {
    const response = await API.patch(`/api/v1/crs/materials/lecture-slides/${encodeId(slideId)}`, payload);
    return response?.data;
}

export async function updateCrSemesterQuestion(sqId, payload) {
    const response = await API.patch(`/api/v1/crs/materials/semester-questions/${encodeId(sqId)}`, payload);
    return response?.data;
}

export async function uploadCrMaterial(materialType, formData) {
    switch (materialType) {
        case CR_MATERIAL_TYPE.CLASS_NOTE:
            return uploadCrClassNote(formData);
        case CR_MATERIAL_TYPE.CT_QUESTION:
            return uploadCrCtQuestion(formData);
        case CR_MATERIAL_TYPE.LECTURE_SLIDE:
            return uploadCrLectureSlide(formData);
        case CR_MATERIAL_TYPE.SEMESTER_QUESTION:
            return uploadCrSemesterQuestion(formData);
        default:
            throw new Error('Please select a valid material type.');
    }
}

export async function getCrMaterialByTypeAndId(materialType, materialId) {
    switch (materialType) {
        case CR_MATERIAL_TYPE.CLASS_NOTE:
            return getCrClassNoteById(materialId);
        case CR_MATERIAL_TYPE.CT_QUESTION:
            return getCrCtQuestionById(materialId);
        case CR_MATERIAL_TYPE.LECTURE_SLIDE:
            return getCrLectureSlideById(materialId);
        case CR_MATERIAL_TYPE.SEMESTER_QUESTION:
            return getCrSemesterQuestionById(materialId);
        default:
            throw new Error('Invalid material type');
    }
}

export async function updateCrMaterial(materialType, materialId, payload) {
    switch (materialType) {
        case CR_MATERIAL_TYPE.CLASS_NOTE:
            return updateCrClassNote(materialId, payload);
        case CR_MATERIAL_TYPE.CT_QUESTION:
            return updateCrCtQuestion(materialId, payload);
        case CR_MATERIAL_TYPE.LECTURE_SLIDE:
            return updateCrLectureSlide(materialId, payload);
        case CR_MATERIAL_TYPE.SEMESTER_QUESTION:
            return updateCrSemesterQuestion(materialId, payload);
        default:
            throw new Error('Invalid material type');
    }
}
