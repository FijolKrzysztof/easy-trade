import { FundamentalIndicatorType, FundamentalRange } from '../models/types';

export const MARKET_OPEN_HOUR = 9;
export const MARKET_OPEN_MINUTE = 30;
export const MARKET_CLOSE_HOUR = 16;
export const MARKET_CLOSE_MINUTE = 0;
export const TRADING_DAYS = [1, 2, 3, 4, 5];

export const BASE_VOLATILITY =           0.0015;
export const MOMENTUM_FACTOR =           0.0008;
export const SPIKE_PROBABILITY =         0.05;
export const SPIKE_MAGNITUDE =           0.005;
export const FUNDAMENTAL_IMPACT_FACTOR = 0.000001; // doesn't impact historical data

export const FUNDAMENTAL_RANGES: Record<string, FundamentalRange> = {
  'Revenue Growth': {
    min: -20,
    max: 30,
    neutral: 5,
    isReversed: false,
    description: 'Year over year revenue growth in percentage'
  },
  'Profit Margin': {
    min: 0,
    max: 30,
    neutral: 10,
    isReversed: false,
    description: 'Net profit as percentage of revenue'
  },
  'Market Share': {
    min: 0,
    max: 60,
    neutral: 20,
    isReversed: false,
    description: 'Company\'s market share in percentage'
  },
  'Innovation Score': {
    min: 0,
    max: 10,
    neutral: 5,
    isReversed: false,
    description: 'Composite score based on R&D spending and patents'
  },
  'Debt Ratio': {
    min: 0,
    max: 1,
    neutral: 0.4,
    isReversed: true,
    description: 'Total debt divided by total assets'
  }
};

export const FUNDAMENTAL_INDICATOR_TYPES: FundamentalIndicatorType[] = [
  { name: 'Revenue Growth', weight: 0.3, range: FUNDAMENTAL_RANGES['Revenue Growth'] },
  { name: 'Profit Margin', weight: 0.25, range: FUNDAMENTAL_RANGES['Profit Margin'] },
  { name: 'Market Share', weight: 0.2, range: FUNDAMENTAL_RANGES['Market Share'] },
  { name: 'Innovation Score', weight: 0.15, range: FUNDAMENTAL_RANGES['Innovation Score'] },
  { name: 'Debt Ratio', weight: 0.1, range: FUNDAMENTAL_RANGES['Debt Ratio'] }
];

export enum TechnicalIndicatorType {
  RSI = 'RSI',
  MACD = 'MACD',
  Volume_Pressure = 'Volume Pressure'
}
