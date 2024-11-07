import { Injectable, signal, computed, inject } from '@angular/core';
import { SimulationService } from './simulation.service';
import { ChartDataset, PricePoint, TimeframeOption } from '../models/types';
import moment from 'moment';
import { Moment } from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private readonly simulationService = inject(SimulationService);
  private readonly selectedTimeframe = signal<TimeframeOption>('1D');
  private readonly selectedStockId = signal<string>('1');
  readonly timeframes: TimeframeOption[] = ['1D', '1W', '1M'];

  readonly chartData = computed(() => {
    const stock = this.simulationService.getStocks()()
      .find(s => s.id === this.selectedStockId());

    if (!stock) return this.getEmptyChartData();

    const simulationDate = this.simulationService.getSimulationConfig()().currentDate;
    const priceHistory = stock.priceHistory;

    switch (this.selectedTimeframe()) {
      case '1D':
        return this.prepareDayChartData(priceHistory, simulationDate);
      case '1W':
        return this.prepareWeekChartData(priceHistory, simulationDate);
      case '1M':
        return this.prepareMonthChartData(priceHistory, simulationDate);
    }
  });

  selectStock(stockId: string): void {
    this.selectedStockId.set(stockId);
  }

  updateTimeframe(timeframe: TimeframeOption): void {
    this.selectedTimeframe.set(timeframe);
  }

  getSelectedTimeframe() {
    return this.selectedTimeframe;
  }

  getSelectedStockId() {
    return this.selectedStockId;
  }

  private prepareDayChartData(priceHistory: PricePoint[], currentDate: Moment): ChartDataset {
    const startOfDay = moment(currentDate).startOf('day');
    const endOfDay = moment(currentDate).endOf('day');

    const filteredData = priceHistory.filter(point => {
      const pointDate = moment(point.timestamp);
      return pointDate.isBetween(startOfDay, endOfDay, 'minute', '[]');
    });

    return {
      labels: filteredData.map(point => moment(point.timestamp).format('HH:mm')),
      datasets: [{
        label: 'Price',
        data: filteredData.map(point => point.price),
        fill: true,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4
      }]
    };
  }

  private prepareWeekChartData(priceHistory: PricePoint[], currentDate: Moment): ChartDataset {
    const startOfWeek = moment(currentDate).subtract(7, 'days');

    const filteredData = priceHistory.filter(point => {
      const pointDate = moment(point.timestamp);
      return pointDate.isBetween(startOfWeek, currentDate, 'minute', '[]');
    });

    return {
      labels: filteredData.map(point => moment(point.timestamp).format('ddd HH:00')),
      datasets: [{
        label: 'Price',
        data: filteredData.map(point => point.price),
        fill: true,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4
      }]
    };
  }

  private prepareMonthChartData(priceHistory: PricePoint[], currentDate: Moment): ChartDataset {
    const startOfMonth = moment(currentDate).subtract(1, 'month');

    const filteredData = priceHistory.filter(point => {
      const pointDate = moment(point.timestamp);
      return pointDate.isBetween(startOfMonth, currentDate, 'minute', '[]');
    });

    return {
      labels: filteredData.map(point => moment(point.timestamp).format('MMM D')),
      datasets: [{
        label: 'Price',
        data: filteredData.map(point => point.price),
        fill: true,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4
      }]
    };
  }

  private getEmptyChartData(): ChartDataset {
    return {
      labels: [],
      datasets: [{
        label: 'Price',
        data: [],
        fill: true,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4
      }]
    };
  }
}
