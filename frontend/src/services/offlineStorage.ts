import { DailySummary } from '../types';

const DAILY_CACHE_PREFIX = 'less_kcals_daily_';
const OFFLINE_QUEUE_KEY = 'less_kcals_offline_queue';

export interface QueuedAction {
  id: string;
  type: 'ADD_ITEM' | 'UPDATE_ITEM' | 'DELETE_ITEM' | 'SET_GOAL';
  payload: any;
  timestamp: number;
}

export const offlineStorage = {
  saveDailySummary(date: string, summary: DailySummary): void {
    try {
      localStorage.setItem(`${DAILY_CACHE_PREFIX}${date}`, JSON.stringify(summary));
    } catch (e) {
      console.warn('Erro ao salvar cache diário offline:', e);
    }
  },

  getDailySummary(date: string): DailySummary | null {
    try {
      const data = localStorage.getItem(`${DAILY_CACHE_PREFIX}${date}`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  enqueueAction(action: Omit<QueuedAction, 'id' | 'timestamp'>): void {
    try {
      const queue = this.getQueue();
      const newAction: QueuedAction = {
        ...action,
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now()
      };
      queue.push(newAction);
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn('Erro ao enfileirar ação offline:', e);
    }
  },

  getQueue(): QueuedAction[] {
    try {
      const data = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  clearQueue(): void {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  }
};
