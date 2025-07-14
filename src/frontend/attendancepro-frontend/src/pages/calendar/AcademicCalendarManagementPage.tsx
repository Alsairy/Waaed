import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Clock,
  MapPin,
  Users,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { academicCalendarService, AcademicTerm, AcademicTermDto, AcademicEvent, Holiday } from '../../services/academicCalendarService';



interface CreateAcademicEventRequest {
  title: string;
  description: string;
  eventType: string;
  startDate: string;
  endDate?: string;
  location?: string;
  academicYearId?: string;
  semesterId?: string;
  isRecurring: boolean;
  recurrencePattern?: string;
}

interface CreateHolidayRequest {
  name: string;
  description: string;
  date: string;
  holidayType: string;
  country?: string;
  region?: string;
  isRecurring: boolean;
}

export function AcademicCalendarManagementPage() {
  const [academicTerms, setAcademicTerms] = useState<AcademicTerm[]>([]);
  const [examSchedules, setExamSchedules] = useState<any[]>([]);
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');
  
  const [showCreateYearDialog, setShowCreateYearDialog] = useState(false);
  const [showCreateSemesterDialog, setShowCreateSemesterDialog] = useState(false);
  const [showCreateEventDialog, setShowCreateEventDialog] = useState(false);
  const [showCreateHolidayDialog, setShowCreateHolidayDialog] = useState(false);
  
  const [newAcademicTerm, setNewAcademicTerm] = useState<AcademicTermDto>({
    name: '',
    type: '',
    startDate: '',
    endDate: '',
    year: new Date().getFullYear()
  });
  
  const [newSemester, setNewSemester] = useState<any>({
    name: '',
    examType: 'Final',
    examDate: '',
    startTime: '',
    endTime: '',
    location: '',
    duration: 120
  });
  
  const [newEvent, setNewEvent] = useState<CreateAcademicEventRequest>({
    title: '',
    description: '',
    eventType: '',
    startDate: '',
    endDate: '',
    location: '',
    academicYearId: '',
    semesterId: '',
    isRecurring: false,
    recurrencePattern: ''
  });
  
  const [newHoliday, setNewHoliday] = useState<CreateHolidayRequest>({
    name: '',
    description: '',
    date: '',
    holidayType: 'National',
    country: '',
    region: '',
    isRecurring: false
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [termsData, holidaysData] = await Promise.all([
        academicCalendarService.getAcademicTerms(),
        academicCalendarService.getHolidays()
      ]);
      
      setAcademicTerms(termsData);
      setHolidays(holidaysData);
      
      if (termsData.length > 0 && !selectedAcademicYear) {
        setSelectedAcademicYear(termsData[0].id);
      }
    } catch (err) {
      setError('Failed to load academic calendar data');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAcademicYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedAcademicYear) {
      loadSemesters();
      loadEvents(selectedAcademicYear, selectedSemester);
    }
  }, [selectedAcademicYear, selectedSemester]);

  const loadSemesters = async () => {
    try {
      const examSchedulesData = await academicCalendarService.getExamSchedules();
      setExamSchedules(examSchedulesData);
    } catch (err) {
      console.error('Error loading semesters:', err);
    }
  };

  const loadEvents = async (academicYearId: string, semesterId?: string) => {
    try {
      const eventsData = await academicCalendarService.getAcademicEvents(academicYearId, semesterId);
      setEvents(eventsData);
    } catch (err) {
      console.error('Error loading events:', err);
    }
  };

  const handleCreateAcademicYear = async () => {
    try {
      await academicCalendarService.createAcademicTerm({
        name: newAcademicTerm.name,
        type: 'Semester',
        startDate: newAcademicTerm.startDate,
        endDate: newAcademicTerm.endDate,
        year: new Date().getFullYear()
      });
      setShowCreateYearDialog(false);
      setNewAcademicTerm({ 
        name: '', 
        type: '', 
        startDate: '', 
        endDate: '', 
        year: new Date().getFullYear() 
      });
      loadData();
    } catch (err) {
      setError('Failed to create academic year');
      console.error('Error creating academic year:', err);
    }
  };

  const handleCreateSemester = async () => {
    try {
      await academicCalendarService.createExamSchedule(newSemester);
      setShowCreateSemesterDialog(false);
      setNewSemester({
        courseId: '',
        examType: 'Final',
        examDate: '',
        startTime: '',
        endTime: '',
        location: '',
        duration: 120
      });
      loadSemesters();
    } catch (err) {
      setError('Failed to create semester');
      console.error('Error creating semester:', err);
    }
  };

  const handleCreateEvent = async () => {
    try {
      await academicCalendarService.createAcademicEvent({
        title: newEvent.title,
        description: newEvent.description,
        eventType: newEvent.eventType,
        startDate: newEvent.startDate,
        endDate: newEvent.endDate || newEvent.startDate,
        isAllDay: false,
        isRecurring: false,
        isPublic: true
      });
      setShowCreateEventDialog(false);
      setNewEvent({
        title: '',
        description: '',
        eventType: '',
        startDate: '',
        endDate: '',
        location: '',
        academicYearId: '',
        semesterId: '',
        isRecurring: false,
        recurrencePattern: ''
      });
      if (selectedAcademicYear) {
        loadEvents(selectedAcademicYear, selectedSemester);
      }
    } catch (err) {
      setError('Failed to create academic event');
      console.error('Error creating event:', err);
    }
  };

  const handleCreateHoliday = async () => {
    try {
      await academicCalendarService.createHoliday({
        ...newHoliday,
        type: 'National',
        isObserved: true
      });
      setShowCreateHolidayDialog(false);
      setNewHoliday({
        name: '',
        description: '',
        date: '',
        holidayType: 'National',
        country: '',
        region: '',
        isRecurring: false
      });
      loadData();
    } catch (err) {
      setError('Failed to create holiday');
      console.error('Error creating holiday:', err);
    }
  };

  const handleDeleteAcademicYear = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this academic year?')) {
      try {
        await academicCalendarService.deleteAcademicEvent(id);
        loadData();
      } catch (err) {
        setError('Failed to delete academic year');
        console.error('Error deleting academic year:', err);
      }
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await academicCalendarService.deleteAcademicEvent(id);
        if (selectedAcademicYear) {
          loadEvents(selectedAcademicYear, selectedSemester);
        }
      } catch (err) {
        setError('Failed to delete event');
        console.error('Error deleting event:', err);
      }
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      try {
        await academicCalendarService.deleteAcademicEvent(id);
        loadData();
      } catch (err) {
        setError('Failed to delete holiday');
        console.error('Error deleting holiday:', err);
      }
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case 'exam': return 'bg-red-100 text-red-800';
      case 'assignment': return 'bg-blue-100 text-blue-800';
      case 'lecture': return 'bg-green-100 text-green-800';
      case 'holiday': return 'bg-purple-100 text-purple-800';
      case 'break': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !eventTypeFilter || event.eventType === eventTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredHolidays = holidays.filter(holiday =>
    holiday.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    holiday.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading academic calendar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Academic Calendar Management</h1>
          <p className="text-gray-600">Manage academic years, semesters, events, and holidays</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCreateYearDialog} onOpenChange={setShowCreateYearDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Academic Year
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Academic Year</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Academic Year Name"
                  value={newAcademicTerm.name}
                  onChange={(e) => setNewAcademicTerm({ ...newAcademicTerm, name: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  value={newAcademicTerm.description}
                  onChange={(e) => setNewAcademicTerm({ ...newAcademicTerm, description: e.target.value })}
                />
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={newAcademicTerm.startDate}
                  onChange={(e) => setNewAcademicTerm({ ...newAcademicTerm, startDate: e.target.value })}
                />
                <Input
                  type="date"
                  placeholder="End Date"
                  value={newAcademicTerm.endDate}
                  onChange={(e) => setNewAcademicTerm({ ...newAcademicTerm, endDate: e.target.value })}
                />
                <Button onClick={handleCreateAcademicYear} className="w-full">
                  Create Academic Year
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Academic Years
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {academicTerms.map((year) => (
                <div
                  key={year.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedAcademicYear === year.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedAcademicYear(year.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{year.name}</h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(year.startDate)} - {formatDate(year.endDate)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAcademicYear(year.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Semesters
              </div>
              <Dialog open={showCreateSemesterDialog} onOpenChange={setShowCreateSemesterDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" disabled={!selectedAcademicYear}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Semester</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Semester Name"
                      value={newSemester.courseId}
                      onChange={(e) => setNewSemester({ ...newSemester, courseId: e.target.value })}
                    />
                    <Select
                      value={newSemester.examType}
                      onValueChange={(value: string) =>
                        setNewSemester({ ...newSemester, examType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Semester Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fall">Fall</SelectItem>
                        <SelectItem value="Spring">Spring</SelectItem>
                        <SelectItem value="Summer">Summer</SelectItem>
                        <SelectItem value="Winter">Winter</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder="Description"
                      value={newSemester.location || ''}
                      onChange={(e) => setNewSemester({ ...newSemester, location: e.target.value })}
                    />
                    <Input
                      type="date"
                      placeholder="Start Date"
                      value={newSemester.examDate}
                      onChange={(e) => setNewSemester({ ...newSemester, examDate: e.target.value })}
                    />
                    <Input
                      type="date"
                      placeholder="End Date"
                      value={newSemester.startTime}
                      onChange={(e) => setNewSemester({ ...newSemester, startTime: e.target.value })}
                    />
                    <Button
                      onClick={() => {
                        setNewSemester({ ...newSemester, endTime: selectedAcademicYear || '' });
                        handleCreateSemester();
                      }}
                      className="w-full"
                    >
                      Create Semester
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {examSchedules.map((semester: any) => (
                <div
                  key={semester.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedSemester === semester.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedSemester(semester.id)}
                >
                  <h3 className="font-medium">{semester.name || 'Unnamed Semester'}</h3>
                  <Badge variant="outline" className="mt-1">
                    {semester.type || 'Regular'}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">
                    {semester.startDate ? formatDate(semester.startDate) : 'TBD'} - {semester.endDate ? formatDate(semester.endDate) : 'TBD'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Quick Actions
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Dialog open={showCreateEventDialog} onOpenChange={setShowCreateEventDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full" disabled={!selectedAcademicYear}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Academic Event</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Event Title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                    <Input
                      placeholder="Event Type (e.g., Exam, Assignment, Lecture)"
                      value={newEvent.eventType}
                      onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value })}
                    />
                    <Textarea
                      placeholder="Description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    />
                    <Input
                      placeholder="Location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    />
                    <Input
                      type="datetime-local"
                      placeholder="Start Date & Time"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    />
                    <Input
                      type="datetime-local"
                      placeholder="End Date & Time (Optional)"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    />
                    <Button
                      onClick={() => {
                        setNewEvent({
                          ...newEvent,
                          academicYearId: selectedAcademicYear,
                          semesterId: selectedSemester
                        });
                        handleCreateEvent();
                      }}
                      className="w-full"
                    >
                      Create Event
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showCreateHolidayDialog} onOpenChange={setShowCreateHolidayDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Holiday
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Holiday</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Holiday Name"
                      value={newHoliday.name}
                      onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                    />
                    <Textarea
                      placeholder="Description"
                      value={newHoliday.description}
                      onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
                    />
                    <Input
                      type="date"
                      placeholder="Date"
                      value={newHoliday.date}
                      onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                    />
                    <Select
                      value={newHoliday.holidayType}
                      onValueChange={(value) => setNewHoliday({ ...newHoliday, holidayType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Holiday Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="National">National</SelectItem>
                        <SelectItem value="Religious">Religious</SelectItem>
                        <SelectItem value="Academic">Academic</SelectItem>
                        <SelectItem value="Regional">Regional</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleCreateHoliday} className="w-full">
                      Create Holiday
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Academic Events
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48"
                />
                <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="Exam">Exams</SelectItem>
                    <SelectItem value="Assignment">Assignments</SelectItem>
                    <SelectItem value="Lecture">Lectures</SelectItem>
                    <SelectItem value="Break">Breaks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredEvents.map((event) => (
                <div key={event.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{event.title}</h3>
                        <Badge className={getEventTypeColor(event.eventType)}>
                          {event.eventType}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(event.startDate)}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Holidays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredHolidays.map((holiday) => (
                <div key={holiday.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{holiday.name}</h3>
                        <Badge variant="outline">{holiday.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{holiday.description}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {formatDate(holiday.date)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteHoliday(holiday.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
