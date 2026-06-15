const DEVICE_TOKEN_STORAGE_KEY = 'stackd_device_token'

export function getDevicePlatform() {
  if (typeof navigator === 'undefined') return 'web'

  const userAgent = navigator.userAgent
  if (/android/i.test(userAgent)) return 'android'
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios'
  return 'web'
}

export function getStoredDeviceToken() {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(DEVICE_TOKEN_STORAGE_KEY)
}

export function setStoredDeviceToken(token: string) {
  localStorage.setItem(DEVICE_TOKEN_STORAGE_KEY, token)
}

export async function registerStoredDeviceToken(
  register: (token: string, platform: string) => Promise<boolean>
) {
  const token = getStoredDeviceToken()
  if (!token) return false
  return register(token, getDevicePlatform())
}
