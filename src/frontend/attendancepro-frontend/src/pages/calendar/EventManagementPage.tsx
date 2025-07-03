import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { LoadingState } from '../../components/ui/error-display'
import { useAsync } from '../../hooks/use-async'
import { handleApiError } from '../../utils/error-handler'
import { 
  Calendar, 
  MapPin, 
  Plus, 
  Save, 
  X, 
  Edit, 
  Trash2,
  BookOpen,
  GraduationCap
} from 'lucide-react'
import { academicCalendarService, AcademicEvent, AcademicEventDto } from '../../services/academicCalendarService'

interface EventFormData {
  title: string
  description: string
  type: string
  startDate: string
  endDate: string
  isAllDay: boolean
  location: string
  isRecurring: boolean
  recurrencePattern: string
  priority: string
  status: string
  color: string
  academicYearId: string
  semesterId: string
}

const EventManagementPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<AcademicEvent | null>(null)
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    type: 'lecture',
    startDate: '',
    endDate: '',
    isAllDay: false,
    location: '',
    isRecurring: false,
    recurrencePattern: '',
    priority: 'medium',
    status: 'scheduled',
    color: '#3B82F6',
    academicYearId: '',
    semesterId: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: events, loading: eventsLoading, retry: retryEvents } = useAsync(
    async () => {
      try {
        const startDate = new Date()
        startDate.setMonth(startDate.getMonth() - 1)
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 6)
        
        return await academicCalendarService.getAcademicEvents(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        )
      } catch (error) {
        handleApiError(error, { fallbackMessage: 'Failed to fetch events' })
        return []
      }
    },
    []
  )

  const { data: academicYears } = useAsync(
    async () => {
      try {
        return await academicCalendarService.getAcademicYears()
      } catch (error) {
        handleApiError(error, { fallbackMessage: 'Failed to fetch academic years' })
        return []
      }
    },
    []
  )

  const { data: semesters } = useAsync(
    async () => {
      try {
        return await academicCalendarService.getSemesters(formData.academicYearId || undefined)
      } catch (error) {
        handleApiError(error, { fallbackMessage: 'Failed to fetch semesters' })
        return []
      }
    },
    [formData.academicYearId]
  )

  const eventTypes = [
    { value: 'lecture', label: 'Lecture', color: '#3B82F6' },
    { value: 'exam', label: 'Exam', color: '#EF4444' },
    { value: 'assignment', label: 'Assignment', color: '#F59E0B' },
    { value: 'seminar', label: 'Seminar', color: '#10B981' },
    { value: 'workshop', label: 'Workshop', color: '#8B5CF6' },
    { value: 'meeting', label: 'Meeting', color: '#6B7280' },
    { value: 'conference', label: 'Conference', color: '#EC4899' },
    { value: 'presentation', label: 'Presentation', color: '#14B8A6' }
  ]

  const priorities = [
    { value: 'low', label: 'Low', color: '#10B981' },
    { value: 'medium', label: 'Medium', color: '#F59E0B' },
    { value: 'high', label: 'High', color: '#EF4444' }
  ]

  const statuses = [
    { value: 'scheduled', label: 'Scheduled', color: '#3B82F6' },
    { value: 'in_progress', label: 'In Progress', color: '#F59E0B' },
    { value: 'completed', label: 'Completed', color: '#10B981' },
    { value: 'cancelled', label: 'Cancelled', color: '#EF4444' },
    { value: 'postponed', label: 'Postponed', color: '#8B5CF6' }
  ]

  const handleInputChange = (field: keyof EventFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const eventData: AcademicEventDto = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isAllDay: formData.isAllDay,
        location: formData.location,
        isRecurring: formData.isRecurring,
        recurrencePattern: formData.recurrencePattern,
        priority: formData.priority,
        status: formData.status,
        color: formData.color,
        academicYearId: formData.academicYearId || undefined,
        semesterId: formData.semesterId || undefined
      }

      if (editingEvent) {
        await academicCalendarService.updateAcademicEvent(editingEvent.id, eventData)
      } else {
        await academicCalendarService.createAcademicEvent(eventData)
      }

      setShowForm(false)
      setEditingEvent(null)
      resetForm()
      retryEvents()
    } catch (error) {
      handleApiError(error, { 
        fallbackMessage: editingEvent ? 'Failed to update event' : 'Failed to create event' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (event: AcademicEvent) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description || '',
      type: event.type,
      startDate: event.startDate.split('T')[0],
      endDate: event.endDate.split('T')[0],
      isAllDay: event.isAllDay,
      location: event.location || '',
      isRecurring: event.isRecurring,
      recurrencePattern: event.recurrencePattern || '',
      priority: event.priority,
      status: event.status,
      color: event.color || '#3B82F6',
      academicYearId: event.academicYearId || '',
      semesterId: event.semesterId || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      await academicCalendarService.deleteAcademicEvent(eventId)
      retryEvents()
    } catch (error) {
      handleApiError(error, { fallbackMessage: 'Failed to delete event' })
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'lecture',
      startDate: '',
      endDate: '',
      isAllDay: false,
      location: '',
      isRecurring: false,
      recurrencePattern: '',
      priority: 'medium',
      status: 'scheduled',
      color: '#3B82F6',
      academicYearId: '',
      semesterId: ''
    })
  }

  const getEventTypeColor = (type: string) => {
    const eventType = eventTypes.find(t => t.value === type)
    return eventType?.color || '#6B7280'
  }

  const getPriorityColor = (priority: string) => {
    const priorityObj = priorities.find(p => p.value === priority)
    return priorityObj?.color || '#6B7280'
  }

  const getStatusColor = (status: string) => {
    const statusObj = statuses.find(s => s.value === status)
    return statusObj?.color || '#6B7280'
  }

  const renderEventForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Plus className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowForm(false)
              setEditingEvent(null)
              resetForm()
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Event Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter event title"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Event Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter event description"
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Start Date *
              </label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                End Date *
              </label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Academic Year
              </label>
              <select
                value={formData.academicYearId}
                onChange={(e) => handleInputChange('academicYearId', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Academic Year</option>
                {academicYears?.map(year => (
                  <option key={year.id} value={year.id}>
                    {year.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Semester
              </label>
              <select
                value={formData.semesterId}
                onChange={(e) => handleInputChange('semesterId', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!formData.academicYearId}
              >
                <option value="">Select Semester</option>
                {semesters?.map(semester => (
                  <option key={semester.id} value={semester.id}>
                    {semester.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Color
              </label>
              <Input
                type="color"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Location
            </label>
            <Input
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter event location"
            />
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isAllDay}
                onChange={(e) => handleInputChange('isAllDay', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">All Day Event</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Recurring Event</span>
            </label>
          </div>

          {formData.isRecurring && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Recurrence Pattern
              </label>
              <Input
                value={formData.recurrencePattern}
                onChange={(e) => handleInputChange('recurrencePattern', e.target.value)}
                placeholder="e.g., weekly, monthly"
              />
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false)
                setEditingEvent(null)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {editingEvent ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )

  if (eventsLoading) {
    return <LoadingState isLoading={true} error={null} onRetry={() => retryEvents()}>
      <div />
    </LoadingState>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
          <p className="text-gray-600 mt-1">
            Create, edit, and manage academic events
          </p>
        </div>
        
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        )}
      </div>

      {showForm && renderEventForm()}

      <div className="grid gap-4">
        {events?.map(event => (
          <Card key={event.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg">{event.title}</h3>
                    <Badge 
                      style={{ 
                        backgroundColor: `${getEventTypeColor(event.type)}20`,
                        color: getEventTypeColor(event.type),
                        borderColor: getEventTypeColor(event.type)
                      }}
                      className="border"
                    >
                      {event.type}
                    </Badge>
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getPriorityColor(event.priority) }}
                      title={`Priority: ${event.priority}`}
                    />
                    <Badge 
                      style={{ 
                        backgroundColor: `${getStatusColor(event.status)}20`,
                        color: getStatusColor(event.status),
                        borderColor: getStatusColor(event.status)
                      }}
                      className="border"
                    >
                      {event.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="grid gap-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    
                    {event.semesterName && (
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span>{event.semesterName}</span>
                      </div>
                    )}

                    {event.academicYearName && (
                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        <span>{event.academicYearName}</span>
                      </div>
                    )}
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEdit(event)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {events?.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first academic event.
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventManagementPage
