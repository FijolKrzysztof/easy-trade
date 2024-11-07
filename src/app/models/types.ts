import { Moment } from 'moment';

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

export interface TradeOrder {
  symbol: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
}

export type TimeframeOption = '1D' | '1W' | '1M';

export enum IndicatorTimeframe {
  SHORT = 'short',   // dni
  MEDIUM = 'medium', // tygodnie
  LONG = 'long'     // miesiące
}

export interface Indicator {
  name: string;
  value: number;
  weight: number;           // waga wpływu na cenę (0-1)
  timeframe: IndicatorTimeframe;
  trend: number;            // kierunek zmian (-1 do 1)
  targetValue: number;      // wartość do której dąży wskaźnik
  changeSpeed: number;      // jak szybko zmienia się wskaźnik (0-1)
  volatility: number;
}

export interface Stock {
  id: string;
  name: string;
  ticker: string;
  currentPrice: number;
  indicators: Indicator[];
  priceHistory: PricePoint[];
  momentum: number;
}

export interface SimulationConfig {
  speed: number;
  isRunning: boolean;
  currentDate: Moment;
}

export interface PricePoint {
  timestamp: number;
  price: number;
  volume: number;
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
