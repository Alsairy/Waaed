import React from 'react'
import { Mail, Phone, Building } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { useAuth } from '../../contexts/AuthContext'

const ProfilePage: React.FC = () => {
  const { user } = useAuth()

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </div>
        <Button>Edit Profile</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.profilePictureUrl} alt={user?.firstName} />
                <AvatarFallback className="text-2xl">
                  {getInitials(user?.firstName, user?.lastName)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{user?.firstName} {user?.lastName}</CardTitle>
            <CardDescription>{user?.position || 'Employee'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user?.email}</span>
              </div>
              {user?.phoneNumber && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user?.phoneNumber}</span>
                </div>
              )}
              {user?.department && (
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user?.department}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your account details and information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">First Name</label>
                <p className="text-sm text-muted-foreground mt-1">{user?.firstName}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <p className="text-sm text-muted-foreground mt-1">{user?.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <p className="text-sm text-muted-foreground mt-1">{user?.phoneNumber || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Employee ID</label>
                <p className="text-sm text-muted-foreground mt-1">{user?.employeeId || 'Not assigned'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Department</label>
                <p className="text-sm text-muted-foreground mt-1">{user?.department || 'Not assigned'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Position</label>
                <p className="text-sm text-muted-foreground mt-1">{user?.position || 'Not assigned'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <p className="text-sm text-muted-foreground mt-1">{user?.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProfilePage
