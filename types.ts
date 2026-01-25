
export interface FoodItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  isAvailable: boolean;
}

export interface CartItem extends FoodItem {
  quantity: number;
}

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID_PENDING_CONFIRMATION = 'PAID_PENDING_CONFIRMATION',
  PREPARING = 'PREPARING',
  COMPLETED = 'COMPLETED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface Order {
  id: string;
  token?: number;
  items: CartItem[];
  totalPrice: number;
  paymentMethod?: string;
  timestamp: number;
  status: OrderStatus;
  customerName?: string;
}

export interface StoreState {
  inventory: FoodItem[];
  orders: Order[];
  nextToken: number;
  ownerPin: string;
  recoveryPhone: string;
  securityQuestion: string;
  securityAnswer: string;
  discordWebhook: string;
}
