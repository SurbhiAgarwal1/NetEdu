// src/types/index.ts - All TypeScript interfaces in one place

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  bio: string;
  school: string;
  city: string;
  country: string;
  avatar: string | null;
  date_joined: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

export interface NetworkMeasurement {
  id: number;
  download_speed: number;
  upload_speed: number;
  latency: number;
  jitter: number;
  packet_loss: number;
  connection_type: 'wifi' | 'mobile' | 'ethernet' | 'unknown';
  isp: string;
  city: string;
  country: string;
  quality_score: number;
  created_at: string;
}

export interface NetworkStats {
  avg_download: number;
  avg_upload: number;
  avg_latency: number;
  avg_quality_score: number;
  total_tests: number;
  last_tested: string | null;
}

export interface NetworkAnalytics {
  empty: boolean;
  message?: string;
  summary?: {
    avg_download: number;
    avg_upload: number;
    avg_latency: number;
    avg_quality: number;
    max_download: number;
    min_download: number;
    total_tests: number;
    std_download: number;
  };
  trend?: Array<{
    date: string;
    avg_download: number;
    avg_upload: number;
    avg_latency: number;
    tests: number;
  }>;
  quality_distribution?: Array<{ band: string; count: number }>;
  connection_breakdown?: Array<{ type: string; count: number }>;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor_name: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  total_lessons: number;
  enrolled_count: number;
  is_published: boolean;
  created_at: string;
}

export interface Enrollment {
  id: number;
  course: number;
  course_title: string;
  enrolled_at: string;
  is_completed: boolean;
  progress_percentage: number;
}

export interface LearningAnalytics {
  empty: boolean;
  message?: string;
  summary?: {
    total_enrolled: number;
    completed_courses: number;
    avg_progress: number;
    total_lessons_done: number;
  };
  course_progress?: Array<{
    course: string;
    progress: number;
    is_completed: boolean;
  }>;
  activity_timeline?: Array<{
    date: string;
    lessons_done: number;
    minutes_spent: number;
  }>;
}

export interface DashboardData {
  network: NetworkAnalytics;
  learning: LearningAnalytics;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  name: string;
  avatar: string;
  courses_completed: number;
  lessons_completed: number;
  avg_score: number;
  streak: number;
  points: number;
  is_current_user: boolean;
}

export interface LeaderboardMyRank {
  found: boolean;
  message?: string;
  rank: number | null;
  total_users: number;
  percentile: number | null;
  entry: LeaderboardEntry | null;
  neighbors: LeaderboardEntry[];
}

// API response wrapper
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
