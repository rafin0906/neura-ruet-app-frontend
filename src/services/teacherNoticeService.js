import API from '../utils/api/apiClient';

function assertNoticeResponse(obj) {
    if (!obj || typeof obj !== 'object') throw new Error('Invalid notice response');
    if (!obj.id) throw new Error('Invalid notice response: missing id');
    if (typeof obj.title !== 'string') throw new Error('Invalid notice response: missing title');
    if (typeof obj.notice_message !== 'string') throw new Error('Invalid notice response: missing notice_message');
    return obj;
}

export async function createTeacherNotice(payload) {
    // POST /api/v1/teacher/notices
    const response = await API.post('/api/v1/teacher/notices', payload);
    return assertNoticeResponse(response?.data);
}

export async function listTeacherNotices(params = {}) {
    // GET /api/v1/teacher/notices?skip=&limit=
    const response = await API.get('/api/v1/teacher/notices', { params });
    const data = response?.data;
    if (!Array.isArray(data)) return [];
    return data.map(assertNoticeResponse);
}

export async function getTeacherNoticeById(noticeId) {
    const id = String(noticeId ?? '').trim();
    if (!id) throw new Error('Missing notice id');
    // GET /api/v1/teacher/notices/{notice_id}
    const response = await API.get(`/api/v1/teacher/notices/${encodeURIComponent(id)}`);
    return assertNoticeResponse(response?.data);
}

export async function updateTeacherNotice(noticeId, payload) {
    const id = String(noticeId ?? '').trim();
    if (!id) throw new Error('Missing notice id');
    // PATCH /api/v1/teacher/notices/{notice_id}
    const response = await API.patch(`/api/v1/teacher/notices/${encodeURIComponent(id)}`, payload);
    return assertNoticeResponse(response?.data);
}
