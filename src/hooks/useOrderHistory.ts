import { useState, useEffect } from 'react';
import type { Product } from '../types';

export interface Order {
  id: string;
  establishmentName: string;
  date: string;
  products: Product[];
}

export const useOrderHistory = () => {
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [orderNumber, setOrderNumber] = useState(1);

  // Load initial state from localStorage
  useEffect(() => {
    // Load order history
    const savedOrderHistory = localStorage.getItem("orderHistory");
    if (savedOrderHistory) {
      try {
        setOrderHistory(JSON.parse(savedOrderHistory));
      } catch (error) {
        console.error("Failed to load order history:", error);
        setOrderHistory([]);
      }
    }

    // Load order number
    const savedOrderNumber = localStorage.getItem("orderNumber");
    if (savedOrderNumber) {
      try {
        setOrderNumber(parseInt(savedOrderNumber, 10));
      } catch (error) {
        console.error("Failed to load order number:", error);
        setOrderNumber(1);
      }
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
  }, [orderHistory]);

  useEffect(() => {
    localStorage.setItem("orderNumber", orderNumber.toString());
  }, [orderNumber]);

  const addOrder = (establishmentName: string, products: Product[]) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      establishmentName,
      date: new Date().toLocaleDateString(),
      products: products.filter(p => p.boxQuantity > 0 || p.bottleQuantity > 0),
    };
    setOrderHistory(prev => [newOrder, ...prev].slice(0, 10));
    setOrderNumber(prev => prev + 1);
  };

  const deleteOrder = (orderId: string) => {
    setOrderHistory(prev => prev.filter(order => order.id !== orderId));
  };

  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    setOrderHistory(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, ...updates } : order
      )
    );
  };

  return {
    orderHistory,
    orderNumber,
    addOrder,
    deleteOrder,
    updateOrder,
  };
}; 