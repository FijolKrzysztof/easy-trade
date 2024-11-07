import { inject, Injectable, signal } from '@angular/core';
import { INITIAL_STOCKS } from '../data/market-data';
import moment, { Moment } from 'moment';
import { MarketIndicatorsService } from './market-indicators.service';
import { MARKET_HOURS, SIMULATION_PARAMS, TRADING_DAYS } from '../configs/market-config';
import { PricePoint, SimulationConfig, Stock } from '../types/market';
import { FundamentalIndicator } from '../types/indicators';
import { PortfolioService } from './portfolio.service';

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  readonly marketIndicatorsService = inject(MarketIndicatorsService);
  readonly portfolioService = inject(PortfolioService);

  private simulationInterval?: number;
  private readonly stocks = signal<Stock[]>(INITIAL_STOCKS);
  private readonly simulationConfig = signal<SimulationConfig>({
    speed: 1000,
    isRunning: false,
    currentDate: moment()
  });

  constructor() {
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

    const isQuarterEnd = this.isQuarterEnd(currentMoment);
    const updatedStocks = stocks.map(stock => this.updateStock(stock, currentMoment, isQuarterEnd));

    // Aktualizacja cen w portfolio
    const marketPrices = updatedStocks.reduce((prices, stock) => {
      prices[stock.ticker] = stock.currentPrice;
      return prices;
    }, {} as { [symbol: string]: number });

    this.portfolioService.updateMarketPrices(marketPrices);

    this.simulationConfig.update(config => ({
      ...config,
      currentDate: moment(currentMoment).add(5, 'minutes')
    }));

    this.stocks.set(updatedStocks);
  }

  private isQuarterEnd(currentMoment: Moment): boolean {
    const month = currentMoment.month();
    const lastDayOfMonth = currentMoment.clone().endOf('month').date();
    return (month % 3 === 2) &&
      (currentMoment.date() === lastDayOfMonth) &&
      (currentMoment.hours() === MARKET_HOURS.CLOSE.MINUTE) &&
      (currentMoment.minutes() === MARKET_HOURS.CLOSE.MINUTE - 5);
  }

  private isMarketOpen(moment: Moment): boolean {
    const hours = moment.hours();
    const minutes = moment.minutes();
    const currentMinutes = hours * 60 + minutes;
    const openMinutes = MARKET_HOURS.OPEN.HOUR * 60 + MARKET_HOURS.OPEN.MINUTE;
    const closeMinutes = MARKET_HOURS.CLOSE.HOUR * 60 + MARKET_HOURS.CLOSE.MINUTE;
    const isWorkday = TRADING_DAYS.includes(moment.day());

    return isWorkday && currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }

  private moveToNextMarketOpen(): void {
    const currentMoment = this.simulationConfig().currentDate;
    let nextMarketOpen = currentMoment.clone();
    const currentMinutes = currentMoment.hours() * 60 + currentMoment.minutes();
    const closeMinutes = MARKET_HOURS.CLOSE.HOUR * 60 + MARKET_HOURS.CLOSE.MINUTE;

    if (currentMinutes >= closeMinutes) {
      nextMarketOpen.add(1, 'day')
        .hours(MARKET_HOURS.OPEN.HOUR)
        .minutes(MARKET_HOURS.OPEN.MINUTE)
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

  private calculateVolume(currentPrice: number, newPrice: number): number {
    const priceChange = (newPrice - currentPrice) / currentPrice;
    const baseVolume = 1000 + Math.random() * 9000;
    const volumeMultiplier = 1 + Math.abs(priceChange) * 10;

    return Math.round(baseVolume * volumeMultiplier);
  }

  private updateStock(stock: Stock, currentMoment: Moment, isQuarterEnd: boolean): Stock {
    const fundamentalIndicators = isQuarterEnd
      ? this.marketIndicatorsService.updateFundamentalIndicators(stock)
      : stock.fundamentalIndicators;

    const { newPrice, newMomentum } = this.calculatePriceStep(
      stock.currentPrice,
      stock.momentum,
      fundamentalIndicators
    );

    const newPricePoint: PricePoint = {
      timestamp: currentMoment.valueOf(),
      price: Number(newPrice.toFixed(2)),
      volume: this.calculateVolume(stock.currentPrice, newPrice)
    };

    const newHistory = [...stock.priceHistory, newPricePoint];
    const technicalIndicators = this.marketIndicatorsService.calculateTechnicalIndicators({
      ...stock,
      priceHistory: newHistory
    });

    return {
      ...stock,
      currentPrice: newPrice,
      momentum: newMomentum,
      priceHistory: newHistory,
      technicalIndicators,
      fundamentalIndicators
    };
  }

  private calculatePriceStep(
    currentPrice: number,
    momentum: number,
    fundamentalIndicators: FundamentalIndicator[]
  ): { newPrice: number; newMomentum: number } {
    const fundamentalEffect = fundamentalIndicators.reduce((sum, indicator) => {
      const normalizedValue = this.marketIndicatorsService.normalizeFundamentalValue(indicator);
      return sum + normalizedValue * indicator.weight;
    }, 0) * SIMULATION_PARAMS.FUNDAMENTAL_IMPACT_FACTOR;

    const newMomentum = momentum * 0.7 + (Math.random() - 0.5) * SIMULATION_PARAMS.MOMENTUM_FACTOR;
    const baseChange = (Math.random() - 0.5) * SIMULATION_PARAMS.BASE_VOLATILITY;
    const spike = Math.random() < SIMULATION_PARAMS.SPIKE_PROBABILITY ?
      (Math.random() - 0.5) * SIMULATION_PARAMS.SPIKE_MAGNITUDE : 0;

    const priceChange = baseChange + newMomentum + spike + fundamentalEffect;

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
        const result = this.calculatePriceStep(currentPrice, momentum, []);
        const volume = this.calculateVolume(currentPrice, result.newPrice);

        currentPrice = result.newPrice;
        momentum = result.newMomentum;

        history.push({
          timestamp: currentMoment.valueOf(),
          price: Number(currentPrice.toFixed(2)),
          volume: volume,
        });
      }
      currentMoment.add(5, 'minutes');
    }

    return history;
  }

  private initializePriceHistory(): void {
    const now = moment();
    const thirtyDaysAgo = moment(now).subtract(30, 'days');

    this.simulationConfig.update(config => ({
      ...config,
      currentDate: now
    }));

    this.stocks.update(stocks =>
      stocks.map(stock => {
        const priceHistory = this.generateInitialHistory(
          stock.currentPrice,
          thirtyDaysAgo,
          now
        );

        const stockWithHistory = {
          ...stock,
          priceHistory,
          currentPrice: priceHistory[priceHistory.length - 1]?.price || stock.currentPrice
        };

        return {
          ...stockWithHistory,
          technicalIndicators: this.marketIndicatorsService.calculateTechnicalIndicators(stockWithHistory),
          fundamentalIndicators: this.marketIndicatorsService.initializeFundamentalIndicators()
        };
      })
    );
  }
}
