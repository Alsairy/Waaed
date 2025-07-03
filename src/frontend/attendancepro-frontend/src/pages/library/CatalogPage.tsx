import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { 
  BookOpen, 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Eye,
  Users,
  Star,
  CheckCircle,
  FileText,
  Heart,
  Share,
  Bookmark,
  Grid,
  List
} from 'lucide-react'
import { toast } from 'sonner'

interface Book {
  id: string
  title: string
  author: string
  isbn: string
  category: string
  subject: string
  publisher: string
  publicationYear: number
  language: 'english' | 'arabic' | 'bilingual'
  format: 'physical' | 'digital' | 'both'
  totalCopies: number
  availableCopies: number
  reservedCopies: number
  checkedOutCopies: number
  rating: number
  reviewCount: number
  description: string
  coverImage: string
  tags: string[]
  location: string
  status: 'available' | 'checked_out' | 'reserved' | 'maintenance' | 'lost'
  addedDate: string
  lastUpdated: string
}

interface BookFilters {
  category: string
  subject: string
  language: string
  format: string
  availability: string
  searchTerm: string
}

interface LibraryStats {
  totalBooks: number
  availableBooks: number
  checkedOutBooks: number
  reservedBooks: number
  digitalBooks: number
  physicalBooks: number
}

const CatalogPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [libraryStats, setLibraryStats] = useState<LibraryStats>({
    totalBooks: 0,
    availableBooks: 0,
    checkedOutBooks: 0,
    reservedBooks: 0,
    digitalBooks: 0,
    physicalBooks: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<BookFilters>({
    category: '',
    subject: '',
    language: '',
    format: '',
    availability: '',
    searchTerm: ''
  })

  useEffect(() => {
    loadLibraryCatalog()
  }, [])

  const loadLibraryCatalog = async () => {
    try {
      setIsLoading(true)
      
      const mockBooks: Book[] = [
        {
          id: '1',
          title: 'Advanced Mathematics for Engineers',
          author: 'Dr. Ahmed Hassan',
          isbn: '978-0123456789',
          category: 'Academic',
          subject: 'Mathematics',
          publisher: 'Academic Press',
          publicationYear: 2023,
          language: 'english',
          format: 'both',
          totalCopies: 15,
          availableCopies: 8,
          reservedCopies: 3,
          checkedOutCopies: 4,
          rating: 4.5,
          reviewCount: 24,
          description: 'Comprehensive guide to advanced mathematical concepts for engineering students.',
          coverImage: '/images/books/math-engineering.jpg',
          tags: ['mathematics', 'engineering', 'calculus', 'algebra'],
          location: 'Section A - Shelf 12',
          status: 'available',
          addedDate: '2024-01-15',
          lastUpdated: '2024-01-30'
        },
        {
          id: '2',
          title: 'الفيزياء الحديثة',
          author: 'د. سارة محمد',
          isbn: '978-0987654321',
          category: 'Academic',
          subject: 'Physics',
          publisher: 'دار المعرفة',
          publicationYear: 2023,
          language: 'arabic',
          format: 'physical',
          totalCopies: 12,
          availableCopies: 5,
          reservedCopies: 2,
          checkedOutCopies: 5,
          rating: 4.2,
          reviewCount: 18,
          description: 'كتاب شامل في الفيزياء الحديثة للطلاب الجامعيين',
          coverImage: '/images/books/modern-physics-ar.jpg',
          tags: ['فيزياء', 'علوم', 'جامعي'],
          location: 'القسم ب - الرف 8',
          status: 'available',
          addedDate: '2024-01-10',
          lastUpdated: '2024-01-25'
        },
        {
          id: '3',
          title: 'Computer Science Fundamentals',
          author: 'Prof. Jennifer Smith',
          isbn: '978-0456789123',
          category: 'Academic',
          subject: 'Computer Science',
          publisher: 'Tech Publications',
          publicationYear: 2024,
          language: 'english',
          format: 'digital',
          totalCopies: 1,
          availableCopies: 1,
          reservedCopies: 0,
          checkedOutCopies: 0,
          rating: 4.8,
          reviewCount: 35,
          description: 'Essential concepts in computer science for beginners and intermediate students.',
          coverImage: '/images/books/cs-fundamentals.jpg',
          tags: ['computer science', 'programming', 'algorithms', 'data structures'],
          location: 'Digital Library',
          status: 'available',
          addedDate: '2024-02-01',
          lastUpdated: '2024-02-01'
        },
        {
          id: '4',
          title: 'English Literature Classics',
          author: 'Various Authors',
          isbn: '978-0789123456',
          category: 'Literature',
          subject: 'English',
          publisher: 'Classic Books Ltd',
          publicationYear: 2022,
          language: 'english',
          format: 'physical',
          totalCopies: 20,
          availableCopies: 0,
          reservedCopies: 5,
          checkedOutCopies: 15,
          rating: 4.6,
          reviewCount: 42,
          description: 'Collection of classic English literature works for students.',
          coverImage: '/images/books/english-classics.jpg',
          tags: ['literature', 'english', 'classics', 'poetry'],
          location: 'Section C - Shelf 5',
          status: 'checked_out',
          addedDate: '2023-12-01',
          lastUpdated: '2024-01-20'
        },
        {
          id: '5',
          title: 'Introduction to Chemistry',
          author: 'Dr. Omar Al-Rashid',
          isbn: '978-0321654987',
          category: 'Academic',
          subject: 'Chemistry',
          publisher: 'Science Press',
          publicationYear: 2023,
          language: 'bilingual',
          format: 'both',
          totalCopies: 18,
          availableCopies: 12,
          reservedCopies: 1,
          checkedOutCopies: 5,
          rating: 4.3,
          reviewCount: 28,
          description: 'Comprehensive introduction to chemistry concepts in both English and Arabic.',
          coverImage: '/images/books/intro-chemistry.jpg',
          tags: ['chemistry', 'science', 'bilingual', 'introduction'],
          location: 'Section A - Shelf 15',
          status: 'available',
          addedDate: '2024-01-05',
          lastUpdated: '2024-01-28'
        },
        {
          id: '6',
          title: 'History of Islamic Civilization',
          author: 'Prof. Fatima Al-Zahra',
          isbn: '978-0654321987',
          category: 'History',
          subject: 'Islamic Studies',
          publisher: 'Heritage Publications',
          publicationYear: 2023,
          language: 'arabic',
          format: 'physical',
          totalCopies: 10,
          availableCopies: 3,
          reservedCopies: 2,
          checkedOutCopies: 5,
          rating: 4.7,
          reviewCount: 31,
          description: 'تاريخ شامل للحضارة الإسلامية عبر العصور',
          coverImage: '/images/books/islamic-history.jpg',
          tags: ['تاريخ', 'حضارة', 'إسلامية'],
          location: 'القسم د - الرف 3',
          status: 'available',
          addedDate: '2023-11-20',
          lastUpdated: '2024-01-15'
        }
      ]

      setBooks(mockBooks)

      const stats: LibraryStats = {
        totalBooks: mockBooks.length,
        availableBooks: mockBooks.filter(b => b.status === 'available').length,
        checkedOutBooks: mockBooks.reduce((sum, b) => sum + b.checkedOutCopies, 0),
        reservedBooks: mockBooks.reduce((sum, b) => sum + b.reservedCopies, 0),
        digitalBooks: mockBooks.filter(b => b.format === 'digital' || b.format === 'both').length,
        physicalBooks: mockBooks.filter(b => b.format === 'physical' || b.format === 'both').length
      }
      setLibraryStats(stats)

    } catch (error) {
      console.error('Error loading library catalog:', error)
      toast.error('Failed to load library catalog')
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Academic': return 'bg-blue-100 text-blue-800'
      case 'Literature': return 'bg-purple-100 text-purple-800'
      case 'History': return 'bg-orange-100 text-orange-800'
      case 'Science': return 'bg-green-100 text-green-800'
      case 'Reference': return 'bg-gray-100 text-gray-800'
      case 'Fiction': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLanguageColor = (language: string) => {
    switch (language) {
      case 'english': return 'bg-blue-100 text-blue-800'
      case 'arabic': return 'bg-green-100 text-green-800'
      case 'bilingual': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'physical': return 'bg-orange-100 text-orange-800'
      case 'digital': return 'bg-blue-100 text-blue-800'
      case 'both': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'checked_out': return 'bg-yellow-100 text-yellow-800'
      case 'reserved': return 'bg-blue-100 text-blue-800'
      case 'maintenance': return 'bg-orange-100 text-orange-800'
      case 'lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAvailabilityStatus = (book: Book) => {
    if (book.availableCopies > 0) return 'Available'
    if (book.reservedCopies > 0) return 'Reserved'
    if (book.checkedOutCopies > 0) return 'Checked Out'
    return 'Unavailable'
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  const handleBookAction = async (action: 'reserve' | 'checkout' | 'favorite' | 'share') => {
    try {
      switch (action) {
        case 'reserve':
          toast.success('Book reserved successfully')
          break
        case 'checkout':
          toast.success('Book checked out successfully')
          break
        case 'favorite':
          toast.success('Book added to favorites')
          break
        case 'share':
          toast.success('Book link shared')
          break
      }
      loadLibraryCatalog()
    } catch (error) {
      toast.error(`Failed to ${action} book`)
    }
  }

  const handleBulkAction = async (action: 'export' | 'import' | 'update_catalog') => {
    try {
      switch (action) {
        case 'export':
          toast.success('Catalog exported successfully')
          break
        case 'import':
          toast.success('Books imported successfully')
          break
        case 'update_catalog':
          toast.success('Catalog updated successfully')
          break
      }
    } catch (error) {
      toast.error(`Failed to ${action}`)
    }
  }

  const filteredBooks = books.filter(book => {
    if (filters.category && book.category !== filters.category) return false
    if (filters.subject && book.subject !== filters.subject) return false
    if (filters.language && book.language !== filters.language) return false
    if (filters.format && book.format !== filters.format) return false
    if (filters.availability) {
      const status = getAvailabilityStatus(book)
      if (status !== filters.availability) return false
    }
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      return book.title.toLowerCase().includes(searchLower) ||
             book.author.toLowerCase().includes(searchLower) ||
             book.isbn.toLowerCase().includes(searchLower) ||
             book.tags.some(tag => tag.toLowerCase().includes(searchLower))
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#005F96' }}>
            Library Catalog
          </h1>
          <p className="text-muted-foreground">
            Browse and search the complete library collection
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => handleBulkAction('export')}>
            <Download className="mr-2 h-4 w-4" />
            Export Catalog
          </Button>
          <Button style={{ backgroundColor: '#36BA91' }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Book
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#005F96' }}>
              {libraryStats.totalBooks}
            </div>
            <p className="text-xs text-muted-foreground">
              In collection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {libraryStats.availableBooks}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready to borrow
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked Out</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#F39C12' }}>
              {libraryStats.checkedOutBooks}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently borrowed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reserved</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#E74C3C' }}>
              {libraryStats.reservedBooks}
            </div>
            <p className="text-xs text-muted-foreground">
              On hold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Digital Books</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#9B59B6' }}>
              {libraryStats.digitalBooks}
            </div>
            <p className="text-xs text-muted-foreground">
              E-books available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Physical Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#E67E22' }}>
              {libraryStats.physicalBooks}
            </div>
            <p className="text-xs text-muted-foreground">
              Physical copies
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
              Search & Filter Books
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-7">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search books, authors, ISBN..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">All Categories</option>
              <option value="Academic">Academic</option>
              <option value="Literature">Literature</option>
              <option value="History">History</option>
              <option value="Science">Science</option>
              <option value="Reference">Reference</option>
              <option value="Fiction">Fiction</option>
            </select>

            <select
              value={filters.subject}
              onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Computer Science">Computer Science</option>
              <option value="English">English</option>
              <option value="Islamic Studies">Islamic Studies</option>
            </select>

            <select
              value={filters.language}
              onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">All Languages</option>
              <option value="english">English</option>
              <option value="arabic">Arabic</option>
              <option value="bilingual">Bilingual</option>
            </select>

            <select
              value={filters.format}
              onChange={(e) => setFilters(prev => ({ ...prev, format: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">All Formats</option>
              <option value="physical">Physical</option>
              <option value="digital">Digital</option>
              <option value="both">Both</option>
            </select>

            <select
              value={filters.availability}
              onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">All Availability</option>
              <option value="Available">Available</option>
              <option value="Checked Out">Checked Out</option>
              <option value="Reserved">Reserved</option>
              <option value="Unavailable">Unavailable</option>
            </select>

            <Button variant="outline" onClick={() => setFilters({ category: '', subject: '', language: '', format: '', availability: '', searchTerm: '' })}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Books Display */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading library catalog...</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredBooks.map((book) => (
                  <Card key={book.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="aspect-[3/4] bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-3 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-base line-clamp-2">{book.title}</CardTitle>
                        <CardDescription className="text-sm">{book.author}</CardDescription>
                        <div className="flex items-center space-x-1">
                          {renderStars(book.rating)}
                          <span className="text-sm text-muted-foreground">({book.reviewCount})</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        <Badge className={getCategoryColor(book.category)}>
                          {book.category}
                        </Badge>
                        <Badge className={getLanguageColor(book.language)}>
                          {book.language}
                        </Badge>
                        <Badge className={getFormatColor(book.format)}>
                          {book.format}
                        </Badge>
                      </div>

                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Available:</span>
                          <span className="font-medium">{book.availableCopies}/{book.totalCopies}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge className={getStatusColor(book.status)}>
                            {getAvailabilityStatus(book)}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium text-xs">{book.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center space-x-1">
                          <Button size="sm" variant="outline" onClick={() => handleBookAction('favorite')}>
                            <Heart className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleBookAction('share')}>
                            <Share className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-1">
                          {book.availableCopies > 0 ? (
                            <Button size="sm" onClick={() => handleBookAction('checkout')} style={{ backgroundColor: '#36BA91' }}>
                              Checkout
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleBookAction('reserve')}>
                              Reserve
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBooks.map((book) => (
                  <Card key={book.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-20 h-28 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-semibold">{book.title}</h3>
                                <p className="text-muted-foreground">{book.author}</p>
                                <div className="flex items-center space-x-1 mt-1">
                                  {renderStars(book.rating)}
                                  <span className="text-sm text-muted-foreground">({book.reviewCount} reviews)</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge className={getStatusColor(book.status)}>
                                  {getAvailabilityStatus(book)}
                                </Badge>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {book.availableCopies}/{book.totalCopies} available
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge className={getCategoryColor(book.category)}>
                              {book.category}
                            </Badge>
                            <Badge className={getLanguageColor(book.language)}>
                              {book.language}
                            </Badge>
                            <Badge className={getFormatColor(book.format)}>
                              {book.format}
                            </Badge>
                            <Badge variant="outline">
                              {book.subject}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {book.description}
                          </p>

                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">ISBN:</span>
                              <p className="font-medium">{book.isbn}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Publisher:</span>
                              <p className="font-medium">{book.publisher}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Year:</span>
                              <p className="font-medium">{book.publicationYear}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Location:</span>
                              <p className="font-medium">{book.location}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="mr-1 h-3 w-3" />
                                View Details
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleBookAction('favorite')}>
                                <Heart className="mr-1 h-3 w-3" />
                                Favorite
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleBookAction('share')}>
                                <Share className="mr-1 h-3 w-3" />
                                Share
                              </Button>
                            </div>
                            <div className="flex items-center space-x-2">
                              {book.availableCopies > 0 ? (
                                <Button size="sm" onClick={() => handleBookAction('checkout')} style={{ backgroundColor: '#36BA91' }}>
                                  <BookOpen className="mr-1 h-3 w-3" />
                                  Checkout
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => handleBookAction('reserve')}>
                                  <Bookmark className="mr-1 h-3 w-3" />
                                  Reserve
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredBooks.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No books found matching your criteria</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default CatalogPage
