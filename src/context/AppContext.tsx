import React, { createContext, useContext, useReducer, useEffect } from "react";
import type { Category, Product, Order, User, AppSettings } from "../types";
import * as storage from "../utils/storage";

interface AppState {
  categories: Category[];
  products: Product[];
  orders: Order[];
  users: User[];
  currentUser: User | null;
  settings: AppSettings;
  selectedCategory: string;
  darkMode: boolean;
}

type AppAction =
  | { type: "SET_CATEGORIES"; payload: Category[] }
  | { type: "ADD_CATEGORY"; payload: Category }
  | { type: "UPDATE_CATEGORY"; payload: Category }
  | { type: "DELETE_CATEGORY"; payload: string }
  | { type: "SET_PRODUCTS"; payload: Product[] }
  | { type: "ADD_PRODUCT"; payload: Product }
  | { type: "UPDATE_PRODUCT"; payload: Product }
  | { type: "DELETE_PRODUCT"; payload: string }
  | { type: "SET_ORDERS"; payload: Order[] }
  | { type: "ADD_ORDER"; payload: Order }
  | { type: "UPDATE_ORDER"; payload: Order }
  | { type: "SET_USERS"; payload: User[] }
  | { type: "SET_CURRENT_USER"; payload: User | null }
  | { type: "SET_SETTINGS"; payload: AppSettings }
  | { type: "SET_SELECTED_CATEGORY"; payload: string }
  | { type: "TOGGLE_DARK_MODE" }
  | { type: "LOAD_STATE"; payload: AppState };

const initialState: AppState = {
  categories: [],
  products: [],
  orders: [],
  users: [],
  currentUser: null,
  settings: storage.getSettings(),
  selectedCategory: "",
  darkMode: storage.getSettings().darkMode,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_CATEGORIES":
      storage.saveCategories(action.payload);
      return { ...state, categories: action.payload };

    case "ADD_CATEGORY":
      const newCategories = [...state.categories, action.payload];
      storage.saveCategories(newCategories);
      return { ...state, categories: newCategories };

    case "UPDATE_CATEGORY":
      const updatedCategories = state.categories.map((cat) =>
        cat.id === action.payload.id ? action.payload : cat
      );
      storage.saveCategories(updatedCategories);
      return { ...state, categories: updatedCategories };

    case "DELETE_CATEGORY":
      const filteredCategories = state.categories.filter(
        (cat) => cat.id !== action.payload
      );
      storage.saveCategories(filteredCategories);
      return {
        ...state,
        categories: filteredCategories,
        products: state.products.filter(
          (p) =>
            state.categories.find((c) => c.id === action.payload)?.name !==
            p.category
        ),
        selectedCategory:
          state.selectedCategory ===
          state.categories.find((c) => c.id === action.payload)?.name
            ? ""
            : state.selectedCategory,
      };

    case "SET_PRODUCTS":
      storage.saveProducts(action.payload);
      return { ...state, products: action.payload };

    case "ADD_PRODUCT":
      const newProducts = [...state.products, action.payload];
      storage.saveProducts(newProducts);
      return { ...state, products: newProducts };

    case "UPDATE_PRODUCT":
      const updatedProducts = state.products.map((prod) =>
        prod.id === action.payload.id ? action.payload : prod
      );
      storage.saveProducts(updatedProducts);
      return { ...state, products: updatedProducts };

    case "DELETE_PRODUCT":
      const filteredProducts = state.products.filter(
        (prod) => prod.id !== action.payload
      );
      storage.saveProducts(filteredProducts);
      return { ...state, products: filteredProducts };

    case "SET_ORDERS":
      storage.saveOrders(action.payload);
      return { ...state, orders: action.payload };

    case "ADD_ORDER":
      const newOrders = [...state.orders, action.payload];
      storage.saveOrders(newOrders);
      return { ...state, orders: newOrders };

    case "UPDATE_ORDER":
      const updatedOrders = state.orders.map((order) =>
        order.id === action.payload.id ? action.payload : order
      );
      storage.saveOrders(updatedOrders);
      return { ...state, orders: updatedOrders };

    case "SET_USERS":
      storage.saveUsers(action.payload);
      return { ...state, users: action.payload };

    case "SET_CURRENT_USER":
      storage.setCurrentUser(action.payload);
      return { ...state, currentUser: action.payload };

    case "SET_SETTINGS":
      storage.saveSettings(action.payload);
      return { ...state, settings: action.payload };

    case "SET_SELECTED_CATEGORY":
      return { ...state, selectedCategory: action.payload };

    case "TOGGLE_DARK_MODE":
      const newDarkMode = !state.darkMode;
      const newSettings = { ...state.settings, darkMode: newDarkMode };
      storage.saveSettings(newSettings);
      return { ...state, darkMode: newDarkMode, settings: newSettings };

    case "LOAD_STATE":
      return action.payload;

    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("appState");
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: "LOAD_STATE", payload: parsedState });
      } catch (error) {
        console.error("Failed to load state from localStorage:", error);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("appState", JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
