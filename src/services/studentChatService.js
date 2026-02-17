import API from '../utils/api/apiClient';

// Backend reference (do not hardcode beyond schemas):
// - ChatRoomCreateIn: { title?: string | null }
// - ChatRoomOut: { id, title, ... }
// - MessageCreateIn: { tool_name: string, content: string }
// - MessageOut: { id, sender_role, content, created_at, ... }

export async function createStudentChatRoom(payload = {}) {
    // POST /api/v1/students/chat/rooms
    // FastAPI endpoint accepts empty body via default_factory.
    const response = await API.post('/api/v1/students/chat/rooms', payload);
    return response?.data;
}

export async function listStudentChatRooms() {
    // GET /api/v1/students/chat/rooms
    const response = await API.get('/api/v1/students/chat/rooms');
    return response?.data;
}

export async function listStudentRoomMessages(roomId) {
    // GET /api/v1/students/chat/rooms/:room_id/messages
    const response = await API.get(`/api/v1/students/chat/rooms/${roomId}/messages`);
    return response?.data;
}

export async function sendStudentRoomMessage(roomId, payload) {
    // POST /api/v1/students/chat/rooms/:room_id/messages
    const response = await API.post(`/api/v1/students/chat/rooms/${roomId}/messages`, payload);
    return response?.data;
}

let ensureInitialRoomsPromise = null;

// Ensures there is at least one chat room for the current student.
// Behavior:
// - If rooms exist => returns them (no create)
// - If no rooms exist => creates one and returns the updated list
// NOTE: Uses a module-level promise to avoid duplicate room creation in dev
// where React may mount/unmount components multiple times.
export async function ensureStudentHasAtLeastOneRoom() {
    if (ensureInitialRoomsPromise) return ensureInitialRoomsPromise;

    ensureInitialRoomsPromise = (async () => {
        const rooms = await listStudentChatRooms();
        if (Array.isArray(rooms) && rooms.length > 0) {
            return rooms;
        }

        await createStudentChatRoom({});
        const updated = await listStudentChatRooms();
        return Array.isArray(updated) ? updated : [];
    })();

    return ensureInitialRoomsPromise;
}
