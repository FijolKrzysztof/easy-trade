import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AccountData } from '../types/account';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private mockAccountData: AccountData = {
    balance: 10000,
    username: 'John Smith',
    notifications: 2
  };

  private readonly accountDataSubject = new BehaviorSubject<AccountData>(this.mockAccountData);

  accountData$ = this.accountDataSubject.asObservable();

  updateBalance(amount: number): void {
    const currentData = this.accountDataSubject.value;
    this.accountDataSubject.next({
      ...currentData,
      balance: currentData.balance + amount
    });
  }

  getBalance(): number {
    return this.accountDataSubject.value.balance;
  }

  clearNotifications(): void {
    const currentData = this.accountDataSubject.value;
    this.accountDataSubject.next({
      ...currentData,
      notifications: 0
    });
  }
}
