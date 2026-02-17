import API from '../utils/api/apiClient';

export async function listStudentNoticesFeed(params = {}) {
    // GET /api/v1/student/notices/feed?skip=&limit=
    const response = await API.get('/api/v1/student/notices/feed', { params });
    const data = response?.data;
    if (!Array.isArray(data)) return [];
    return data;
}
