const CLOUDINARY_CLOUD_NAME = 'dviigplcx'
const CLOUDINARY_UPLOAD_PRESET = 'domus-console'

export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    { method: 'POST', body: formData }
  )

  if (!response.ok) {
    throw new Error('Failed to upload file')
  }

  const result = (await response.json()) as { secure_url?: unknown }
  if (typeof result.secure_url !== 'string' || result.secure_url.trim() === '') {
    throw new Error('Upload succeeded but no file URL was returned')
  }

  return result.secure_url
}
