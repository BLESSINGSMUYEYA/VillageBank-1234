'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, Share2, Users, Clock, Shield, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'

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
        toast.success('QR Code generated successfully!')
      } else {
        toast.error(data.error || 'Failed to generate QR code')
      }
    } catch (error) {
      toast.error('Failed to generate QR code')
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

        // Setup dimensions (Premium square/tall format)
        const width = 1080
        const padding = 80
        const qrSize = width - (padding * 2)
        const headerHeight = 120
        const footerHeight = 400
        const height = qrSize + headerHeight + footerHeight

        canvas.width = width
        canvas.height = height

        // Background with subtle gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height)
        gradient.addColorStop(0, '#ffffff')
        gradient.addColorStop(1, '#f8fafc')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)

        // Draw Header
        ctx.fillStyle = '#1e293b'
        ctx.font = 'bold 52px Inter, system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Village Banking Group', width / 2, padding + 20)

        // Draw QR Code Background (Glassmorphism look)
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
        ctx.shadowBlur = 40
        ctx.shadowOffsetY = 10
        ctx.fillStyle = '#ffffff'
        const radius = 40
        ctx.beginPath()
        ctx.roundRect(padding - 20, headerHeight + padding - 20, qrSize + 40, qrSize + 40, radius)
        ctx.fill()
        ctx.shadowBlur = 0 // Reset shadow

        // Draw QR Code
        ctx.drawImage(img, padding, headerHeight + padding, qrSize, qrSize)

        // Draw Footer Section
        const footerY = headerHeight + qrSize + padding + 60

        // Group Name
        ctx.fillStyle = '#2563eb'
        ctx.font = 'bold 48px Inter, system-ui, sans-serif'
        ctx.fillText(groupName, width / 2, footerY)

        // Custom Message
        if (customMsg) {
          ctx.fillStyle = '#64748b'
          ctx.font = 'italic 36px Inter, system-ui, sans-serif'
          ctx.fillText(`"${customMsg}"`, width / 2, footerY + 70)
        }

        // Link with background
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

        // Call to action
        ctx.fillStyle = '#94a3b8'
        ctx.font = 'bold 28px Inter, system-ui, sans-serif'
        ctx.fillText('SCAN OR CLICK TO JOIN', width / 2, height - 60)

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], 'village-banking-invite.png', { type: 'image/png' }))
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
      // 1. Copy link to clipboard first as a proactive safeguard
      await navigator.clipboard.writeText(shareData.shareUrl)

      // 2. Create the combined high-fidelity image
      const combinedFile = await createCombinedImage(
        shareData.qrCode,
        groupName,
        shareData.shareUrl,
        shareData.customMessage
      )

      const message = `*Village Banking Group Invitation*\n\n` +
        `Group: ${groupName}\n` +
        (shareData.customMessage ? `_"${shareData.customMessage}"_\n\n` : '') +
        `Scan the QR code or click the link to join:\n${shareData.shareUrl}`

      // 3. Use Web Share API
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

      // 4. Fallback (e.g. if Desktop or Unsupported)
      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/?text=${encodedMessage}`
      window.open(whatsappUrl, '_blank')
      toast.success('Link copied & opening WhatsApp...')

    } catch (error) {
      console.error('Share error:', error)
      toast.error('Share failed, but link was copied to clipboard')
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
    const colors = {
      VIEW_ONLY: 'bg-blue-100 text-blue-800',
      REQUEST_JOIN: 'bg-green-100 text-green-800',
      LIMITED_ACCESS: 'bg-yellow-100 text-yellow-800',
      FULL_PREVIEW: 'bg-purple-100 text-purple-800',
    }

    const labels = {
      VIEW_ONLY: 'View Only',
      REQUEST_JOIN: 'Can Request to Join',
      LIMITED_ACCESS: 'Limited Access',
      FULL_PREVIEW: 'Full Preview',
    }

    return (
      <Badge className={colors[permission as keyof typeof colors]}>
        {labels[permission as keyof typeof labels]}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Generate QR Code Share
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="permissions">Access Level</Label>
                <Select value={permissions} onValueChange={setPermissions}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIEW_ONLY">View Only</SelectItem>
                    <SelectItem value="REQUEST_JOIN">Can Request to Join</SelectItem>
                    <SelectItem value="LIMITED_ACCESS">Limited Access</SelectItem>
                    <SelectItem value="FULL_PREVIEW">Full Preview</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expires">Expires In</Label>
                <Select value={expiresIn} onValueChange={setExpiresIn}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="maxUses">Max Uses</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="message">Custom Message (Optional)</Label>
              <Input
                placeholder="Add a personal message (max 2 lines)"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value.slice(0, 100))}
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                {customMessage.length}/100 characters
              </p>
            </div>
          </div>

          <Button onClick={generateQRCode} disabled={loading} className="w-full">
            {loading ? 'Generating...' : 'Generate QR Code'}
          </Button>
        </CardContent>
      </Card>

      {/* QR Code Display */}
      {shareData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your QR Code</span>
              {getPermissionBadge(shareData.permissions)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* QR Code Image */}
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <img
                  src={shareData.qrCode}
                  alt="Group QR Code"
                  className="w-full max-w-[320px] h-auto aspect-[400/460] object-contain"
                />
              </div>
            </div>

            {/* Share Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{shareData.currentUses} / {shareData.maxUses} uses</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {shareData.expiresAt
                    ? `Expires ${new Date(shareData.expiresAt).toLocaleDateString()}`
                    : 'Never expires'
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>Secure share link</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button onClick={copyShareLink} variant="outline" className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button onClick={downloadQRCode} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download QR
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {loading ? 'Preparing...' : 'Share Invitation'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
