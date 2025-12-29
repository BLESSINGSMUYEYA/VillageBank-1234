'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { User as UserIcon, Bell, Shield, CreditCard } from 'lucide-react'

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  region: string
  role: string
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    region: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          region: data.region || '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchProfile() // Refresh profile data
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // TODO: Implement notification preferences API
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-display font-black text-blue-900 dark:text-blue-100">Settings</h1>
        <p className="text-muted-foreground text-body">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="w-full flex justify-start overflow-x-auto bg-muted p-1 rounded-xl no-scrollbar flex-nowrap">
          <TabsTrigger value="profile" className="flex-1 min-w-[100px] flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1 min-w-[130px] flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1 min-w-[100px] flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex-1 min-w-[150px] flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payment Methods
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-h3">Profile Information</CardTitle>
              <CardDescription className="text-body">
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-body">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-body">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-body">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || user?.email || ''}
                    disabled
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Email cannot be changed. Contact admin if needed.
                  </p>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-body">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="region" className="text-body">Region</Label>
                  <Select value={formData.region} onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NORTHERN">Northern Region</SelectItem>
                      <SelectItem value="CENTRAL">Central Region</SelectItem>
                      <SelectItem value="SOUTHERN">Southern Region</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {profile?.role || user?.role || 'MEMBER'}
                  </Badge>
                  <span className="text-body text-muted-foreground">Account Role</span>
                </div>

                <Button type="submit" disabled={isLoading} className="bg-blue-900 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold rounded-xl">
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-h3">Notification Preferences</CardTitle>
              <CardDescription className="text-body">
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveNotifications} className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-black text-body">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-black text-body">Contribution Reminders</h4>
                      <p className="text-sm text-muted-foreground">Get reminded about monthly contributions</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-black text-body">Loan Updates</h4>
                      <p className="text-sm text-muted-foreground">Notifications about loan status changes</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-black text-body">Group Activities</h4>
                      <p className="text-sm text-muted-foreground">Updates about group activities</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4" />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="bg-blue-900 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold rounded-xl">
                  {isLoading ? 'Saving...' : 'Save Preferences'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-h3">Security Settings</CardTitle>
              <CardDescription className="text-body">
                Manage your account security and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium text-body mb-2">Password</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Change your password to keep your account secure
                </p>
                <Button variant="outline">Change Password</Button>
              </div>

              <div>
                <h4 className="font-medium text-body mb-2">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Add an extra layer of security to your account
                </p>
                <Button variant="outline">Enable 2FA</Button>
              </div>

              <div>
                <h4 className="font-medium text-body mb-2">Active Sessions</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Manage your active sessions across devices
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium text-body">Current Session</p>
                      <p className="text-sm text-muted-foreground">Chrome on Windows • Active now</p>
                    </div>
                    <Badge variant="outline">Current</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-h3">Payment Methods</CardTitle>
              <CardDescription className="text-body">
                Manage your payment methods for contributions and loan repayments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold">A</span>
                    </div>
                    <div>
                      <p className="font-medium text-body">Airtel Money</p>
                      <p className="text-sm text-muted-foreground">+265 99 123 456</p>
                    </div>
                  </div>
                  <Badge variant="outline">Default</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">M</span>
                    </div>
                    <div>
                      <p className="font-medium text-body">Mpamba</p>
                      <p className="text-sm text-muted-foreground">+265 88 987 654</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Remove</Button>
                </div>
              </div>

              <Button className="w-full bg-blue-900 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold rounded-xl">Add Payment Method</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
