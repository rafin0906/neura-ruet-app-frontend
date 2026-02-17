import API from '../utils/api/apiClient';

// Endpoints:
// - POST /api/v1/crs/chat/rooms
// - GET  /api/v1/crs/chat/rooms
// - GET  /api/v1/crs/chat/rooms/:room_id/messages
// - POST /api/v1/crs/chat/rooms/:room_id/messages

export async function createCrChatRoom(payload = {}) {
    const response = await API.post('/api/v1/crs/chat/rooms', payload);
    return response?.data;
}

export async function listCrChatRooms() {
    const response = await API.get('/api/v1/crs/chat/rooms');
    return response?.data;
}

export async function listCrRoomMessages(roomId) {
    const response = await API.get(`/api/v1/crs/chat/rooms/${roomId}/messages`);
    return response?.data;
}

export async function sendCrRoomMessage(roomId, payload) {
    const response = await API.post(`/api/v1/crs/chat/rooms/${roomId}/messages`, payload);
    return response?.data;
}
