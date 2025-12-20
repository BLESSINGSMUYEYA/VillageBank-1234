'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, Share2, Users, Clock, Shield } from 'lucide-react'
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
                  className="w-64 h-64"
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}
