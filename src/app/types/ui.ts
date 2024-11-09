export interface DifficultyLevel {
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  recommendedLesson: string;
  features: string[];
}

export interface DifficultyLevels {
  [key: string]: DifficultyLevel;
}

export interface NavigationItem {
  name: string;
  icon: string;
  route: string;
}

export interface LearningCard {
  title: string;
  icon: string;
  progress?: number;
  description?: string;
  stats?: string;
  actionText: string;
  route: string;
}

export interface ChartDataset {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    fill: boolean;
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }>;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export type TimeframeOption = '1D' | '1W' | '1M';
