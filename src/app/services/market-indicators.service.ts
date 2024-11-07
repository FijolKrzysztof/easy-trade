import { Injectable } from '@angular/core';
import {
  getAllFundamentalIndicators,
  getAllTechnicalIndicators,
} from '../configs/market-config';
import { FundamentalIndicator, TechnicalIndicator, TechnicalIndicatorType } from '../types/indicators';
import { PricePoint, Stock } from '../types/market';

@Injectable({
  providedIn: 'root'
})
export class MarketIndicatorsService {
  initializeFundamentalIndicators(): FundamentalIndicator[] {
    return getAllFundamentalIndicators().map(indicator => {
      const value = indicator.neutral + (Math.random() - 0.5) * (indicator.max - indicator.min) * 0.2;
      return {
        name: indicator.name,
        value,
        weight: indicator.weight
      };
    });
  }

  updateFundamentalIndicators(stock: Stock): FundamentalIndicator[] {
    return stock.fundamentalIndicators.map(indicator => ({
      ...indicator,
      value: this.generateNewFundamentalValue(indicator)
    }));
  }

  normalizeFundamentalValue(indicator: FundamentalIndicator): number {
    const type = getAllFundamentalIndicators().find(t => t.name === indicator.name)!;

    let normalizedValue = (indicator.value - type.min) / (type.max - type.min);
    let normalizedNeutral = (type.neutral - type.min) / (type.max - type.min);

    if (type.isReversed) {
      normalizedValue = 1 - normalizedValue;
      normalizedNeutral = 1 - normalizedNeutral;
    }

    return (normalizedValue - normalizedNeutral) * 2;
  }

  calculateTechnicalIndicators(stock: Stock): TechnicalIndicator[] {
    const priceHistory = stock.priceHistory;

    return getAllTechnicalIndicators().map(indicator => ({
      type: indicator.type,
      name: indicator.name,
      value: this.calculateIndicator(indicator.type, priceHistory)
    }));
  }

  private generateNewFundamentalValue(indicator: FundamentalIndicator): number {
    const type = getAllFundamentalIndicators().find(t => t.name === indicator.name)!;
    const maxChange = (type.max - type.min) * 0.1;
    const change = (Math.random() - 0.5) * maxChange;
    return Math.max(type.min, Math.min(type.max, indicator.value + change));
  }

  private calculateIndicator(type: TechnicalIndicatorType, priceHistory: PricePoint[]): number {
    if (priceHistory.length < 15) return 50;

    switch (type) {
      case TechnicalIndicatorType.RSI:
        return this.calculateRSI(priceHistory);
      case TechnicalIndicatorType.MACD:
        return this.calculateMACD(priceHistory);
      case TechnicalIndicatorType.VOLUME_PRESSURE:
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
