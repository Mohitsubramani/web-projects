import { FoodItem } from './types';

export const INITIAL_INVENTORY: FoodItem[] = [
  {
    id: '1',
    name: 'Classic Burger',
    price: 99,
    description: 'Juicy chicken patty with lettuce and cheese',
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=800&auto=format&fit=crop',
    isAvailable: true
  },
  {
    id: 'c1',
    name: 'Burger & Fries Combo',
    price: 149,
    description: 'Classic Burger + Peri Peri Fries + Drink',
    category: 'Combos',
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800&auto=format&fit=crop',
    isAvailable: true
  },
  {
    id: '2',
    name: 'Peri Peri Fries',
    price: 60,
    description: 'Crispy fries with spicy peri peri seasoning',
    category: 'Sides',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=800&auto=format&fit=crop',
    isAvailable: true
  },
  {
    id: '3',
    name: 'Iced Lemon Tea',
    price: 40,
    description: 'Refreshing cold tea with a citrus twist',
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=800&auto=format&fit=crop',
    isAvailable: true
  }
];

/** 
 * ACTION REQUIRED: Change these to your actual details! 
 * UPI_ID: Your GPay/PhonePe ID (e.g., yourname@okaxis)
 * BUSINESS_NAME: The name of your stall
 * CONTACT_EMAIL: Use a real support email for Razorpay verification
 */
export const UPI_ID = 'mohitsubramani04@okhdfcbank'; 
export const BUSINESS_NAME = 'DREAMCRAFTER';
export const APP_NAME = 'DREAMCRAFTER';
export const APP_DESCRIPTION = 'DreamCrafter is a digital platform for ordering food/services online.';
export const CONTACT_EMAIL = 'dreamerzcodex@gmail.com';
export const CONTACT_PHONE = '9344830534';

// SECURITY CONFIG (Initial Defaults - Change in App)
export const OWNER_PIN = '775300';
export const RECOVERY_PHONE = '9384999473';
export const DEFAULT_SECURITY_QUESTION = "Shameplant";
export const DEFAULT_SECURITY_ANSWER = "renukadevi";

// OPTIONAL: DISCORD WEBHOOK (Recommended for instant notifications)
export const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1464784599308566629/H5ZsPU92mDpwwKqBWBvWUq-cIo_DfReC0oasq9AnqiRlZnWZQc97ObgxcaL7gB-XKpms';