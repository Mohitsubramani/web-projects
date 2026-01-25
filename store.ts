
import { useState, useEffect, useCallback } from 'react';
import { StoreState, FoodItem, Order, OrderStatus } from './types';
import { INITIAL_INVENTORY, OWNER_PIN, RECOVERY_PHONE, DEFAULT_SECURITY_QUESTION, DEFAULT_SECURITY_ANSWER, DISCORD_WEBHOOK_URL } from './constants';

const STORE_KEY = 'stallease_storage_v3'; 

interface VersionedState extends StoreState {
  version: number;
}

export const useStore = () => {
  const [state, setState] = useState<VersionedState>(() => {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.ownerPin) parsed.ownerPin = OWNER_PIN;
      if (!parsed.recoveryPhone) parsed.recoveryPhone = RECOVERY_PHONE;
      if (!parsed.securityQuestion) parsed.securityQuestion = DEFAULT_SECURITY_QUESTION;
      if (!parsed.securityAnswer) parsed.securityAnswer = DEFAULT_SECURITY_ANSWER;
      if (parsed.discordWebhook === undefined) parsed.discordWebhook = DISCORD_WEBHOOK_URL;
      return parsed;
    }
    return {
      inventory: INITIAL_INVENTORY,
      orders: [],
      nextToken: 1,
      ownerPin: OWNER_PIN,
      recoveryPhone: RECOVERY_PHONE,
      securityQuestion: DEFAULT_SECURITY_QUESTION,
      securityAnswer: DEFAULT_SECURITY_ANSWER,
      discordWebhook: DISCORD_WEBHOOK_URL,
      version: Date.now()
    };
  });

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORE_KEY && e.newValue) {
        const newState = JSON.parse(e.newValue);
        if (newState.version > state.version) {
          setState(newState);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [state.version]);

  const updateInventory = useCallback((items: FoodItem[]) => {
    setState(prev => ({ ...prev, inventory: items, version: Date.now() }));
  }, []);

  const addOrder = useCallback((order: Order) => {
    setState(prev => {
      if (prev.orders.some(o => o.id === order.id)) return prev;
      return { ...prev, orders: [...prev.orders, order], version: Date.now() };
    });
  }, []);

  const updateOrder = useCallback((orderId: string, updates: Partial<Order>) => {
    setState(prev => {
      const orderExists = prev.orders.some(o => o.id === orderId);
      if (!orderExists) return prev;

      let nextToken = prev.nextToken;
      const updatedOrders = prev.orders.map(o => {
        if (o.id === orderId) {
          const finalUpdates = { ...updates };
          const isAssigningToken = 
            updates.status === OrderStatus.PREPARING && 
            o.status !== OrderStatus.PREPARING && 
            !o.token;

          if (isAssigningToken) {
            finalUpdates.token = nextToken;
            nextToken++;
          }
          return { ...o, ...finalUpdates };
        }
        return o;
      });

      return { ...prev, orders: updatedOrders, nextToken, version: Date.now() };
    });
  }, []);

  const updatePin = useCallback((newPin: string) => {
    setState(prev => ({ ...prev, ownerPin: newPin, version: Date.now() }));
  }, []);

  const updateRecoveryPhone = useCallback((phone: string) => {
    setState(prev => ({ ...prev, recoveryPhone: phone, version: Date.now() }));
  }, []);

  const updateSecurityInfo = useCallback((question: string, answer: string) => {
    setState(prev => ({ ...prev, securityQuestion: question, securityAnswer: answer, version: Date.now() }));
  }, []);

  const updateDiscordWebhook = useCallback((url: string) => {
    setState(prev => ({ ...prev, discordWebhook: url, version: Date.now() }));
  }, []);

  const clearAllData = useCallback(() => {
    if (confirm('Clear all orders and history?')) {
      setState(prev => ({ ...prev, orders: [], nextToken: 1, version: Date.now() }));
    }
  }, []);

  return {
    ...state,
    updateInventory,
    addOrder,
    updateOrder,
    updatePin,
    updateRecoveryPhone,
    updateSecurityInfo,
    updateDiscordWebhook,
    clearAllData
  };
};
