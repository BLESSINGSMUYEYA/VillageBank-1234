'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button' // Lowercase button
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Copy, Share2, Shield, Clock, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { InlineLogoLoader } from '@/components/ui/LogoLoader'
import { GlassCard } from '@/components/ui/GlassCard'
import { PremiumInput } from '@/components/ui/premium-input'
import { staggerContainer, itemFadeIn, fadeIn } from '@/lib/motions'
import { AnimatePresence, motion } from 'framer-motion'

// ... Keep existing generateHighResQR function ...
const generateHighResQR = async (text: string): Promise<string> => {
  try {
    const QRCodeLib = (await import('qrcode')).default

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
    gradient.addColorStop(1, '#EAB308') // yellow-500 (Brand Banana)

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

interface QRCodeShareProps {
  groupId: string
  groupName: string
}

export function QRCodeShare({ groupId, groupName }: QRCodeShareProps) {
  const [loading, setLoading] = useState(false)
  const [permissions, setPermissions] = useState('VIEW_ONLY')
  const [expiresIn, setExpiresIn] = useState('7')
  const [maxUses, setMaxUses] = useState('50')
  const [customMessage, setCustomMessage] = useState('')
  const [shareData, setShareData] = useState<any>(null)

  // Validation State
  const [maxUsesError, setMaxUsesError] = useState('')

  // Derived state
  const groupTag = shareData?.groupTag

  const generateQRCode = async () => {
    // Basic Validation
    if (parseInt(maxUses) < 1 || parseInt(maxUses) > 100) {
      setMaxUsesError('Must be between 1 and 100')
      return;
    }
    setMaxUsesError('') // Clear error

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

  const createCombinedImage = async (qrDataUrl: string, groupName: string, shareUrl: string, customMsg?: string, tag?: string | null): Promise<File> => {
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
        const cardHeight = 1300 // Slightly taller for better spacing
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
        ctx.fillStyle = '#EAB308' // Yellow-500 (Brand Banana)
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
        currentY += qrSize + 80 // Reduced gap

        // Group Tag Badge (Primary Display)
        if (tag) {
          ctx.font = 'bold 42px Inter, system-ui, sans-serif' // Increased size
          const tagText = tag.startsWith('@') ? tag : `@${tag}`
          const textMetrics = ctx.measureText(tagText)
          const badgeWidth = textMetrics.width + 120
          const badgeHeight = 100

          // Badge Background
          ctx.fillStyle = 'rgba(59, 130, 246, 0.08)' // Blue-500/8
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)' // Blue-500/30
          ctx.lineWidth = 3

          ctx.beginPath()
          ctx.roundRect(contentCenterX - (badgeWidth / 2), currentY, badgeWidth, badgeHeight, 999)
          ctx.fill()
          ctx.stroke()

          // Badge Text
          ctx.fillStyle = '#2563eb' // Blue-600
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(tagText, contentCenterX, currentY + (badgeHeight / 2))
          ctx.textBaseline = 'alphabetic' // Reset

          currentY += badgeHeight + 60
        } else {
          // Fallback if no tag: Show Group Name
          ctx.fillStyle = '#1e293b'
          ctx.font = 'bold 56px Inter, system-ui, sans-serif'
          ctx.fillText(groupName, contentCenterX, currentY + 40)
          currentY += 120
        }

        // Custom Message
        if (customMsg) {
          ctx.fillStyle = '#64748b' // Slate-500
          ctx.font = 'italic 32px Inter, system-ui, sans-serif'
          ctx.fillText(`"${customMsg}"`, contentCenterX, currentY)
        }



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
      // Generate the combined image first
      const combinedFile = await createCombinedImage(
        shareData.qrCode,
        groupName,
        shareData.shareUrl,
        shareData.customMessage,
        groupTag
      )

      const shareText = `*Join ${groupName} on uBank*\n` +
        (groupTag ? `Tag: ${groupTag}\n` : '') +
        (shareData.customMessage ? `\n_"${shareData.customMessage}"_\n` : '') +
        `\nSecure Link: ${shareData.shareUrl}`

      if (navigator.share && navigator.canShare) {
        const shareObj = {
          title: `Join ${groupName}`,
          text: shareText,
          url: shareData.shareUrl,
          files: [combinedFile]
        }

        if (navigator.canShare(shareObj)) {
          try {
            await navigator.share(shareObj)
            toast.success('Shared successfully!')
            return
          } catch (shareError) {
            console.warn('Native share failed or cancelled, falling back to download:', shareError)
          }
        }
      }

      // FALLBACK: Download the image and copy text
      const link = document.createElement('a')
      link.href = URL.createObjectURL(combinedFile)
      link.download = `ubank-invite-${groupName.replace(/\s+/g, '-').toLowerCase()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)

      await navigator.clipboard.writeText(shareText)

      toast.success('Image downloaded & Text copied!', {
        description: 'Native sharing not supported. Image saved to downloads.',
        duration: 5000,
      })

    } catch (error) {
      console.error('Share generation error:', error)
      toast.error('Failed to generate share image')
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


  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-8 max-w-2xl mx-auto"
    >
      <motion.div variants={itemFadeIn}>
        <GlassCard className="p-8 sm:p-10 space-y-8" hover={false}>
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-foreground">Invites</h2>
            <p className="text-sm font-medium text-muted-foreground/80">Configure secure access for {groupName}</p>
          </div>

          <div className="space-y-6">
            {/* Main Configuration */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Access Level</label>
              <Select value={permissions} onValueChange={setPermissions}>
                <SelectTrigger className="w-full h-12 rounded-xl bg-white/40 dark:bg-black/20 border-white/10 shadow-sm backdrop-blur-md focus:ring-2 focus:ring-blue-500/10 font-bold px-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl p-1">
                  <SelectItem value="VIEW_ONLY" className="font-bold rounded-lg cursor-pointer py-2.5">View Only</SelectItem>
                  <SelectItem value="REQUEST_JOIN" className="font-bold rounded-lg cursor-pointer py-2.5">Can Request to Join</SelectItem>
                  <SelectItem value="LIMITED_ACCESS" className="font-bold rounded-lg cursor-pointer py-2.5">Limited Access</SelectItem>
                  <SelectItem value="FULL_PREVIEW" className="font-bold rounded-lg cursor-pointer py-2.5">Full Preview</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Options Toggle (Simplified as a grid for now) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Expires In</label>
                <Select value={expiresIn} onValueChange={setExpiresIn}>
                  <SelectTrigger className="w-full h-12 rounded-xl bg-white/40 dark:bg-black/20 border-white/10 shadow-sm backdrop-blur-md focus:ring-2 focus:ring-blue-500/10 font-bold px-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl p-1">
                    <SelectItem value="1" className="font-bold rounded-lg cursor-pointer py-2.5">1 Day</SelectItem>
                    <SelectItem value="7" className="font-bold rounded-lg cursor-pointer py-2.5">7 Days</SelectItem>
                    <SelectItem value="30" className="font-bold rounded-lg cursor-pointer py-2.5">30 Days</SelectItem>
                    <SelectItem value="never" className="font-bold rounded-lg cursor-pointer py-2.5">Permanent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Max Uses</label>
                <PremiumInput
                  type="number"
                  min="1"
                  max="100"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  className="h-12 bg-white/40 dark:bg-black/20 rounded-xl"
                  error={!!maxUsesError}
                  errorMessage={maxUsesError}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Personal Message</label>
              <PremiumInput
                placeholder="Optional greeting..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value.slice(0, 100))}
                maxLength={100}
                className="h-12 bg-white/40 dark:bg-black/20 rounded-xl"
              />
            </div>

            <Button
              onClick={generateQRCode}
              isLoading={loading}
              variant="primary"
              className="w-full h-14 rounded-2xl shadow-lg mt-4 text-base font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0"
            >
              Generate Invitation
            </Button>
          </div>
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
            <GlassCard className="p-0 overflow-hidden" hover={false}>
              <div className="p-8 flex flex-col items-center justify-center space-y-6 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10">
                <div className="relative group cursor-pointer transform hover:scale-[1.02] transition-transform duration-300" onClick={downloadQRCode}>
                  <div className="p-4 bg-white rounded-3xl shadow-xl border border-white/50">
                    <img
                      src={shareData.qrCode}
                      alt="QR Code"
                      className="w-48 h-48 object-contain rounded-xl"
                    />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Click to Download
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 text-xs font-medium text-muted-foreground">
                  <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Secure & Verified</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-white/5">
                    <Clock className="w-3.5 h-3.5" />
                    {shareData.expiresAt ? new Date(shareData.expiresAt).toLocaleDateString() : 'Permanent'}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-zinc-50/50 dark:bg-black/20 border-t border-zinc-100 dark:border-white/5 grid grid-cols-2 gap-3">
                <Button
                  onClick={copyShareLink}
                  variant="outline"
                  className="h-12 w-full rounded-xl font-bold border-zinc-200 dark:border-white/10 hover:bg-white hover:text-blue-600 transition-colors"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  onClick={handleShare}
                  variant="primary" // Explicitly primary
                  className="h-12 w-full rounded-xl font-bold bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-lg"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
