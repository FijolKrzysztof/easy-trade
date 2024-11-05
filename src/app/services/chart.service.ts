import { Injectable, signal, computed } from '@angular/core';
import { PricePoint, TimeframeOption } from '../models/types';

interface TimeframeData {
  minutely: PricePoint[];
  hourly: PricePoint[];
  daily: PricePoint[];
}

interface ChartDataset {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    fill: boolean;
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }>;
}

interface OHLCData extends PricePoint {
  open: number;
  high: number;
  low: number;
  close: number;
}

interface SimulationConfig {
  interval: number;  // in milliseconds
  enabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  // Private properties
  private readonly historicalData: PricePoint[] = [];
  private simulationInterval?: number;

  // Signals
  private readonly selectedTimeframe = signal<TimeframeOption>('1D');
  private readonly timeframeData = signal<TimeframeData>({ minutely: [], hourly: [], daily: [] });
  private readonly simulationConfig = signal<SimulationConfig>({
    interval: 100,
    enabled: false
  });

  // Public properties
  readonly timeframes: TimeframeOption[] = ['1D', '1W', '1M'];

  // Computed signals
  private readonly chartData = computed(() => {
    const data = this.timeframeData();
    const now = new Date();

    switch (this.selectedTimeframe()) {
      case '1D':
        return this.prepareDayChartData(data.minutely, now);
      case '1W':
        return this.prepareWeekChartData(data.hourly, now);
      case '1M':
        return this.prepareMonthChartData(data.daily, now);
    }
  });

  constructor() {
    this.historicalData = this.generateHistoricalData();
    this.timeframeData.set(this.aggregateAllTimeframes());
  }

  // Public methods
  getSelectedTimeframe() {
    return this.selectedTimeframe;
  }

  getChartData() {
    return this.chartData;
  }

  updateTimeframe(timeframe: TimeframeOption): void {
    this.selectedTimeframe.set(timeframe);
  }

  configureSimulation(config: Partial<SimulationConfig>) {
    const currentConfig = this.simulationConfig();
    this.simulationConfig.set({ ...currentConfig, ...config });

    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = undefined;
    }

    if (config.enabled) {
      this.startLiveUpdates();
    }
  }

  refreshData() {
    this.timeframeData.set(this.aggregateAllTimeframes());
  }

  // Private methods for data generation and processing
  private generateHistoricalData(): PricePoint[] {
    const data: PricePoint[] = [];
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days back
    let currentDate = startDate;
    let currentPrice = 4580;

    while (currentDate <= endDate) {
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) { // Skip weekends
        const hours = currentDate.getHours();
        const minutes = currentDate.getMinutes();

        // Only generate data during market hours (9:30 AM - 4:00 PM)
        if ((hours === 9 && minutes >= 30) || (hours > 9 && hours < 16) || (hours === 16 && minutes === 0)) {
          const timeOfDay = hours + minutes / 60;
          let volatility = 0.0005;

          // Increased volatility at market open and close
          if (timeOfDay < 10.5 || timeOfDay > 15) {
            volatility *= 2;
          }

          const dailyTrend = Math.sin(currentDate.getDate() * 0.5) * 0.0002;
          const change = currentPrice * (
            volatility * (Math.random() - 0.5) +
            dailyTrend +
            0.00005
          );

          currentPrice += change;

          const baseVolume = 1000000;
          let volume = baseVolume + Math.random() * baseVolume;

          if (timeOfDay < 10.5 || timeOfDay > 15) {
            volume *= 2;
          }

          data.push({
            timestamp: currentDate.getTime(),
            price: Number(currentPrice.toFixed(2)),
            volume: Math.round(volume)
          });
        }
      }
      currentDate = new Date(currentDate.getTime() + 5 * 60 * 1000); // 5-minute intervals
    }
    return data;
  }

  private aggregateAllTimeframes(): TimeframeData {
    const minutely = [...this.historicalData].sort((a, b) => a.timestamp - b.timestamp);
    const hourly = this.aggregateToHourly(minutely);
    const daily = this.aggregateToDaily(hourly);

    return { minutely, hourly, daily };
  }

  private aggregateToHourly(minutelyData: PricePoint[]): OHLCData[] {
    const hourlyMap = new Map<string, PricePoint[]>();

    minutelyData.forEach(point => {
      const date = new Date(point.timestamp);
      const hourKey = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours()
      ).getTime().toString();

      if (!hourlyMap.has(hourKey)) {
        hourlyMap.set(hourKey, []);
      }
      hourlyMap.get(hourKey)!.push(point);
    });

    return Array.from(hourlyMap.entries())
      .map(([timestamp, points]) => {
        const sortedPoints = points.sort((a, b) => a.timestamp - b.timestamp);

        return {
          timestamp: Number(timestamp),
          price: sortedPoints[sortedPoints.length - 1].price,
          volume: sortedPoints.reduce((sum, point) => sum + point.volume, 0),
          open: sortedPoints[0].price,
          high: Math.max(...sortedPoints.map(p => p.price)),
          low: Math.min(...sortedPoints.map(p => p.price)),
          close: sortedPoints[sortedPoints.length - 1].price
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  private aggregateToDaily(hourlyData: OHLCData[]): OHLCData[] {
    const dailyMap = new Map<string, OHLCData[]>();

    hourlyData.forEach(point => {
      const date = new Date(point.timestamp);
      const dayKey = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      ).getTime().toString();

      if (!dailyMap.has(dayKey)) {
        dailyMap.set(dayKey, []);
      }
      dailyMap.get(dayKey)!.push(point);
    });

    return Array.from(dailyMap.entries())
      .map(([timestamp, points]) => {
        const sortedPoints = points.sort((a, b) => a.timestamp - b.timestamp);

        return {
          timestamp: Number(timestamp),
          price: sortedPoints[sortedPoints.length - 1].close,
          volume: sortedPoints.reduce((sum, point) => sum + point.volume, 0),
          open: sortedPoints[0].open,
          high: Math.max(...sortedPoints.map(p => p.high)),
          low: Math.min(...sortedPoints.map(p => p.low)),
          close: sortedPoints[sortedPoints.length - 1].close
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  // Private methods for chart data preparation
  private prepareDayChartData(minutelyData: PricePoint[], now: Date): ChartDataset {
    const startOfDay = new Date(now);
    startOfDay.setHours(9, 30, 0, 0);

    // If it's past market hours, move to the next day
    if (now.getHours() >= 16) {
      startOfDay.setDate(startOfDay.getDate() + 1);
    }

    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(16, 0, 0, 0);

    const filteredData = minutelyData.filter(point =>
      point.timestamp >= startOfDay.getTime() &&
      point.timestamp <= endOfDay.getTime()
    );

    return {
      labels: filteredData.map(point => {
        const date = new Date(point.timestamp);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      }),
      datasets: [{
        label: 'S&P 500',
        data: filteredData.map(point => point.price),
        fill: true,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4
      }]
    };
  }

  private prepareWeekChartData(hourlyData: PricePoint[], now: Date): ChartDataset {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const filteredData = hourlyData.filter(point =>
      point.timestamp >= startOfWeek.getTime()
    );

    return {
      labels: filteredData.map(point => {
        const date = new Date(point.timestamp);
        return `${date.toLocaleDateString('en-US', { weekday: 'short' })} ${date.getHours()}:00`;
      }),
      datasets: [{
        label: 'S&P 500',
        data: filteredData.map(point => point.price),
        fill: true,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4
      }]
    };
  }

  private prepareMonthChartData(dailyData: PricePoint[], now: Date): ChartDataset {
    const startOfMonth = new Date(now);
    startOfMonth.setMonth(now.getMonth() - 1);

    const filteredData = dailyData.filter(point =>
      point.timestamp >= startOfMonth.getTime()
    );

    return {
      labels: filteredData.map(point => {
        const date = new Date(point.timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [{
        label: 'S&P 500',
        data: filteredData.map(point => point.price),
        fill: true,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4
      }]
    };
  }

  private startLiveUpdates() {
    const config = this.simulationConfig();
    if (!config.enabled) return;

    this.simulationInterval = window.setInterval(() => {
      const lastPoint = this.historicalData[this.historicalData.length - 1];
      const newTimestamp = lastPoint.timestamp + 5 * 60 * 1000; // 5-minute intervals
      const change = lastPoint.price * 0.0005 * (Math.random() - 0.5);
      const newPrice = Number((lastPoint.price + change).toFixed(2));
      const newVolume = Math.round(1000000 + Math.random() * 1000000);

      const newPoint = {
        timestamp: newTimestamp,
        price: newPrice,
        volume: newVolume
      };

      this.historicalData.push(newPoint);
      this.timeframeData.set(this.aggregateAllTimeframes());
    }, config.interval);
  }
}
