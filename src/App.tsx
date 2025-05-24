import React, { useState, useEffect, useRef } from "react";
import {
  PlusIcon,
  MinusIcon,
  PrinterIcon,
  PlusCircleIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  TrashIcon,
  SunIcon,
  MoonIcon,
  CubeIcon,
  BeakerIcon,
  MagnifyingGlassIcon,
  StarIcon,
  ClockIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { useApp, AppProvider } from "./context/AppContext";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import { Card } from "./components/Card";
import { Modal } from "./components/Modal";
import type { Category, Product } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { useReactToPrint } from "react-to-print";

function AppContent() {
  const { state, dispatch } = useApp();
  const [newProduct, setNewProduct] = useState({ name: "", category: "" });
  const [newCategory, setNewCategory] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | Category | null>(
    null
  );
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    itemId: string;
    type: "category" | "product";
  } | null>(null);
  const [selectedQuantityType, setSelectedQuantityType] = useState<{
    [key: string]: "box" | "bottle";
  }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [orderHistory, setOrderHistory] = useState<
    Array<{
      id: string;
      establishmentName: string;
      date: string;
      products: Product[];
    }>
  >([]);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const printRef = useRef<HTMLDivElement>(null);
  const [orderNumber, setOrderNumber] = useState(1);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [orderContextMenu, setOrderContextMenu] = useState<{
    x: number;
    y: number;
    orderId: string;
  } | null>(null);
  const [editingOrder, setEditingOrder] = useState<
    (typeof orderHistory)[0] | null
  >(null);

  // Load initial state from localStorage
  useEffect(() => {
    // Load favorites
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error("Failed to load favorites:", error);
        setFavorites([]);
      }
    }

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
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
  }, [orderHistory]);

  useEffect(() => {
    localStorage.setItem("orderNumber", orderNumber.toString());
  }, [orderNumber]);

  const getCleanTableContent = (establishmentName: string) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${establishmentName} - Order #${orderNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              font-size: 24px;
              margin-bottom: 5px;
            }
            .header p {
              color: #666;
              margin: 0;
            }
            .order-container {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 20px;
              margin-top: 20px;
            }
            .category-card {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 15px;
              background: #fff;
            }
            .category-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 15px;
              padding-bottom: 8px;
              border-bottom: 2px solid #eee;
            }
            .product-row {
              display: flex;
              flex-direction: column;
              padding: 8px 0;
              border-bottom: 1px solid #f0f0f0;
            }
            .product-name {
              font-weight: 500;
              margin-bottom: 4px;
            }
            .quantity-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin: 2px 0;
              font-size: 14px;
            }
            .quantity-label {
              color: #666;
            }
            .product-quantity {
              font-weight: bold;
              color: #2563eb;
            }
            @media print {
              body {
                padding: 0;
              }
              .category-card {
                break-inside: avoid;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${establishmentName}</h1>
            <p>Order #${orderNumber} - ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="order-container">
            ${state.categories
              .map((category) => {
                const categoryProducts = state.products.filter(
                  (product) =>
                    product.category === category.name &&
                    (product.boxQuantity > 0 || product.bottleQuantity > 0)
                );

                if (categoryProducts.length === 0) return "";

                return `
                  <div class="category-card">
                    <div class="category-title">${category.name}</div>
                    ${categoryProducts
                      .map(
                        (product) => `
                          <div class="product-row">
                            <div class="product-name">${product.name}</div>
                            ${
                              product.boxQuantity > 0
                                ? `
                              <div class="quantity-row">
                                <span class="quantity-label">Box:</span>
                                <span class="product-quantity">${product.boxQuantity}</span>
                              </div>
                            `
                                : ""
                            }
                            ${
                              product.bottleQuantity > 0
                                ? `
                              <div class="quantity-row">
                                <span class="quantity-label">Bottle:</span>
                                <span class="product-quantity">${product.bottleQuantity}</span>
                              </div>
                            `
                                : ""
                            }
                          </div>
                        `
                      )
                      .join("")}
                  </div>
                `;
              })
              .join("")}
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = useReactToPrint({
    documentTitle: "Restaurant Order",
    onBeforeGetContent: () => {
      const establishmentName = prompt("Enter establishment name:");
      if (!establishmentName) return Promise.reject();

      if (printRef.current) {
        printRef.current.innerHTML = getCleanTableContent(establishmentName);
      }
      return Promise.resolve();
    },
    onAfterPrint: () => {
      if (printRef.current) {
        printRef.current.innerHTML = "";
      }
      // Save to order history
      const establishmentName = prompt("Enter establishment name:");
      if (establishmentName) {
        const newOrder = {
          id: Date.now().toString(),
          establishmentName,
          date: new Date().toLocaleDateString(),
          products: state.products.filter(
            (p) => p.boxQuantity > 0 || p.bottleQuantity > 0
          ),
        };
        setOrderHistory((prev) => [newOrder, ...prev].slice(0, 10));
        setOrderNumber((prev) => prev + 1);
      }
    },
    onPrintError: (error: Error) => {
      console.error("Print failed:", error);
    },
    removeAfterPrint: true,
    content: () => printRef.current,
  } as any);

  const handleDownload = () => {
    const establishmentName = prompt("Enter establishment name:");
    if (!establishmentName) return;

    const content = getCleanTableContent(establishmentName);
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${establishmentName}-${new Date().toLocaleDateString()}-Order${orderNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Save to order history
    const newOrder = {
      id: Date.now().toString(),
      establishmentName,
      date: new Date().toLocaleDateString(),
      products: state.products.filter(
        (p) => p.boxQuantity > 0 || p.bottleQuantity > 0
      ),
    };
    setOrderHistory((prev) => [newOrder, ...prev].slice(0, 10));
    setOrderNumber((prev) => prev + 1);
  };

  const addProduct = () => {
    if (newProduct.name && state.selectedCategory) {
      const product: Product = {
        id: Date.now().toString(),
        name: newProduct.name,
        category: state.selectedCategory,
        boxQuantity: 0,
        bottleQuantity: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      dispatch({ type: "ADD_PRODUCT", payload: product });
      setNewProduct({ name: "", category: "" });
    }
  };

  const addCategory = () => {
    if (newCategory) {
      // Check if category name already exists (case-insensitive)
      const categoryExists = state.categories.some(
        (cat) => cat.name.toLowerCase() === newCategory.toLowerCase()
      );

      if (categoryExists) {
        alert("A category with this name already exists!");
        return;
      }

      const category: Category = {
        id: Date.now().toString(),
        name: newCategory.trim(), // Trim whitespace
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      dispatch({ type: "ADD_CATEGORY", payload: category });
      setNewCategory("");
    }
  };

  const updateQuantity = (
    id: string,
    type: "box" | "bottle",
    change: number
  ) => {
    const product = state.products.find((p) => p.id === id);
    if (product) {
      const updatedProduct = {
        ...product,
        [type === "box" ? "boxQuantity" : "bottleQuantity"]: Math.max(
          0,
          (type === "box" ? product.boxQuantity : product.bottleQuantity) +
            change
        ),
        updatedAt: Date.now(),
      };
      dispatch({ type: "UPDATE_PRODUCT", payload: updatedProduct });
    }
  };

  const resetAll = () => {
    if (confirm("Are you sure you want to reset all quantities to zero?")) {
      state.products.forEach((product) => {
        dispatch({
          type: "UPDATE_PRODUCT",
          payload: {
            ...product,
            boxQuantity: 0,
            bottleQuantity: 0,
            updatedAt: Date.now(),
          },
        });
      });
    }
  };

  const toggleDarkMode = () => {
    dispatch({ type: "TOGGLE_DARK_MODE" });
  };

  const handleContextMenu = (
    e: React.MouseEvent,
    itemId: string,
    type: "category" | "product"
  ) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      itemId,
      type,
    });
  };

  const handleContextMenuAction = (action: "edit" | "delete" | "favorite") => {
    if (!contextMenu) return;

    if (contextMenu.type === "category") {
      const category = state.categories.find(
        (c) => c.id === contextMenu.itemId
      );
      if (!category) return;

      if (action === "edit") {
        setEditingItem(category);
        setIsEditModalOpen(true);
      } else if (action === "delete") {
        if (
          confirm(
            "Are you sure you want to delete this category? All products in this category will also be deleted."
          )
        ) {
          dispatch({
            type: "DELETE_CATEGORY",
            payload: category.id,
          });
        }
      }
    } else {
      const product = state.products.find((p) => p.id === contextMenu.itemId);
      if (!product) return;

      if (action === "edit") {
        setEditingItem(product);
        setIsEditModalOpen(true);
      } else if (action === "delete") {
        if (confirm("Are you sure you want to delete this product?")) {
          dispatch({
            type: "DELETE_PRODUCT",
            payload: product.id,
          });
        }
      } else if (action === "favorite") {
        const newFavorites = favorites.includes(product.id)
          ? favorites.filter((id) => id !== product.id)
          : [...favorites, product.id];
        setFavorites(newFavorites);
        localStorage.setItem("favorites", JSON.stringify(newFavorites));
      }
    }

    setContextMenu(null);
  };

  // Close context menu when clicking outside
  const handleClickOutside = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleQuantityType = (productId: string) => {
    setSelectedQuantityType((prev) => ({
      ...prev,
      [productId]: prev[productId] === "box" ? "bottle" : "box",
    }));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "+" || e.key === "=") {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.getAttribute("data-product-id")) {
          const productId = activeElement.getAttribute("data-product-id");
          const type = activeElement.getAttribute("data-quantity-type") as
            | "box"
            | "bottle";
          if (productId && type) {
            updateQuantity(productId, type, 1);
          }
        }
      } else if (e.key === "-" || e.key === "_") {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.getAttribute("data-product-id")) {
          const productId = activeElement.getAttribute("data-product-id");
          const type = activeElement.getAttribute("data-quantity-type") as
            | "box"
            | "bottle";
          if (productId && type) {
            updateQuantity(productId, type, -1);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Filter products based on search query
  const filteredProducts = state.products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add this function to check if any products have quantities
  const hasProductsWithQuantities = () => {
    return state.products.some(
      (product) => product.boxQuantity > 0 || product.bottleQuantity > 0
    );
  };

  // Add this function to handle reordering
  const handleReorder = (order: (typeof orderHistory)[0]) => {
    if (
      confirm(
        "This will reset current quantities and apply the selected order. Continue?"
      )
    ) {
      // Reset all quantities first
      state.products.forEach((product) => {
        dispatch({
          type: "UPDATE_PRODUCT",
          payload: {
            ...product,
            boxQuantity: 0,
            bottleQuantity: 0,
            updatedAt: Date.now(),
          },
        });
      });

      // Create a map of existing categories (case-insensitive)
      const existingCategories = new Map(
        state.categories.map((cat) => [cat.name.toLowerCase(), cat])
      );

      // Then set the quantities from the order
      order.products.forEach((product) => {
        const normalizedProductName = product.name.toLowerCase().trim();
        const normalizedCategoryName = product.category.toLowerCase().trim();

        // Find existing product by name and category (case-insensitive)
        const existingProduct = state.products.find(
          (p) =>
            p.name.toLowerCase().trim() === normalizedProductName &&
            p.category.toLowerCase().trim() === normalizedCategoryName
        );

        if (existingProduct) {
          // Update existing product quantities
          dispatch({
            type: "UPDATE_PRODUCT",
            payload: {
              ...existingProduct,
              boxQuantity: product.boxQuantity,
              bottleQuantity: product.bottleQuantity,
              updatedAt: Date.now(),
            },
          });
        } else {
          // Check if category exists (case-insensitive)
          const existingCategory = existingCategories.get(
            normalizedCategoryName
          );

          // If category doesn't exist, create it
          if (!existingCategory) {
            const newCategory: Category = {
              id: Date.now().toString(),
              name: product.category.trim(),
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            dispatch({ type: "ADD_CATEGORY", payload: newCategory });
            // Add to our map to prevent duplicates
            existingCategories.set(normalizedCategoryName, newCategory);
          }

          // Create the missing product
          const newProduct: Product = {
            ...product,
            id: Date.now().toString(),
            category: existingCategory
              ? existingCategory.name
              : product.category.trim(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          dispatch({ type: "ADD_PRODUCT", payload: newProduct });
        }
      });
    }
  };

  const handleDeleteAll = () => {
    if (
      confirm(
        "Are you sure you want to delete all categories and products? This action cannot be undone."
      )
    ) {
      // Delete all products first
      state.products.forEach((product) => {
        dispatch({
          type: "DELETE_PRODUCT",
          payload: product.id,
        });
      });

      // Then delete all categories
      state.categories.forEach((category) => {
        dispatch({
          type: "DELETE_CATEGORY",
          payload: category.id,
        });
      });
    }
  };

  const handleOrderContextMenu = (e: React.MouseEvent, orderId: string) => {
    e.preventDefault();
    setOrderContextMenu({
      x: e.clientX,
      y: e.clientY,
      orderId,
    });
  };

  const handleOrderContextMenuAction = (
    action: "delete" | "edit" | "favorite"
  ) => {
    if (!orderContextMenu) return;

    const order = orderHistory.find((o) => o.id === orderContextMenu.orderId);
    if (!order) return;

    if (action === "delete") {
      if (confirm("Are you sure you want to delete this order from history?")) {
        const newOrderHistory = orderHistory.filter(
          (o) => o.id !== orderContextMenu.orderId
        );
        setOrderHistory(newOrderHistory);
        localStorage.setItem("orderHistory", JSON.stringify(newOrderHistory));
      }
    } else if (action === "edit") {
      setEditingOrder(order);
      setIsEditModalOpen(true);
    } else if (action === "favorite") {
      const newFavorites = favorites.includes(order.id)
        ? favorites.filter((id) => id !== order.id)
        : [...favorites, order.id];
      setFavorites(newFavorites);
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
    }

    setOrderContextMenu(null);
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (orderContextMenu) {
        setOrderContextMenu(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [orderContextMenu]);

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        state.darkMode
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900"
      }`}
    >
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="secondary"
              size="sm"
              icon={
                state.darkMode ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )
              }
              onClick={toggleDarkMode}
            >
              {state.darkMode ? "Light Mode" : "Dark Mode"}
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Calco
            </h1>
            <div className="w-24" /> {/* Spacer for alignment */}
          </div>
          <p
            className={`mt-2 ${
              state.darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Manage your restaurant orders efficiently
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products or categories..."
              className={`pl-10 ${
                state.darkMode ? "bg-gray-700 border-gray-600 text-white" : ""
              }`}
            />
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Favorites Toggle Button */}
        {favorites.length > 0 && (
          <div className="mb-6">
            <Button
              variant="secondary"
              onClick={() => setShowFavorites(!showFavorites)}
              className="flex items-center gap-2"
            >
              <StarIcon className="h-5 w-5 text-yellow-500" />
              {showFavorites ? "Hide Favorites" : "Show Favorites"}
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-yellow-500 text-white">
                {favorites.length}
              </span>
            </Button>
          </div>
        )}

        {/* Favorites Section */}
        {showFavorites && favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-6"
          >
            <Card
              title="Favorites"
              className={`${
                state.darkMode ? "bg-gray-800 border-gray-700" : ""
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((favoriteId) => {
                  const product = state.products.find(
                    (p) => p.id === favoriteId
                  );
                  if (!product) return null;
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`p-3 rounded-lg border ${
                        state.darkMode
                          ? "border-gray-700 bg-gray-800"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{product.name}</span>
                        <motion.button
                          onClick={() => toggleQuantityType(product.id)}
                          className={`text-sm px-2 py-1 rounded flex items-center gap-1 ${
                            state.darkMode
                              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {selectedQuantityType[product.id] === "bottle" ? (
                            <>
                              <BeakerIcon className="h-4 w-4" />
                              Bottle
                            </>
                          ) : (
                            <>
                              <CubeIcon className="h-4 w-4" />
                              Box
                            </>
                          )}
                        </motion.button>
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          onClick={() =>
                            updateQuantity(
                              product.id,
                              selectedQuantityType[product.id] || "box",
                              -1
                            )
                          }
                          variant="danger"
                          size="sm"
                          className="min-w-[28px] h-7 px-1 opacity-60 hover:opacity-100 bg-red-500/80 hover:bg-red-500 flex items-center justify-center"
                          icon={<MinusIcon className="h-3 w-3" />}
                          data-product-id={product.id}
                          data-quantity-type={
                            selectedQuantityType[product.id] || "box"
                          }
                        />
                        <span
                          className={`w-8 text-center font-medium ${
                            state.darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {selectedQuantityType[product.id] === "bottle"
                            ? product.bottleQuantity
                            : product.boxQuantity}
                        </span>
                        <Button
                          onClick={() =>
                            updateQuantity(
                              product.id,
                              selectedQuantityType[product.id] || "box",
                              1
                            )
                          }
                          variant="success"
                          size="sm"
                          className="min-w-[28px] h-7 px-1 opacity-60 hover:opacity-100 bg-green-500/80 hover:bg-green-500 flex items-center justify-center"
                          icon={<PlusIcon className="h-3 w-3" />}
                          data-product-id={product.id}
                          data-quantity-type={
                            selectedQuantityType[product.id] || "box"
                          }
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Order History */}
        {orderHistory.length > 0 && (
          <Card
            title={
              <div className="flex items-center justify-between w-full">
                <span>Recent Orders</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowOrderHistory(!showOrderHistory)}
                  className="flex items-center gap-2"
                >
                  <ClockIcon className="h-4 w-4" />
                  {showOrderHistory ? "Hide Orders" : "Show Orders"}
                </Button>
              </div>
            }
            className={`mb-6 ${
              state.darkMode ? "bg-gray-800 border-gray-700" : ""
            }`}
          >
            <AnimatePresence>
              {showOrderHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {orderHistory.slice(0, 5).map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      onContextMenu={(e) => handleOrderContextMenu(e, order.id)}
                      className={`p-3 rounded-lg border ${
                        state.darkMode
                          ? "border-gray-700 bg-gray-800"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium">
                            {order.establishmentName}
                          </h3>
                          <p className="text-sm text-gray-500">{order.date}</p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleReorder(order)}
                        >
                          Reorder
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        )}

        {/* Order Context Menu */}
        {orderContextMenu && (
          <div
            className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[150px]"
            style={{
              top: orderContextMenu.y,
              left: orderContextMenu.x,
            }}
          >
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
              onClick={(e) => {
                e.preventDefault();
                handleOrderContextMenuAction("edit");
              }}
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </button>
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
              onClick={(e) => {
                e.preventDefault();
                handleOrderContextMenuAction("favorite");
              }}
            >
              <StarIcon
                className={`h-4 w-4 ${
                  favorites.includes(orderContextMenu.orderId)
                    ? "text-yellow-500"
                    : "text-gray-400"
                }`}
              />
              {favorites.includes(orderContextMenu.orderId)
                ? "Remove from Favorites"
                : "Add to Favorites"}
            </button>
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600 flex items-center gap-2"
              onClick={(e) => {
                e.preventDefault();
                handleOrderContextMenuAction("delete");
              }}
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </button>
          </div>
        )}

        {/* Categories Section */}
        <Card
          title={
            <div className="flex items-center gap-2">
              Categories
              <div className="relative group">
                <InformationCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help" />
                <div className="fixed transform -translate-x-1/2 -translate-y-full mt-[-8px] w-72 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
                  <p className="mb-2 font-medium">Quick Guide:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Enter your category name and press +</li>
                    <li>Select a category to add products to it</li>
                    <li>Enter product name and press + to add it</li>
                    <li>
                      Right-click on categories/products to edit or delete
                    </li>
                    <li>Use the quantity controls to set box/bottle amounts</li>
                  </ol>
                  <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
              </div>
            </div>
          }
          className={state.darkMode ? "bg-gray-800 border-gray-700" : ""}
          headerRight={
            state.categories.length > 0 && (
              <Button
                onClick={handleDeleteAll}
                variant="secondary"
                size="sm"
                className="text-red-500 hover:text-red-600"
              >
                Delete All
              </Button>
            )
          }
        >
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New Category"
                className={
                  state.darkMode ? "bg-gray-700 border-gray-600 text-white" : ""
                }
              />
              <Button
                onClick={addCategory}
                variant="primary"
                size="sm"
                icon={<PlusCircleIcon className="h-6 w-6" />}
              />
            </div>

            {/* Category List */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {state.categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() =>
                    dispatch({
                      type: "SET_SELECTED_CATEGORY",
                      payload: category.name,
                    })
                  }
                  onContextMenu={(e) =>
                    handleContextMenu(e, category.id, "category")
                  }
                  variant={
                    state.selectedCategory === category.name
                      ? "primary"
                      : "secondary"
                  }
                  size="sm"
                  className="w-full font-bold text-lg py-3 hover:shadow-lg transition-all duration-200"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Context Menu */}
        {contextMenu && (
          <div
            className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[150px]"
            style={{
              top: contextMenu.y,
              left: contextMenu.x,
            }}
          >
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
              onClick={(e) => {
                e.preventDefault();
                handleContextMenuAction("edit");
              }}
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </button>
            {contextMenu.type === "product" && (
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                onClick={(e) => {
                  e.preventDefault();
                  handleContextMenuAction("favorite");
                }}
              >
                <StarIcon
                  className={`h-4 w-4 ${
                    favorites.includes(contextMenu.itemId)
                      ? "text-yellow-500"
                      : "text-gray-400"
                  }`}
                />
                {favorites.includes(contextMenu.itemId)
                  ? "Remove from Favorites"
                  : "Add to Favorites"}
              </button>
            )}
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600 flex items-center gap-2"
              onClick={(e) => {
                e.preventDefault();
                handleContextMenuAction("delete");
              }}
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </button>
          </div>
        )}

        {/* Add Product Section */}
        {state.selectedCategory && (
          <Card
            title={`Add Product to ${state.selectedCategory}`}
            className={`mt-6 ${
              state.darkMode ? "bg-gray-800 border-gray-700" : ""
            }`}
          >
            <div className="flex gap-2">
              <Input
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                placeholder="Product Name"
                className={
                  state.darkMode ? "bg-gray-700 border-gray-600 text-white" : ""
                }
              />
              <Button
                onClick={addProduct}
                variant="success"
                size="sm"
                icon={<PlusCircleIcon className="h-6 w-6" />}
              />
            </div>
          </Card>
        )}

        {/* Products Table */}
        <div ref={printRef} className="mt-6 flex-1">
          <Card
            title="Order List"
            className={`${
              state.darkMode ? "bg-gray-800 border-gray-700" : ""
            } h-full flex flex-col`}
            headerRight={
              hasProductsWithQuantities() && (
                <Button
                  onClick={resetAll}
                  variant="secondary"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                >
                  Reset All
                </Button>
              )
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[calc(100vh-400px)] pr-2">
              {state.categories.map((category) => {
                const categoryProducts = state.products.filter(
                  (product) => product.category === category.name
                );

                if (categoryProducts.length === 0) return null;

                return (
                  <div
                    key={category.id}
                    className={`rounded-lg border ${
                      state.darkMode
                        ? "border-gray-700 bg-gray-800"
                        : "border-gray-200 bg-white"
                    } p-4`}
                  >
                    <h3
                      className={`font-bold text-lg mb-4 pb-2 border-b ${
                        state.darkMode
                          ? "border-gray-700 text-gray-200"
                          : "border-gray-200 text-gray-800"
                      }`}
                    >
                      {category.name}
                    </h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {categoryProducts.map((product) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          onContextMenu={(e) =>
                            handleContextMenu(e, product.id, "product")
                          }
                          className={`flex flex-col p-2 rounded-lg hover:bg-gray-50 cursor-context-menu ${
                            state.darkMode ? "hover:bg-gray-700" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`font-medium ${
                                state.darkMode
                                  ? "text-gray-300"
                                  : "text-gray-700"
                              }`}
                            >
                              {product.name}
                            </span>
                            <motion.button
                              onClick={() => toggleQuantityType(product.id)}
                              className={`text-sm px-2 py-1 rounded flex items-center gap-1 ${
                                state.darkMode
                                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {selectedQuantityType[product.id] === "bottle" ? (
                                <>
                                  <BeakerIcon className="h-4 w-4" />
                                  Bottle
                                </>
                              ) : (
                                <>
                                  <CubeIcon className="h-4 w-4" />
                                  Box
                                </>
                              )}
                            </motion.button>
                          </div>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              onClick={() =>
                                updateQuantity(
                                  product.id,
                                  selectedQuantityType[product.id] || "box",
                                  -1
                                )
                              }
                              variant="danger"
                              size="sm"
                              className="min-w-[28px] h-7 px-1 opacity-60 hover:opacity-100 bg-red-500/80 hover:bg-red-500 flex items-center justify-center"
                              icon={<MinusIcon className="h-3 w-3" />}
                              data-product-id={product.id}
                              data-quantity-type={
                                selectedQuantityType[product.id] || "box"
                              }
                            />
                            <span
                              className={`w-8 text-center font-medium ${
                                state.darkMode
                                  ? "text-gray-300"
                                  : "text-gray-700"
                              }`}
                            >
                              {selectedQuantityType[product.id] === "bottle"
                                ? product.bottleQuantity
                                : product.boxQuantity}
                            </span>
                            <Button
                              onClick={() =>
                                updateQuantity(
                                  product.id,
                                  selectedQuantityType[product.id] || "box",
                                  1
                                )
                              }
                              variant="success"
                              size="sm"
                              className="min-w-[28px] h-7 px-1 opacity-60 hover:opacity-100 bg-green-500/80 hover:bg-green-500 flex items-center justify-center"
                              icon={<PlusIcon className="h-3 w-3" />}
                              data-product-id={product.id}
                              data-quantity-type={
                                selectedQuantityType[product.id] || "box"
                              }
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center mt-6 sticky bottom-4">
          {!showPrintOptions ? (
            <Button
              onClick={() => setShowPrintOptions(true)}
              variant="primary"
              className="px-8"
              disabled={!hasProductsWithQuantities()}
            >
              Next
            </Button>
          ) : (
            <div className="flex gap-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg">
              <Button
                onClick={() => {
                  handlePrint();
                  setShowPrintOptions(false);
                }}
                variant="primary"
                icon={<PrinterIcon className="h-5 w-5" />}
              >
                Print
              </Button>
              <Button
                onClick={() => {
                  handleDownload();
                  setShowPrintOptions(false);
                }}
                variant="primary"
                icon={<ArrowDownTrayIcon className="h-5 w-5" />}
              >
                Download
              </Button>
              <Button
                onClick={() => setShowPrintOptions(false)}
                variant="secondary"
              >
                Back
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
          setEditingOrder(null);
        }}
        title="Edit Item"
      >
        {editingItem && (
          <div className="space-y-4">
            <Input
              label="Name"
              value={editingItem.name}
              onChange={(e) => {
                if ("category" in editingItem) {
                  dispatch({
                    type: "UPDATE_PRODUCT",
                    payload: {
                      ...editingItem,
                      name: e.target.value,
                      updatedAt: Date.now(),
                    },
                  });
                } else {
                  dispatch({
                    type: "UPDATE_CATEGORY",
                    payload: {
                      ...editingItem,
                      name: e.target.value,
                      updatedAt: Date.now(),
                    },
                  });
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingItem(null);
                  setEditingOrder(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingItem(null);
                  setEditingOrder(null);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        )}
        {editingOrder && (
          <div className="space-y-4">
            <Input
              label="Establishment Name"
              value={editingOrder.establishmentName}
              onChange={(e) => {
                const updatedOrder = {
                  ...editingOrder,
                  establishmentName: e.target.value,
                };
                setEditingOrder(updatedOrder);
                const newOrderHistory = orderHistory.map((order) =>
                  order.id === editingOrder.id ? updatedOrder : order
                );
                setOrderHistory(newOrderHistory);
                localStorage.setItem(
                  "orderHistory",
                  JSON.stringify(newOrderHistory)
                );
              }}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingItem(null);
                  setEditingOrder(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingItem(null);
                  setEditingOrder(null);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
