export interface Product {
  id: string;
  name: string;
  category: string;
  boxQuantity: number;
  bottleQuantity: number;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface Order {
  id: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'staff';
  email?: string;
}

export interface AppSettings {
  darkMode: boolean;
  language: string;
  currency: string;
  notifications: boolean;
} 