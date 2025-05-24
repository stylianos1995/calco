import React, { createContext, useContext, useReducer, useEffect } from "react";
import type { Category, Product, Order, User, AppSettings } from "../types";

interface AppState {
  categories: Category[];
  products: Product[];
  orders: Order[];
  users: User[];
  currentUser: User | null;
  settings: AppSettings;
  selectedCategory: string;
  darkMode: boolean;
  favorites: string[];
  orderHistory: Array<{
    id: string;
    establishmentName: string;
    date: string;
    products: Product[];
  }>;
  orderNumber: number;
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
  | { type: "SET_FAVORITES"; payload: string[] }
  | { type: "SET_ORDER_HISTORY"; payload: AppState["orderHistory"] }
  | { type: "SET_ORDER_NUMBER"; payload: number }
  | { type: "LOAD_STATE"; payload: AppState };

const initialState: AppState = {
  categories: [],
  products: [],
  orders: [],
  users: [],
  currentUser: null,
  settings: {
    darkMode: false,
    language: "en",
    currency: "USD",
    notifications: true,
  },
  selectedCategory: "",
  darkMode: false,
  favorites: [],
  orderHistory: [],
  orderNumber: 1,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_CATEGORIES":
      return { ...state, categories: action.payload };

    case "ADD_CATEGORY":
      return { ...state, categories: [...state.categories, action.payload] };

    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((cat) =>
          cat.id === action.payload.id ? action.payload : cat
        ),
      };

    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter((cat) => cat.id !== action.payload),
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
      return { ...state, products: action.payload };

    case "ADD_PRODUCT":
      return { ...state, products: [...state.products, action.payload] };

    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((prod) =>
          prod.id === action.payload.id ? action.payload : prod
        ),
      };

    case "DELETE_PRODUCT":
      return {
        ...state,
        products: state.products.filter((prod) => prod.id !== action.payload),
      };

    case "SET_ORDERS":
      return { ...state, orders: action.payload };

    case "ADD_ORDER":
      return { ...state, orders: [...state.orders, action.payload] };

    case "UPDATE_ORDER":
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.payload.id ? action.payload : order
        ),
      };

    case "SET_USERS":
      return { ...state, users: action.payload };

    case "SET_CURRENT_USER":
      return { ...state, currentUser: action.payload };

    case "SET_SETTINGS":
      return { ...state, settings: action.payload };

    case "SET_SELECTED_CATEGORY":
      return { ...state, selectedCategory: action.payload };

    case "TOGGLE_DARK_MODE":
      return {
        ...state,
        darkMode: !state.darkMode,
        settings: { ...state.settings, darkMode: !state.darkMode },
      };

    case "SET_FAVORITES":
      return { ...state, favorites: action.payload };

    case "SET_ORDER_HISTORY":
      return { ...state, orderHistory: action.payload };

    case "SET_ORDER_NUMBER":
      return { ...state, orderNumber: action.payload };

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
