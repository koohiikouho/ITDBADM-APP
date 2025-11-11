import React, { useState } from "react";
import { Button, cn } from "@heroui/react";
import { ShoppingCart, Check } from "lucide-react";

interface BigAddToCartButtonProps {
  onAddToCart?: () => void;
  className?: string;
  price?: string;
  showPrice?: boolean;
}

const BigAddToCartButton: React.FC<BigAddToCartButtonProps> = ({
  onAddToCart,
  className,
  price = "$29.99",
  showPrice = true,
}) => {
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    setIsAdded(true);
    onAddToCart?.();

    // Reset after 2 seconds
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
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
        className={cn(
          "h-16 text-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl",
          isAdded && "bg-success-500 text-white scale-105"
        )}
        startContent={
          isAdded ? (
            <Check size={28} className="animate-bounce" />
          ) : (
            <ShoppingCart size={28} />
          )
        }
      >
        {isAdded ? "Added to Cart! 🎉" : "Add to Cart"}
      </Button>
    </div>
  );
};

export default BigAddToCartButton;
