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
import { LMSService } from '../services/LMSService';
import LoadingScreen from '../components/LoadingScreen';

interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  instructorName: string;
  enrollmentCount: number;
  moduleCount: number;
  assignmentCount: number;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  status: string;
  courseTitle: string;
}

const LMSScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'courses' | 'assignments' | 'grades'>('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data: courses, isLoading: coursesLoading, error: coursesError } = useQuery(
    ['courses', searchQuery],
    () => LMSService.getCourses({ search: searchQuery }),
    {
      enabled: activeTab === 'courses',
    }
  );

  const { data: assignments, isLoading: assignmentsLoading } = useQuery(
    ['assignments'],
    () => LMSService.getAssignments(),
    {
      enabled: activeTab === 'assignments',
    }
  );

  const { data: grades, isLoading: gradesLoading } = useQuery(
    ['grades'],
    () => LMSService.getGrades(),
    {
      enabled: activeTab === 'grades',
    }
  );

  const enrollMutation = useMutation(
    (courseId: string) => LMSService.enrollInCourse(courseId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['courses']);
        Alert.alert('Success', 'Successfully enrolled in course');
      },
      onError: () => {
        Alert.alert('Error', 'Failed to enroll in course');
      },
    }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  };

  const handleCoursePress = (course: Course) => {
    Alert.alert(
      course.title,
      `${course.description}\n\nInstructor: ${course.instructorName}\nModules: ${course.moduleCount}\nAssignments: ${course.assignmentCount}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => console.log('Navigate to course details') },
        { text: 'Enroll', onPress: () => enrollMutation.mutate(course.id) },
      ]
    );
  };

  const handleAssignmentPress = (assignment: Assignment) => {
    Alert.alert(
      assignment.title,
      `${assignment.description}\n\nCourse: ${assignment.courseTitle}\nDue: ${new Date(assignment.dueDate).toLocaleDateString()}\nPoints: ${assignment.points}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => console.log('Navigate to assignment details') },
        { text: 'Submit', onPress: () => console.log('Navigate to submission') },
      ]
    );
  };

  const renderCourse = ({ item }: { item: Course }) => (
    <Card style={styles.card} onPress={() => handleCoursePress(item)}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.courseTitle}>{item.title}</Text>
          <Chip mode="outlined" textStyle={styles.chipText}>
            {item.status}
          </Chip>
        </View>
        <Text style={styles.courseCode}>{item.code}</Text>
        <Text style={styles.courseDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.courseStats}>
          <View style={styles.statItem}>
            <Icon name="people" size={16} color={Colors.gray} />
            <Text style={styles.statText}>{item.enrollmentCount} students</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="book" size={16} color={Colors.gray} />
            <Text style={styles.statText}>{item.moduleCount} modules</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="assignment" size={16} color={Colors.gray} />
            <Text style={styles.statText}>{item.assignmentCount} assignments</Text>
          </View>
        </View>
        <Text style={styles.instructor}>Instructor: {item.instructorName}</Text>
      </Card.Content>
    </Card>
  );

  const renderAssignment = ({ item }: { item: Assignment }) => (
    <Card style={styles.card} onPress={() => handleAssignmentPress(item)}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.assignmentTitle}>{item.title}</Text>
          <Chip 
            mode="outlined" 
            textStyle={styles.chipText}
            style={[
              styles.statusChip,
              { backgroundColor: item.status === 'submitted' ? Colors.success : Colors.warning }
            ]}
          >
            {item.status}
          </Chip>
        </View>
        <Text style={styles.courseCode}>{item.courseTitle}</Text>
        <Text style={styles.assignmentDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.assignmentMeta}>
          <View style={styles.metaItem}>
            <Icon name="schedule" size={16} color={Colors.gray} />
            <Text style={styles.metaText}>
              Due: {new Date(item.dueDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="star" size={16} color={Colors.gray} />
            <Text style={styles.metaText}>{item.points} points</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderGrade = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.gradeTitle}>{item.assignmentTitle}</Text>
          <Text style={[styles.gradeScore, { color: item.score >= 80 ? Colors.success : item.score >= 60 ? Colors.warning : Colors.error }]}>
            {item.score}%
          </Text>
        </View>
        <Text style={styles.courseCode}>{item.courseTitle}</Text>
        <Text style={styles.gradeFeedback}>{item.feedback}</Text>
        <Text style={styles.gradeDate}>
          Graded: {new Date(item.gradedAt).toLocaleDateString()}
        </Text>
      </Card.Content>
    </Card>
  );

  if (coursesLoading || assignmentsLoading || gradesLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning Management</Text>
        <Searchbar
          placeholder="Search courses, assignments..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'courses' && styles.activeTab]}
          onPress={() => setActiveTab('courses')}
        >
          <Icon name="school" size={20} color={activeTab === 'courses' ? Colors.white : Colors.gray} />
          <Text style={[styles.tabText, activeTab === 'courses' && styles.activeTabText]}>
            Courses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'assignments' && styles.activeTab]}
          onPress={() => setActiveTab('assignments')}
        >
          <Icon name="assignment" size={20} color={activeTab === 'assignments' ? Colors.white : Colors.gray} />
          <Text style={[styles.tabText, activeTab === 'assignments' && styles.activeTabText]}>
            Assignments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'grades' && styles.activeTab]}
          onPress={() => setActiveTab('grades')}
        >
          <Icon name="grade" size={20} color={activeTab === 'grades' ? Colors.white : Colors.gray} />
          <Text style={[styles.tabText, activeTab === 'grades' && styles.activeTabText]}>
            Grades
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={
          activeTab === 'courses' ? courses?.data || [] :
          activeTab === 'assignments' ? assignments?.data || [] :
          grades?.data || []
        }
        renderItem={
          activeTab === 'courses' ? renderCourse :
          activeTab === 'assignments' ? renderAssignment :
          renderGrade
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
          if (activeTab === 'courses') {
            console.log('Navigate to course creation');
          } else if (activeTab === 'assignments') {
            console.log('Navigate to assignment creation');
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
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  gradeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  courseCode: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  courseDescription: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 12,
    lineHeight: 20,
  },
  assignmentDescription: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 8,
    lineHeight: 20,
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: Colors.gray,
    marginLeft: 4,
  },
  instructor: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  assignmentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: Colors.gray,
    marginLeft: 4,
  },
  chipText: {
    fontSize: 12,
  },
  statusChip: {
    height: 24,
  },
  gradeScore: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  gradeFeedback: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  gradeDate: {
    fontSize: 12,
    color: Colors.gray,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
});

export default LMSScreen;
