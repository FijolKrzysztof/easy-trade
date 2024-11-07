import {
  FundamentalIndicatorConfig,
  FundamentalIndicatorType,
  TechnicalIndicatorConfig,
  TechnicalIndicatorType
} from '../types/indicators';

export const MARKET_HOURS = {
  OPEN: {
    HOUR: 9,
    MINUTE: 30
  },
  CLOSE: {
    HOUR: 16,
    MINUTE: 0
  },
};
export const TRADING_DAYS = [1, 2, 3, 4, 5] as number[];

export const SIMULATION_PARAMS = {
  BASE_VOLATILITY:           0.0015,
  MOMENTUM_FACTOR:           0.0008,
  SPIKE_PROBABILITY:         0.05,
  SPIKE_MAGNITUDE:           0.005,
  FUNDAMENTAL_IMPACT_FACTOR: 0.000001 // doesn't impact historical data
};

export const TECHNICAL_INDICATORS: Record<TechnicalIndicatorType, TechnicalIndicatorConfig> = {
  [TechnicalIndicatorType.RSI]: {
    type: TechnicalIndicatorType.RSI,
    name: 'Relative Strength Index',
    description: 'Momentum indicator that measures the speed and magnitude of recent price changes'
  },
  [TechnicalIndicatorType.MACD]: {
    type: TechnicalIndicatorType.MACD,
    name: 'Moving Average Convergence Divergence',
    description: 'Trend-following momentum indicator comparing two moving averages'
  },
  [TechnicalIndicatorType.VOLUME_PRESSURE]: {
    type: TechnicalIndicatorType.VOLUME_PRESSURE,
    name: 'Volume Pressure',
    description: 'Volume pressure indicator based on recent trading volumes'
  }
};

export const FUNDAMENTAL_INDICATORS: Record<FundamentalIndicatorType, FundamentalIndicatorConfig> = {
  [FundamentalIndicatorType.REVENUE_GROWTH]: {
    type: FundamentalIndicatorType.REVENUE_GROWTH,
    name: 'Revenue Growth',
    weight: 0.3,
    min: -20,
    max: 30,
    neutral: 5,
    isReversed: false,
    description: 'Year over year revenue growth in percentage'
  },
  [FundamentalIndicatorType.PROFIT_MARGIN]: {
    type: FundamentalIndicatorType.PROFIT_MARGIN,
    name: 'Profit Margin',
    weight: 0.25,
    min: 0,
    max: 30,
    neutral: 10,
    isReversed: false,
    description: 'Net profit as percentage of revenue'
  },
  [FundamentalIndicatorType.MARKET_SHARE]: {
    type: FundamentalIndicatorType.MARKET_SHARE,
    name: 'Market Share',
    weight: 0.2,
    min: 0,
    max: 60,
    neutral: 20,
    isReversed: false,
    description: 'Company\'s market share in percentage'
  },
  [FundamentalIndicatorType.INNOVATION_SCORE]: {
    type: FundamentalIndicatorType.INNOVATION_SCORE,
    name: 'Innovation Score',
    weight: 0.15,
    min: 0,
    max: 10,
    neutral: 5,
    isReversed: false,
    description: 'Composite score based on R&D spending and patents'
  },
  [FundamentalIndicatorType.DEBT_RATIO]: {
    type: FundamentalIndicatorType.DEBT_RATIO,
    name: 'Debt Ratio',
    weight: 0.1,
    min: 0,
    max: 1,
    neutral: 0.4,
    isReversed: true,
    description: 'Total debt divided by total assets'
  }
};

export const getAllTechnicalIndicators = () => Object.values(TECHNICAL_INDICATORS);
export const getAllFundamentalIndicators = () => Object.values(FUNDAMENTAL_INDICATORS);
