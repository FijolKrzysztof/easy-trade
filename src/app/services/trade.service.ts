import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

@Injectable({
  providedIn: 'root'
})
export class TradeService {
  stockData = signal<Stock[]>([
    { symbol: 'AAPL', name: 'Apple Inc.', price: 178.72, change: 2.34 },
    { symbol: 'MSFT', name: 'Microsoft', price: 334.12, change: -1.23 },
    { symbol: 'GOOGL', name: 'Alphabet', price: 125.23, change: 0.45 }
  ]);

  portfolioData = signal([
    { name: 'AAPL', value: 1750, color: '#10B981' },
    { name: 'MSFT', value: 1250, color: '#3B82F6' },
    { name: 'Cash', value: 7000, color: '#6B7280' }
  ]);

  constructor(private http: HttpClient) {}

  buy(symbol: string, amount: number) {
    // Implement buy logic
  }

  sell(symbol: string, amount: number) {
    // Implement sell logic
  }
}
