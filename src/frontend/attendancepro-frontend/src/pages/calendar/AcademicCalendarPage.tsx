import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { LoadingState } from '../../components/ui/error-display'
import { useAsync } from '../../hooks/use-async'
import { handleApiError } from '../../utils/error-handler'
import CalendarWidget from '../../components/educational/CalendarWidget'
import { 
  Calendar, 
  Plus, 
  Filter, 
  Eye,
  Edit,
  Trash2,
  Clock,
  MapPin,
  BookOpen,
  GraduationCap,
  Settings
} from 'lucide-react'
import { academicCalendarService, AcademicEvent, Holiday } from '../../services/academicCalendarService'

interface CalendarFilters {
  eventType: string
  academicYear: string
  semester: string
  dateRange: string
  search: string
}

const AcademicCalendarPage: React.FC = () => {
  const [selectedView, setSelectedView] = useState<'calendar' | 'events' | 'years' | 'semesters'>('calendar')
  const [, setSelectedDate] = useState<Date>(new Date())
  const [filters, setFilters] = useState<CalendarFilters>({
    eventType: '',
    academicYear: '',
    semester: '',
    dateRange: 'month',
    search: ''
  })

  const { data: academicEvents, loading: eventsLoading } = useAsync(
    async () => {
      try {
        const startDate = new Date()
        startDate.setMonth(startDate.getMonth() - 1)
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 6)
        
        return await academicCalendarService.getAcademicEvents(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
          filters.eventType || undefined
        )
      } catch (error) {
        handleApiError(error, { fallbackMessage: 'Failed to fetch academic events' })
        return []
      }
    },
    [filters.eventType]
  )

  const { data: academicYears, loading: yearsLoading } = useAsync(
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

  const { data: semesters, loading: semestersLoading } = useAsync(
    async () => {
      try {
        return await academicCalendarService.getSemesters(filters.academicYear || undefined)
      } catch (error) {
        handleApiError(error, { fallbackMessage: 'Failed to fetch semesters' })
        return []
      }
    },
    [filters.academicYear]
  )

  const { data: holidays } = useAsync(
    async () => {
      try {
        const startDate = new Date()
        startDate.setMonth(startDate.getMonth() - 1)
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 6)
        
        return await academicCalendarService.getHolidays(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        )
      } catch (error) {
        handleApiError(error, { fallbackMessage: 'Failed to fetch holidays' })
        return []
      }
    },
    []
  )

  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'exam':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'assignment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'lecture':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'seminar':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'workshop':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'holiday':
        return 'bg-pink-100 text-pink-800 border-pink-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const convertToCalendarEvents = (events: AcademicEvent[], holidays: Holiday[]) => {
    const calendarEvents = [
      ...events.map(event => ({
        id: event.id,
        title: event.title,
        date: event.startDate.split('T')[0],
        time: new Date(event.startDate).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        type: event.type.toLowerCase() as 'class' | 'exam' | 'assignment' | 'event' | 'holiday',
        location: event.location,
        course: event.semesterName,
        description: event.description
      })),
      ...holidays.map(holiday => ({
        id: holiday.id,
        title: holiday.name,
        date: holiday.date.split('T')[0],
        time: 'All Day',
        type: 'holiday' as const,
        description: holiday.description
      }))
    ]
    return calendarEvents
  }

  const filteredEvents = academicEvents?.filter(event => {
    if (filters.search && !event.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.academicYear && event.academicYearId !== filters.academicYear) {
      return false
    }
    if (filters.semester && event.semesterId !== filters.semester) {
      return false
    }
    return true
  }) || []

  const renderCalendarView = () => {
    const calendarEvents = convertToCalendarEvents(academicEvents || [], holidays || [])
    
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CalendarWidget
            events={calendarEvents}
            onEventClick={(event) => {
              console.log('Event clicked:', event)
            }}
            onDateSelect={setSelectedDate}
            showMiniCalendar={true}
            className="h-full"
          />
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Event Type
                </label>
                <select
                  value={filters.eventType}
                  onChange={(e) => setFilters(prev => ({ ...prev, eventType: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="exam">Exams</option>
                  <option value="assignment">Assignments</option>
                  <option value="lecture">Lectures</option>
                  <option value="seminar">Seminars</option>
                  <option value="workshop">Workshops</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Academic Year
                </label>
                <select
                  value={filters.academicYear}
                  onChange={(e) => setFilters(prev => ({ ...prev, academicYear: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Years</option>
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
                  value={filters.semester}
                  onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!filters.academicYear}
                >
                  <option value="">All Semesters</option>
                  {semesters?.map(semester => (
                    <option key={semester.id} value={semester.id}>
                      {semester.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Search Events
                </label>
                <Input
                  placeholder="Search events..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
                  Quick Stats
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Events</span>
                <Badge variant="outline">{academicEvents?.length || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Month</span>
                <Badge variant="outline">
                  {academicEvents?.filter(event => {
                    const eventDate = new Date(event.startDate)
                    const now = new Date()
                    return eventDate.getMonth() === now.getMonth() && 
                           eventDate.getFullYear() === now.getFullYear()
                  }).length || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Holidays</span>
                <Badge variant="outline">{holidays?.length || 0}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderEventsView = () => {
    if (eventsLoading) {
      return <LoadingState isLoading={true} error={null} onRetry={() => {}}>
        <div />
      </LoadingState>
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Search events..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-64"
            />
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>

        <div className="grid gap-4">
          {filteredEvents.map(event => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <Badge className={getEventTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(event.priority)}`} />
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
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
                    </div>
                    
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const renderAcademicYearsView = () => {
    if (yearsLoading) {
      return <LoadingState isLoading={true} error={null} onRetry={() => {}}>
        <div />
      </LoadingState>
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Academic Years</h2>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Academic Year
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {academicYears?.map(year => (
            <Card key={year.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <GraduationCap className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
                    {year.name}
                  </span>
                  <Badge variant={year.isActive ? 'default' : 'secondary'}>
                    {year.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {new Date(year.startDate).toLocaleDateString()} - {new Date(year.endDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Semesters</span>
                    <span className="font-medium">{year.semesters?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Events</span>
                    <span className="font-medium">{year.academicEvents?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Holidays</span>
                    <span className="font-medium">{year.holidays?.length || 0}</span>
                  </div>
                  
                  {year.description && (
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                      {year.description}
                    </p>
                  )}
                  
                  <div className="flex justify-end space-x-2 pt-3">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const renderSemestersView = () => {
    if (semestersLoading) {
      return <LoadingState isLoading={true} error={null} onRetry={() => {}}>
        <div />
      </LoadingState>
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Semesters</h2>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Semester
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {semesters?.map(semester => (
            <Card key={semester.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
                    {semester.name}
                  </span>
                  <Badge variant={semester.isActive ? 'default' : 'secondary'}>
                    {semester.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {semester.type} • {semester.academicYearName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-gray-600">Duration: </span>
                    <span className="font-medium">
                      {new Date(semester.startDate).toLocaleDateString()} - {new Date(semester.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Events</span>
                    <span className="font-medium">{semester.academicEvents?.length || 0}</span>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-3">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (selectedView) {
      case 'calendar':
        return renderCalendarView()
      case 'events':
        return renderEventsView()
      case 'years':
        return renderAcademicYearsView()
      case 'semesters':
        return renderSemestersView()
      default:
        return renderCalendarView()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Calendar</h1>
          <p className="text-gray-600 mt-1">
            Manage academic events, years, semesters, and holidays
          </p>
        </div>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={selectedView === 'calendar' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedView('calendar')}
          className={selectedView === 'calendar' ? 'bg-white shadow-sm' : ''}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Calendar
        </Button>
        <Button
          variant={selectedView === 'events' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedView('events')}
          className={selectedView === 'events' ? 'bg-white shadow-sm' : ''}
        >
          <Clock className="h-4 w-4 mr-2" />
          Events
        </Button>
        <Button
          variant={selectedView === 'years' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedView('years')}
          className={selectedView === 'years' ? 'bg-white shadow-sm' : ''}
        >
          <GraduationCap className="h-4 w-4 mr-2" />
          Academic Years
        </Button>
        <Button
          variant={selectedView === 'semesters' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedView('semesters')}
          className={selectedView === 'semesters' ? 'bg-white shadow-sm' : ''}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Semesters
        </Button>
      </div>

      {renderContent()}
    </div>
  )
}

export default AcademicCalendarPage
