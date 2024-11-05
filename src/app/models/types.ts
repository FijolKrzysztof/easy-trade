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

// Okresy wpływu wskaźnika
export enum IndicatorTimeframe {
  SHORT = 'short',   // dni
  MEDIUM = 'medium', // tygodnie
  LONG = 'long'     // miesiące
}

// Struktura pojedynczego wskaźnika
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

// Podstawowe typy dla spółki
export interface Stock {
  id: string;
  name: string;
  ticker: string;
  currentPrice: number;
  indicators: Indicator[];
  priceHistory: PricePoint[];
}

// Konfiguracja symulacji
export interface SimulationConfig {
  speed: number;        // prędkość symulacji (ms na dzień)
  isRunning: boolean;   // czy symulacja działa
  currentDate: Date;    // aktualny dzień symulacji
}

// Zachowujemy istniejące typy związane z ceną
export interface PricePoint {
  timestamp: number;
  price: number;
  volume: number;
}

// Do generowania wykresu
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
