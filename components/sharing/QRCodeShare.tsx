'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, Share2, Users, Clock, Shield, QrCode } from 'lucide-react'
import QRCodeLib from 'qrcode'
import { InlineLogoLoader } from '@/components/ui/LogoLoader'
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

  // Function to generate a high-res branded QR code data URL
  const generateHighResQR = async (text: string): Promise<string> => {
    try {
      // 1. Generate base QR code to canvas
      const canvas = document.createElement('canvas')
      await QRCodeLib.toCanvas(canvas, text, {
        errorCorrectionLevel: 'H', // High error correction to support logo overlay
        margin: 1,
        width: 1000,
        color: {
          dark: '#000000',
          light: '#00000000' // Transparent background for mask
        }
      })

      const size = canvas.width
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      // 2. Create Gradient for QR Modules
      // We want to recolor the black pixels to a brand gradient
      const gradient = ctx.createLinearGradient(0, 0, size, size)
      gradient.addColorStop(0, '#2563eb') // blue-600
      gradient.addColorStop(1, '#ca8a04') // yellow-600 (banana-dark)

      // Use composite operation to colorize
      ctx.globalCompositeOperation = 'source-in'
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, size, size)
      ctx.globalCompositeOperation = 'source-over'

      // 3. Overlay Logo in Center
      const logoImg = new Image()
      logoImg.crossOrigin = 'anonymous'
      logoImg.src = '/ubank-logo.png'

      await new Promise((resolve, reject) => {
        logoImg.onload = resolve
        logoImg.onerror = reject
      })

      // Draw white circular background for logo
      const logoSize = size * 0.22 // 22% of QR size
      const center = size / 2

      ctx.beginPath()
      ctx.arc(center, center, (logoSize / 2) + 20, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
      ctx.shadowColor = 'rgba(0,0,0,0.1)'
      ctx.shadowBlur = 20
      ctx.stroke()

      // Draw Logo
      ctx.shadowBlur = 0
      ctx.drawImage(logoImg, center - logoSize / 2, center - logoSize / 2, logoSize, logoSize)

      return canvas.toDataURL('image/png')
    } catch (err) {
      console.error('Failed to generate high res QR', err)
      return ''
    }
  }

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
        // Generate client-side branded QR
        const brandedQRCode = await generateHighResQR(data.shareUrl)

        setShareData({
          ...data,
          qrCode: brandedQRCode || data.qrCode // Fallback to server QR if client fails
        })
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

      // We don't need a separate logo load here because it's already in the QR data URL
      // but we do need it for the Header if we want it there too.
      // Let's keep the header logo separate for the card design.
      const logoImg = new Image()
      logoImg.crossOrigin = 'anonymous'

      let imagesLoaded = 0
      const onImageLoad = () => {
        imagesLoaded++
        if (imagesLoaded === 2) {
          drawCanvas()
        }
      }

      img.onload = onImageLoad
      logoImg.onload = onImageLoad
      img.onerror = () => reject(new Error('Failed to load QR image'))
      logoImg.onerror = () => reject(new Error('Failed to load logo image'))

      img.src = qrDataUrl
      logoImg.src = '/ubank-logo.png'

      const drawCanvas = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        const width = 1200
        const height = 1600 // Taller format

        canvas.width = width
        canvas.height = height

        // 1. Premium Mesh Background
        // Create a rich gradient background
        const bgGradient = ctx.createLinearGradient(0, 0, width, height)
        bgGradient.addColorStop(0, '#f8fafc')   // Slate-50
        bgGradient.addColorStop(0.5, '#f1f5f9') // Slate-100
        bgGradient.addColorStop(1, '#e2e8f0')   // Slate-200
        ctx.fillStyle = bgGradient
        ctx.fillRect(0, 0, width, height)

        // Add subtle decorative circles
        ctx.fillStyle = 'rgba(59, 130, 246, 0.03)' // Very faint blue
        ctx.beginPath()
        ctx.arc(width, 0, 600, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = 'rgba(234, 179, 8, 0.03)' // Very faint banana
        ctx.beginPath()
        ctx.arc(0, height, 500, 0, Math.PI * 2)
        ctx.fill()

        // 2. Glass Card Container
        const cardWidth = 900
        const cardHeight = 1200
        const cardX = (width - cardWidth) / 2
        const cardY = (height - cardHeight) / 2
        const cardRadius = 60

        ctx.save()
        // Card Shadow
        ctx.shadowColor = 'rgba(15, 23, 42, 0.15)'
        ctx.shadowBlur = 60
        ctx.shadowOffsetY = 30

        // Card Background (Glass effect simulation)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
        ctx.beginPath()
        ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cardRadius)
        ctx.fill()
        ctx.restore()

        // Card Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
        ctx.lineWidth = 2
        ctx.stroke()

        // 3. Header Content
        const contentCenterX = width / 2
        let currentY = cardY + 120

        // Header Logo
        const headerLogoSize = 100
        ctx.drawImage(logoImg, contentCenterX - (headerLogoSize / 2), currentY, headerLogoSize, headerLogoSize)
        currentY += headerLogoSize + 40

        // App Name
        ctx.fillStyle = '#1e293b' // Slate-800
        ctx.font = '900 48px Inter, system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('uBANK', contentCenterX, currentY)

        // Tagline - Golden
        currentY += 50
        ctx.fillStyle = '#ca8a04' // Yellow-600
        ctx.font = '800 24px Inter, system-ui, sans-serif'
        ctx.letterSpacing = '0.3rem'
        const tagline = 'SECURE GROUP ACCESS'
        ctx.fillText(tagline, contentCenterX, currentY)

        // 4. QR Code
        currentY += 80
        const qrSize = 600

        // QR Container
        const qrContainerSize = qrSize + 60
        ctx.fillStyle = '#ffffff'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.05)'
        ctx.shadowBlur = 20
        ctx.shadowOffsetY = 10
        ctx.beginPath()
        ctx.roundRect(contentCenterX - (qrContainerSize / 2), currentY - 30, qrContainerSize, qrContainerSize, 40)
        ctx.fill()
        ctx.shadowColor = 'transparent'

        // Draw the Branded QR
        ctx.drawImage(img, contentCenterX - (qrSize / 2), currentY, qrSize, qrSize)

        // 5. Footer Details
        currentY += qrSize + 100

        // Group Name
        ctx.fillStyle = '#1e293b'
        ctx.font = 'bold 56px Inter, system-ui, sans-serif'
        ctx.fillText(groupName, contentCenterX, currentY)

        // Custom Message
        if (customMsg) {
          currentY += 70
          ctx.fillStyle = '#64748b' // Slate-500
          ctx.font = 'italic 32px Inter, system-ui, sans-serif'
          ctx.fillText(`"${customMsg}"`, contentCenterX, currentY)
        }

        // Link Badge
        currentY = cardY + cardHeight - 120
        const linkText = shareUrl.replace(/^https?:\/\//, '')
        ctx.font = '600 30px monospace' // Monospace for URL
        const textMetrics = ctx.measureText(linkText)
        const badgeWidth = textMetrics.width + 100
        const badgeHeight = 80

        ctx.fillStyle = '#f1f5f9' // Slate-100
        ctx.beginPath()
        ctx.roundRect(contentCenterX - (badgeWidth / 2), currentY - (badgeHeight / 2), badgeWidth, badgeHeight, 999)
        ctx.fill()

        ctx.fillStyle = '#3b82f6' // Blue-500
        ctx.fillText(linkText, contentCenterX, currentY + 10)

        // Generate Blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], 'ubank-invite.png', { type: 'image/png' }))
          } else {
            reject(new Error('Canvas to Blob failed'))
          }
        }, 'image/png', 1.0)
      }
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
            description="Configure secure access parameters for this share link"
            icon={Share2}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FormGroup label="Access Level">
              <Select value={permissions} onValueChange={setPermissions}>
                <SelectTrigger className="w-full h-14 rounded-2xl bg-white/40 dark:bg-black/20 border-white/10 shadow-inner backdrop-blur-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all font-bold text-foreground hover:bg-white/50 dark:hover:bg-white/5 px-5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-white/10 bg-white/90 dark:bg-slate-950/90 backdrop-blur-3xl shadow-2xl p-1">
                  <SelectItem value="VIEW_ONLY" className="font-bold rounded-xl focus:bg-blue-500/10 focus:text-blue-600 cursor-pointer py-3">View Only</SelectItem>
                  <SelectItem value="REQUEST_JOIN" className="font-bold rounded-xl focus:bg-blue-500/10 focus:text-blue-600 cursor-pointer py-3">Can Request to Join</SelectItem>
                  <SelectItem value="LIMITED_ACCESS" className="font-bold rounded-xl focus:bg-blue-500/10 focus:text-blue-600 cursor-pointer py-3">Limited Access</SelectItem>
                  <SelectItem value="FULL_PREVIEW" className="font-bold rounded-xl focus:bg-blue-500/10 focus:text-blue-600 cursor-pointer py-3">Full Preview</SelectItem>
                </SelectContent>
              </Select>
            </FormGroup>

            <FormGroup label="Persistence">
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger className="w-full h-14 rounded-2xl bg-white/40 dark:bg-black/20 border-white/10 shadow-inner backdrop-blur-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all font-bold text-foreground hover:bg-white/50 dark:hover:bg-white/5 px-5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-white/10 bg-white/90 dark:bg-slate-950/90 backdrop-blur-3xl shadow-2xl p-1">
                  <SelectItem value="1" className="font-bold rounded-xl focus:bg-blue-500/10 focus:text-blue-600 cursor-pointer py-3">1 Day</SelectItem>
                  <SelectItem value="7" className="font-bold rounded-xl focus:bg-blue-500/10 focus:text-blue-600 cursor-pointer py-3">7 Days</SelectItem>
                  <SelectItem value="30" className="font-bold rounded-xl focus:bg-blue-500/10 focus:text-blue-600 cursor-pointer py-3">30 Days</SelectItem>
                  <SelectItem value="never" className="font-bold rounded-xl focus:bg-blue-500/10 focus:text-blue-600 cursor-pointer py-3">Permanent</SelectItem>
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
                className="bg-white/40 dark:bg-black/20"
              />
            </FormGroup>
          </div>

          <FormGroup label="Custom Invitation Message">
            <PremiumInput
              placeholder="Add a personal touch to your invitation..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value.slice(0, 100))}
              maxLength={100}
              className="bg-white/40 dark:bg-black/20"
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
            variant="default"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-500/20 h-16 rounded-2xl border-t border-white/20 font-black tracking-tight text-lg transition-all active:scale-[0.98]"
          >
            {loading ? (
              <>
                <InlineLogoLoader size="sm" />
                <span className="ml-2">Encoding protocol...</span>
              </>
            ) : (
              <>
                <QrCode className="mr-3 h-5 w-5" />
                Generate Secure Key
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
              {/* QR Code Card */}
              <GlassCard className="p-8 flex flex-col items-center justify-center space-y-8 bg-gradient-to-br from-white/40 to-white/10 dark:from-slate-900/60 dark:to-slate-900/20" hover={true}>
                <div className="relative group cursor-pointer" onClick={downloadQRCode}>
                  <div className="absolute -inset-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 animate-pulse" />
                  <div className="relative p-6 bg-white rounded-[32px] shadow-2xl border border-white/20 transform group-hover:scale-[1.02] transition-transform duration-500">
                    <img
                      src={shareData.qrCode}
                      alt="Group QR Code"
                      className="w-full max-w-[260px] h-auto aspect-square object-contain"
                    />
                  </div>
                </div>
                <div className="text-center space-y-1.5">
                  <h4 className="text-xl font-black tracking-tight text-foreground">{groupName}</h4>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Secure Entry Point</p>
                </div>
              </GlassCard>

              {/* Details & Actions Card */}
              <GlassCard className="p-8 sm:p-10 space-y-8" hover={false}>
                <div className="flex items-center justify-between border-b border-border/10 pb-6">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Permissions</h4>
                    <p className="text-xs text-muted-foreground/60 font-medium">Access level configuration</p>
                  </div>
                  {getPermissionBadge(shareData.permissions)}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-blue-500/5 hover:bg-blue-500/10 transition-colors rounded-2xl border border-blue-500/10 group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider text-muted-foreground group-hover:text-blue-600 transition-colors">Capacity</span>
                    </div>
                    <span className="text-sm font-bold">{shareData.currentUses} / {shareData.maxUses} uses</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-orange-500/5 hover:bg-orange-500/10 transition-colors rounded-2xl border border-orange-500/10 group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Clock className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider text-muted-foreground group-hover:text-orange-600 transition-colors">Expires</span>
                    </div>
                    <span className="text-sm font-bold">
                      {shareData.expiresAt
                        ? new Date(shareData.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Never'
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors rounded-2xl border border-emerald-500/10 group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Shield className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider text-muted-foreground group-hover:text-emerald-600 transition-colors">Security</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">SHA-256 Verified</span>
                  </div>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-3">
                  <Button
                    onClick={copyShareLink}
                    variant="outline"
                    className="h-12 font-bold rounded-xl border-border/20 hover:bg-white/5 hover:text-blue-600 hover:border-blue-500/30 transition-all text-xs uppercase tracking-wider"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button
                    onClick={downloadQRCode}
                    variant="outline"
                    className="h-12 font-bold rounded-xl border-border/20 hover:bg-white/5 hover:text-blue-600 hover:border-blue-500/30 transition-all text-xs uppercase tracking-wider"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                <Button
                  onClick={handleShare}
                  variant="default"
                  size="xl"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 group h-14 rounded-2xl font-black tracking-tight"
                  disabled={loading}
                >
                  <Share2 className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                  {loading ? 'Processing...' : 'Share Invitation'}
                </Button>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
