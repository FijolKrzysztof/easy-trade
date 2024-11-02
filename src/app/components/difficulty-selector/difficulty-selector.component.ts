import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DifficultyLevel, DifficultyType } from '../../models/types';

@Component({
  selector: 'app-difficulty-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-4 rounded-lg shadow-sm mb-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Interface Level</h2>
        <div class="flex items-center space-x-4">
          @for (item of Object.entries(difficultyLevels); track item[0]) {
            <button
              (click)="setDifficulty(item[0])"
              class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
              [class]="selectedDifficulty === item[0] ?
                      item[1].bgColor + ' ' + item[1].color :
                      'bg-gray-50 text-gray-600 hover:bg-gray-100'"
            >
              <i [class]="item[1].icon"></i>
              <span>{{item[1].name}}</span>
            </button>
          }
        </div>
      </div>

      <div
        class="p-4 rounded-lg bg-opacity-50"
        [class]="difficultyLevels[selectedDifficulty].bgColor"
      >
        <div class="flex items-start space-x-4">
          <div class="flex-1">
            <h3 class="font-medium mb-1">
              {{difficultyLevels[selectedDifficulty].description}}
            </h3>
            <div class="text-sm text-gray-600">
              Features: {{difficultyLevels[selectedDifficulty].features.join(', ')}}
            </div>
          </div>
          <div class="flex items-center space-x-2 text-sm">
            <i class="pi pi-book"></i>
            <span>Recommended: {{difficultyLevels[selectedDifficulty].recommendedLesson}}</span>
            <button
              class="text-blue-500 hover:text-blue-600"
              (click)="startLearning.emit(difficultyLevels[selectedDifficulty].recommendedLesson)"
            >
              Start Learning →
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DifficultySelectorComponent {
  @Input() selectedDifficulty!: DifficultyType;
  @Output() difficultyChange = new EventEmitter<DifficultyType>();
  @Output() startLearning = new EventEmitter<string>();

  difficultyLevels: Record<DifficultyType, DifficultyLevel> = {
    beginner: {
      name: "Beginner",
      icon: "pi pi-shield",
      color: "text-green-500",
      bgColor: "bg-green-100",
      description: "Basic buy/sell with market orders",
      recommendedLesson: "Stock Market Basics",
      features: ["Market orders", "Basic chart", "Simple portfolio view"]
    },
    intermediate: {
      name: "Intermediate",
      icon: "pi pi-compass",
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      description: "Limit orders and basic analysis",
      recommendedLesson: "Understanding Order Types",
      features: ["Limit orders", "Stop orders", "Technical indicators", "Order book"]
    },
    advanced: {
      name: "Advanced",
      icon: "pi pi-bolt",
      color: "text-purple-500",
      bgColor: "bg-purple-100",
      description: "Full trading capabilities",
      recommendedLesson: "Advanced Trading Strategies",
      features: ["All order types", "Advanced charts", "Trading algorithms", "Risk management"]
    }
  };

  setDifficulty(difficulty: string): void {
    this.difficultyChange.emit(difficulty as DifficultyType);
  }

  protected readonly Object = Object;
}
