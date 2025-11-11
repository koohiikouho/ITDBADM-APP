import React, { useState } from "react";
import { Button, cn } from "@heroui/react";
import { Heart } from "lucide-react";

interface HeartButtonProps {
  initialLiked?: boolean;
  initialCount?: number;
  size?: "sm" | "md" | "lg";
  variant?: "flat" | "light" | "ghost" | "solid";
  showCount?: boolean;
  animated?: boolean;
  onLikeChange?: (isLiked: boolean, count: number) => void;
  className?: string;
}

const HeartButton: React.FC<HeartButtonProps> = ({
  initialLiked = false,
  initialCount = 0,
  size = "md",
  variant = "light",
  showCount = false,
  animated = true,
  onLikeChange,
  className,
}) => {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLike = () => {
    const newLikedState = !isLiked;
    const newCount = newLikedState ? likeCount + 1 : likeCount - 1;

    if (animated) {
      setIsAnimating(true);
    }

    setIsLiked(newLikedState);
    setLikeCount(newCount);

    onLikeChange?.(newLikedState, newCount);

    if (animated) {
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  const buttonSize = {
    sm: "h-8 min-w-8",
    md: "h-10 min-w-10",
    lg: "h-12 min-w-12",
  };

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const HeartIcon = () => (
    <Heart
      size={iconSize[size]}
      className={cn(
        "transition-all duration-300",
        isLiked && "fill-current",
        isAnimating && "animate-pulse"
      )}
    />
  );

  if (showCount) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          isIconOnly
          variant={variant}
          onPress={handleLike}
          className={cn(
            "transition-all duration-300",
            buttonSize[size],
            isLiked
              ? "text-red-500 bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900"
              : "text-default-500 hover:text-red-500",
            isAnimating && "scale-110"
          )}
        >
          <HeartIcon />
        </Button>
        {showCount && (
          <span
            className={cn(
              "font-medium transition-colors duration-300 min-w-8 text-center",
              isLiked ? "text-red-500" : "text-default-500",
              size === "sm"
                ? "text-sm"
                : size === "md"
                  ? "text-base"
                  : "text-lg"
            )}
          >
            {likeCount}
          </span>
        )}
      </div>
    );
  }

  return (
    <Button
      isIconOnly
      variant={variant}
      onPress={handleLike}
      className={cn(
        "transition-all duration-300",
        buttonSize[size],
        className,
        isLiked
          ? "text-red-500 bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900"
          : "text-default-500 hover:text-red-500",
        isAnimating && "scale-110"
      )}
    >
      <HeartIcon />
    </Button>
  );
};

export default HeartButton;
