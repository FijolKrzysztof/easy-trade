import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ChartService } from '../../services/chart.service';
import { TimeframeOption } from '../../models/types';

@Component({
  selector: 'app-chart-panel',
  standalone: true,
  imports: [CommonModule, ChartModule],
  template: `
    <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <div class="p-4 border-b border-gray-100">
        <div class="flex flex-row items-center justify-between">
          <h2 class="text-lg font-semibold">S&P 500 - Daily Chart</h2>
          <div class="flex space-x-2">
            <div class="flex space-x-2 mr-4">
              <button
                (click)="toggleLiveUpdates()"
                [class]="getLiveUpdateButtonClass()"
              >
                {{ isLiveEnabled ? 'Pause' : 'Start' }} Live Updates
              </button>
              <button
                (click)="refreshData()"
                class="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200"
              >
                Refresh
              </button>
            </div>
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
      </div>
      <div class="flex-1 p-4">
        <p-chart
          type="line"
          [data]="chartService.getChartData()()"
          [options]="options"
        ></p-chart>
      </div>
    </div>
  `
})
export class ChartPanelComponent implements OnInit, OnDestroy {
  readonly chartService = inject(ChartService);
  isLiveEnabled = false;

  readonly options = {
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
          label: (context: any) => {
            return `$${context.parsed.y.toFixed(2)}`;
          }
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
          callback: (value: number) => `$${value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
          })}`,
          maxTicksLimit: 6
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 4,
        hoverBorderWidth: 2
      }
    },
    transitions: {
      zoom: {
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    },
    animation: true
  };

  ngOnInit() {
    // Nie startujemy live updates automatycznie
  }

  ngOnDestroy() {
    // Zatrzymujemy symulację przy zniszczeniu komponentu
    this.chartService.configureSimulation({ enabled: false });
  }

  toggleLiveUpdates() {
    this.isLiveEnabled = !this.isLiveEnabled;
    this.chartService.configureSimulation({ enabled: this.isLiveEnabled });
  }

  refreshData() {
    this.chartService.refreshData();
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

  getLiveUpdateButtonClass(): string {
    return `px-3 py-1 text-sm rounded ${
      this.isLiveEnabled
        ? 'bg-green-500 text-white'
        : 'bg-gray-100 hover:bg-gray-200'
    }`;
  }
}
