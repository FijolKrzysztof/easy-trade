import { Injectable, signal, computed, inject } from '@angular/core';
import { SimulationService } from './simulation.service';
import { ChartDataset, PricePoint, TimeframeOption } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private readonly simulationService = inject(SimulationService);

  // Sygnały
  private readonly selectedTimeframe = signal<TimeframeOption>('1D');
  private readonly selectedStockId = signal<string>('1');

  // Timeframes
  readonly timeframes: TimeframeOption[] = ['1D', '1W', '1M'];

  // Computed signal dla danych wykresu
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

  private prepareDayChartData(priceHistory: PricePoint[], currentDate: Date): ChartDataset {
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const filteredData = priceHistory.filter(point => {
      const pointDate = new Date(point.timestamp);
      return pointDate >= startOfDay && pointDate <= endOfDay;
    });

    return {
      labels: filteredData.map(point => {
        const date = new Date(point.timestamp);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      }),
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

  private prepareWeekChartData(priceHistory: PricePoint[], currentDate: Date): ChartDataset {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const filteredData = priceHistory.filter(point => {
      const pointDate = new Date(point.timestamp);
      return pointDate >= startOfWeek && pointDate <= currentDate;
    });

    return {
      labels: filteredData.map(point => {
        const date = new Date(point.timestamp);
        return `${date.toLocaleDateString('en-US', { weekday: 'short' })} ${date.getHours()}:00`;
      }),
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

  private prepareMonthChartData(priceHistory: PricePoint[], currentDate: Date): ChartDataset {
    const startOfMonth = new Date(currentDate);
    startOfMonth.setMonth(startOfMonth.getMonth() - 1);

    const filteredData = priceHistory.filter(point => {
      const pointDate = new Date(point.timestamp);
      return pointDate >= startOfMonth && pointDate <= currentDate;
    });

    return {
      labels: filteredData.map(point => {
        const date = new Date(point.timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
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

  // Public methods
  selectStock(stockId: string) {
    this.selectedStockId.set(stockId);
  }

  updateTimeframe(timeframe: TimeframeOption) {
    this.selectedTimeframe.set(timeframe);
  }

  getSelectedTimeframe() {
    return this.selectedTimeframe;
  }

  getSelectedStockId() {
    return this.selectedStockId;
  }
}
