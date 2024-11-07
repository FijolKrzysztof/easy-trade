import { Injectable, signal } from '@angular/core';
import { Indicator, IndicatorTimeframe, PricePoint, SimulationConfig, Stock } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  private readonly PRICE_CHANGE_PARAMS = {
    BASE_VOLATILITY: 0.004,        // Jeszcze mniejsza bazowa zmienność
    MOMENTUM_FACTOR: 0.002,        // Mniejszy wpływ momentum
    DAILY_LIMIT: 0.07,              // Limit dzienny ±7%
    INTRADAY_LIMIT: 0.04,           // Nowy limit: ±4% w ciągu dnia
    SPIKE_PROBABILITY: 0.1,        // Rzadsze spiki
    SPIKE_MAGNITUDE: 0.005,        // Mniejsze spiki
    VOLATILITY_RANGE: {
      MIN: 0.67,
      MAX: 1.33                     // Mniejszy zakres zmienności
    }
  };

  // Nowa metoda do wyliczania zmiany ceny - używana zarówno w historii jak i symulacji
  private calculatePriceStep(
    currentPrice: number,
    lastDayStartPrice: number,
    momentum: number,
    volatilityFactor: number
  ): {
    newPrice: number,
    newMomentum: number
  } {
    // Update momentum
    const newMomentum = momentum * 0.7 + (Math.random() - 0.5) * this.PRICE_CHANGE_PARAMS.MOMENTUM_FACTOR;

    // Podstawowa zmiana
    const baseChange = (Math.random() - 0.5) * this.PRICE_CHANGE_PARAMS.BASE_VOLATILITY * volatilityFactor;

    // Occasional spike
    const spike = Math.random() < this.PRICE_CHANGE_PARAMS.SPIKE_PROBABILITY ?
      (Math.random() - 0.5) * this.PRICE_CHANGE_PARAMS.SPIKE_MAGNITUDE : 0;

    let potentialChange = baseChange + newMomentum + spike;

    // Sprawdź limit dzienny
    const dailyChange = ((currentPrice * (1 + potentialChange)) - lastDayStartPrice) / lastDayStartPrice;
    if (Math.abs(dailyChange) > this.PRICE_CHANGE_PARAMS.DAILY_LIMIT) {
      const direction = dailyChange > 0 ? 1 : -1;
      return {
        newPrice: lastDayStartPrice * (1 + direction * this.PRICE_CHANGE_PARAMS.DAILY_LIMIT),
        newMomentum
      };
    }

    // Sprawdź limit intraday względem ostatniej ceny
    if (Math.abs(potentialChange) > this.PRICE_CHANGE_PARAMS.INTRADAY_LIMIT) {
      const direction = potentialChange > 0 ? 1 : -1;
      potentialChange = direction * this.PRICE_CHANGE_PARAMS.INTRADAY_LIMIT;
    }

    return {
      newPrice: currentPrice * (1 + potentialChange),
      newMomentum
    };
  }

  private generateInitialHistory(startPrice: number, startDate: Date, endDate: Date): PricePoint[] {
    const history: PricePoint[] = [];
    let currentDate = new Date(startDate);
    let currentPrice = startPrice;
    let momentum = 0;
    let volatilityFactor = 1;
    let lastDayStartPrice = currentPrice;
    let lastDay = currentDate.getDate();

    while (currentDate <= endDate) {
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        const hours = currentDate.getHours();
        if ((hours === 9 && currentDate.getMinutes() >= 30) || (hours > 9 && hours < 16)) {
          // Reset dzienny
          if (currentDate.getDate() !== lastDay) {
            lastDayStartPrice = currentPrice;
            lastDay = currentDate.getDate();
          }

          // Update volatility
          if (Math.random() < 0.05) {
            volatilityFactor = this.PRICE_CHANGE_PARAMS.VOLATILITY_RANGE.MIN +
              Math.random() * (this.PRICE_CHANGE_PARAMS.VOLATILITY_RANGE.MAX - this.PRICE_CHANGE_PARAMS.VOLATILITY_RANGE.MIN);
          }

          const result = this.calculatePriceStep(currentPrice, lastDayStartPrice, momentum, volatilityFactor);
          currentPrice = result.newPrice;
          momentum = result.newMomentum;

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
      // Znajdź cenę z początku dnia
      const today = new Date(currentDate);
      today.setHours(0, 0, 0, 0);
      const lastDayStartPrice = stock.priceHistory.find(p => new Date(p.timestamp) >= today)?.price || stock.currentPrice;

      // Użyj tej samej logiki co w historycznych danych
      const result = this.calculatePriceStep(
        stock.currentPrice,
        lastDayStartPrice,
        0, // Reset momentum każdego dnia dla większej stabilności
        1  // Stały volatilityFactor dla większej stabilności
      );

      const newPrice = Number(result.newPrice.toFixed(2));

      const newPricePoint: PricePoint = {
        timestamp: currentDate.getTime(),
        price: newPrice,
        volume: Math.round(100000 + Math.random() * 900000)
      };

      // Update wskaźników z mniejszym wpływem
      const updatedIndicators = this.updateIndicators(stock.indicators);

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

  private updateIndicators(indicators: Indicator[]): Indicator[] {
    return indicators.map(indicator => {
      const difference = indicator.targetValue - indicator.value;
      const change = difference * indicator.changeSpeed * 0.05; // Jeszcze mniejsza zmiana
      const randomNoise = (Math.random() - 0.5) * indicator.volatility * 0.02;

      const isNearTarget = Math.abs(difference) < 2;
      const newTargetValue = isNearTarget
        ? this.generateNewTarget(indicator.value, indicator.volatility)
        : indicator.targetValue;

      let newValue = indicator.value + change + randomNoise;
      newValue = Math.max(35, Math.min(65, newValue));

      return {
        ...indicator,
        value: Number(newValue.toFixed(2)),
        targetValue: newTargetValue
      };
    });
  }

  private generateNewTarget(currentValue: number, volatility: number): number {
    const maxChange = 3 + (volatility * 10); // Mniejsze zmiany targetów
    const change = (Math.random() - 0.5) * maxChange;
    return Math.max(35, Math.min(65, currentValue + change));
  }

  private readonly simulationConfig = signal<SimulationConfig>({
    speed: 1000,
    isRunning: false,
    currentDate: new Date()
  });

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
      value: 45 + Math.random() * 10,
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
