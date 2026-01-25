
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

// PAYMENT CONFIG
export const UPI_ID = 'SET_YOUR_UPI_ID_HERE@okaxis'; 
export const BUSINESS_NAME = 'My Awesome Stall';

// SECURITY CONFIG (Initial Defaults)
export const OWNER_PIN = '123456';
export const RECOVERY_PHONE = '9344830534';
export const DEFAULT_SECURITY_QUESTION = "What is your favorite dish?";
export const DEFAULT_SECURITY_ANSWER = "sustenance";

// OPTIONAL: DISCORD WEBHOOK (Get from Channel Settings -> Integrations -> Webhooks)
export const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1464784599308566629/H5ZsPU92mDpwwKqBWBvWUq-cIo_DfReC0oasq9AnqiRlZnWZQc97ObgxcaL7gB-XKpms'; 
