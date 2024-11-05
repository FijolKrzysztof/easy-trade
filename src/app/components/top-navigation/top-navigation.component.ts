import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { AccountService } from "../../services/account.service";
import { SimulationService } from "../../services/simulation.service";

@Component({
  selector: 'app-top-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-4 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] mb-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-6">
          <div class="text-2xl font-bold text-blue-600">EasyTrade</div>

          <!-- Kontrola Symulacji -->
          <div class="flex items-center space-x-3">
            <button
              (click)="toggleSimulation()"
              [class]="getSimulationButtonClass()"
            >
              {{ isSimulationRunning() ? 'Pause' : 'Start' }} Simulation
            </button>
            <select
              (change)="setSimulationSpeed($event)"
              class="px-3 py-1 text-sm rounded bg-gray-100 border border-gray-200"
            >
              <option value="1000">1x Speed</option>
              <option value="500">2x Speed</option>
              <option value="200">5x Speed</option>
            </select>
            <span class="text-sm text-gray-600">
              {{ simulationConfig().currentDate | date:'medium' }}
            </span>
          </div>
        </div>

        <div class="flex items-center space-x-6">
          <div class="flex items-center space-x-2">
            <i class="pi pi-bell text-blue-500 text-xl"></i>
            <span class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {{accountData()?.notifications}}
            </span>
          </div>
          <div class="flex flex-col items-end">
            <span class="text-green-500 font-semibold">{{accountData()?.balance}} $</span>
            <span class="text-sm text-gray-500">{{accountData()?.username}}</span>
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

  readonly simulationConfig = computed(() => this.simulationService.getSimulationConfig()());
  readonly isSimulationRunning = computed(() => this.simulationConfig().isRunning);

  toggleSimulation() {
    if (this.isSimulationRunning()) {
      this.simulationService.stopSimulation();
    } else {
      this.simulationService.startSimulation();
    }
  }

  setSimulationSpeed(event: Event) {
    const speed = Number((event.target as HTMLSelectElement).value);
    this.simulationService.setSimulationSpeed(speed);
  }

  getSimulationButtonClass(): string {
    return `px-3 py-1 text-sm rounded ${
      this.isSimulationRunning()
        ? 'bg-red-500 hover:bg-red-600 text-white'
        : 'bg-green-500 hover:bg-green-600 text-white'
    }`;
  }
}
