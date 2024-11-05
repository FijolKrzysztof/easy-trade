import { Injectable, signal } from '@angular/core';
import { PricePoint, TimeframeOption } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private readonly historicalData: PricePoint[] = this.generateHistoricalData();
  private readonly selectedTimeframe = signal<TimeframeOption>('1D');
  private readonly chartData = signal(this.prepareChartData('1D'));

  readonly timeframes: TimeframeOption[] = ['1D', '1W', '1M'];

  getSelectedTimeframe() {
    return this.selectedTimeframe;
  }

  getChartData() {
    return this.chartData;
  }

  updateTimeframe(timeframe: TimeframeOption): void {
    this.selectedTimeframe.set(timeframe);
    this.chartData.set(this.prepareChartData(timeframe));
  }

  private generateHistoricalData(): PricePoint[] {
    const data: PricePoint[] = [];
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 dni wstecz
    let currentDate = startDate;
    let currentPrice = 4580; // Startowa cena

    while (currentDate <= endDate) {
      // Pomijamy weekendy
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        // Tylko godziny handlowe (9:30 - 16:00)
        const hours = currentDate.getHours();
        const minutes = currentDate.getMinutes();
        if (
          (hours === 9 && minutes >= 30) ||
          (hours > 9 && hours < 16) ||
          (hours === 16 && minutes === 0)
        ) {
          // Symulacja zmian ceny z większą zmiennością na otwarciu i zamknięciu
          const timeOfDay = hours + minutes / 60;
          let volatility = 0.0005; // Bazowa zmienność

          // Zwiększona zmienność na otwarciu i zamknięciu
          if (timeOfDay < 10.5 || timeOfDay > 15) {
            volatility *= 2;
          }

          // Symulacja trendu dziennego
          const dailyTrend = Math.sin(currentDate.getDate() * 0.5) * 0.0002;

          // Obliczanie nowej ceny
          const change = currentPrice * (
            volatility * (Math.random() - 0.5) + // Losowa zmiana
            dailyTrend + // Trend dzienny
            0.00005 // Delikatny trend wzrostowy
          );

          currentPrice += change;

          // Symulacja wolumenu
          const baseVolume = 1000000;
          let volume = baseVolume + Math.random() * baseVolume;

          // Większy wolumen na otwarciu i zamknięciu
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
      // Przesuwamy o 5 minut
      currentDate = new Date(currentDate.getTime() + 5 * 60 * 1000);
    }
    return data;
  }

  private prepareChartData(timeframe: TimeframeOption) {
    const now = new Date();
    let filteredData: PricePoint[] = [];
    let labels: string[] = [];

    switch (timeframe) {
      case '1D': {
        const startOfDay = new Date(now);
        startOfDay.setHours(9, 30, 0, 0);

        filteredData = this.historicalData.filter(point =>
          point.timestamp >= startOfDay.getTime()
        );

        labels = filteredData.map(point => {
          const date = new Date(point.timestamp);
          return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        });
        break;
      }
      case '1W': {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);

        // Agregujemy dane do dziennych punktów
        filteredData = this.aggregateDataByDay(
          this.historicalData.filter(point => point.timestamp >= startOfWeek.getTime())
        );

        labels = filteredData.map(point => {
          const date = new Date(point.timestamp);
          return date.toLocaleDateString('en-US', { weekday: 'short' });
        });
        break;
      }
      case '1M': {
        const startOfMonth = new Date(now);
        startOfMonth.setMonth(now.getMonth() - 1);

        filteredData = this.aggregateDataByDay(
          this.historicalData.filter(point => point.timestamp >= startOfMonth.getTime())
        );

        labels = filteredData.map(point => {
          const date = new Date(point.timestamp);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        break;
      }
    }

    return {
      labels,
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

  private aggregateDataByDay(data: PricePoint[]): PricePoint[] {
    const dailyData = new Map<string, PricePoint[]>();

    // Grupujemy punkty po dniach
    data.forEach(point => {
      const date = new Date(point.timestamp);
      const dateKey = date.toISOString().split('T')[0];
      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, []);
      }
      dailyData.get(dateKey)!.push(point);
    });

    // Agregujemy dane dla każdego dnia
    return Array.from(dailyData.entries()).map(([dateKey, points]) => {
      const timestamp = new Date(dateKey).getTime();
      // OHLC można by też dodać
      const price = points[points.length - 1].price; // Cena zamknięcia
      const volume = points.reduce((sum, point) => sum + point.volume, 0);

      return { timestamp, price, volume };
    });
  }

  // Możemy też dodać live updates
  startLiveUpdates() {
    setInterval(() => {
      if (this.selectedTimeframe() === '1D') {
        const lastPoint = this.historicalData[this.historicalData.length - 1];
        const newTimestamp = lastPoint.timestamp + 5 * 60 * 1000;
        const change = lastPoint.price * 0.0005 * (Math.random() - 0.5);
        const newPrice = Number((lastPoint.price + change).toFixed(2));
        const newVolume = Math.round(1000000 + Math.random() * 1000000);

        this.historicalData.push({
          timestamp: newTimestamp,
          price: newPrice,
          volume: newVolume
        });

        // Aktualizujemy wykres
        this.chartData.set(this.prepareChartData('1D'));
      }
    }, 5000); // Co 5 sekund dla demonstracji
  }
}
