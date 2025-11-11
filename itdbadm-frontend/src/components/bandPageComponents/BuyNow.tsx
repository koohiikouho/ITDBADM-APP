import React, { useState } from "react";
import { Button, cn } from "@heroui/react";
import { Check, Rocket, ShoppingBag, ArrowRight } from "lucide-react";

interface BuyNowButtonProps {
  onBuyNow?: () => void;
  className?: string;
  price?: string;
  showPrice?: boolean;
  redirectUrl?: string;
  icon?: "rocket" | "flash" | "shoppingBag" | "arrow";
}

const BuyNowButton: React.FC<BuyNowButtonProps> = ({
  onBuyNow,
  className,
  price = "$29.99",
  showPrice = true,
  redirectUrl = "/cart",
  icon = "rocket",
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBuyNow = () => {
    setIsProcessing(true);

    // Call the callback if provided
    onBuyNow?.();

    // Simulate processing time, then redirect
    setTimeout(() => {
      setIsProcessing(false);

      // Redirect to cart page
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    }, 1500);
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
    if (isProcessing) return "Processing...";

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
