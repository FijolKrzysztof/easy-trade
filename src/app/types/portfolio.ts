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
