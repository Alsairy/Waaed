import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { Card, Button, Searchbar, FAB, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from 'react-query';

import { Colors } from '../utils/colors';
import { LibraryService } from '../services/LibraryService';
import LoadingScreen from '../components/LoadingScreen';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  status: string;
  availableCopies: number;
  totalCopies: number;
  publishedYear: number;
}

interface BookIssue {
  id: string;
  bookTitle: string;
  memberName: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: string;
  fineAmount?: number;
}

interface BookReservation {
  id: string;
  bookTitle: string;
  memberName: string;
  reservationDate: string;
  status: string;
  priority: number;
}

const LibraryScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'books' | 'issues' | 'reservations'>('books');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data: books, isLoading: booksLoading } = useQuery(
    ['books', searchQuery],
    () => LibraryService.getBooks({ search: searchQuery }),
    {
      enabled: activeTab === 'books',
    }
  );

  const { data: issues, isLoading: issuesLoading } = useQuery(
    ['book-issues'],
    () => LibraryService.getBookIssues(),
    {
      enabled: activeTab === 'issues',
    }
  );

  const { data: reservations, isLoading: reservationsLoading } = useQuery(
    ['book-reservations'],
    () => LibraryService.getBookReservations(),
    {
      enabled: activeTab === 'reservations',
    }
  );

  const reserveBookMutation = useMutation(
    (bookId: string) => LibraryService.reserveBook(bookId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['books']);
        queryClient.invalidateQueries(['book-reservations']);
        Alert.alert('Success', 'Book reserved successfully');
      },
      onError: () => {
        Alert.alert('Error', 'Failed to reserve book');
      },
    }
  );

  const returnBookMutation = useMutation(
    (issueId: string) => LibraryService.returnBook(issueId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['book-issues']);
        queryClient.invalidateQueries(['books']);
        Alert.alert('Success', 'Book returned successfully');
      },
      onError: () => {
        Alert.alert('Error', 'Failed to return book');
      },
    }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  };

  const handleBookPress = (book: Book) => {
    Alert.alert(
      book.title,
      `Author: ${book.author}\nISBN: ${book.isbn}\nCategory: ${book.category}\nPublished: ${book.publishedYear}\nAvailable: ${book.availableCopies}/${book.totalCopies}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => console.log('Navigate to book details') },
        ...(book.availableCopies > 0 ? [
          { text: 'Reserve', onPress: () => reserveBookMutation.mutate(book.id) }
        ] : []),
      ]
    );
  };

  const handleIssuePress = (issue: BookIssue) => {
    Alert.alert(
      'Book Issue',
      `Book: ${issue.bookTitle}\nMember: ${issue.memberName}\nIssued: ${new Date(issue.issueDate).toLocaleDateString()}\nDue: ${new Date(issue.dueDate).toLocaleDateString()}${issue.fineAmount ? `\nFine: $${issue.fineAmount}` : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => console.log('Navigate to issue details') },
        ...(issue.status === 'issued' ? [
          { text: 'Return', onPress: () => returnBookMutation.mutate(issue.id) }
        ] : []),
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
      case 'returned':
      case 'active':
        return Colors.success;
      case 'issued':
      case 'reserved':
      case 'pending':
        return Colors.warning;
      case 'overdue':
      case 'lost':
      case 'damaged':
        return Colors.error;
      default:
        return Colors.gray;
    }
  };

  const renderBook = ({ item }: { item: Book }) => (
    <Card style={styles.card} onPress={() => handleBookPress(item)}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.bookTitle}>{item.title}</Text>
          <Chip 
            mode="outlined" 
            textStyle={styles.chipText}
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
          >
            {item.status.toUpperCase()}
          </Chip>
        </View>
        <Text style={styles.bookAuthor}>{item.author}</Text>
        <Text style={styles.bookCategory}>{item.category}</Text>
        <View style={styles.bookMeta}>
          <View style={styles.metaItem}>
            <Icon name="book" size={16} color={Colors.gray} />
            <Text style={styles.metaText}>ISBN: {item.isbn}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="schedule" size={16} color={Colors.gray} />
            <Text style={styles.metaText}>Published: {item.publishedYear}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="inventory" size={16} color={Colors.gray} />
            <Text style={styles.metaText}>
              Available: {item.availableCopies}/{item.totalCopies}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderIssue = ({ item }: { item: BookIssue }) => (
    <Card style={styles.card} onPress={() => handleIssuePress(item)}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.issueBook}>{item.bookTitle}</Text>
          <Chip 
            mode="outlined" 
            textStyle={styles.chipText}
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
          >
            {item.status.toUpperCase()}
          </Chip>
        </View>
        <Text style={styles.issueMember}>{item.memberName}</Text>
        <View style={styles.issueDates}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Issued</Text>
            <Text style={styles.dateValue}>
              {new Date(item.issueDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Due</Text>
            <Text style={[
              styles.dateValue,
              { color: new Date(item.dueDate) < new Date() && !item.returnDate ? Colors.error : Colors.text }
            ]}>
              {new Date(item.dueDate).toLocaleDateString()}
            </Text>
          </View>
          {item.returnDate && (
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Returned</Text>
              <Text style={styles.dateValue}>
                {new Date(item.returnDate).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
        {item.fineAmount && item.fineAmount > 0 && (
          <Text style={styles.fineAmount}>Fine: ${item.fineAmount}</Text>
        )}
      </Card.Content>
    </Card>
  );

  const renderReservation = ({ item }: { item: BookReservation }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.reservationBook}>{item.bookTitle}</Text>
          <Chip 
            mode="outlined" 
            textStyle={styles.chipText}
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
          >
            {item.status.toUpperCase()}
          </Chip>
        </View>
        <Text style={styles.reservationMember}>{item.memberName}</Text>
        <View style={styles.reservationMeta}>
          <View style={styles.metaItem}>
            <Icon name="schedule" size={16} color={Colors.gray} />
            <Text style={styles.metaText}>
              Reserved: {new Date(item.reservationDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="priority-high" size={16} color={Colors.gray} />
            <Text style={styles.metaText}>Priority: {item.priority}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (booksLoading || issuesLoading || reservationsLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
        <Searchbar
          placeholder="Search books, members..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'books' && styles.activeTab]}
          onPress={() => setActiveTab('books')}
        >
          <Icon name="book" size={20} color={activeTab === 'books' ? Colors.white : Colors.gray} />
          <Text style={[styles.tabText, activeTab === 'books' && styles.activeTabText]}>
            Books
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'issues' && styles.activeTab]}
          onPress={() => setActiveTab('issues')}
        >
          <Icon name="assignment" size={20} color={activeTab === 'issues' ? Colors.white : Colors.gray} />
          <Text style={[styles.tabText, activeTab === 'issues' && styles.activeTabText]}>
            Issues
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reservations' && styles.activeTab]}
          onPress={() => setActiveTab('reservations')}
        >
          <Icon name="bookmark" size={20} color={activeTab === 'reservations' ? Colors.white : Colors.gray} />
          <Text style={[styles.tabText, activeTab === 'reservations' && styles.activeTabText]}>
            Reservations
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={
          activeTab === 'books' ? books?.data || [] :
          activeTab === 'issues' ? issues?.data || [] :
          reservations?.data || []
        }
        renderItem={
          activeTab === 'books' ? renderBook :
          activeTab === 'issues' ? renderIssue :
          renderReservation
        }
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => {
          if (activeTab === 'books') {
            console.log('Navigate to add book');
          } else if (activeTab === 'issues') {
            console.log('Navigate to issue book');
          } else {
            console.log('Navigate to reserve book');
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  searchbar: {
    backgroundColor: Colors.lightGray,
    elevation: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.white,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  bookAuthor: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  bookCategory: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 8,
  },
  bookMeta: {
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: Colors.gray,
    marginLeft: 8,
  },
  issueBook: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  issueMember: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  issueDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  fineAmount: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  reservationBook: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  reservationMember: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  reservationMeta: {
    gap: 4,
  },
  chipText: {
    fontSize: 10,
    color: Colors.white,
  },
  statusChip: {
    height: 24,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
});

export default LibraryScreen;
