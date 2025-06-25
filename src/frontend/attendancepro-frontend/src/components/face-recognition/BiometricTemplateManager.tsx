import React, { useState, useEffect } from 'react'
import { Trash2, Eye, EyeOff, Plus, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import faceRecognitionService, { FaceTemplate } from '../../services/faceRecognitionService'
import FaceEnrollmentComponent from './FaceEnrollmentComponent'

interface BiometricTemplateManagerProps {
  userId?: string
  showEnrollment?: boolean
}

const BiometricTemplateManager: React.FC<BiometricTemplateManagerProps> = ({
  userId,
  showEnrollment = true,
}) => {
  const [templates, setTemplates] = useState<FaceTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEnrollmentDialog, setShowEnrollmentDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    templateId: string
    templateName: string
  }>({
    open: false,
    templateId: '',
    templateName: '',
  })
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [userId])

  const loadTemplates = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const userTemplates = await faceRecognitionService.getUserTemplates(userId)
      setTemplates(userTemplates)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load biometric templates'
      setError(errorMessage)
      toast.error('Failed to load templates')
    }finally {
      setIsLoading(false)
    }
  }

  const handleActivateTemplate = async (templateId: string) => {
    try {
      setActionLoading(templateId)
      await faceRecognitionService.activateTemplate(templateId)
      toast.success('Template activated successfully')
      await loadTemplates()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to activate template'
      toast.error(errorMessage)
    }finally {
      setActionLoading(null)
    }
  }

  const handleDeactivateTemplate = async (templateId: string) => {
    try {
      setActionLoading(templateId)
      await faceRecognitionService.deactivateTemplate(templateId)
      toast.success('Template deactivated successfully')
      await loadTemplates()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to deactivate template'
      toast.error(errorMessage)
    }finally {
      setActionLoading(null)
    }
  }

  const handleDeleteTemplate = async () => {
    try {
      setActionLoading(deleteDialog.templateId)
      await faceRecognitionService.deleteTemplate(deleteDialog.templateId)
      toast.success('Template deleted successfully')
      setDeleteDialog({ open: false, templateId: '', templateName: '' })
      await loadTemplates()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete template'
      toast.error(errorMessage)
    }finally {
      setActionLoading(null)
    }
  }

  const handleEnrollmentComplete = async (templateId: string) => {
    setShowEnrollmentDialog(false)
    toast.success('New biometric template created successfully')
    console.log('Template enrolled:', templateId)
    await loadTemplates()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading biometric templates...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Biometric Templates</CardTitle>
              <CardDescription>
                Manage your face recognition templates for secure authentication
              </CardDescription>
            </div>
            {showEnrollment && (
              <Button onClick={() => setShowEnrollmentDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Template
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {templates.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Eye className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Biometric Templates</h3>
              <p className="text-muted-foreground mb-4">
                You haven't enrolled any biometric templates yet.
              </p>
              {showEnrollment && (
                <Button onClick={() => setShowEnrollmentDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Enroll Your First Template
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>{templates.filter(t => t.isActive).length} active templates</span>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-mono text-sm">
                        {template.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={template.isActive ? 'default' : 'secondary'}
                          className={template.isActive ? 'bg-green-100 text-green-800' : ''}
                        >
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(template.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(template.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {template.isActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeactivateTemplate(template.id)}
                              disabled={actionLoading === template.id}
                            >
                              {actionLoading === template.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <EyeOff className="w-3 h-3" />
                              )}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivateTemplate(template.id)}
                              disabled={actionLoading === template.id}
                            >
                              {actionLoading === template.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                templateId: template.id,
                                templateName: `Template ${template.id.substring(0, 8)}`,
                              })
                            }
                            disabled={actionLoading === template.id}
                          >
                            {actionLoading === template.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showEnrollmentDialog} onOpenChange={setShowEnrollmentDialog}>
        <DialogContent className="max-w-lg">
          <FaceEnrollmentComponent
            userId={userId}
            onEnrollmentComplete={handleEnrollmentComplete}
            onCancel={() => setShowEnrollmentDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => 
        setDeleteDialog({ ...deleteDialog, open })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Biometric Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog.templateName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, templateId: '', templateName: '' })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTemplate}
              disabled={actionLoading === deleteDialog.templateId}
            >
              {actionLoading === deleteDialog.templateId ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Template'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default BiometricTemplateManager
