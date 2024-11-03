import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DifficultyLevel {
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  recommendedLesson: string;
  features: string[];
}

interface DifficultyLevels {
  [key: string]: DifficultyLevel;
}

@Component({
  selector: 'app-difficulty-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-4 rounded-lg mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Interface Level</h2>
        <div class="flex items-center space-x-4">
          @for (level of getDifficultyLevels(); track level[0]) {
            <button
              (click)="setDifficultyLevel(level[0])"
              [class]="getLevelButtonClass(level[0])"
            >
              <i [class]="level[1].icon"></i>
              <span>{{ level[1].name }}</span>
            </button>
          }
        </div>
      </div>

      <div [class]="'p-4 rounded-lg ' + difficultyLevels[selectedLevel].bgColor + ' bg-opacity-50'">
        <div class="flex items-start space-x-4">
          <div class="flex-1">
            <h3 class="font-medium mb-1">{{ difficultyLevels[selectedLevel].description }}</h3>
            <div class="text-sm text-gray-600">
              Features: {{ difficultyLevels[selectedLevel].features.join(', ') }}
            </div>
          </div>
          <div class="flex items-center space-x-2 text-sm">
            <i class="fas fa-book"></i>
            <span>Recommended: {{ difficultyLevels[selectedLevel].recommendedLesson }}</span>
            <button class="text-blue-500 hover:text-blue-600">Start Learning →</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DifficultySelectorComponent {
  @Output() levelChange = new EventEmitter<string>();

  selectedLevel: string = 'beginner';

  difficultyLevels: DifficultyLevels = {
    beginner: {
      name: "Beginner",
      icon: "fas fa-shield",
      color: "text-green-500",
      bgColor: "bg-green-100",
      description: "Basic buy/sell with market orders",
      recommendedLesson: "Stock Market Basics",
      features: ["Market orders", "Basic chart", "Simple portfolio view"]
    },
    intermediate: {
      name: "Intermediate",
      icon: "fas fa-gauge",
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      description: "Limit orders and basic analysis",
      recommendedLesson: "Understanding Order Types",
      features: ["Limit orders", "Stop orders", "Technical indicators", "Order book"]
    },
    advanced: {
      name: "Advanced",
      icon: "fas fa-bolt",
      color: "text-purple-500",
      bgColor: "bg-purple-100",
      description: "Full trading capabilities",
      recommendedLesson: "Advanced Trading Strategies",
      features: ["All order types", "Advanced charts", "Trading algorithms", "Risk management"]
    }
  };

  getDifficultyLevels() {
    return Object.entries(this.difficultyLevels);
  }

  setDifficultyLevel(level: string) {
    this.selectedLevel = level;
    this.levelChange.emit(level);
  }

  getLevelButtonClass(level: string): string {
    const baseClasses = 'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors';
    if (level === this.selectedLevel) {
      return `${baseClasses} ${this.difficultyLevels[level].bgColor} ${this.difficultyLevels[level].color}`;
    }
    return `${baseClasses} bg-gray-50 text-gray-600 hover:bg-gray-100`;
  }
}
