import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ChartService } from '../../../../services/chart.service';
import { SimulationService } from '../../../../services/simulation.service';
import * as moment from 'moment';
import { TimeframeOption } from '../../../../types/ui';
import { CHART_CONFIG } from '../../../../configs/chart-config';
import { MARKET_HOURS, TRADING_DAYS } from "../../../../configs/market-config";

@Component({
  selector: 'app-chart-panel',
  standalone: true,
  imports: [CommonModule, ChartModule],
  template: `
    <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <div class="p-4 border-b border-gray-100">
        <div class="flex flex-row items-center justify-between">
          <div class="flex items-center space-x-4">
            <h2 class="text-lg font-semibold">Market Data</h2>
            <div class="flex space-x-2">
              @for (stock of availableStocks(); track stock.id) {
                <button
                    (click)="selectStock(stock.id)"
                    [class]="getStockButtonClass(stock.id)"
                >
                  {{ stock.ticker }}
                </button>
              }
            </div>
          </div>

          <div class="flex space-x-2">
            @for (period of chartService.timeframes; track period) {
              <button
                  (click)="onTimeframeChange(period)"
                  [class]="getTimeframeButtonClass(period)"
              >
                {{period}}
              </button>
            }
          </div>
        </div>

        <div class="mt-2 text-sm text-gray-500">
          {{ formatDate(currentDate()) }}
        </div>
      </div>

      <div class="flex-1 p-4 relative">
        @if (hasData()) {
          <p-chart
              type="line"
              [data]="chartService.chartData()"
              [options]="CHART_CONFIG"
          ></p-chart>
        } @else {
          <div class="w-full" style="aspect-ratio: 2/1;">
            <div class="absolute inset-0 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center flex-col">
              <div class="flex flex-col items-center space-y-3">
                <svg
                    class="w-12 h-12 text-gray-300 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                  <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p class="text-lg font-semibold text-gray-600">{{ getNoDataMessage() }}</p>
                <p class="text-sm text-gray-500">
                  Trading hours: {{MARKET_HOURS.OPEN.HOUR}}:{{MARKET_HOURS.OPEN.MINUTE.toString().padStart(2, '0')}} AM - {{MARKET_HOURS.CLOSE.HOUR}}:00 PM ET, Mon-Fri
                </p>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ChartPanelComponent {
  readonly chartService = inject(ChartService);
  readonly simulationService = inject(SimulationService);

  availableStocks = computed(() => this.simulationService.getStocks()());
  currentDate = computed(() => this.simulationService.getSimulationConfig()().currentDate);
  hasData = computed(() => {
    const data = this.chartService.chartData();
    return data?.datasets?.[0]?.data?.length > 0;
  });

  readonly CHART_CONFIG = CHART_CONFIG;
  readonly MARKET_HOURS = MARKET_HOURS;

  getNoDataMessage(): string {
    const currentDate = this.currentDate();
    const currentHour = currentDate.hour();
    const currentMinute = currentDate.minute();
    const currentDay = currentDate.day();

    if (!TRADING_DAYS.includes(currentDay)) {
      return 'Market is closed (Weekend)';
    }

    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const marketOpenInMinutes = MARKET_HOURS.OPEN.HOUR * 60 + MARKET_HOURS.OPEN.MINUTE;
    const marketCloseInMinutes = MARKET_HOURS.CLOSE.HOUR * 60;

    if (currentTimeInMinutes < marketOpenInMinutes) {
      return 'Market has not opened yet';
    } else if (currentTimeInMinutes >= marketCloseInMinutes) {
      return 'Market is closed for the day';
    }

    return 'No market data available';
  }

  selectStock(stockId: string): void {
    this.chartService.selectStock(stockId);
  }

  onTimeframeChange(timeframe: TimeframeOption): void {
    this.chartService.updateTimeframe(timeframe);
  }

  getTimeframeButtonClass(timeframe: string): string {
    return `px-3 py-1 text-sm rounded ${
        this.chartService.getSelectedTimeframe()() === timeframe
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 hover:bg-gray-200'
    }`;
  }

  getStockButtonClass(stockId: string): string {
    return `px-3 py-1 text-sm rounded ${
        this.chartService.getSelectedStockId()() === stockId
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 hover:bg-gray-200'
    }`;
  }

  formatDate(date: moment.Moment): string {
    return date.format('YYYY-MM-DD HH:mm:ss');
  }
}
