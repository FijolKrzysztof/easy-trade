import { Moment } from 'moment';
import { FundamentalIndicator, TechnicalIndicator } from './indicators';

export interface PricePoint {
  timestamp: number;
  price: number;
  volume: number;
}

export interface Stock {
  id: string;
  name: string;
  ticker: string;
  currentPrice: number;
  technicalIndicators: TechnicalIndicator[];
  fundamentalIndicators: FundamentalIndicator[];
  priceHistory: PricePoint[];
  momentum: number;
}

export interface SimulationConfig {
  speed: number;
  isRunning: boolean;
  currentDate: Moment;
}
