export const config = {
    BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
    WEBSOCKET_URL: import.meta.env.VITE_WEBSOCKET_URL,
    MAX_REFRESH_RETRIES: parseInt(import.meta.env.VITE_MAX_REFRESH_RETRIES, 10),

    PASSWORD_LENGTH_LOWEST: 6,
    PASSWORD_LENGTH_HIGHEST: 18,
}
