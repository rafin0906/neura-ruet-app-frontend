/**
 * errorHandler.js
 * Normalizes Axios errors into a predictable shape for UI.
 */

/**
 * @typedef {Object} ApiError
 * @property {string} message - Human-friendly message.
 * @property {number|null} status - HTTP status code if available.
 * @property {any} data - Response body if available.
 * @property {boolean} isNetworkError
 * @property {boolean} isTimeout
 * @property {any} raw - Original error (useful for logging).
 */

/**
 * Format an Axios (or network) error to a consistent object.
 * Keep UI code simple: show error.message, branch on error.status.
 *
 * @param {any} error
 * @returns {ApiError}
 */
export function formatApiError(error) {
    const isTimeout = error?.code === 'ECONNABORTED';

    // Axios: no response means request never reached server / no internet / DNS.
    const hasResponse = Boolean(error?.response);
    const status = hasResponse ? error.response.status : null;
    const data = hasResponse ? error.response.data : null;

    const normalizeDetailToString = (detail) => {
        if (!detail) return null;
        if (typeof detail === 'string') return detail;

        // FastAPI/Pydantic validation errors commonly look like:
        // [{ loc: ['body','field'], msg: 'Field required', type: 'missing', ... }]
        if (Array.isArray(detail)) {
            const parts = detail
                .map((item) => {
                    const loc = Array.isArray(item?.loc)
                        ? item.loc.filter((x) => x !== 'body').join('.')
                        : null;
                    const msg = typeof item?.msg === 'string' ? item.msg : null;
                    if (loc && msg) return `${loc}: ${msg}`;
                    if (msg) return msg;
                    return null;
                })
                .filter(Boolean);
            return parts.length ? parts.join('\n') : 'Request validation failed.';
        }

        // If backend sends an object, try common keys.
        if (typeof detail === 'object') {
            if (typeof detail.message === 'string') return detail.message;
            if (typeof detail.msg === 'string') return detail.msg;
            return 'Request failed.';
        }

        return null;
    };

    // Try common backend message fields, but always normalize to a string.
    const backendMessage =
        (typeof data === 'string' && data) ||
        (typeof data?.message === 'string' ? data.message : null) ||
        normalizeDetailToString(data?.detail) ||
        (typeof data?.error === 'string' ? data.error : null) ||
        null;

    const message =
        (typeof backendMessage === 'string' ? backendMessage : null) ||
        (isTimeout
            ? 'Request timed out. Please try again.'
            : hasResponse
                ? 'Request failed. Please try again.'
                : 'Network error. Check your internet connection.');

    return {
        message,
        status,
        data,
        isNetworkError: !hasResponse,
        isTimeout,
        raw: error,
    };
}
