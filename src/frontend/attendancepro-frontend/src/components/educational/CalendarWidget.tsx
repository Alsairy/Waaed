import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Users, Plus, Filter } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  type: 'class' | 'exam' | 'assignment' | 'event' | 'holiday'
  location?: string
  course?: string
  attendees?: number
  description?: string
}

interface CalendarWidgetProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  onDateSelect?: (date: Date) => void
  onCreateEvent?: () => void
  showMiniCalendar?: boolean
  showCreateButton?: boolean
  showFilters?: boolean
  className?: string
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  events,
  onEventClick,
  onDateSelect,
  onCreateEvent,
  showMiniCalendar = true,
  showCreateButton = false,
  showFilters = false,
  className = ''
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('')
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'class':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'exam':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'assignment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'event':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'holiday':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return events.filter(event => {
      const matchesDate = event.date === dateString
      const matchesFilter = !eventTypeFilter || event.type === eventTypeFilter
      return matchesDate && matchesFilter
    })
  }

  const getFilteredEvents = () => {
    if (!eventTypeFilter) return events
    return events.filter(event => event.type === eventTypeFilter)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(newDate)
    onDateSelect?.(newDate)
  }

  const renderMiniCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayEvents = getEventsForDate(date)
      const isSelected = selectedDate.toDateString() === date.toDateString()
      const isToday = new Date().toDateString() === date.toDateString()

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`
            h-8 w-8 text-sm rounded-md flex items-center justify-center relative transition-colors
            ${isSelected ? 'bg-blue-600 text-white' : 
              isToday ? 'bg-blue-100 text-blue-600 font-medium' : 
              'hover:bg-gray-100 text-gray-700'}
          `}
        >
          {day}
          {dayEvents.length > 0 && (
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
      )
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-xs text-gray-600 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="h-6 flex items-center justify-center font-medium">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    )
  }

  const renderEventsList = () => {
    const selectedDateEvents = getEventsForDate(selectedDate)
    const filteredEvents = getFilteredEvents()
    const upcomingEvents = filteredEvents
      .filter(event => new Date(event.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)

    const eventsToShow = selectedDateEvents.length > 0 ? selectedDateEvents : upcomingEvents

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">
            {selectedDateEvents.length > 0 
              ? `Events on ${selectedDate.toLocaleDateString()}`
              : 'Upcoming Events'
            }
          </h3>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {eventsToShow.length} event{eventsToShow.length !== 1 ? 's' : ''}
            </Badge>
            {showCreateButton && (
              <Button
                size="sm"
                onClick={onCreateEvent}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="class">Classes</option>
              <option value="exam">Exams</option>
              <option value="assignment">Assignments</option>
              <option value="event">Events</option>
              <option value="holiday">Holidays</option>
            </select>
            <div className="flex border border-gray-300 rounded overflow-hidden">
              <button
                onClick={() => setViewMode('month')}
                className={`px-2 py-1 text-xs ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-2 py-1 text-xs ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-2 py-1 text-xs ${viewMode === 'day' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Day
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {eventsToShow.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No events scheduled</p>
            </div>
          ) : (
            eventsToShow.map(event => (
              <div
                key={event.id}
                onClick={() => onEventClick?.(event)}
                className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {event.title}
                  </h4>
                  <Badge className={`text-xs ${getEventTypeColor(event.type)}`}>
                    {event.type}
                  </Badge>
                </div>

                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-2" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-2" />
                    <span>{event.time}</span>
                  </div>

                  {event.location && (
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-2" />
                      <span>{event.location}</span>
                    </div>
                  )}

                  {event.course && (
                    <div className="flex items-center">
                      <span className="w-3 h-3 mr-2 bg-blue-500 rounded-full flex-shrink-0" />
                      <span>{event.course}</span>
                    </div>
                  )}

                  {event.attendees && (
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-2" />
                      <span>{event.attendees} attendees</span>
                    </div>
                  )}
                </div>

                {event.description && (
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                    {event.description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className={`hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2" style={{ color: '#005F96' }} />
          Academic Calendar
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-6">
          {showMiniCalendar && renderMiniCalendar()}
          {renderEventsList()}
        </div>
      </CardContent>
    </Card>
  )
}

export default CalendarWidget
