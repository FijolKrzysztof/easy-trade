import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LearningCard } from '../../types/ui';

@Component({
  selector: 'app-learning-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
      @for (card of cards; track card.title) {
        <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
          <div class="p-4 border-b border-gray-100">
            <h2 class="flex items-center space-x-2">
              <span [innerHTML]="card.icon"></span>
              <span class="text-lg font-semibold">{{card.title}}</span>
            </h2>
          </div>
          <div class="p-4">
            @if (card.progress !== undefined) {
              <div class="space-y-2">
                <div class="h-2 bg-gray-200 rounded-full">
                  <div
                    class="h-full bg-blue-500 rounded-full"
                    [style.width.%]="card.progress"
                  ></div>
                </div>
                <div class="text-sm text-gray-600">{{card.progress}}% completed</div>
              </div>
            }
            @if (card.description) {
              <p class="text-gray-600 mb-2">{{card.description}}</p>
            }
            @if (card.stats) {
              <div class="text-sm text-gray-600">{{card.stats}}</div>
            }
            <button
              (click)="cardAction.emit(card.route)"
              class="text-blue-600 hover:text-blue-700 mt-2"
            >
              {{card.actionText}} →
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class LearningCardsComponent {
  @Input() cards!: LearningCard[];
  @Output() cardAction = new EventEmitter<string>();
}
