import { IndicatorTimeframe, Stock } from '../models/types';

export const MARKET_INDICATORS = [
  {
    name: 'RSI (Relative Strength Index)',
    baseWeight: 0.15,
    timeframe: IndicatorTimeframe.SHORT,
    volatility: 0.2,
    description: 'Momentum indicator measuring speed and magnitude of recent price changes'
  },
  {
    name: 'Volume Pressure',
    baseWeight: 0.15,
    timeframe: IndicatorTimeframe.SHORT,
    volatility: 0.25,
    description: 'Indicates buying/selling pressure based on volume analysis'
  },
  {
    name: 'MACD Signal',
    baseWeight: 0.15,
    timeframe: IndicatorTimeframe.MEDIUM,
    volatility: 0.15,
    description: 'Moving Average Convergence/Divergence trend indicator'
  },
  {
    name: 'Market Sentiment',
    baseWeight: 0.1,
    timeframe: IndicatorTimeframe.SHORT,
    volatility: 0.3,
    description: 'Overall market mood based on various sentiment indicators'
  },
  {
    name: 'Sector Trend',
    baseWeight: 0.15,
    timeframe: IndicatorTimeframe.MEDIUM,
    volatility: 0.1,
    description: 'Performance relative to sector average'
  },
  {
    name: 'Institutional Money Flow',
    baseWeight: 0.15,
    timeframe: IndicatorTimeframe.MEDIUM,
    volatility: 0.12,
    description: 'Tracks institutional investor buying/selling patterns'
  },
  {
    name: 'Economic Context',
    baseWeight: 0.15,
    timeframe: IndicatorTimeframe.LONG,
    volatility: 0.08,
    description: 'Impact of broader economic conditions'
  }
];

export const INITIAL_STOCKS: Stock[] = [
  {
    id: '1',
    name: 'Tech Corp',
    ticker: 'TCH',
    currentPrice: 100,
    indicators: [],
    priceHistory: [],
    momentum: 0,
  },
  {
    id: '2',
    name: 'Stable Industries',
    ticker: 'STB',
    currentPrice: 50,
    indicators: [],
    priceHistory: [],
    momentum: 0,
  }
];
