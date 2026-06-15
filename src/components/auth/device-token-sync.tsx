import { useEffect } from 'react'
import { useRegisterDeviceToken } from '@/hooks/use-auth'
import { registerStoredDeviceToken } from '@/lib/device-token'

export function DeviceTokenSync() {
  const { registerDeviceToken } = useRegisterDeviceToken()

  useEffect(() => {
    void registerStoredDeviceToken(registerDeviceToken)
  }, [registerDeviceToken])

  return null
}
