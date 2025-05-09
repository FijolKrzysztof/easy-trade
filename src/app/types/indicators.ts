export enum TechnicalIndicatorType {
  RSI = 'RSI',
  MACD = 'MACD',
  VOLUME_PRESSURE = 'Volume Pressure'
}

export interface TechnicalIndicator {
  type: TechnicalIndicatorType;
  name: string;
  value: number;
}

export interface TechnicalIndicatorConfig {
  type: TechnicalIndicatorType;
  name: string;
  description: string;
}

export enum FundamentalIndicatorType {
  REVENUE_GROWTH = 'Revenue Growth',
  PROFIT_MARGIN = 'Profit Margin',
  MARKET_SHARE = 'Market Share',
  INNOVATION_SCORE = 'Innovation Score',
  DEBT_RATIO = 'Debt Ratio'
}

export interface FundamentalIndicator {
  name: string;
  value: number;
  weight: number;
}

export interface FundamentalIndicatorConfig {
  type: FundamentalIndicatorType;
  name: string;
  weight: number;
  min: number;
  max: number;
  neutral: number;
  isReversed: boolean;
  description: string;
}
