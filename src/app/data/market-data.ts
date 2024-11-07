import { Stock } from '../types/market';

export const INITIAL_STOCKS: Stock[] = [
  {
    id: '1',
    name: 'Tech Corp',
    ticker: 'TCH',
    currentPrice: 100,
    technicalIndicators: [],
    fundamentalIndicators: [],
    priceHistory: [],
    momentum: 0
  },
  {
    id: '2',
    name: 'Stable Industries',
    ticker: 'STB',
    currentPrice: 50,
    technicalIndicators: [],
    fundamentalIndicators: [],
    priceHistory: [],
    momentum: 0
  }
];
