/**
 * Waaed Platform Translations
 * 
 * This file contains bilingual translations for the Waaed educational platform,
 * supporting both English (LTR) and Arabic (RTL) languages.
 */

export interface TranslationKeys {
  common: {
    loading: string
    error: string
    success: string
    cancel: string
    save: string
    edit: string
    delete: string
    view: string
    search: string
    filter: string
    clear: string
    submit: string
    back: string
    next: string
    previous: string
    close: string
    open: string
    select: string
    selectAll: string
    none: string
    all: string
    yes: string
    no: string
    ok: string
    confirm: string
    dashboard: string
    profile: string
    settings: string
    logout: string
    login: string
    register: string
    welcome: string
    home: string
    menu: string
    notifications: string
    help: string
    support: string
    about: string
    contact: string
    privacy: string
    terms: string
    language: string
    theme: string
    darkMode: string
    lightMode: string
    questions: string
  }

  navigation: {
    dashboard: string
    attendance: string
    students: string
    courses: string
    assignments: string
    grades: string
    reports: string
    calendar: string
    library: string
    finance: string
    settings: string
    profile: string
    logout: string
    enrollment: string
    gradebook: string
    progressReports: string
    fees: string
    payments: string
    financialReports: string
    libraryCatalog: string
    bookCheckout: string
    reservations: string
    quizzes: string
    discussions: string
    chat: string
    advancedAnalytics: string
    eventManagement: string
  }

  education: {
    student: string
    students: string
    teacher: string
    teachers: string
    parent: string
    parents: string
    admin: string
    administrator: string
    class: string
    classes: string
    grade: string
    grades: string
    gpa: string
    transcript: string
    enrollment: string
    enroll: string
    enrolled: string
    unenroll: string
    academic: string
    academicYear: string
    semester: string
    term: string
    classSchedule: string
    timetable: string

    course: string
    courses: string
    lesson: string
    lessons: string
    assignment: string
    assignments: string
    homework: string
    quiz: string
    quizzes: string
    exam: string
    exams: string
    test: string
    tests: string
    
    // Quiz specific translations
    quizType: string
    quizTypes: string
    createQuiz: string
    editQuiz: string
    takeQuiz: string
    startQuiz: string
    continueQuiz: string
    retakeQuiz: string
    submitQuiz: string
    viewResults: string
    quizResults: string
    quizStatistics: string
    quizAttempts: string
    bestScore: string
    averageScore: string
    timeLimit: string
    timeRemaining: string
    questionsAnswered: string
    totalQuestions: string
    correctAnswers: string
    incorrectAnswers: string
    skippedQuestions: string
    quizCompleted: string
    quizSubmitted: string
    quizInProgress: string
    quizNotStarted: string
    multipleChoice: string
    multipleSelect: string
    trueFalse: string
    shortAnswer: string
    essay: string
    fillInTheBlank: string
    correct: string
    incorrect: string
    enterAnswer: string
    enterEssayAnswer: string
    sampleAnswer: string
    explanation: string
    unsupportedQuestionType: string
    question: string
    of: string
    point: string
    quizPoints: string
    true: string
    false: string
    correctAnswer: string
    searchQuizzes: string
    allTypes: string
    noQuizzesFound: string
    noQuizzesYet: string
    tryDifferentSearch: string
    createFirstQuiz: string
    checkBackLater: string
    errorLoading: string
    answered: string
    notAnswered: string
    unanswered: string
    flagged: string
    flag: string
    confirmSubmit: string
    submitting: string
    project: string
    projects: string
    submission: string
    submissions: string
    deadline: string
    dueDate: string
    submitted: string
    pending: string
    graded: string
    assignmentOverdue: string
    completed: string
    inProgress: string
    notStarted: string
    draft: string
    published: string
    archived: string

    gradebook: string
    grading: string
    assessment: string
    assessments: string
    rubric: string
    rubrics: string
    feedback: string
    comments: string
    score: string
    points: string
    percentage: string
    passingGrade: string
    failingGrade: string
    honor: string
    distinction: string
    excellence: string
    satisfactory: string
    needsImprovement: string
    unsatisfactory: string

    library: string
    book: string
    books: string
    catalog: string
    search: string
    checkout: string
    checkin: string
    return: string
    renew: string
    reserve: string
    reservation: string
    reservations: string
    available: string
    unavailable: string
    borrowed: string
    returned: string
    lost: string
    damaged: string
    fine: string
    fines: string
    author: string
    title: string
    isbn: string
    publisher: string
    publication: string
    category: string
    subject: string
    genre: string
    format: string
    digital: string
    physical: string
    ebook: string
    audiobook: string

    finance: string
    fee: string
    fees: string
    tuition: string
    payment: string
    payments: string
    invoice: string
    invoices: string
    receipt: string
    receipts: string
    balance: string
    outstanding: string
    paid: string
    unpaid: string
    paymentOverdue: string
    discount: string
    scholarship: string
    financial: string
    financialAid: string
    billing: string
    transaction: string
    transactions: string
    refund: string
    installment: string
    installments: string

    calendar: string
    event: string
    events: string
    eventSchedule: string
    appointment: string
    appointments: string
    meeting: string
    meetings: string
    holiday: string
    holidays: string
    vacation: string
    break: string
    examPeriod: string
    registrationPeriod: string
    orientation: string
    graduation: string
    ceremony: string
    conference: string
    workshop: string
    seminar: string
    lecture: string
    presentation: string

    progress: string
    report: string
    reports: string
    analytics: string
    statistics: string
    performance: string
    achievement: string
    achievements: string
    milestone: string
    milestones: string
    goal: string
    goals: string
    objective: string
    objectives: string
    outcome: string
    outcomes: string
    competency: string
    competencies: string
    skill: string
    skills: string
    knowledge: string
    understanding: string
    mastery: string
    proficiency: string
    improvement: string
    growth: string
    development: string
    learning: string
    education: string
    curriculum: string
    syllabus: string
    standard: string
    standards: string
    benchmark: string
    benchmarks: string,

    chat: string,
    message: string,
    messages: string,
    send: string,
    typing: string,
    online: string,
    offline: string,
    away: string,
    channel: string,
    channels: string,
    directMessage: string,
    groupChat: string,
    chatRoom: string,
    chatRooms: string,
    participants: string,
    joinChat: string,
    leaveChat: string,
    muteChat: string,
    unmuteChat: string,
    chatHistory: string,
    newMessage: string,
    unreadMessages: string,
    messageRead: string,
    messageDelivered: string,
    messageSent: string,
    attachFile: string,
    emoji: string,
    reaction: string,
    reactions: string,
    reply: string,
    forward: string,
    edit: string,
    
    discussion: string,
    discussions: string,
    forum: string,
    forums: string,
    topic: string,
    topics: string,
    post: string,
    posts: string,
    thread: string,
    threads: string,
    replies: string,
    newTopic: string,
    newPost: string,
    latestPost: string,
    lastReply: string,
    viewCount: string,
    replyCount: string,
    postCount: string,
    moderator: string,
    pinned: string,
    locked: string,
    sticky: string,
    featured: string,
    solved: string,
    unsolved: string,
    upvote: string,
    downvote: string,
    vote: string,
    votes: string,
    like: string,
    likes: string,
    dislike: string,
    share: string,
    subscribe: string,
    unsubscribe: string,
    follow: string,
    unfollow: string,
    
    advancedAnalytics: string,
    kpi: string,
    kpis: string,
    metrics: string,
    insights: string,
    trends: string,
    forecast: string,
    prediction: string,
    predictive: string,
    dataVisualization: string,
    chart: string,
    charts: string,
    graph: string,
    graphs: string,
    dateRange: string,
    timeframe: string,
    comparison: string,
    target: string,
    actual: string,
    variance: string,
    decline: string,
    increase: string,
    decrease: string,
    ratio: string,
    median: string,
    count: string,
    sum: string,
    minimum: string,
    maximum: string,
    range: string,
    distribution: string,
    correlation: string,
    regression: string,
    anomaly: string,
    outlier: string,
    pattern: string,
    seasonality: string,
    volatility: string,
    stability: string
  }

  status: {
    active: string
    inactive: string
    pending: string
    approved: string
    rejected: string
    completed: string
    inProgress: string
    cancelled: string
    expired: string
    draft: string
    published: string
    archived: string
    suspended: string
    enrolled: string
    graduated: string
    transferred: string
    withdrawn: string
  }

  time: {
    today: string
    yesterday: string
    tomorrow: string
    thisWeek: string
    lastWeek: string
    nextWeek: string
    thisMonth: string
    lastMonth: string
    nextMonth: string
    thisYear: string
    lastYear: string
    nextYear: string
    morning: string
    afternoon: string
    evening: string
    night: string
    am: string
    pm: string
    hour: string
    hours: string
    minute: string
    minutes: string
    second: string
    seconds: string
    day: string
    days: string
    week: string
    weeks: string
    month: string
    months: string
    year: string
    years: string
    date: string
    time: string
    datetime: string
    duration: string
    period: string
    deadline: string
    schedule: string
  }

  errors: {
    general: string
    network: string
    server: string
    notFound: string
    unauthorized: string
    forbidden: string
    validation: string
    required: string
    invalid: string
    tooShort: string
    tooLong: string
    emailInvalid: string
    passwordWeak: string
    passwordMismatch: string
    fileTooBig: string
    fileTypeInvalid: string
    uploadFailed: string
    saveFailed: string
    loadFailed: string
    deleteFailed: string
    updateFailed: string
    createFailed: string
    connectionLost: string
    timeout: string
    maintenance: string
  }

  success: {
    saved: string
    updated: string
    created: string
    deleted: string
    uploaded: string
    submitted: string
    sent: string
    completed: string
    approved: string
    enrolled: string
    unenrolled: string
    graded: string
    published: string
    archived: string
    restored: string
    imported: string
    exported: string
    synchronized: string
    backup: string
    restore: string
  }
}

export const enTranslations: TranslationKeys = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    submit: 'Submit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    open: 'Open',
    select: 'Select',
    selectAll: 'Select All',
    none: 'None',
    all: 'All',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    confirm: 'Confirm',
    dashboard: 'Dashboard',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    welcome: 'Welcome',
    home: 'Home',
    menu: 'Menu',
    notifications: 'Notifications',
    help: 'Help',
    support: 'Support',
    about: 'About',
    contact: 'Contact',
    privacy: 'Privacy',
    terms: 'Terms',
    language: 'Language',
    theme: 'Theme',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    questions: 'Questions'
  },

  navigation: {
    dashboard: 'Dashboard',
    attendance: 'Attendance',
    students: 'Students',
    courses: 'Courses',
    assignments: 'Assignments',
    grades: 'Grades',
    reports: 'Reports',
    calendar: 'Calendar',
    library: 'Library',
    finance: 'Finance',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Logout',
    enrollment: 'Enrollment',
    gradebook: 'Grade Book',
    progressReports: 'Progress Reports',
    fees: 'Fees',
    payments: 'Payments',
    financialReports: 'Financial Reports',
    libraryCatalog: 'Library Catalog',
    bookCheckout: 'Book Checkout',
    reservations: 'Reservations',
    quizzes: 'Quizzes',
    discussions: 'Discussions',
    chat: 'Chat',
    advancedAnalytics: 'Advanced Analytics',
    eventManagement: 'Event Management'
  },

  education: {
    student: 'Student',
    students: 'Students',
    teacher: 'Teacher',
    teachers: 'Teachers',
    parent: 'Parent',
    parents: 'Parents',
    admin: 'Admin',
    administrator: 'Administrator',
    class: 'Class',
    classes: 'Classes',
    grade: 'Grade',
    grades: 'Grades',
    gpa: 'GPA',
    transcript: 'Transcript',
    enrollment: 'Enrollment',
    enroll: 'Enroll',
    enrolled: 'Enrolled',
    unenroll: 'Unenroll',
    academic: 'Academic',
    academicYear: 'Academic Year',
    semester: 'Semester',
    term: 'Term',
    classSchedule: 'Schedule',
    timetable: 'Timetable',

    course: 'Course',
    courses: 'Courses',
    lesson: 'Lesson',
    lessons: 'Lessons',
    assignment: 'Assignment',
    assignments: 'Assignments',
    homework: 'Homework',
    quiz: 'Quiz',
    quizzes: 'Quizzes',
    exam: 'Exam',
    exams: 'Exams',
    test: 'Test',
    tests: 'Tests',
    
    // Quiz specific translations
    quizType: 'Quiz Type',
    quizTypes: 'Quiz Types',
    createQuiz: 'Create Quiz',
    editQuiz: 'Edit Quiz',
    takeQuiz: 'Take Quiz',
    startQuiz: 'Start Quiz',
    continueQuiz: 'Continue Quiz',
    retakeQuiz: 'Retake Quiz',
    submitQuiz: 'Submit Quiz',
    viewResults: 'View Results',
    quizResults: 'Quiz Results',
    quizStatistics: 'Quiz Statistics',
    quizAttempts: 'Quiz Attempts',
    bestScore: 'Best Score',
    averageScore: 'Average Score',
    timeLimit: 'Time Limit',
    timeRemaining: 'Time Remaining',
    questionsAnswered: 'Questions Answered',
    totalQuestions: 'Total Questions',
    correctAnswers: 'Correct Answers',
    incorrectAnswers: 'Incorrect Answers',
    skippedQuestions: 'Skipped Questions',
    quizCompleted: 'Quiz Completed',
    quizSubmitted: 'Quiz Submitted',
    quizInProgress: 'Quiz In Progress',
    quizNotStarted: 'Quiz Not Started',
    multipleChoice: 'Multiple Choice',
    multipleSelect: 'Multiple Select',
    trueFalse: 'True/False',
    shortAnswer: 'Short Answer',
    essay: 'Essay',
    fillInTheBlank: 'Fill in the Blank',
    correct: 'Correct',
    incorrect: 'Incorrect',
    enterAnswer: 'Enter your answer',
    enterEssayAnswer: 'Enter your essay answer',
    sampleAnswer: 'Sample Answer',
    explanation: 'Explanation',
    unsupportedQuestionType: 'Unsupported question type',
    question: 'Question',
    of: 'of',
    point: 'point',
    quizPoints: 'points',
    true: 'True',
    false: 'False',
    correctAnswer: 'Correct Answer',
    searchQuizzes: 'Search quizzes',
    allTypes: 'All Types',
    noQuizzesFound: 'No quizzes found',
    noQuizzesYet: 'No quizzes yet',
    tryDifferentSearch: 'Try a different search',
    createFirstQuiz: 'Create your first quiz',
    checkBackLater: 'Check back later',
    errorLoading: 'Error loading',
    answered: 'Answered',
    notAnswered: 'Not Answered',
    unanswered: 'Unanswered',
    flagged: 'Flagged',
    flag: 'Flag',
    confirmSubmit: 'Confirm Submit',
    submitting: 'Submitting',
    project: 'Project',
    projects: 'Projects',
    submission: 'Submission',
    submissions: 'Submissions',
    deadline: 'Deadline',
    dueDate: 'Due Date',
    submitted: 'Submitted',
    pending: 'Pending',
    graded: 'Graded',
    assignmentOverdue: 'Overdue',
    completed: 'Completed',
    inProgress: 'In Progress',
    notStarted: 'Not Started',
    draft: 'Draft',
    published: 'Published',
    archived: 'Archived',

    gradebook: 'Grade Book',
    grading: 'Grading',
    assessment: 'Assessment',
    assessments: 'Assessments',
    rubric: 'Rubric',
    rubrics: 'Rubrics',
    feedback: 'Feedback',
    comments: 'Comments',
    score: 'Score',
    points: 'Points',
    percentage: 'Percentage',
    passingGrade: 'Passing Grade',
    failingGrade: 'Failing Grade',
    honor: 'Honor',
    distinction: 'Distinction',
    excellence: 'Excellence',
    satisfactory: 'Satisfactory',
    needsImprovement: 'Needs Improvement',
    unsatisfactory: 'Unsatisfactory',

    library: 'Library',
    book: 'Book',
    books: 'Books',
    catalog: 'Catalog',
    search: 'Search',
    checkout: 'Checkout',
    checkin: 'Check In',
    return: 'Return',
    renew: 'Renew',
    reserve: 'Reserve',
    reservation: 'Reservation',
    reservations: 'Reservations',
    available: 'Available',
    unavailable: 'Unavailable',
    borrowed: 'Borrowed',
    returned: 'Returned',
    lost: 'Lost',
    damaged: 'Damaged',
    fine: 'Fine',
    fines: 'Fines',
    author: 'Author',
    title: 'Title',
    isbn: 'ISBN',
    publisher: 'Publisher',
    publication: 'Publication',
    category: 'Category',
    subject: 'Subject',
    genre: 'Genre',
    format: 'Format',
    digital: 'Digital',
    physical: 'Physical',
    ebook: 'E-book',
    audiobook: 'Audiobook',

    finance: 'Finance',
    fee: 'Fee',
    fees: 'Fees',
    tuition: 'Tuition',
    payment: 'Payment',
    payments: 'Payments',
    invoice: 'Invoice',
    invoices: 'Invoices',
    receipt: 'Receipt',
    receipts: 'Receipts',
    balance: 'Balance',
    outstanding: 'Outstanding',
    paid: 'Paid',
    unpaid: 'Unpaid',
    paymentOverdue: 'Overdue',
    discount: 'Discount',
    scholarship: 'Scholarship',
    financial: 'Financial',
    financialAid: 'Financial Aid',
    billing: 'Billing',
    transaction: 'Transaction',
    transactions: 'Transactions',
    refund: 'Refund',
    installment: 'Installment',
    installments: 'Installments',

    calendar: 'Calendar',
    event: 'Event',
    events: 'Events',
    eventSchedule: 'Schedule',
    appointment: 'Appointment',
    appointments: 'Appointments',
    meeting: 'Meeting',
    meetings: 'Meetings',
    holiday: 'Holiday',
    holidays: 'Holidays',
    vacation: 'Vacation',
    break: 'Break',
    examPeriod: 'Exam Period',
    registrationPeriod: 'Registration Period',
    orientation: 'Orientation',
    graduation: 'Graduation',
    ceremony: 'Ceremony',
    conference: 'Conference',
    workshop: 'Workshop',
    seminar: 'Seminar',
    lecture: 'Lecture',
    presentation: 'Presentation',

    progress: 'Progress',
    report: 'Report',
    reports: 'Reports',
    analytics: 'Analytics',
    statistics: 'Statistics',
    performance: 'Performance',
    achievement: 'Achievement',
    achievements: 'Achievements',
    milestone: 'Milestone',
    milestones: 'Milestones',
    goal: 'Goal',
    goals: 'Goals',
    objective: 'Objective',
    objectives: 'Objectives',
    outcome: 'Outcome',
    outcomes: 'Outcomes',
    competency: 'Competency',
    competencies: 'Competencies',
    skill: 'Skill',
    skills: 'Skills',
    knowledge: 'Knowledge',
    understanding: 'Understanding',
    mastery: 'Mastery',
    proficiency: 'Proficiency',
    improvement: 'Improvement',
    growth: 'Growth',
    development: 'Development',
    learning: 'Learning',
    education: 'Education',
    curriculum: 'Curriculum',
    syllabus: 'Syllabus',
    standard: 'Standard',
    standards: 'Standards',
    benchmark: 'Benchmark',
    benchmarks: 'Benchmarks',

    chat: 'المحادثة',
    message: 'رسالة',
    messages: 'الرسائل',
    send: 'إرسال',
    typing: 'يكتب',
    online: 'متصل',
    offline: 'غير متصل',
    away: 'غائب',
    channel: 'قناة',
    channels: 'القنوات',
    directMessage: 'رسالة مباشرة',
    groupChat: 'محادثة جماعية',
    chatRoom: 'غرفة المحادثة',
    chatRooms: 'غرف المحادثة',
    participants: 'المشاركون',
    joinChat: 'انضمام للمحادثة',
    leaveChat: 'مغادرة المحادثة',
    muteChat: 'كتم المحادثة',
    unmuteChat: 'إلغاء كتم المحادثة',
    chatHistory: 'تاريخ المحادثة',
    newMessage: 'رسالة جديدة',
    unreadMessages: 'رسائل غير مقروءة',
    messageRead: 'رسالة مقروءة',
    messageDelivered: 'رسالة مُسلمة',
    messageSent: 'رسالة مُرسلة',
    attachFile: 'إرفاق ملف',
    emoji: 'رموز تعبيرية',
    reaction: 'تفاعل',
    reactions: 'التفاعلات',
    reply: 'رد',
    forward: 'إعادة توجيه',
    edit: 'تعديل',
    
    discussion: 'مناقشة',
    discussions: 'المناقشات',
    forum: 'منتدى',
    forums: 'المنتديات',
    topic: 'موضوع',
    topics: 'المواضيع',
    post: 'منشور',
    posts: 'المنشورات',
    thread: 'موضوع',
    threads: 'المواضيع',
    replies: 'الردود',
    newTopic: 'موضوع جديد',
    newPost: 'منشور جديد',
    latestPost: 'آخر منشور',
    lastReply: 'آخر رد',
    viewCount: 'المشاهدات',
    replyCount: 'الردود',
    postCount: 'المنشورات',
    moderator: 'مشرف',
    pinned: 'مثبت',
    locked: 'مقفل',
    sticky: 'لاصق',
    featured: 'مميز',
    solved: 'محلول',
    unsolved: 'غير محلول',
    upvote: 'تصويت إيجابي',
    downvote: 'تصويت سلبي',
    vote: 'تصويت',
    votes: 'الأصوات',
    like: 'إعجاب',
    likes: 'الإعجابات',
    dislike: 'عدم إعجاب',
    share: 'مشاركة',
    subscribe: 'اشتراك',
    unsubscribe: 'إلغاء الاشتراك',
    follow: 'متابعة',
    unfollow: 'إلغاء المتابعة',
    
    advancedAnalytics: 'التحليلات المتقدمة',
    kpi: 'مؤشر أداء رئيسي',
    kpis: 'مؤشرات الأداء الرئيسية',
    metrics: 'المقاييس',
    insights: 'الرؤى',
    trends: 'الاتجاهات',
    forecast: 'التنبؤ',
    prediction: 'التوقع',
    predictive: 'تنبؤي',
    dataVisualization: 'تصور البيانات',
    chart: 'مخطط',
    charts: 'المخططات',
    graph: 'رسم بياني',
    graphs: 'الرسوم البيانية',
    dateRange: 'نطاق التاريخ',
    timeframe: 'الإطار الزمني',
    comparison: 'مقارنة',
    target: 'الهدف',
    actual: 'الفعلي',
    variance: 'التباين',
    decline: 'انخفاض',
    increase: 'زيادة',
    decrease: 'نقصان',
    ratio: 'النسبة',
    median: 'الوسيط',
    count: 'العدد',
    sum: 'المجموع',
    minimum: 'الحد الأدنى',
    maximum: 'الحد الأقصى',
    range: 'النطاق',
    distribution: 'التوزيع',
    correlation: 'الارتباط',
    regression: 'الانحدار',
    anomaly: 'شذوذ',
    outlier: 'قيمة شاذة',
    pattern: 'نمط',
    seasonality: 'الموسمية',
    volatility: 'التقلب',
    stability: 'الاستقرار'
  },

  status: {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    inProgress: 'In Progress',
    cancelled: 'Cancelled',
    expired: 'Expired',
    draft: 'Draft',
    published: 'Published',
    archived: 'Archived',
    suspended: 'Suspended',
    enrolled: 'Enrolled',
    graduated: 'Graduated',
    transferred: 'Transferred',
    withdrawn: 'Withdrawn'
  },

  time: {
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    lastWeek: 'Last Week',
    nextWeek: 'Next Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    nextMonth: 'Next Month',
    thisYear: 'This Year',
    lastYear: 'Last Year',
    nextYear: 'Next Year',
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night',
    am: 'AM',
    pm: 'PM',
    hour: 'Hour',
    hours: 'Hours',
    minute: 'Minute',
    minutes: 'Minutes',
    second: 'Second',
    seconds: 'Seconds',
    day: 'Day',
    days: 'Days',
    week: 'Week',
    weeks: 'Weeks',
    month: 'Month',
    months: 'Months',
    year: 'Year',
    years: 'Years',
    date: 'Date',
    time: 'Time',
    datetime: 'Date & Time',
    duration: 'Duration',
    period: 'Period',
    deadline: 'Deadline',
    schedule: 'Schedule'
  },

  errors: {
    general: 'An error occurred. Please try again.',
    network: 'Network error. Please check your connection.',
    server: 'Server error. Please try again later.',
    notFound: 'The requested resource was not found.',
    unauthorized: 'You are not authorized to access this resource.',
    forbidden: 'Access to this resource is forbidden.',
    validation: 'Please check your input and try again.',
    required: 'This field is required.',
    invalid: 'Invalid input.',
    tooShort: 'Input is too short.',
    tooLong: 'Input is too long.',
    emailInvalid: 'Please enter a valid email address.',
    passwordWeak: 'Password is too weak.',
    passwordMismatch: 'Passwords do not match.',
    fileTooBig: 'File size is too large.',
    fileTypeInvalid: 'Invalid file type.',
    uploadFailed: 'File upload failed.',
    saveFailed: 'Failed to save changes.',
    loadFailed: 'Failed to load data.',
    deleteFailed: 'Failed to delete item.',
    updateFailed: 'Failed to update item.',
    createFailed: 'Failed to create item.',
    connectionLost: 'Connection lost. Please try again.',
    timeout: 'Request timed out. Please try again.',
    maintenance: 'System is under maintenance. Please try again later.'
  },

  success: {
    saved: 'Changes saved successfully.',
    updated: 'Item updated successfully.',
    created: 'Item created successfully.',
    deleted: 'Item deleted successfully.',
    uploaded: 'File uploaded successfully.',
    submitted: 'Submitted successfully.',
    sent: 'Sent successfully.',
    completed: 'Completed successfully.',
    approved: 'Approved successfully.',
    enrolled: 'Enrolled successfully.',
    unenrolled: 'Unenrolled successfully.',
    graded: 'Graded successfully.',
    published: 'Published successfully.',
    archived: 'Archived successfully.',
    restored: 'Restored successfully.',
    imported: 'Imported successfully.',
    exported: 'Exported successfully.',
    synchronized: 'Synchronized successfully.',
    backup: 'Backup completed successfully.',
    restore: 'Restore completed successfully.'
  }
}

export const arTranslations: TranslationKeys = {
  common: {
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    cancel: 'إلغاء',
    save: 'حفظ',
    edit: 'تعديل',
    delete: 'حذف',
    view: 'عرض',
    search: 'بحث',
    filter: 'تصفية',
    clear: 'مسح',
    submit: 'إرسال',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    close: 'إغلاق',
    open: 'فتح',
    select: 'اختيار',
    selectAll: 'اختيار الكل',
    none: 'لا شيء',
    all: 'الكل',
    yes: 'نعم',
    no: 'لا',
    ok: 'موافق',
    confirm: 'تأكيد',
    dashboard: 'لوحة التحكم',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    login: 'تسجيل الدخول',
    register: 'التسجيل',
    welcome: 'مرحباً',
    home: 'الرئيسية',
    menu: 'القائمة',
    notifications: 'الإشعارات',
    help: 'المساعدة',
    support: 'الدعم',
    about: 'حول',
    contact: 'اتصل بنا',
    privacy: 'الخصوصية',
    terms: 'الشروط',
    language: 'اللغة',
    theme: 'المظهر',
    darkMode: 'الوضع المظلم',
    lightMode: 'الوضع الفاتح',
    questions: 'الأسئلة'
  },

  navigation: {
    dashboard: 'لوحة التحكم',
    attendance: 'الحضور',
    students: 'الطلاب',
    courses: 'المقررات',
    assignments: 'الواجبات',
    grades: 'الدرجات',
    reports: 'التقارير',
    calendar: 'التقويم',
    library: 'المكتبة',
    finance: 'المالية',
    settings: 'الإعدادات',
    profile: 'الملف الشخصي',
    logout: 'تسجيل الخروج',
    enrollment: 'التسجيل',
    gradebook: 'سجل الدرجات',
    progressReports: 'تقارير التقدم',
    fees: 'الرسوم',
    payments: 'المدفوعات',
    financialReports: 'التقارير المالية',
    libraryCatalog: 'فهرس المكتبة',
    bookCheckout: 'استعارة الكتب',
    reservations: 'الحجوزات',
    quizzes: 'الاختبارات القصيرة',
    discussions: 'المناقشات',
    chat: 'المحادثة',
    advancedAnalytics: 'التحليلات المتقدمة',
    eventManagement: 'إدارة الأحداث'
  },

  education: {
    student: 'طالب',
    students: 'الطلاب',
    teacher: 'معلم',
    teachers: 'المعلمون',
    parent: 'ولي أمر',
    parents: 'أولياء الأمور',
    admin: 'مدير',
    administrator: 'المدير',
    class: 'فصل',
    classes: 'الفصول',
    grade: 'درجة',
    grades: 'الدرجات',
    gpa: 'المعدل التراكمي',
    transcript: 'كشف الدرجات',
    enrollment: 'التسجيل',
    enroll: 'تسجيل',
    enrolled: 'مسجل',
    unenroll: 'إلغاء التسجيل',
    academic: 'أكاديمي',
    academicYear: 'العام الدراسي',
    semester: 'الفصل الدراسي',
    term: 'المدة',
    classSchedule: 'الجدول',
    timetable: 'جدول الحصص',

    course: 'مقرر',
    courses: 'المقررات',
    lesson: 'درس',
    lessons: 'الدروس',
    assignment: 'واجب',
    assignments: 'الواجبات',
    homework: 'الواجب المنزلي',
    quiz: 'اختبار قصير',
    quizzes: 'الاختبارات القصيرة',
    exam: 'امتحان',
    exams: 'الامتحانات',
    test: 'اختبار',
    tests: 'الاختبارات',
    
    // Quiz specific translations
    quizType: 'نوع الاختبار',
    quizTypes: 'أنواع الاختبارات',
    createQuiz: 'إنشاء اختبار',
    editQuiz: 'تعديل الاختبار',
    takeQuiz: 'أداء الاختبار',
    startQuiz: 'بدء الاختبار',
    continueQuiz: 'متابعة الاختبار',
    retakeQuiz: 'إعادة الاختبار',
    submitQuiz: 'تسليم الاختبار',
    viewResults: 'عرض النتائج',
    quizResults: 'نتائج الاختبار',
    quizStatistics: 'إحصائيات الاختبار',
    quizAttempts: 'محاولات الاختبار',
    bestScore: 'أفضل نتيجة',
    averageScore: 'المتوسط',
    timeLimit: 'الحد الزمني',
    timeRemaining: 'الوقت المتبقي',
    questionsAnswered: 'الأسئلة المجابة',
    totalQuestions: 'إجمالي الأسئلة',
    correctAnswers: 'الإجابات الصحيحة',
    incorrectAnswers: 'الإجابات الخاطئة',
    skippedQuestions: 'الأسئلة المتجاهلة',
    quizCompleted: 'اكتمل الاختبار',
    quizSubmitted: 'تم تسليم الاختبار',
    quizInProgress: 'الاختبار قيد التقدم',
    quizNotStarted: 'لم يبدأ الاختبار',
    multipleChoice: 'اختيار متعدد',
    multipleSelect: 'اختيار متعدد',
    trueFalse: 'صحيح/خطأ',
    shortAnswer: 'إجابة قصيرة',
    essay: 'مقال',
    fillInTheBlank: 'املأ الفراغ',
    correct: 'صحيح',
    incorrect: 'خطأ',
    enterAnswer: 'أدخل إجابتك',
    enterEssayAnswer: 'أدخل إجابة المقال',
    sampleAnswer: 'إجابة نموذجية',
    explanation: 'التفسير',
    unsupportedQuestionType: 'نوع سؤال غير مدعوم',
    question: 'سؤال',
    of: 'من',
    point: 'نقطة',
    quizPoints: 'نقاط',
    true: 'صحيح',
    false: 'خطأ',
    correctAnswer: 'الإجابة الصحيحة',
    searchQuizzes: 'البحث في الاختبارات',
    allTypes: 'جميع الأنواع',
    noQuizzesFound: 'لم يتم العثور على اختبارات',
    noQuizzesYet: 'لا توجد اختبارات بعد',
    tryDifferentSearch: 'جرب بحثاً مختلفاً',
    createFirstQuiz: 'أنشئ اختبارك الأول',
    checkBackLater: 'تحقق لاحقاً',
    errorLoading: 'خطأ في التحميل',
    answered: 'مجاب',
    notAnswered: 'غير مجاب',
    unanswered: 'غير مجاب',
    flagged: 'مُعلم',
    flag: 'علم',
    confirmSubmit: 'تأكيد التسليم',
    submitting: 'جاري التسليم',
    project: 'مشروع',
    projects: 'المشاريع',
    submission: 'تسليم',
    submissions: 'التسليمات',
    deadline: 'الموعد النهائي',
    dueDate: 'تاريخ الاستحقاق',
    submitted: 'مُسلم',
    pending: 'معلق',
    graded: 'مُقيم',
    assignmentOverdue: 'متأخر',
    completed: 'مكتمل',
    inProgress: 'قيد التنفيذ',
    notStarted: 'لم يبدأ',
    draft: 'مسودة',
    published: 'منشور',
    archived: 'مؤرشف',

    gradebook: 'سجل الدرجات',
    grading: 'التقييم',
    assessment: 'تقييم',
    assessments: 'التقييمات',
    rubric: 'معيار التقييم',
    rubrics: 'معايير التقييم',
    feedback: 'التغذية الراجعة',
    comments: 'التعليقات',
    score: 'النتيجة',
    points: 'النقاط',
    percentage: 'النسبة المئوية',
    passingGrade: 'درجة النجاح',
    failingGrade: 'درجة الرسوب',
    honor: 'شرف',
    distinction: 'امتياز',
    excellence: 'تفوق',
    satisfactory: 'مرضي',
    needsImprovement: 'يحتاج تحسين',
    unsatisfactory: 'غير مرضي',

    library: 'المكتبة',
    book: 'كتاب',
    books: 'الكتب',
    catalog: 'الفهرس',
    search: 'بحث',
    checkout: 'استعارة',
    checkin: 'إرجاع',
    return: 'إرجاع',
    renew: 'تجديد',
    reserve: 'حجز',
    reservation: 'حجز',
    reservations: 'الحجوزات',
    available: 'متاح',
    unavailable: 'غير متاح',
    borrowed: 'مُستعار',
    returned: 'مُرجع',
    lost: 'مفقود',
    damaged: 'تالف',
    fine: 'غرامة',
    fines: 'الغرامات',
    author: 'المؤلف',
    title: 'العنوان',
    isbn: 'الرقم المعياري',
    publisher: 'الناشر',
    publication: 'النشر',
    category: 'الفئة',
    subject: 'الموضوع',
    genre: 'النوع',
    format: 'التنسيق',
    digital: 'رقمي',
    physical: 'مادي',
    ebook: 'كتاب إلكتروني',
    audiobook: 'كتاب صوتي',

    finance: 'المالية',
    fee: 'رسم',
    fees: 'الرسوم',
    tuition: 'الرسوم الدراسية',
    payment: 'دفعة',
    payments: 'المدفوعات',
    invoice: 'فاتورة',
    invoices: 'الفواتير',
    receipt: 'إيصال',
    receipts: 'الإيصالات',
    balance: 'الرصيد',
    outstanding: 'مستحق',
    paid: 'مدفوع',
    unpaid: 'غير مدفوع',
    paymentOverdue: 'متأخر',
    discount: 'خصم',
    scholarship: 'منحة دراسية',
    financial: 'مالي',
    financialAid: 'المساعدة المالية',
    billing: 'الفوترة',
    transaction: 'معاملة',
    transactions: 'المعاملات',
    refund: 'استرداد',
    installment: 'قسط',
    installments: 'الأقساط',

    calendar: 'التقويم',
    event: 'حدث',
    events: 'الأحداث',
    eventSchedule: 'الجدول',
    appointment: 'موعد',
    appointments: 'المواعيد',
    meeting: 'اجتماع',
    meetings: 'الاجتماعات',
    holiday: 'عطلة',
    holidays: 'العطل',
    vacation: 'إجازة',
    break: 'استراحة',
    examPeriod: 'فترة الامتحانات',
    registrationPeriod: 'فترة التسجيل',
    orientation: 'التوجيه',
    graduation: 'التخرج',
    ceremony: 'حفل',
    conference: 'مؤتمر',
    workshop: 'ورشة عمل',
    seminar: 'ندوة',
    lecture: 'محاضرة',
    presentation: 'عرض تقديمي',

    progress: 'التقدم',
    report: 'تقرير',
    reports: 'التقارير',
    analytics: 'التحليلات',
    statistics: 'الإحصائيات',
    performance: 'الأداء',
    achievement: 'إنجاز',
    achievements: 'الإنجازات',
    milestone: 'معلم',
    milestones: 'المعالم',
    goal: 'هدف',
    goals: 'الأهداف',
    objective: 'غاية',
    objectives: 'الغايات',
    outcome: 'نتيجة',
    outcomes: 'النتائج',
    competency: 'كفاءة',
    competencies: 'الكفاءات',
    skill: 'مهارة',
    skills: 'المهارات',
    knowledge: 'المعرفة',
    understanding: 'الفهم',
    mastery: 'الإتقان',
    proficiency: 'الكفاءة',
    improvement: 'التحسن',
    growth: 'النمو',
    development: 'التطوير',
    learning: 'التعلم',
    education: 'التعليم',
    curriculum: 'المنهج',
    syllabus: 'المقرر',
    standard: 'معيار',
    standards: 'المعايير',
    benchmark: 'مرجع',
    benchmarks: 'المراجع',

    chat: 'Chat',
    message: 'Message',
    messages: 'Messages',
    send: 'Send',
    typing: 'Typing',
    online: 'Online',
    offline: 'Offline',
    away: 'Away',
    channel: 'Channel',
    channels: 'Channels',
    directMessage: 'Direct Message',
    groupChat: 'Group Chat',
    chatRoom: 'Chat Room',
    chatRooms: 'Chat Rooms',
    participants: 'Participants',
    joinChat: 'Join Chat',
    leaveChat: 'Leave Chat',
    muteChat: 'Mute Chat',
    unmuteChat: 'Unmute Chat',
    chatHistory: 'Chat History',
    newMessage: 'New Message',
    unreadMessages: 'Unread Messages',
    messageRead: 'Message Read',
    messageDelivered: 'Message Delivered',
    messageSent: 'Message Sent',
    attachFile: 'Attach File',
    emoji: 'Emoji',
    reaction: 'Reaction',
    reactions: 'Reactions',
    reply: 'Reply',
    forward: 'Forward',
    edit: 'Edit',
    
    discussion: 'Discussion',
    discussions: 'Discussions',
    forum: 'Forum',
    forums: 'Forums',
    topic: 'Topic',
    topics: 'Topics',
    post: 'Post',
    posts: 'Posts',
    thread: 'Thread',
    threads: 'Threads',
    replies: 'Replies',
    newTopic: 'New Topic',
    newPost: 'New Post',
    latestPost: 'Latest Post',
    lastReply: 'Last Reply',
    viewCount: 'Views',
    replyCount: 'Replies',
    postCount: 'Posts',
    moderator: 'Moderator',
    pinned: 'Pinned',
    locked: 'Locked',
    sticky: 'Sticky',
    featured: 'Featured',
    solved: 'Solved',
    unsolved: 'Unsolved',
    upvote: 'Upvote',
    downvote: 'Downvote',
    vote: 'Vote',
    votes: 'Votes',
    like: 'Like',
    likes: 'Likes',
    dislike: 'Dislike',
    share: 'Share',
    subscribe: 'Subscribe',
    unsubscribe: 'Unsubscribe',
    follow: 'Follow',
    unfollow: 'Unfollow',
    
    advancedAnalytics: 'Advanced Analytics',
    kpi: 'KPI',
    kpis: 'KPIs',
    metrics: 'Metrics',
    insights: 'Insights',
    trends: 'Trends',
    forecast: 'Forecast',
    prediction: 'Prediction',
    predictive: 'Predictive',
    dataVisualization: 'Data Visualization',
    chart: 'Chart',
    charts: 'Charts',
    graph: 'Graph',
    graphs: 'Graphs',
    dateRange: 'Date Range',
    timeframe: 'Timeframe',
    comparison: 'Comparison',
    target: 'Target',
    actual: 'Actual',
    variance: 'Variance',
    decline: 'Decline',
    increase: 'Increase',
    decrease: 'Decrease',
    ratio: 'Ratio',
    median: 'Median',
    count: 'Count',
    sum: 'Sum',
    minimum: 'Minimum',
    maximum: 'Maximum',
    range: 'Range',
    distribution: 'Distribution',
    correlation: 'Correlation',
    regression: 'Regression',
    anomaly: 'Anomaly',
    outlier: 'Outlier',
    pattern: 'Pattern',
    seasonality: 'Seasonality',
    volatility: 'Volatility',
    stability: 'Stability'
  },

  status: {
    active: 'نشط',
    inactive: 'غير نشط',
    pending: 'معلق',
    approved: 'موافق عليه',
    rejected: 'مرفوض',
    completed: 'مكتمل',
    inProgress: 'قيد التنفيذ',
    cancelled: 'ملغي',
    expired: 'منتهي الصلاحية',
    draft: 'مسودة',
    published: 'منشور',
    archived: 'مؤرشف',
    suspended: 'معلق',
    enrolled: 'مسجل',
    graduated: 'متخرج',
    transferred: 'محول',
    withdrawn: 'منسحب'
  },

  time: {
    today: 'اليوم',
    yesterday: 'أمس',
    tomorrow: 'غداً',
    thisWeek: 'هذا الأسبوع',
    lastWeek: 'الأسبوع الماضي',
    nextWeek: 'الأسبوع القادم',
    thisMonth: 'هذا الشهر',
    lastMonth: 'الشهر الماضي',
    nextMonth: 'الشهر القادم',
    thisYear: 'هذا العام',
    lastYear: 'العام الماضي',
    nextYear: 'العام القادم',
    morning: 'الصباح',
    afternoon: 'بعد الظهر',
    evening: 'المساء',
    night: 'الليل',
    am: 'ص',
    pm: 'م',
    hour: 'ساعة',
    hours: 'ساعات',
    minute: 'دقيقة',
    minutes: 'دقائق',
    second: 'ثانية',
    seconds: 'ثوان',
    day: 'يوم',
    days: 'أيام',
    week: 'أسبوع',
    weeks: 'أسابيع',
    month: 'شهر',
    months: 'أشهر',
    year: 'سنة',
    years: 'سنوات',
    date: 'التاريخ',
    time: 'الوقت',
    datetime: 'التاريخ والوقت',
    duration: 'المدة',
    period: 'الفترة',
    deadline: 'الموعد النهائي',
    schedule: 'الجدول'
  },

  errors: {
    general: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    network: 'خطأ في الشبكة. يرجى التحقق من الاتصال.',
    server: 'خطأ في الخادم. يرجى المحاولة لاحقاً.',
    notFound: 'المورد المطلوب غير موجود.',
    unauthorized: 'غير مخول للوصول إلى هذا المورد.',
    forbidden: 'الوصول إلى هذا المورد محظور.',
    validation: 'يرجى التحقق من المدخلات والمحاولة مرة أخرى.',
    required: 'هذا الحقل مطلوب.',
    invalid: 'مدخل غير صحيح.',
    tooShort: 'المدخل قصير جداً.',
    tooLong: 'المدخل طويل جداً.',
    emailInvalid: 'يرجى إدخال عنوان بريد إلكتروني صحيح.',
    passwordWeak: 'كلمة المرور ضعيفة جداً.',
    passwordMismatch: 'كلمات المرور غير متطابقة.',
    fileTooBig: 'حجم الملف كبير جداً.',
    fileTypeInvalid: 'نوع الملف غير صحيح.',
    uploadFailed: 'فشل في رفع الملف.',
    saveFailed: 'فشل في حفظ التغييرات.',
    loadFailed: 'فشل في تحميل البيانات.',
    deleteFailed: 'فشل في حذف العنصر.',
    updateFailed: 'فشل في تحديث العنصر.',
    createFailed: 'فشل في إنشاء العنصر.',
    connectionLost: 'فُقد الاتصال. يرجى المحاولة مرة أخرى.',
    timeout: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.',
    maintenance: 'النظام تحت الصيانة. يرجى المحاولة لاحقاً.'
  },

  success: {
    saved: 'تم حفظ التغييرات بنجاح.',
    updated: 'تم تحديث العنصر بنجاح.',
    created: 'تم إنشاء العنصر بنجاح.',
    deleted: 'تم حذف العنصر بنجاح.',
    uploaded: 'تم رفع الملف بنجاح.',
    submitted: 'تم الإرسال بنجاح.',
    sent: 'تم الإرسال بنجاح.',
    completed: 'تم الإكمال بنجاح.',
    approved: 'تم الموافقة بنجاح.',
    enrolled: 'تم التسجيل بنجاح.',
    unenrolled: 'تم إلغاء التسجيل بنجاح.',
    graded: 'تم التقييم بنجاح.',
    published: 'تم النشر بنجاح.',
    archived: 'تم الأرشفة بنجاح.',
    restored: 'تم الاستعادة بنجاح.',
    imported: 'تم الاستيراد بنجاح.',
    exported: 'تم التصدير بنجاح.',
    synchronized: 'تم التزامن بنجاح.',
    backup: 'تم النسخ الاحتياطي بنجاح.',
    restore: 'تم الاستعادة بنجاح.'
  }
}

export const translations = {
  en: enTranslations,
  ar: arTranslations
}

export type SupportedLanguage = keyof typeof translations
export const supportedLanguages: SupportedLanguage[] = ['en', 'ar']
export const defaultLanguage: SupportedLanguage = 'en'
