

const OBFUSCATE_BYTE = 0x5a

const STORAGE_KEY = (() => {
  const s = atob('c2Vzc19kYXRh')
  return '_' + s
})()

function encodeToken(token) {
  if (!token || typeof token !== 'string') return ''
  try {
    const bytes = new TextEncoder().encode(token)
    const out = new Uint8Array(bytes.length)
    for (let i = 0; i < bytes.length; i++) {
      out[i] = bytes[i] ^ OBFUSCATE_BYTE
    }
    return btoa(String.fromCharCode.apply(null, out))
  } catch {
    return ''
  }
}

function decodeToken(encoded) {
  if (!encoded || typeof encoded !== 'string') return null
  try {
    const binary = atob(encoded)
    const out = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      out[i] = binary.charCodeAt(i) ^ OBFUSCATE_BYTE
    }
    return new TextDecoder().decode(out)
  } catch {
    return null
  }
}

export function getStoredToken() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? decodeToken(raw) : null
  } catch {
    return null
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      sessionStorage.setItem(STORAGE_KEY, encodeToken(token))
    } else {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    error;
  }
}

export function removeStoredToken() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    error;
  }
}
