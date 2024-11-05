export interface AccountData {
  balance: number;
  username: string;
  notifications: number;
}

export interface PricePoint {
  timestamp: number;
  price: number;
  volume: number;
}

export interface PortfolioItem {
  symbol: string;
  shares: number;
  averagePrice: number;
  currentPrice: number;
  value: number;
  change: number;
  profitLoss: number;
}

export interface PositionSnapshot {
  symbol: string;
  shares: number;
  price: number;
  value: number;
  change: number;
}

export interface PortfolioSnapshot {
  timestamp: Date;
  positions: PositionSnapshot[];
  totalValue: number;
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
  type: 'buy' | 'sell';
  shares: number;
  price: number;
}

export type TimeframeOption = '1D' | '1W' | '1M';
