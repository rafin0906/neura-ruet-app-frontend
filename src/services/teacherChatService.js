import API from '../utils/api/apiClient';

// Endpoints:
// - POST /api/v1/teachers/chat/rooms
// - GET  /api/v1/teachers/chat/rooms
// - GET  /api/v1/teachers/chat/rooms/:room_id/messages
// - POST /api/v1/teachers/chat/rooms/:room_id/messages

export async function createTeacherChatRoom(payload = {}) {
    const response = await API.post('/api/v1/teachers/chat/rooms', payload);
    return response?.data;
}

export async function listTeacherChatRooms() {
    const response = await API.get('/api/v1/teachers/chat/rooms');
    return response?.data;
}

export async function listTeacherRoomMessages(roomId) {
    const response = await API.get(`/api/v1/teachers/chat/rooms/${roomId}/messages`);
    return response?.data;
}

export async function sendTeacherRoomMessage(roomId, payload) {
    const response = await API.post(`/api/v1/teachers/chat/rooms/${roomId}/messages`, payload);
    return response?.data;
}
