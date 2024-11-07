export interface PositionSnapshot {
  symbol: string;
  shares: number;
  price: number;
  value: number;
  unrealizedPL: number;
  averagePrice: number;
}

export interface PortfolioSnapshot {
  timestamp: Date;
  positions: PositionSnapshot[];
  totalValue: number;
  cashBalance: number;
  unrealizedPL: number;
  totalEquity: number;
}

export interface PortfolioPosition {
  symbol: string;
  shares: number;
  averagePrice: number;
  currentPrice: number;
  value: number;
  unrealizedPL: number;
}

export interface PortfolioSummary {
  totalValue: number;
  cashBalance: number;
  unrealizedPL: number;
  totalEquity: number;
}
