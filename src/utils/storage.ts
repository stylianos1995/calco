import type { Category, Product, Order, User, AppSettings } from '../types';

const STORAGE_KEYS = {
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  USERS: 'users',
  SETTINGS: 'settings',
  CURRENT_USER: 'currentUser',
} as const;

// Generic storage functions
const getItem = <T>(key: string): T | null => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

const setItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Category storage
export const getCategories = (): Category[] => {
  return getItem<Category[]>(STORAGE_KEYS.CATEGORIES) || [];
};

export const saveCategories = (categories: Category[]): void => {
  setItem(STORAGE_KEYS.CATEGORIES, categories);
};

// Product storage
export const getProducts = (): Product[] => {
  return getItem<Product[]>(STORAGE_KEYS.PRODUCTS) || [];
};

export const saveProducts = (products: Product[]): void => {
  setItem(STORAGE_KEYS.PRODUCTS, products);
};

// Order storage
export const getOrders = (): Order[] => {
  return getItem<Order[]>(STORAGE_KEYS.ORDERS) || [];
};

export const saveOrders = (orders: Order[]): void => {
  setItem(STORAGE_KEYS.ORDERS, orders);
};

// User storage
export const getUsers = (): User[] => {
  return getItem<User[]>(STORAGE_KEYS.USERS) || [];
};

export const saveUsers = (users: User[]): void => {
  setItem(STORAGE_KEYS.USERS, users);
};

export const getCurrentUser = (): User | null => {
  return getItem<User>(STORAGE_KEYS.CURRENT_USER);
};

export const setCurrentUser = (user: User | null): void => {
  setItem(STORAGE_KEYS.CURRENT_USER, user);
};

// Settings storage
export const getSettings = (): AppSettings => {
  return getItem<AppSettings>(STORAGE_KEYS.SETTINGS) || {
    darkMode: false,
    language: 'en',
    currency: 'USD',
    notifications: true,
  };
};

export const saveSettings = (settings: AppSettings): void => {
  setItem(STORAGE_KEYS.SETTINGS, settings);
};

// Export/Import functions
export const exportData = (): string => {
  const data = {
    categories: getCategories(),
    products: getProducts(),
    orders: getOrders(),
    users: getUsers(),
    settings: getSettings(),
  };
  return JSON.stringify(data, null, 2);
};

export const importData = (data: string): boolean => {
  try {
    const parsed = JSON.parse(data);
    if (parsed.categories) saveCategories(parsed.categories);
    if (parsed.products) saveProducts(parsed.products);
    if (parsed.orders) saveOrders(parsed.orders);
    if (parsed.users) saveUsers(parsed.users);
    if (parsed.settings) saveSettings(parsed.settings);
    return true;
  } catch (error) {
    console.error('Import failed:', error);
    return false;
  }
}; 