import { Injectable, signal } from '@angular/core';
import { Indicator, PricePoint, SimulationConfig, Stock } from '../models/types';
import { INITIAL_STOCKS, MARKET_INDICATORS } from '../data/market-data';
import {
  BASE_VOLATILITY,
  MARKET_CLOSE_HOUR,
  MARKET_CLOSE_MINUTE,
  MARKET_OPEN_HOUR,
  MARKET_OPEN_MINUTE,
  MOMENTUM_FACTOR,
  SPIKE_MAGNITUDE,
  SPIKE_PROBABILITY,
  TRADING_DAYS
} from '../configs/market-config';
import moment, { Moment } from 'moment';

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  private readonly simulationConfig = signal<SimulationConfig>({
    speed: 1000,
    isRunning: false,
    currentDate: moment()
  });

  private readonly stocks = signal<Stock[]>(INITIAL_STOCKS);
  private simulationInterval?: number;

  constructor() {
    this.initializeStocks();
    this.initializePriceHistory();
  }

  startSimulation(): void {
    if (!this.simulationInterval) {
      this.simulationConfig.update(config => ({ ...config, isRunning: true }));
      this.simulationInterval = window.setInterval(
        () => this.simulateDay(),
        this.simulationConfig().speed
      );
    }
  }

  stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = undefined;
      this.simulationConfig.update(config => ({ ...config, isRunning: false }));
    }
  }

  setSimulationSpeed(speed: number): void {
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

  private simulateDay(): void {
    const stocks = this.stocks();
    const currentMoment = this.simulationConfig().currentDate;

    if (!this.isMarketOpen(currentMoment)) {
      this.moveToNextMarketOpen();
      return;
    }

    const updatedStocks = stocks.map(stock => this.updateStock(stock, currentMoment));

    this.simulationConfig.update(config => ({
      ...config,
      currentDate: moment(currentMoment).add(5, 'minutes')
    }));

    this.stocks.set(updatedStocks);
  }

  private isMarketOpen(moment: Moment): boolean {
    const hours = moment.hours();
    const minutes = moment.minutes();
    const currentMinutes = hours * 60 + minutes;
    const openMinutes = MARKET_OPEN_HOUR * 60 + MARKET_OPEN_MINUTE;
    const closeMinutes = MARKET_CLOSE_HOUR * 60 + MARKET_CLOSE_MINUTE;
    const isWorkday = TRADING_DAYS.includes(moment.day());

    return isWorkday && currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }

  private moveToNextMarketOpen(): void {
    const currentMoment = this.simulationConfig().currentDate;
    let nextMarketOpen = currentMoment.clone();
    const currentMinutes = currentMoment.hours() * 60 + currentMoment.minutes();
    const closeMinutes = MARKET_CLOSE_HOUR * 60 + MARKET_CLOSE_MINUTE;

    if (currentMinutes >= closeMinutes) {
      nextMarketOpen.add(1, 'day')
        .hours(MARKET_OPEN_HOUR)
        .minutes(MARKET_OPEN_MINUTE)
        .seconds(0)
        .milliseconds(0);
    }

    while (!TRADING_DAYS.includes(nextMarketOpen.day())) {
      nextMarketOpen.add(1, 'day');
    }

    this.simulationConfig.update(config => ({
      ...config,
      currentDate: nextMarketOpen
    }));
  }

  private calculateVolume(priceChange: number): number {
    const baseVolume = 1000 + Math.random() * 9000;
    const volumeMultiplier = 1 + Math.abs(priceChange) * 10;

    return Math.round(baseVolume * volumeMultiplier);
  }

  private updateStock(stock: Stock, currentMoment: Moment): Stock {
    const { newPrice, newMomentum } = this.calculatePriceStep(
      stock.currentPrice,
      stock.momentum
    );

    const priceChange = (newPrice - stock.currentPrice) / stock.currentPrice;

    const newPricePoint: PricePoint = {
      timestamp: currentMoment.valueOf(),
      price: Number(newPrice.toFixed(2)),
      volume: this.calculateVolume(priceChange)
    };

    return {
      ...stock,
      currentPrice: newPrice,
      momentum: newMomentum,
      indicators: this.updateIndicators(stock.indicators),
      priceHistory: [...stock.priceHistory, newPricePoint]
    };
  }

  private calculatePriceStep(
    currentPrice: number,
    momentum: number
  ): { newPrice: number, newMomentum: number } {
    const newMomentum = momentum * 0.7 + (Math.random() - 0.5) * MOMENTUM_FACTOR;
    const baseChange = (Math.random() - 0.5) * BASE_VOLATILITY;
    const spike = Math.random() < SPIKE_PROBABILITY ?
      (Math.random() - 0.5) * SPIKE_MAGNITUDE : 0;

    const priceChange = baseChange + newMomentum + spike;

    return {
      newPrice: currentPrice * (1 + priceChange),
      newMomentum
    };
  }

  private generateInitialHistory(startPrice: number, startMoment: Moment, endMoment: Moment): PricePoint[] {
    const history: PricePoint[] = [];
    let currentMoment = startMoment.clone();
    let currentPrice = startPrice;
    let momentum = 0;

    while (currentMoment.isSameOrBefore(endMoment)) {
      if (this.isMarketOpen(currentMoment)) {
        const result = this.calculatePriceStep(currentPrice, momentum);
        const priceChange = (result.newPrice - currentPrice) / currentPrice;

        currentPrice = result.newPrice;
        momentum = result.newMomentum;

        history.push({
          timestamp: currentMoment.valueOf(),
          price: Number(currentPrice.toFixed(2)),
          volume: this.calculateVolume(priceChange)
        });
      }
      currentMoment.add(5, 'minutes');
    }

    return history;
  }

  private updateIndicators(indicators: Indicator[]): Indicator[] {
    return indicators.map(indicator => {
      const difference = indicator.targetValue - indicator.value;
      const change = difference * indicator.changeSpeed * 0.05;
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
    const maxChange = 3 + (volatility * 10);
    const change = (Math.random() - 0.5) * maxChange;
    return Math.max(35, Math.min(65, currentValue + change));
  }

  private initializeStocks(): void {
    this.stocks.update(stocks =>
      stocks.map(stock => ({
        ...stock,
        indicators: this.initializeIndicators(),
      }))
    );
  }

  private initializeIndicators(): Indicator[] {
    return MARKET_INDICATORS.map(indicator => ({
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

  private initializePriceHistory(): void {
    const now = moment();
    const thirtyDaysAgo = moment(now).subtract(30, 'days');

    this.simulationConfig.update(config => ({
      ...config,
      currentDate: now
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
}
