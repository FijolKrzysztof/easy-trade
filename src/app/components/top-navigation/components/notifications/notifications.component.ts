import { Component, computed, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from "@angular/animations";
import { Notification } from "../../../../types/ui";

@Component({
    selector: 'app-notifications',
    standalone: true,
    imports: [CommonModule],
    templateUrl: 'notifications.component.html',
    animations: [
        trigger('notificationPanel', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(-10px)' }),
                animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
            ])
        ])
    ],
    styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent {
    notifications = signal<Notification[]>([
        {
            id: 1,
            title: "🚀 Welcome to EasyTrade Demo!",
            message: "This is a demo version of EasyTrade. Many features are still in development.",
            timestamp: "Just now",
            read: false
        },
        {
            id: 2,
            title: "💡 Current Features",
            message: "Currently you can: Start/pause the market simulation, adjust simulation speed, trade stocks via the beginner trading panel, and view your portfolio.",
            timestamp: "5 minutes ago",
            read: false
        },
        {
            id: 3,
            title: "📈 Trading Simulation Active",
            message: "Use the simulation controls at the top to manage market speed and trading activity.",
            timestamp: "10 minutes ago",
            read: false
        },
        {
            id: 4,
            title: "📊 Portfolio Tracking",
            message: "All your purchased stocks will appear in your portfolio section for easy tracking.",
            timestamp: "15 minutes ago",
            read: false
        }
    ]);

    isNotificationsPanelOpen = signal(false);
    unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

    @HostListener('document:click', ['$event'])
    onClick(event: MouseEvent) {
        const container = document.querySelector('.relative') as HTMLElement;
        if (container && !container.contains(event.target as Node)) {
            this.isNotificationsPanelOpen.set(false);
        }
    }

    getPanelClass(): string {
        const baseClass = 'bg-white rounded-lg shadow-lg border border-gray-200 z-50';
        return window.innerWidth < 640
            ? `fixed top-16 left-4 right-4 ${baseClass}`
            : `absolute right-0 top-10 w-80 ${baseClass}`;
    }

    getNotificationClass(notification: Notification): string {
        return `p-3 border-b border-gray-100 last:border-0 transition-colors cursor-pointer
           ${notification.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'}`;
    }

    toggleNotifications(): void {
        this.isNotificationsPanelOpen.update(v => !v);
    }

    markAsRead(id: number): void {
        this.notifications.update(notifications =>
            notifications.map(notification =>
                notification.id === id ? { ...notification, read: true } : notification
            )
        );
    }
}
