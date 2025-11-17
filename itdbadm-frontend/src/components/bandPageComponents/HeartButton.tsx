import React, { useState, useEffect } from "react";
import { Button, cn } from "@heroui/react";
import { Heart } from "lucide-react";
import { apiClient } from "@/lib/api";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Get productId from URL parameters
  const getProductIdFromUrl = (): string | null => {
    // Method 1: Using URLSearchParams for query parameters (?productId=123)
    const urlParams = new URLSearchParams(window.location.search);
    const productIdFromQuery = urlParams.get("productId");
    if (productIdFromQuery) return productIdFromQuery;

    // Method 2: Extract from path parameters (/product/123)
    const pathSegments = window.location.pathname.split("/");
    const productIdFromPath = pathSegments[pathSegments.length - 1];

    // Check if it's a valid ID (not empty and not a common route)
    const commonRoutes = ["", "products", "shop", "store", "home", "index"];
    if (productIdFromPath && !commonRoutes.includes(productIdFromPath)) {
      return productIdFromPath;
    }

    // Method 3: Look for productId in any path segment
    for (const segment of pathSegments) {
      if (segment && !commonRoutes.includes(segment) && segment.length > 5) {
        return segment;
      }
    }

    return null;
  };

  // Fetch like status on component mount
  useEffect(() => {
    const fetchLikeStatus = async () => {
      const productId = getProductIdFromUrl();

      if (!productId) {
        console.warn("No productId found in URL");
        setIsInitialLoad(false);
        return;
      }

      try {
        setIsLoading(true);
        const token = localStorage.getItem("accessToken");

        if (!token) {
          console.warn("No access token found");
          setIsInitialLoad(false);
          return;
        }

        const response = await fetch(apiClient.baseURL + `/like/${productId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Assuming the API returns { isLiked: boolean, likeCount?: number }
          setIsLiked(data.isLiked || false);
          if (data.likeCount !== undefined) {
            setLikeCount(data.likeCount);
          }
        } else {
          console.error("Failed to fetch like status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching like status:", error);
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchLikeStatus();
  }, []);

  const handleLike = async () => {
    const productId = getProductIdFromUrl();

    if (!productId) {
      console.error("No productId found in URL");
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        console.error("No access token found");
        return;
      }

      if (animated) {
        setIsAnimating(true);
      }

      const response = await fetch(apiClient.baseURL + `/like/${productId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok || response.status === 201) {
        const data = await response.json();

        // Update state based on API response
        const newLikedState =
          data.isLiked !== undefined ? data.isLiked : !isLiked;
        setIsLiked(newLikedState);

        // Update count based on the API response or calculate locally
        if (data.likeCount !== undefined) {
          setLikeCount(data.likeCount);
        } else {
          const newCount = newLikedState ? likeCount + 1 : likeCount - 1;
          setLikeCount(newCount);
        }

        onLikeChange?.(
          newLikedState,
          data.likeCount || (newLikedState ? likeCount + 1 : likeCount - 1)
        );
      } else {
        console.error("Failed to toggle like:", response.status);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLoading(false);
      if (animated) {
        setTimeout(() => setIsAnimating(false), 600);
      }
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
        isAnimating && "animate-pulse",
        isLoading && "opacity-50"
      )}
    />
  );

  // Get current productId for conditional rendering
  const currentProductId = getProductIdFromUrl();

  // Don't render the button if no productId is found
  if (!currentProductId) {
    return (
      <Button
        isIconOnly
        variant={variant}
        disabled
        className={cn(
          buttonSize[size],
          className,
          "opacity-50 cursor-not-allowed"
        )}
      >
        <Heart size={iconSize[size]} />
      </Button>
    );
  }

  if (showCount) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          isIconOnly
          variant={variant}
          onPress={handleLike}
          disabled={isLoading || isInitialLoad}
          className={cn(
            "transition-all duration-300",
            buttonSize[size],
            isLiked
              ? "text-red-500 bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900"
              : "text-default-500 hover:text-red-500",
            isAnimating && "scale-110",
            (isLoading || isInitialLoad) && "opacity-50 cursor-not-allowed"
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
                  : "text-lg",
              (isLoading || isInitialLoad) && "opacity-50"
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
      disabled={isLoading || isInitialLoad}
      className={cn(
        "transition-all duration-300",
        buttonSize[size],
        className,
        isLiked
          ? "text-red-500 bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900"
          : "text-default-500 hover:text-red-500",
        isAnimating && "scale-110",
        (isLoading || isInitialLoad) && "opacity-50 cursor-not-allowed"
      )}
    >
      <HeartIcon />
    </Button>
  );
};

export default HeartButton;
