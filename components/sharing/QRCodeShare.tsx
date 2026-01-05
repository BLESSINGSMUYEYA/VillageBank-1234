'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, Share2, Users, Clock, Shield, QrCode, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { GlassCard } from '@/components/ui/GlassCard'
import { PremiumInput } from '@/components/ui/premium-input'
import { SectionHeader } from '@/components/ui/section-header'
import { FormGroup } from '@/components/ui/form-group'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeIn, staggerContainer, itemFadeIn } from '@/lib/motions'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface QRCodeShareProps {
  groupId: string
  groupName: string
}

export function QRCodeShare({ groupId, groupName }: QRCodeShareProps) {
  const [shareData, setShareData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [permissions, setPermissions] = useState('REQUEST_JOIN')
  const [expiresIn, setExpiresIn] = useState('7')
  const [maxUses, setMaxUses] = useState('10')
  const [customMessage, setCustomMessage] = useState('')
  const { t } = useLanguage()

  const generateQRCode = async () => {
    setLoading(true)
    try {
      const expiresAt = expiresIn === 'never' ? null :
        new Date(Date.now() + parseInt(expiresIn) * 24 * 60 * 60 * 1000).toISOString()

      const response = await fetch(`/api/groups/${groupId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permissions,
          expiresAt,
          maxUses: parseInt(maxUses),
          customMessage: customMessage.trim(),
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setShareData(data)
        toast.success('Secure entry key generated!')
      } else {
        toast.error(data.error || 'Failed to generate access key')
      }
    } catch (error) {
      toast.error('Network error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyShareLink = () => {
    if (shareData?.shareUrl) {
      navigator.clipboard.writeText(shareData.shareUrl)
      toast.success('Link copied to clipboard!')
    }
  }

  const createCombinedImage = async (qrDataUrl: string, groupName: string, shareUrl: string, customMsg?: string): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        const width = 1080
        const padding = 80
        const qrSize = width - (padding * 2)
        const headerHeight = 120
        const footerHeight = 400
        const height = qrSize + headerHeight + footerHeight

        canvas.width = width
        canvas.height = height

        const gradient = ctx.createLinearGradient(0, 0, 0, height)
        gradient.addColorStop(0, '#ffffff')
        gradient.addColorStop(1, '#f8fafc')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)

        ctx.fillStyle = '#1e293b'
        ctx.font = 'bold 52px Inter, system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('uBank Group', width / 2, padding + 20)

        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
        ctx.shadowBlur = 40
        ctx.shadowOffsetY = 10
        ctx.fillStyle = '#ffffff'
        const radius = 40
        ctx.beginPath()
        ctx.roundRect(padding - 20, headerHeight + padding - 20, qrSize + 40, qrSize + 40, radius)
        ctx.fill()
        ctx.shadowBlur = 0

        ctx.drawImage(img, padding, headerHeight + padding, qrSize, qrSize)

        const footerY = headerHeight + qrSize + padding + 60
        ctx.fillStyle = '#2563eb'
        ctx.font = 'bold 48px Inter, system-ui, sans-serif'
        ctx.fillText(groupName, width / 2, footerY)

        if (customMsg) {
          ctx.fillStyle = '#64748b'
          ctx.font = 'italic 36px Inter, system-ui, sans-serif'
          ctx.fillText(`"${customMsg}"`, width / 2, footerY + 70)
        }

        const linkY = footerY + (customMsg ? 160 : 100)
        const linkText = shareUrl.replace(/^https?:\/\//, '')
        ctx.font = '500 32px monospace'
        const metrics = ctx.measureText(linkText)
        const linkWidth = metrics.width + 60

        ctx.fillStyle = '#f1f5f9'
        ctx.beginPath()
        ctx.roundRect((width - linkWidth) / 2, linkY - 40, linkWidth, 70, 15)
        ctx.fill()

        ctx.fillStyle = '#334155'
        ctx.fillText(linkText, width / 2, linkY + 8)

        ctx.fillStyle = '#94a3b8'
        ctx.font = 'bold 28px Inter, system-ui, sans-serif'
        ctx.fillText('SCAN OR CLICK TO JOIN', width / 2, height - 60)

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], 'ubank-invite.png', { type: 'image/png' }))
          } else {
            reject(new Error('Canvas to Blob failed'))
          }
        }, 'image/png', 1.0)
      }
      img.onerror = () => reject(new Error('Failed to load QR image'))
      img.src = qrDataUrl
    })
  }

  const handleShare = async () => {
    if (!shareData?.shareUrl || !shareData?.qrCode) return

    setLoading(true)
    try {
      await navigator.clipboard.writeText(shareData.shareUrl)
      const combinedFile = await createCombinedImage(
        shareData.qrCode,
        groupName,
        shareData.shareUrl,
        shareData.customMessage
      )

      const message = `*uBank Group Invitation*\n\n` +
        `Group: ${groupName}\n` +
        (shareData.customMessage ? `_"${shareData.customMessage}"_\n\n` : '') +
        `Scan the QR code or click the link to join:\n${shareData.shareUrl}`

      if (navigator.share && navigator.canShare) {
        const shareObj = {
          title: `Join ${groupName}`,
          text: message,
          files: [combinedFile]
        }

        if (navigator.canShare(shareObj)) {
          await navigator.share(shareObj)
          toast.success('Shared successfully!')
          return
        }
      }

      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/?text=${encodedMessage}`
      window.open(whatsappUrl, '_blank')
      toast.success('Link copied & opening WhatsApp...')

    } catch (error) {
      console.error('Share error:', error)
      toast.error('Share failed, but link was copied')
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = () => {
    if (shareData?.qrCode) {
      const link = document.createElement('a')
      link.download = `${groupName}-qr-code.png`
      link.href = shareData.qrCode
      link.click()
    }
  }

  const getPermissionBadge = (permission: string) => {
    const variants: Record<string, string> = {
      VIEW_ONLY: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      REQUEST_JOIN: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      LIMITED_ACCESS: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      FULL_PREVIEW: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    }

    const labels: Record<string, string> = {
      VIEW_ONLY: 'View Only',
      REQUEST_JOIN: 'Join Permitted',
      LIMITED_ACCESS: 'Limited',
      FULL_PREVIEW: 'Full Access',
    }

    return (
      <Badge variant="outline" className={`font-black uppercase tracking-widest px-3 py-1 rounded-lg ${variants[permission] || ''}`}>
        {labels[permission] || permission}
      </Badge>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-10 max-w-4xl mx-auto"
    >
      <motion.div variants={itemFadeIn}>
        <GlassCard className="p-8 sm:p-12 space-y-10" hover={false}>
          <SectionHeader
            title="Invitation Protocol"
            description="Configure access parameters for this share link"
            icon={Share2}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FormGroup label="Access Level">
              <Select value={permissions} onValueChange={setPermissions}>
                <SelectTrigger className="bg-white/50 dark:bg-black/20 border-white/20 rounded-xl h-14 font-bold px-6">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-white/10 backdrop-blur-3xl">
                  <SelectItem value="VIEW_ONLY" className="font-bold">View Only</SelectItem>
                  <SelectItem value="REQUEST_JOIN" className="font-bold">Can Request to Join</SelectItem>
                  <SelectItem value="LIMITED_ACCESS" className="font-bold">Limited Access</SelectItem>
                  <SelectItem value="FULL_PREVIEW" className="font-bold">Full Preview</SelectItem>
                </SelectContent>
              </Select>
            </FormGroup>

            <FormGroup label="Persistence">
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger className="bg-white/50 dark:bg-black/20 border-white/20 rounded-xl h-14 font-bold px-6">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-white/10 backdrop-blur-3xl">
                  <SelectItem value="1" className="font-bold">1 Day</SelectItem>
                  <SelectItem value="7" className="font-bold">7 Days</SelectItem>
                  <SelectItem value="30" className="font-bold">30 Days</SelectItem>
                  <SelectItem value="never" className="font-bold">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </FormGroup>

            <FormGroup label="Capacity Limit">
              <PremiumInput
                type="number"
                min="1"
                max="100"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
              />
            </FormGroup>
          </div>

          <FormGroup label="Custom Invitation Message">
            <PremiumInput
              placeholder="Add a personal touch to your invitation..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value.slice(0, 100))}
              maxLength={100}
            />
            <div className="flex justify-end pt-2">
              <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground opacity-50">
                {customMessage.length} / 100
              </span>
            </div>
          </FormGroup>

          <Button
            onClick={generateQRCode}
            disabled={loading}
            size="xl"
            variant="banana"
            className="w-full shadow-lg shadow-yellow-500/10 h-16 rounded-2xl"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <QrCode className="mr-2 h-5 w-5" />
                Generate Secure Entry Key
              </>
            )}
          </Button>
        </GlassCard>
      </motion.div>

      <AnimatePresence>
        {shareData && (
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-start">
              <GlassCard className="p-8 flex flex-col items-center justify-center space-y-6" hover={false}>
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[40px] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                  <div className="relative p-6 bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-white/20">
                    <img
                      src={shareData.qrCode}
                      alt="Group QR Code"
                      className="w-full max-w-[280px] h-auto aspect-square object-contain"
                    />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <h4 className="text-lg font-black tracking-tight">{groupName}</h4>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Entry Authorization</p>
                </div>
              </GlassCard>

              <GlassCard className="p-8 sm:p-10 space-y-8" hover={false}>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Key Metadata</h4>
                  {getPermissionBadge(shareData.permissions)}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-black uppercase tracking-wider">Capacity</span>
                    </div>
                    <span className="text-sm font-bold">{shareData.currentUses} / {shareData.maxUses} uses</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-xs font-black uppercase tracking-wider">Persistence</span>
                    </div>
                    <span className="text-sm font-bold">
                      {shareData.expiresAt
                        ? `Until ${new Date(shareData.expiresAt).toLocaleDateString()}`
                        : 'Permanent'
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs font-black uppercase tracking-wider">Security</span>
                    </div>
                    <span className="text-sm font-bold">SHA-256 Validated</span>
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-4">
                  <Button onClick={copyShareLink} variant="outline" className="h-14 font-black rounded-xl border-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button onClick={downloadQRCode} variant="outline" className="h-14 font-black rounded-xl border-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                    <Download className="h-4 w-4 mr-2" />
                    Archive Key
                  </Button>
                </div>

                <Button
                  onClick={handleShare}
                  variant="banana"
                  size="xl"
                  className="w-full shadow-xl shadow-yellow-500/10 group h-16 rounded-2xl"
                  disabled={loading}
                >
                  <Share2 className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                  {loading ? 'Preparing Vault...' : 'Distribute Invitation'}
                </Button>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
