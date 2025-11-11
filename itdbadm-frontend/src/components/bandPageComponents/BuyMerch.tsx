import React from "react";
import { Button, cn } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Shirt, Star, Zap, Music } from "lucide-react";

interface BuyMerchButtonProps {
  variant?: "solid" | "flat" | "shadow" | "ghost" | "light";
  size?: "sm" | "md" | "lg";
  className?: string;
  theme?: "default" | "merch" | "premium" | "rock" | "limited";
}

const BuyMerchButton: React.FC<BuyMerchButtonProps> = ({
  variant = "solid",
  size = "md",
  className,
  theme = "default",
}) => {
  const navigate = useNavigate();

  const handleBuyMerch = () => {
    navigate("/bandinfo");
  };

  const getButtonStyles = () => {
    switch (theme) {
      case "merch":
        return "bg-gradient-to-r from-blue-500 to-teal-500 text-white border-0 shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-teal-600";
      case "premium":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg hover:shadow-xl hover:from-red-600 hover:to-pink-600";
      case "rock":
        return "bg-gradient-to-r from-gray-800 to-red-600 text-white border-0 shadow-lg hover:shadow-xl hover:from-gray-900 hover:to-red-700";
      case "limited":
        return "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-indigo-700";
      default:
        return "";
    }
  };

  const getIcon = () => {
    switch (theme) {
      case "merch":
        return <Shirt size={20} />;
      case "premium":
        return <Star size={20} />;
      case "rock":
        return <Zap size={20} />;
      case "limited":
        return <Music size={20} />;
      default:
        return <ShoppingBag size={20} />;
    }
  };

  const buttonSize = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-6 text-lg",
  };

  return (
    <Button
      variant={theme === "default" ? variant : "solid"}
      size={size}
      onPress={handleBuyMerch}
      className={cn(
        "font-semibold transition-all duration-200",
        buttonSize[size],
        getButtonStyles(),
        className
      )}
      startContent={getIcon()}
    >
      Buy Merchandise
    </Button>
  );
};

export default BuyMerchButton;
