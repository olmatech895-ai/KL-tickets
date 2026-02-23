/**
 * Флаги фич. По умолчанию все отключены (false).
 * В .env задайте VITE_DEBUG=true, чтобы включить скрытые роуты (например Kosta Daily).
 */
const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}

export const isDebug = env.VITE_DEBUG === 'true'

/** Показывать роут и пункт меню "Kosta Daily" (по умолчанию false) */
export const showKostaDaily = isDebug
