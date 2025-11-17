import React, { useState } from "react";
import { Button, cn } from "@heroui/react";
import { Check, Rocket, ShoppingBag, ArrowRight } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

interface BuyNowButtonProps {
  onBuyNow?: () => void;
  className?: string;
  price?: string;
  showPrice?: boolean;
  redirectUrl?: string;
  icon?: "rocket" | "flash" | "shoppingBag" | "arrow";
}

interface CartResponse {
  message: string;
  action: string;
  product_id: number;
  new_quantity: number;
}

const BuyNowButton: React.FC<BuyNowButtonProps> = ({
  onBuyNow,
  className,
  price = "$29.99",
  showPrice = true,
  redirectUrl = "/cart",
  icon = "rocket",
}) => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBuyNow = async () => {
    if (!productId) {
      console.error("No product ID found in URL");
      return;
    }

    setIsProcessing(true);

    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem("accessToken");

      if (!token) {
        alert("Please log in to purchase items");
        return;
      }

      // Add item to cart via API
      const response = await fetch("http://localhost:3000/carts/add", {
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

      // Call the callback if provided
      onBuyNow?.();

      // Navigate directly to cart page
      navigate(redirectUrl);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart. Please try again.");
      setIsProcessing(false);
    }
  };

  // Icon configuration
  const getIcon = () => {
    if (isProcessing) {
      return <Check size={28} className="animate-bounce" />;
    }

    switch (icon) {
      case "rocket":
        return <Rocket size={28} />;
      case "shoppingBag":
        return <ShoppingBag size={28} />;
      case "arrow":
        return <ArrowRight size={28} />;
      default:
        return <Rocket size={28} />;
    }
  };

  const getButtonText = () => {
    if (isProcessing) return "Adding to Cart...";

    switch (icon) {
      case "rocket":
        return "Buy Now";
      case "flash":
        return "Buy Now";
      case "shoppingBag":
        return "Buy Now";
      case "arrow":
        return "Buy Now";
      default:
        return "Buy Now";
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
        color="success"
        variant="shadow"
        size="lg"
        onPress={handleBuyNow}
        isDisabled={isProcessing}
        className={cn(
          "h-16 text-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl",
          isProcessing && "bg-warning-500 text-white scale-105"
        )}
        startContent={getIcon()}
      >
        {getButtonText()}
      </Button>
    </div>
  );
};

export default BuyNowButton;
