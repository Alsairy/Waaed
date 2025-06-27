export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  grade: string;
  section: string;
  status: string;
  enrollmentDate: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
  status: string;
  startDate: string;
  endDate: string;
  code: string;
  credits: number;
  category: string;
  level: string;
  language: string;
  format: string;
  maxEnrollment: number;
  currentEnrollment: number;
  isPublic: boolean;
  allowSelfEnrollment: boolean;
  requireApproval: boolean;
  syllabus: string;
  objectives: string;
  prerequisites: string;
  gradingPolicy: string;
  attendancePolicy: string;
  latePolicy: string;
  imageUrl: string;
  tags: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  moduleCount: number;
  enrollmentCount: number;
  assignmentCount: number;
  modules?: CourseModule[];
  enrollments?: CourseEnrollment[];
  assignments?: Assignment[];
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string;
  content: string;
  contentType: string;
  position: number;
  isPublished: boolean;
  availableFrom?: string;
  availableUntil?: string;
  estimatedDuration: number;
  learningObjectives: string;
  resources: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  instructions: string;
  type: string;
  points: number;
  dueDate?: string;
  availableFrom?: string;
  availableUntil?: string;
  submissionTypes: string;
  allowedFileTypes: string;
  maxFileSize: number;
  maxAttempts: number;
  gradingType: string;
  rubricId?: string;
  groupAssignment: boolean;
  peerReview: boolean;
  anonymousGrading: boolean;
  turnitinEnabled: boolean;
  lockAfterDue: boolean;
  showGradeAfterSubmission: boolean;
  allowLateSubmissions: boolean;
  latePenalty: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  submissionCount: number;
  gradedCount: number;
  submissions?: Submission[];
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  content: string;
  attachmentUrls: string;
  submittedAt: string;
  status: string;
  attempt: number;
  grade?: number;
  feedback: string;
  gradedAt?: string;
  gradedBy: string;
  isLate: boolean;
  turnitinScore?: number;
  turnitinReportUrl: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  instructions: string;
  type: string;
  points: number;
  timeLimit?: number;
  allowedAttempts: number;
  scoringPolicy: string;
  availableFrom?: string;
  availableUntil?: string;
  dueDate?: string;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showCorrectAnswers: boolean;
  showCorrectAnswersAt?: string;
  oneQuestionAtATime: boolean;
  cantGoBack: boolean;
  accessCode: string;
  requireLockdownBrowser: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  questionCount: number;
  attemptCount: number;
  questions?: Question[];
  attempts?: QuizAttempt[];
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  type: string;
  points: number;
  position: number;
  correctAnswer: string;
  answerChoices: string;
  explanation: string;
  imageUrl: string;
  videoUrl: string;
  createdAt: string;
}

export interface Discussion {
  id: string;
  courseId: string;
  title: string;
  description: string;
  type: string;
  isGraded: boolean;
  points?: number;
  dueDate?: string;
  availableFrom?: string;
  availableUntil?: string;
  requireInitialPost: boolean;
  allowRating: boolean;
  sortByRating: boolean;
  onlyGradersCanRate: boolean;
  isAnnouncement: boolean;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  postCount: number;
  participantCount: number;
  posts?: DiscussionPost[];
}

export interface DiscussionPost {
  id: string;
  discussionId: string;
  parentPostId?: string;
  authorId: string;
  authorName: string;
  content: string;
  attachmentUrls: string;
  rating: number;
  ratingCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  replyCount: number;
  replies?: DiscussionPost[];
}

export interface Rubric {
  id: string;
  title: string;
  description: string;
  type: string;
  isPublic: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  criteria: RubricCriterion[];
}

export interface RubricCriterion {
  id: string;
  rubricId: string;
  description: string;
  points: number;
  position: number;
  learningOutcomeId?: string;
  createdAt: string;
  levels: RubricLevel[];
}

export interface RubricLevel {
  id: string;
  rubricCriterionId: string;
  description: string;
  points: number;
  position: number;
}

export interface LearningOutcome {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  status: string;
  enrolledAt: string;
  completedAt?: string;
  sectionId: string;
  canViewGrades: boolean;
  canSubmitAssignments: boolean;
  canParticipateDiscussions: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  attempt: number;
  startedAt: string;
  submittedAt?: string;
  score?: number;
  status: string;
  timeSpent: number;
  responses: QuestionResponse[];
}

export interface QuestionResponse {
  id: string;
  quizAttemptId: string;
  questionId: string;
  response: string;
  isCorrect: boolean;
  points: number;
  timeSpent: number;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  status: string;
  hireDate: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  subject: string;
  duration: number;
  status: string;
  scheduledDate: string;
}

export interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  category: string;
  timestamp: string;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: Widget[];
  createdAt: string;
}

export interface Widget {
  id: string;
  type: string;
  title: string;
  data: any;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: string;
  steps: WorkflowStep[];
  createdAt: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  status: string;
  order: number;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: string;
  plan: string;
  createdAt: string;
}
