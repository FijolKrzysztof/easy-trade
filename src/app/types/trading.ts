export interface TradeOrder {
  symbol: string;
  type: 'buy' | 'sell';
  orderType: 'market';
  shares: number;
  price: number;
}

export interface TradeResult {
  success: boolean;
  error?: string;
  executionPrice: number;
  commission: number;
  totalCost: number;
}
