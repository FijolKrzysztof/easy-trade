import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../services/portfolio.service';
import { HistoricalTrackingService } from '../../services/historical-tracking.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <!-- Header section -->
      <div class="p-4 border-b border-gray-100">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">Your Portfolio</h2>
          <div class="text-sm space-y-1">
            <div class="text-gray-500">
              Total Equity: {{ totalEquity() | currency }}
            </div>
            <div class="text-gray-500">
              Cash Balance: {{ cashBalance() | currency }}
            </div>
          </div>
        </div>
      </div>

      <!-- Portfolio positions -->
      <div class="p-4">
        <div class="space-y-3">
          @for (item of portfolio(); track item.symbol) {
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <div class="font-medium">{{item.symbol}}</div>
                <div class="text-sm text-gray-500">{{item.shares}} shares {{item.averagePrice | currency}}</div>
              </div>
              <div class="text-right">
                <div [class]="getPercentageClass(getPriceChange(item))">
                  {{item.currentPrice | currency}}
                  ({{getPriceChange(item) > 0 ? '+' : ''}}{{getPriceChange(item).toFixed(2)}}%)
                </div>
                <div class="text-sm">
                  Market Value: {{item.value | currency}}
                </div>
                <div [class]="getPercentageClass(item.unrealizedPL)" class="text-sm">
                  P/L: {{item.unrealizedPL | currency}}
                </div>
              </div>
            </div>
          }

          @if (portfolio().length === 0) {
            <div class="text-center p-4 text-gray-500">
              <i class="fas fa-folder-open mb-2"></i>
              <p>No stocks in your portfolio</p>
            </div>
          }
        </div>

        @if (portfolio().length > 0) {
          <div class="mt-4 pt-4 border-t border-gray-100">
            <div class="grid grid-cols-3 gap-4">
              <div class="p-3 bg-gray-50 rounded-lg">
                <div class="text-sm text-gray-500">Daily Change</div>
                <div [class]="getPercentageClass(dailyChange())">
                  {{ dailyChange() > 0 ? '+' : '' }}{{ dailyChange().toFixed(2) }}%
                </div>
              </div>
              <div class="p-3 bg-gray-50 rounded-lg">
                <div class="text-sm text-gray-500">Total Return</div>
                <div [class]="getPercentageClass(totalReturn())">
                  {{ totalReturn() > 0 ? '+' : '' }}{{ totalReturn().toFixed(2) }}%
                </div>
              </div>
              <div class="p-3 bg-gray-50 rounded-lg">
                <div class="text-sm text-gray-500">Unrealized P/L</div>
                <div [class]="getPercentageClass(totalUnrealizedPL())">
                  {{ totalUnrealizedPL() | currency }}
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class PortfolioComponent {
  readonly portfolioService = inject(PortfolioService);
  readonly historicalService = inject(HistoricalTrackingService);

  portfolio = toSignal(this.portfolioService.portfolio$, { initialValue: [] });
  historicalData = toSignal(this.historicalService.historicalData$, { initialValue: [] });

  cashBalance = computed(() => this.portfolioService.getCashBalance());

  totalEquity = computed(() => {
    const summary = this.portfolioService.getPortfolioSummary();
    return summary.totalEquity;
  });

  totalUnrealizedPL = computed(() => {
    return this.portfolio().reduce((sum, item) => sum + item.unrealizedPL, 0);
  });

  dailyChange = computed(() => {
    const history = this.historicalData();
    if (history.length < 2) return 0;

    const previousValue = history[history.length - 2].totalEquity;
    const currentValue = history[history.length - 1].totalEquity;

    return ((currentValue - previousValue) / previousValue) * 100;
  });

  totalReturn = computed(() => {
    const history = this.historicalData();
    if (history.length === 0) return 0;

    const initialValue = history[0].totalEquity;
    const currentValue = this.totalEquity();

    return ((currentValue - initialValue) / initialValue) * 100;
  });

  getPriceChange(item: any): number {
    return ((item.currentPrice - item.averagePrice) / item.averagePrice) * 100;
  }

  getPercentageClass(change: number): string {
    if (change === 0) return 'text-gray-500';
    return change > 0 ? 'text-green-500' : 'text-red-500';
  }
}
