import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { AccountService } from "../../services/account.service";
import { SimulationService } from "../../services/simulation.service";
import * as moment from 'moment';

@Component({
  selector: 'app-top-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-2 sm:p-4 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] mb-4">
      <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-3 lg:space-y-0">

        <div class="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
          <div class="text-xl sm:text-2xl font-bold text-blue-600">EasyTrade</div>

          <div class="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
                (click)="toggleSimulation()"
                [class]="getSimulationButtonClass()"
            >
              {{ isSimulationRunning() ? 'Pause' : 'Start' }}
              <span class="hidden sm:inline"> Simulation</span>
            </button>

            <select
                (change)="setSimulationSpeed($event)"
                class="px-2 sm:px-3 py-1 text-sm rounded bg-gray-100 border border-gray-200"
            >
              <option value="1000">1x</option>
              <option value="500">2x</option>
              <option value="200">5x</option>
              <option value="100">10x</option>
              <option value="50">20x</option>
            </select>

            <span class="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
              {{ formatDate(simulationConfig().currentDate) }}
            </span>
          </div>
        </div>

        <div class="flex items-center justify-between sm:justify-end sm:space-x-6">
          <div class="flex items-center space-x-2">
            <i class="pi pi-bell text-blue-500 text-lg sm:text-xl"></i>
            <span class="bg-red-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
              {{accountData()?.notifications}}
            </span>
          </div>

          <div class="flex flex-col items-end">
            <span class="text-sm sm:text-base text-green-500 font-semibold">{{accountData()?.balance}} $</span>
            <span class="text-xs sm:text-sm text-gray-500">{{accountData()?.username}}</span>
          </div>
        </div>

      </div>
    </div>
  `
})
export class TopNavigationComponent {
  readonly accountService = inject(AccountService);
  readonly simulationService = inject(SimulationService);

  accountData = toSignal(this.accountService.accountData$);
  simulationConfig = computed(() => this.simulationService.getSimulationConfig()());
  isSimulationRunning = computed(() => this.simulationConfig().isRunning);

  toggleSimulation(): void {
    if (this.isSimulationRunning()) {
      this.simulationService.stopSimulation();
    } else {
      this.simulationService.startSimulation();
    }
  }

  setSimulationSpeed(event: Event): void {
    const speed = Number((event.target as HTMLSelectElement).value);
    this.simulationService.setSimulationSpeed(speed);
  }

  getSimulationButtonClass(): string {
    return `px-2 sm:px-3 py-1 text-sm rounded whitespace-nowrap ${
        this.isSimulationRunning()
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white'
    }`;
  }

  formatDate(date: moment.Moment): string {
    return date.format('YYYY-MM-DD HH:mm:ss');
  }
}
