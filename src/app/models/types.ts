export interface NavigationItem {
  name: string;
  icon: string;
  route: string;
}

export interface PortfolioItem {
  symbol: string;
  shares: number;
  change: number;
  value: number;
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

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    fill: boolean;
    borderColor: string;
    tension: number;
  }[];
}

export interface TradeOrder {
  symbol: string;
  amount: number;
  type: 'buy' | 'sell';
}

export type TimeframeOption = '1D' | '1W' | '1M';

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

export type DifficultyType = 'beginner' | 'intermediate' | 'advanced';
