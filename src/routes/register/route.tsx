import * as React from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { PasswordInput } from '@/components/ui/password-input'
import { Select } from '@/components/ui/select'
import { AuthShell } from '@/components/auth-shell'
import { ChevronRight, ChevronLeft, Upload } from 'lucide-react'
import { useRegisterBrand } from '@/hooks/use-auth'

const registerSearchSchema = z.object({
  step: z.coerce.number().int().min(1).max(2).optional(),
})

export const Route = createFileRoute('/register')({
  validateSearch: registerSearchSchema,
  component: RegisterRoute,
})

const COUNTRIES = [
  { value: 'Ghana', currency: 'GHS', flag: 'https://flagcdn.com/w40/gh.png', label: 'Ghana' },
  { value: 'Nigeria', currency: 'NGN', flag: 'https://flagcdn.com/w40/ng.png', label: 'Nigeria' },
  { value: 'USA', currency: 'USD', flag: 'https://flagcdn.com/w40/us.png', label: 'USA' },
]

const INDUSTRIES = [
  'Technology',
  'Fashion & Apparel',
  'Beauty & Cosmetics',
  'Food & Beverage',
  'Health & Wellness',
  'Entertainment',
  'E-commerce',
  'Other',
]



function RegisterRoute() {
  const { step = 1 } = Route.useSearch()
  const navigate = useNavigate()
  
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = React.useState({
    brandName: '',
    contactName: '',
    email: '',
    password: '',
    website: '',
    logoUrl: '',
    description: '',
    industry: '',
    country: '',
    currency: '',
    city: '',
  })

  const [logoFile, setLogoFile] = React.useState<File | null>(null)

  const { registerBrand, loading: isSubmitting } = useRegisterBrand()
  const [isUploading, setIsUploading] = React.useState(false)

  const setStep = (newStep: number) => {
    navigate({
      to: '/register',
      search: { step: newStep },
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleCountrySelect = (country: string) => {
    const matched = COUNTRIES.find((c) => c.value === country)
    setFormData((prev) => ({
      ...prev,
      country,
      currency: matched?.currency ?? '',
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      setFormData((prev) => ({ ...prev, logoUrl: URL.createObjectURL(file) }))
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      setStep(2)
    } else {
      let finalLogoUrl = formData.logoUrl || undefined

      if (logoFile) {
        try {
          setIsUploading(true)
          
          const uploadData = new FormData()
          uploadData.append('file', logoFile)
          uploadData.append('upload_preset', 'domus-console')

          const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/dviigplcx/image/upload`, {
            method: 'POST',
            body: uploadData,
          })

          if (!uploadRes.ok) throw new Error('Failed to upload image')

          const uploadResult = await uploadRes.json()
          finalLogoUrl = uploadResult.secure_url
        } catch (error) {
          console.error('Upload error:', error)
          setIsUploading(false)
          return
        } finally {
          setIsUploading(false)
        }
      }

      await registerBrand({
        email: formData.email,
        password: formData.password,
        brandName: formData.brandName,
        contactName: formData.contactName,
        country: formData.country,
        currency: formData.currency || undefined,
        industry: formData.industry,
        city: formData.city,
        description: formData.description,
        website: formData.website || undefined,
        logoUrl: finalLogoUrl,
      })
    }
  }

  const handleBack = () => {
    setStep(1)
  }


  const backButtonPill = (
    <button 
      type="button" 
      onClick={handleBack} 
      className="inline-flex items-center text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors gap-1 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full w-fit"
    >
      <ChevronLeft className="w-3 h-3" />
      Step 1
    </button>
  )

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join a trusted marketplace where verified brands and student creators collaborate on campaigns that deliver results."
      topRightText="Already have an account?"
      topRightLinkText="Sign In"
      topRightLinkTo="/signin"
      backButton={step === 2 ? backButtonPill : undefined}
    >
      <form className="space-y-5" onSubmit={handleNext}>
        {step === 1 ? (
          /* Step 1: Core credentials */
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-2">
              <Label htmlFor="brandName" className="text-zinc-700 dark:text-zinc-300">Brand Name</Label>
              <Input 
                id="brandName" 
                value={formData.brandName} 
                onChange={handleInputChange} 
                className="border-zinc-200 dark:border-zinc-800" 
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactName" className="text-zinc-700 dark:text-zinc-300">Contact Name</Label>
              <Input 
                id="contactName" 
                value={formData.contactName} 
                onChange={handleInputChange} 
                className="border-zinc-200 dark:border-zinc-800" 
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                className="border-zinc-200 dark:border-zinc-800" 
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-700 dark:text-zinc-300">Password</Label>
              <PasswordInput 
                id="password" 
                value={formData.password} 
                onChange={handleInputChange} 
                className="border-zinc-200 dark:border-zinc-800" 
                required
              />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full py-6 text-base font-semibold rounded-xl gap-2">
                Continue
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ) : (
          /* Step 2: Extended details */
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
            
            {/* Logo Custom File Upload Style */}
            <div className="space-y-2">
              <Label className="text-zinc-700 dark:text-zinc-300">Logo</Label>
              <div className="flex items-center gap-4">
                <div 
                  onClick={triggerFileUpload}
                  className="w-16 h-16 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 cursor-pointer overflow-hidden hover:bg-zinc-100 transition-colors"
                >
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-5 h-5 text-zinc-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <input 
                    type="file" 
                    id="logo-file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*" 
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={triggerFileUpload}
                    className="text-zinc-700 border-zinc-200 hover:bg-zinc-50 rounded-lg shadow-none px-3"
                  >
                    Upload
                  </Button>
                  <p className="text-[10px] text-zinc-400">Recommended size 1:1, up to 10MB.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-zinc-700 dark:text-zinc-300">Industry</Label>
                <Select
                  value={formData.industry}
                  onChange={(val) => setFormData((prev) => ({ ...prev, industry: val }))}
                  options={INDUSTRIES.map((ind) => ({
                    value: ind,
                    label: ind,
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website" className="text-zinc-700 dark:text-zinc-300">Website (Optional)</Label>
                <Input 
                  id="website" 
                  value={formData.website} 
                  onChange={handleInputChange} 
                  className="border-zinc-200 dark:border-zinc-800" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country" className="text-zinc-700 dark:text-zinc-300">Country</Label>
                <Select
                  value={formData.country}
                  onChange={handleCountrySelect}
                  options={COUNTRIES.map((c) => ({
                    value: c.value,
                    label: c.label,
                    icon: <img src={c.flag} alt="" className="w-5 h-auto rounded-[2px]" />,
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-zinc-700 dark:text-zinc-300">Currency</Label>
                <Select
                  value={formData.currency}
                  onChange={(val) => setFormData((prev) => ({ ...prev, currency: val }))}
                  disabled={!formData.country}
                  options={COUNTRIES.map((c) => ({
                    value: c.currency,
                    label: c.currency,
                    disabled: formData.country !== c.value,
                  }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-zinc-700 dark:text-zinc-300">City</Label>
                <Input 
                  id="city" 
                  value={formData.city} 
                  onChange={handleInputChange} 
                  className="border-zinc-200 dark:border-zinc-800" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-zinc-700 dark:text-zinc-300">Description</Label>
                <Input 
                  id="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  className="border-zinc-200 dark:border-zinc-800" 
                  required
                />
              </div>
            </div>

            <div className="flex items-start space-x-3 pt-2">
              <Checkbox id="terms" className="mt-0.5 border-zinc-300 dark:border-zinc-700" required />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-relaxed text-zinc-500 dark:text-zinc-400 cursor-pointer"
                >
                  By creating an account as a <span className="text-primary font-semibold">brand</span>, you agree to our{' '}
                  <Link 
                    to="/" 
                    className="text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300 underline underline-offset-4 transition-colors"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link 
                    to="/" 
                    className="text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300 underline underline-offset-4 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full py-6 text-base font-semibold rounded-xl" isLoading={isSubmitting || isUploading}>
                Create account
              </Button>
            </div>
          </div>
        )}
      </form>
    </AuthShell>
  )
}
