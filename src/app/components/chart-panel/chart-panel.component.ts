import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ChartData, TimeframeOption } from '../../models/types';

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
            @for (period of timeframes; track period) {
              <button
                (click)="timeframeChange.emit(period)"
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
          [data]="chartData"
          [options]="chartOptions"
        ></p-chart>
      </div>
    </div>
  `
})
export class ChartPanelComponent {
  @Input() timeframes!: TimeframeOption[];
  @Input() selectedTimeframe!: TimeframeOption;
  @Input() chartData!: ChartData;
  @Input() chartOptions: any;
  @Output() timeframeChange = new EventEmitter<TimeframeOption>();

  getTimeframeButtonClass(timeframe: string): string {
    return `px-3 py-1 text-sm rounded ${
      this.selectedTimeframe === timeframe
        ? 'bg-blue-500 text-white'
        : 'bg-gray-100 hover:bg-gray-200'
    }`;
  }
}
