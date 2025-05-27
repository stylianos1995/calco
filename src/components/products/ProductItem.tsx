import React from "react";
import { motion } from "framer-motion";
import {
  PlusIcon,
  MinusIcon,
  CubeIcon,
  BeakerIcon,
} from "@heroicons/react/24/solid";
import { Button } from "../Button";
import { useApp } from "../../context/AppContext";
import type { Product } from "../../types";

interface ProductItemProps {
  product: Product;
  selectedQuantityType: "box" | "bottle";
  onToggleQuantityType: (productId: string) => void;
  onContextMenu: (e: React.MouseEvent, itemId: string, type: "product") => void;
}

export const ProductItem: React.FC<ProductItemProps> = ({
  product,
  selectedQuantityType,
  onToggleQuantityType,
  onContextMenu,
}) => {
  const { state, dispatch } = useApp();

  const updateQuantity = (type: "box" | "bottle", change: number) => {
    const updatedProduct = {
      ...product,
      [type === "box" ? "boxQuantity" : "bottleQuantity"]: Math.max(
        0,
        (type === "box" ? product.boxQuantity : product.bottleQuantity) + change
      ),
      updatedAt: Date.now(),
    };
    dispatch({ type: "UPDATE_PRODUCT", payload: updatedProduct });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onContextMenu={(e) => onContextMenu(e, product.id, "product")}
      className={`flex flex-col p-2 rounded-lg hover:bg-gray-50 cursor-context-menu ${
        state.darkMode ? "hover:bg-gray-700" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={`font-medium ${
            state.darkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {product.name}
        </span>
        <motion.button
          onClick={() => onToggleQuantityType(product.id)}
          className={`text-sm px-2 py-1 rounded flex items-center gap-1 ${
            state.darkMode
              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {selectedQuantityType === "bottle" ? (
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
          onClick={() => updateQuantity(selectedQuantityType, -1)}
          variant="danger"
          size="sm"
          className="min-w-[28px] h-7 px-1 opacity-60 hover:opacity-100 bg-red-500/80 hover:bg-red-500 flex items-center justify-center"
          icon={<MinusIcon className="h-3 w-3" />}
          data-product-id={product.id}
          data-quantity-type={selectedQuantityType}
        />
        <span
          className={`w-8 text-center font-medium ${
            state.darkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {selectedQuantityType === "bottle"
            ? product.bottleQuantity
            : product.boxQuantity}
        </span>
        <Button
          onClick={() => updateQuantity(selectedQuantityType, 1)}
          variant="success"
          size="sm"
          className="min-w-[28px] h-7 px-1 opacity-60 hover:opacity-100 bg-green-500/80 hover:bg-green-500 flex items-center justify-center"
          icon={<PlusIcon className="h-3 w-3" />}
          data-product-id={product.id}
          data-quantity-type={selectedQuantityType}
        />
      </div>
    </motion.div>
  );
};
