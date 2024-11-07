import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ChartService } from '../../services/chart.service';
import { SimulationService } from '../../services/simulation.service';
import { TimeframeOption } from '../../models/types';
import * as moment from 'moment';

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

      <div class="flex-1 p-4">
        <p-chart
          type="line"
          [data]="chartService.chartData()"
          [options]="chartOptions"
        ></p-chart>
      </div>
    </div>
  `
})
export class ChartPanelComponent {
  readonly chartService = inject(ChartService);
  private readonly simulationService = inject(SimulationService);

  readonly availableStocks = computed(() => this.simulationService.getStocks()());
  readonly currentDate = computed(() => this.simulationService.getSimulationConfig()().currentDate);

  readonly chartOptions = {
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1e293b',
        bodyColor: '#1e293b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context: any) => `$${context.parsed.y.toFixed(2)}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#64748b',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8
        }
      },
      y: {
        position: 'right',
        grid: {
          color: '#e2e8f0'
        },
        ticks: {
          color: '#64748b',
          callback: (value: number) => `$${value.toFixed(2)}`,
          maxTicksLimit: 6
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 4
      }
    },
    animation: {
      duration: 0
    }
  };

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
