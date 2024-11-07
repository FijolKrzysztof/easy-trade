import { FundamentalIndicator, PricePoint, Stock, TechnicalIndicator } from '../models/types';
import { Injectable } from '@angular/core';
import { FUNDAMENTAL_INDICATOR_TYPES } from '../configs/market-config';

@Injectable({
  providedIn: 'root'
})
export class MarketIndicatorsService {
  private readonly technicalIndicatorTypes = [
    'RSI',
    'MACD',
    'Volume Pressure'
  ];

  initializeFundamentalIndicators(): FundamentalIndicator[] {
    return FUNDAMENTAL_INDICATOR_TYPES.map(type => {
      const range = type.range;
      const value = range.neutral + (Math.random() - 0.5) * (range.max - range.min) * 0.2;
      return {
        name: type.name,
        value,
        weight: type.weight
      };
    });
  }

  private generateNewFundamentalValue(indicator: FundamentalIndicator): number {
    const type = FUNDAMENTAL_INDICATOR_TYPES.find(t => t.name === indicator.name)!;
    const range = type.range;
    const maxChange = (range.max - range.min) * 0.1;
    const change = (Math.random() - 0.5) * maxChange;
    return Math.max(range.min, Math.min(range.max, indicator.value + change));
  }

  updateFundamentalIndicators(stock: Stock): FundamentalIndicator[] {
    return stock.fundamentalIndicators.map(indicator => ({
      ...indicator,
      value: this.generateNewFundamentalValue(indicator)
    }));
  }

  normalizeFundamentalValue(indicator: FundamentalIndicator): number {
    const type = FUNDAMENTAL_INDICATOR_TYPES.find(t => t.name === indicator.name)!;
    const range = type.range;

    let normalizedValue = (indicator.value - range.min) / (range.max - range.min);
    let normalizedNeutral = (range.neutral - range.min) / (range.max - range.min);

    if (range.isReversed) {
      normalizedValue = 1 - normalizedValue;
      normalizedNeutral = 1 - normalizedNeutral;
    }

    return (normalizedValue - normalizedNeutral) * 2;
  }

  calculateTechnicalIndicators(stock: Stock): TechnicalIndicator[] {
    const priceHistory = stock.priceHistory;

    return this.technicalIndicatorTypes.map(name => ({
      name,
      value: this.calculateIndicator(name, priceHistory)
    }));
  }

  private calculateIndicator(name: string, priceHistory: PricePoint[]): number {
    if (priceHistory.length < 15) return 50;

    switch (name) {
      case 'RSI':
        return this.calculateRSI(priceHistory);
      case 'MACD':
        return this.calculateMACD(priceHistory);
      case 'Volume Pressure':
        return this.calculateVolumePressure(priceHistory);
      default:
        return 50;
    }
  }

  private calculateRSI(priceHistory: PricePoint[]): number {
    let gains = 0;
    let losses = 0;
    const period = 14;

    for (let i = priceHistory.length - period; i < priceHistory.length; i++) {
      const change = priceHistory[i].price - priceHistory[i - 1].price;
      if (change >= 0) gains += change;
      else losses -= change;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateMACD(priceHistory: PricePoint[]): number {
    const ema12 = this.calculateEMA(priceHistory, 12);
    const ema26 = this.calculateEMA(priceHistory, 26);

    const macd = ema12 - ema26;
    const maxMACD = priceHistory[priceHistory.length - 1].price * 0.02;

    return 50 + (macd / maxMACD) * 25;
  }

  private calculateVolumePressure(priceHistory: PricePoint[]): number {
    const recentVolumes = priceHistory.slice(-10);
    const avgVolume = recentVolumes.reduce((sum, point) => sum + point.volume, 0) / 10;
    const lastVolume = recentVolumes[recentVolumes.length - 1].volume;

    return Math.min(100, Math.max(0, (lastVolume / avgVolume) * 50));
  }

  private calculateEMA(priceHistory: PricePoint[], period: number): number {
    const multiplier = 2 / (period + 1);
    let ema = priceHistory[0].price;

    for (let i = 1; i < priceHistory.length; i++) {
      ema = (priceHistory[i].price - ema) * multiplier + ema;
    }

    return ema;
  }
}
