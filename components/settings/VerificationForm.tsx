'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DocumentUploader } from './DocumentUploader'
import { uploadReceipt } from '@/lib/upload' // Reuse existing upload logic
import { submitVerification } from '@/app/actions/submit-verification'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormGroup } from '@/components/ui/form-group'
import { PremiumInput } from '@/components/ui/premium-input'
import { GlassCard } from '@/components/ui/GlassCard'
import { InlineLogoLoader } from '@/components/ui/LogoLoader'
import { toast } from 'sonner'
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react'
import { IdentityType } from '@prisma/client'
import { useLanguage } from '@/components/providers/LanguageProvider'

export function VerificationForm() {
    const router = useRouter()
    const { t } = useLanguage()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    // Form State
    const [type, setType] = useState<IdentityType>('NATIONAL_ID')
    const [documentNumber, setDocumentNumber] = useState('')
    const [frontFile, setFrontFile] = useState<File | null>(null)
    const [backFile, setBackFile] = useState<File | null>(null)
    const [selfieFile, setSelfieFile] = useState<File | null>(null)

    const handleSubmit = async () => {
        if (!documentNumber) return toast.error("Please enter your Document Number")
        if (!frontFile) return toast.error("Please upload the Front of your ID")
        if (!backFile && type !== 'PASSPORT') return toast.error("Please upload the Back of your ID")
        if (!selfieFile) return toast.error("Please take a Selfie holding your ID")

        setLoading(true)
        try {
            // 1. Upload Images concurrently
            toast.loading("Uploading documents securely...")

            const uploadPromises = [
                uploadReceipt(frontFile),
                backFile ? uploadReceipt(backFile) : Promise.resolve(null),
                uploadReceipt(selfieFile)
            ]

            const [frontUrl, backUrl, selfieUrl] = await Promise.all(uploadPromises)

            if (!frontUrl || !selfieUrl) throw new Error("Image upload failed")

            // 2. Submit Data
            const result = await submitVerification({
                type,
                documentNumber,
                frontImageUrl: frontUrl,
                backImageUrl: backUrl,
                selfieImageUrl: selfieUrl
            })

            if (!result.success) {
                throw new Error(result.error)
            }

            setSuccess(true)
            toast.success("Verification Submitted!")
            router.refresh()

        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Failed to submit verification")
        } finally {
            setLoading(false)
            toast.dismiss()
        }
    }

    if (success) {
        return (
            <GlassCard className="p-8 text-center space-y-6 bg-emerald-500/5 border-emerald-500/20">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto animate-bounce-slow">
                    <Shield className="w-10 h-10 text-emerald-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-foreground">{t('verification_form.submitted_title')}</h2>
                    <p className="text-muted-foreground font-medium">
                        {t('verification_form.submitted_desc')}
                    </p>
                </div>
            </GlassCard>
        )
    }

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                    <Shield className="w-6 h-6 text-blue-500" />
                    {t('verification_form.title')}
                </h2>
                <p className="text-muted-foreground font-medium">
                    {t('verification_form.subtitle')}
                </p>
            </div>

            <GlassCard className="p-4 sm:p-6 space-y-8" hover={false}>
                {/* ID Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormGroup label={t('verification_form.document_type')}>
                        <Select value={type} onValueChange={(v) => setType(v as IdentityType)}>
                            <SelectTrigger className="h-14 rounded-xl bg-muted/20 border-white/10 font-bold">
                                <SelectValue placeholder={t('verification_form.select_type')} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="NATIONAL_ID" className="font-bold">{t('verification_form.national_id')}</SelectItem>
                                <SelectItem value="PASSPORT" className="font-bold">{t('verification_form.passport')}</SelectItem>
                                <SelectItem value="DRIVING_LICENSE" className="font-bold">{t('verification_form.driving_license')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormGroup>

                    <FormGroup label={t('verification_form.document_number')}>
                        <PremiumInput
                            value={documentNumber}
                            onChange={(e) => setDocumentNumber(e.target.value)}
                            placeholder={type === 'NATIONAL_ID' ? 'e.g. M12345678' : t('verification_form.enter_number')}
                        />
                    </FormGroup>
                </div>

                {/* File Uploads Grid */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">{t('verification_form.proof_documents')}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <DocumentUploader
                            label={t('verification_form.front_id')}
                            subLabel={t('verification_form.front_sub')}
                            onFileSelect={setFrontFile}
                        // previewUrl={frontFile ? URL.createObjectURL(frontFile) : undefined}
                        />

                        {type !== 'PASSPORT' && (
                            <DocumentUploader
                                label={t('verification_form.back_id')}
                                subLabel={t('verification_form.back_sub')}
                                onFileSelect={setBackFile}
                            />
                        )}

                        <DocumentUploader
                            label={t('verification_form.selfie_id')}
                            subLabel={t('verification_form.selfie_sub')}
                            onFileSelect={setSelfieFile}
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="pt-4 flex justify-end">
                    <Button
                        size="xl"
                        className="w-full sm:w-auto font-black rounded-xl shadow-lg shadow-blue-500/20"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? <InlineLogoLoader size="sm" /> : t('verification_form.submit_btn')}
                    </Button>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-3 text-sm text-muted-foreground">
                    <Shield className="w-5 h-5 text-blue-500 shrink-0" />
                    <p>{t('verification_form.secure_note')}</p>
                </div>
            </GlassCard>
        </div>
    )
}
