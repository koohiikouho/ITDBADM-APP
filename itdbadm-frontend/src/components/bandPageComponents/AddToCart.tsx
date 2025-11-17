import React, { useState } from "react";
import { Button, cn } from "@heroui/react";
import { ShoppingCart, Check } from "lucide-react";
import { useParams } from "react-router-dom";
import { apiClient } from "@/lib/api";

interface BigAddToCartButtonProps {
  onAddToCart?: () => void;
  className?: string;
  price?: string;
  showPrice?: boolean;
}

interface CartResponse {
  message: string;
  action: string;
  product_id: number;
  new_quantity: number;
}

const BigAddToCartButton: React.FC<BigAddToCartButtonProps> = ({
  onAddToCart,
  className,
  price = "$29.99",
  showPrice = true,
}) => {
  const { productId } = useParams<{ productId: string }>();
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!productId) {
      console.error("No product ID found in URL");
      return;
    }

    setIsLoading(true);

    try {
      // Get JWT token from localStorage (adjust this based on your auth storage)
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      if (!token) {
        alert("Please log in to add items to cart");
        return;
      }

      const response = await fetch(apiClient.baseURL + "/carts/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: parseInt(productId),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add to cart: ${response.status}`);
      }

      const data: CartResponse = await response.json();
      console.log("Cart response:", data);

      // Success - show added state
      setIsAdded(true);
      onAddToCart?.();

      // Reset after 2 seconds
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      {showPrice && (
        <div className="text-center">
          <span className="text-4xl font-bold text-default-900">{price}</span>
        </div>
      )}

      <Button
        color="primary"
        variant="shadow"
        size="lg"
        onPress={handleAddToCart}
        isLoading={isLoading}
        disabled={isLoading || isAdded}
        className={cn(
          "h-16 text-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl",
          isAdded && "bg-success-500 text-white scale-105",
          isLoading && "opacity-70"
        )}
        startContent={
          isLoading ? null : isAdded ? (
            <Check size={28} className="animate-bounce" />
          ) : (
            <ShoppingCart size={28} />
          )
        }
      >
        {isLoading
          ? "Adding..."
          : isAdded
            ? "Added to Cart! 🎉"
            : "Add to Cart"}
      </Button>
    </div>
  );
};

export default BigAddToCartButton;
