import { Injectable, signal } from '@angular/core';
import { Indicator, IndicatorTimeframe, PricePoint, SimulationConfig, Stock } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  private readonly simulationConfig = signal<SimulationConfig>({
    speed: 1000,
    isRunning: false,
    currentDate: new Date()
  });

  // Stały zestaw wskaźników rynkowych
  private readonly marketIndicators = [
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

  private readonly stocks = signal<Stock[]>([
    {
      id: '1',
      name: 'Tech Corp',
      ticker: 'TCH',
      currentPrice: 100,
      indicators: [],
      priceHistory: []
    },
    {
      id: '2',
      name: 'Stable Industries',
      ticker: 'STB',
      currentPrice: 50,
      indicators: [],
      priceHistory: []
    }
  ]);

  private simulationInterval?: number;

  constructor() {
    this.stocks.update(stocks =>
      stocks.map(stock => ({
        ...stock,
        indicators: this.initializeIndicators()
      }))
    );
    this.initializePriceHistory();
  }

  private initializeIndicators(): Indicator[] {
    return this.marketIndicators.map(indicator => ({
      name: indicator.name,
      value: 45 + Math.random() * 10, // Startowa wartość między 45 a 55 dla większej stabilności
      weight: indicator.baseWeight,
      timeframe: indicator.timeframe,
      trend: (Math.random() - 0.5) * 0.1,
      targetValue: 40 + Math.random() * 20,
      changeSpeed: 0.05 + Math.random() * 0.05,
      volatility: indicator.volatility
    }));
  }

  private initializePriceHistory() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    this.simulationConfig.update(config => ({
      ...config,
      currentDate: new Date(now.getTime())
    }));

    this.stocks.update(stocks =>
      stocks.map(stock => ({
        ...stock,
        priceHistory: this.generateInitialHistory(stock.currentPrice, thirtyDaysAgo, now)
      }))
    );

    this.stocks.update(stocks =>
      stocks.map(stock => ({
        ...stock,
        currentPrice: stock.priceHistory[stock.priceHistory.length - 1]?.price || stock.currentPrice
      }))
    );
  }

  private generateInitialHistory(startPrice: number, startDate: Date, endDate: Date): PricePoint[] {
    const history: PricePoint[] = [];
    let currentDate = new Date(startDate);
    let currentPrice = startPrice;
    let momentum = 0;
    let volatilityFactor = 1;

    while (currentDate <= endDate) {
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        const hours = currentDate.getHours();
        if ((hours === 9 && currentDate.getMinutes() >= 30) || (hours > 9 && hours < 16)) {
          momentum = momentum * 0.7 + (Math.random() - 0.5) * 0.002;

          if (Math.random() < 0.05) {
            volatilityFactor = 0.8 + Math.random() * 0.4; // Zakres 0.8-1.2
          }

          const baseChange = (Math.random() - 0.5) * 0.003 * volatilityFactor;
          const change = (baseChange + momentum) * currentPrice;

          const spike = Math.random() < 0.05 ?
            (Math.random() - 0.5) * 0.004 * currentPrice * volatilityFactor : 0;

          currentPrice += change + spike;
          currentPrice = Math.max(currentPrice, currentPrice * 0.998);

          history.push({
            timestamp: currentDate.getTime(),
            price: Number(currentPrice.toFixed(2)),
            volume: Math.round(100000 + Math.random() * 900000)
          });
        }
      }
      currentDate = new Date(currentDate.getTime() + 5 * 60 * 1000);
    }

    return history;
  }

  private calculatePriceChange(indicators: Indicator[]): number {
    let totalChange = 0;
    let momentum = 0;

    indicators.forEach(indicator => {
      const normalizedValue = (indicator.value - 50) / 50;
      let impact = normalizedValue * indicator.weight;

      const volatilityImpact = (Math.random() - 0.5) * indicator.volatility * 0.3;

      switch (indicator.timeframe) {
        case IndicatorTimeframe.SHORT:
          impact *= 0.006;
          break;
        case IndicatorTimeframe.MEDIUM:
          impact *= 0.003;
          break;
        case IndicatorTimeframe.LONG:
          impact *= 0.0015;
          break;
      }

      impact += volatilityImpact;
      totalChange += impact;
    });

    momentum = momentum * 0.6 + totalChange * 0.2;
    const spike = Math.random() < 0.05 ? (Math.random() - 0.5) * 0.001 : 0;

    return totalChange + momentum + spike;
  }

  private updateIndicators(indicators: Indicator[]): Indicator[] {
    return indicators.map(indicator => {
      const difference = indicator.targetValue - indicator.value;
      const change = difference * indicator.changeSpeed * 0.3;
      const randomNoise = (Math.random() - 0.5) * indicator.volatility * 0.2;

      const isNearTarget = Math.abs(difference) < 2;
      const newTargetValue = isNearTarget
        ? this.generateNewTarget(indicator.value, indicator.volatility)
        : indicator.targetValue;

      return {
        ...indicator,
        value: Number((indicator.value + change + randomNoise).toFixed(2)),
        targetValue: newTargetValue
      };
    });
  }

  private generateNewTarget(currentValue: number, volatility: number): number {
    const maxChange = 15 + (volatility * 50);
    const change = (Math.random() - 0.5) * maxChange;
    return Math.max(0, Math.min(100, currentValue + change));
  }

  private simulateDay() {
    const stocks = this.stocks();
    const currentDate = this.simulationConfig().currentDate;

    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const isMarketOpen = (hours === 9 && minutes >= 30) || (hours > 9 && hours < 16);

    if (!isMarketOpen || currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      this.moveToNextMarketOpen();
      return;
    }

    const updatedStocks = stocks.map(stock => {
      const updatedIndicators = this.updateIndicators(stock.indicators);
      const priceChange = this.calculatePriceChange(updatedIndicators);
      const newPrice = Number((stock.currentPrice * (1 + priceChange)).toFixed(2));

      const newPricePoint: PricePoint = {
        timestamp: currentDate.getTime(),
        price: newPrice,
        volume: Math.round(100000 + Math.random() * 900000)
      };

      return {
        ...stock,
        currentPrice: newPrice,
        indicators: updatedIndicators,
        priceHistory: [...stock.priceHistory, newPricePoint]
      };
    });

    this.simulationConfig.update(config => ({
      ...config,
      currentDate: new Date(currentDate.getTime() + 5 * 60 * 1000)
    }));

    this.stocks.set(updatedStocks);
  }

  private moveToNextMarketOpen() {
    const currentDate = this.simulationConfig().currentDate;
    let nextDate = new Date(currentDate);

    if (currentDate.getHours() >= 16) {
      nextDate.setDate(nextDate.getDate() + 1);
      nextDate.setHours(9, 30, 0, 0);
    }

    while (nextDate.getDay() === 0 || nextDate.getDay() === 6) {
      nextDate.setDate(nextDate.getDate() + 1);
    }

    this.simulationConfig.update(config => ({
      ...config,
      currentDate: nextDate
    }));
  }

  startSimulation() {
    if (!this.simulationInterval) {
      this.simulationConfig.update(config => ({ ...config, isRunning: true }));
      this.simulationInterval = window.setInterval(
        () => this.simulateDay(),
        this.simulationConfig().speed
      );
    }
  }

  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = undefined;
      this.simulationConfig.update(config => ({ ...config, isRunning: false }));
    }
  }

  setSimulationSpeed(speed: number) {
    this.simulationConfig.update(config => ({ ...config, speed }));
    if (this.simulationInterval) {
      this.stopSimulation();
      this.startSimulation();
    }
  }

  getStocks() {
    return this.stocks;
  }

  getSimulationConfig() {
    return this.simulationConfig;
  }
}
