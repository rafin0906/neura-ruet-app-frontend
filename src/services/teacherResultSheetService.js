import API from '../utils/api/apiClient';

// Endpoints:
// - POST /api/v1/result-sheets/
// - POST /api/v1/result-sheets/{sheet_id}/entries/batch
// - GET  /api/v1/result-sheets/get-by-id/{sheet_id}
// - GET  /api/v1/result-sheets/get-all
// - PATCH /api/v1/result-sheets/{sheet_id}

export async function createTeacherResultSheet(payload) {
    const response = await API.post('/api/v1/result-sheets/', payload);
    return response?.data;
}

export async function batchUpsertTeacherResultEntries(sheetId, payload) {
    const response = await API.post(`/api/v1/result-sheets/${sheetId}/entries/batch`, payload);
    return response?.data;
}

export async function getTeacherResultSheetById(sheetId) {
    const response = await API.get(`/api/v1/result-sheets/get-by-id/${sheetId}`);
    return response?.data;
}

export async function listTeacherResultSheetsHistory() {
    const response = await API.get('/api/v1/result-sheets/get-all');
    return response?.data;
}

export async function updateTeacherResultSheet(sheetId, payload) {
    const response = await API.patch(`/api/v1/result-sheets/${sheetId}`, payload);
    return response?.data;
}
