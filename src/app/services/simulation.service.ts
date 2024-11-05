import { Injectable, signal } from '@angular/core';
import { Indicator, IndicatorTimeframe, PricePoint, SimulationConfig, Stock } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  // Sygnały
  private readonly simulationConfig = signal<SimulationConfig>({
    speed: 1000,
    isRunning: false,
    currentDate: new Date()
  });

  // Inicjalizacja stocks z początkowymi danymi
  private readonly stocks = signal<Stock[]>([
    {
      id: '1',
      name: 'Tech Corp',
      ticker: 'TCH',
      currentPrice: 100,
      indicators: [
        {
          name: 'Market Sentiment',
          value: 50,
          weight: 0.6,
          timeframe: IndicatorTimeframe.SHORT,
          trend: 0.1,
          targetValue: 65,
          changeSpeed: 0.1
        },
        {
          name: 'Growth Potential',
          value: 75,
          weight: 0.4,
          timeframe: IndicatorTimeframe.LONG,
          trend: 0.05,
          targetValue: 80,
          changeSpeed: 0.05
        }
      ],
      priceHistory: []
    },
    {
      id: '2',
      name: 'Stable Industries',
      ticker: 'STB',
      currentPrice: 50,
      indicators: [
        {
          name: 'Market Sentiment',
          value: 45,
          weight: 0.4,
          timeframe: IndicatorTimeframe.SHORT,
          trend: -0.1,
          targetValue: 40,
          changeSpeed: 0.1
        },
        {
          name: 'Growth Potential',
          value: 60,
          weight: 0.6,
          timeframe: IndicatorTimeframe.LONG,
          trend: 0.02,
          targetValue: 65,
          changeSpeed: 0.03
        }
      ],
      priceHistory: []
    }
  ]);

  private simulationInterval?: number;

  constructor() {
    this.initializePriceHistory();
    // this.startSimulation();
  }

  private initializePriceHistory() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    this.stocks.update(stocks =>
      stocks.map(stock => ({
        ...stock,
        priceHistory: this.generateInitialHistory(stock.currentPrice, thirtyDaysAgo, now)
      }))
    );
  }

  private generateInitialHistory(startPrice: number, startDate: Date, endDate: Date): PricePoint[] {
    const history: PricePoint[] = [];
    let currentDate = new Date(startDate);
    let currentPrice = startPrice;

    while (currentDate <= endDate) {
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        const hours = currentDate.getHours();
        // Generuj dane tylko podczas godzin giełdowych (9:30 - 16:00)
        if ((hours === 9 && currentDate.getMinutes() >= 30) || (hours > 9 && hours < 16)) {
          const change = currentPrice * (Math.random() - 0.5) * 0.02;
          currentPrice += change;

          history.push({
            timestamp: currentDate.getTime(),
            price: Number(currentPrice.toFixed(2)),
            volume: Math.round(100000 + Math.random() * 900000)
          });
        }
      }

      // 5-minutowe interwały
      currentDate = new Date(currentDate.getTime() + 5 * 60 * 1000);
    }

    return history;
  }

  private simulateDay() {
    const stocks = this.stocks();
    const currentDate = this.simulationConfig().currentDate;

    // Symuluj tylko podczas godzin giełdowych
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const isMarketOpen = (hours === 9 && minutes >= 30) || (hours > 9 && hours < 16);

    if (!isMarketOpen || currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      // Poza godzinami giełdowymi lub w weekend, przejdź do następnego momentu
      this.moveToNextMarketOpen();
      return;
    }

    const updatedStocks = stocks.map(stock => {
      // Aktualizuj wskaźniki
      const updatedIndicators = this.updateIndicators(stock.indicators);

      // Oblicz zmianę ceny na podstawie wskaźników
      const priceChange = this.calculatePriceChange(updatedIndicators);

      // Oblicz nową cenę
      const newPrice = Number((stock.currentPrice * (1 + priceChange)).toFixed(2));

      // Utwórz nowy punkt cenowy
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

    // Aktualizuj czas o 5 minut
    this.simulationConfig.update(config => ({
      ...config,
      currentDate: new Date(currentDate.getTime() + 5 * 60 * 1000)
    }));

    this.stocks.set(updatedStocks);
  }

  private moveToNextMarketOpen() {
    const currentDate = this.simulationConfig().currentDate;
    let nextDate = new Date(currentDate);

    // Najpierw przesuń do następnego dnia 9:30 jeśli jesteśmy po 16:00
    if (currentDate.getHours() >= 16) {
      nextDate.setDate(nextDate.getDate() + 1);
      nextDate.setHours(9, 30, 0, 0);
    }

    // Jeśli to weekend, przesuń do poniedziałku
    while (nextDate.getDay() === 0 || nextDate.getDay() === 6) {
      nextDate.setDate(nextDate.getDate() + 1);
    }

    this.simulationConfig.update(config => ({
      ...config,
      currentDate: nextDate
    }));
  }

  private updateIndicators(indicators: Indicator[]): Indicator[] {
    return indicators.map(indicator => {
      // Oblicz odległość do wartości docelowej
      const difference = indicator.targetValue - indicator.value;
      const change = difference * indicator.changeSpeed;

      // Jeśli jesteśmy blisko celu, wygeneruj nowy
      const isNearTarget = Math.abs(difference) < 1;
      const newTargetValue = isNearTarget
        ? this.generateNewTarget(indicator.value)
        : indicator.targetValue;

      return {
        ...indicator,
        value: Number((indicator.value + change).toFixed(2)),
        targetValue: newTargetValue
      };
    });
  }

  private generateNewTarget(currentValue: number): number {
    const change = (Math.random() - 0.5) * 60; // ±30 punktów
    return Math.max(0, Math.min(100, currentValue + change));
  }

  private calculatePriceChange(indicators: Indicator[]): number {
    let totalChange = 0;

    indicators.forEach(indicator => {
      // Normalizuj wartość wskaźnika do zakresu -1 do 1
      const normalizedValue = (indicator.value - 50) / 50;
      let impact = normalizedValue * indicator.weight;

      // Dostosuj wpływ based on timeframe
      switch (indicator.timeframe) {
        case IndicatorTimeframe.SHORT:
          impact *= 0.03; // 3% max wpływu
          break;
        case IndicatorTimeframe.MEDIUM:
          impact *= 0.015; // 1.5% max wpływu
          break;
        case IndicatorTimeframe.LONG:
          impact *= 0.007; // 0.7% max wpływu
          break;
      }

      totalChange += impact;
    });

    // Dodaj mały losowy szum
    totalChange += (Math.random() - 0.5) * 0.002;

    return totalChange;
  }

  // Metody publiczne
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
