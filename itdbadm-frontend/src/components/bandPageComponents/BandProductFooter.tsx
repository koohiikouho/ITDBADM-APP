import React, { useState, useEffect, useRef } from "react";
import { Pagination, Button } from "@heroui/react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Image,
  Badge,
} from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface Product {
  product_id: number;
  name: string;
  price: string;
  description: string;
  category: string;
  image: {
    url: string[];
  };
}

interface ProductCardProps {
  category: string;
  title: string;
  price: string;
  imageUrl: string;
  isNew?: boolean;
  productId: number;
  onProductClick: (productId: number) => void;
}

interface CompactProductGridProps {
  bandId: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  category,
  title,
  price,
  imageUrl,
  isNew,
  productId,
  onProductClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    console.log("Product card clicked, productId:", productId); // Debug log
    onProductClick(productId);
  };

  return (
    <div
      ref={cardRef}
      className={`
        transition-all duration-500 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      onClick={handleClick} // Move onClick to the div wrapper
    >
      <Card className="hover:scale-102 transition-transform duration-200 shadow-md border cursor-pointer">
        <CardHeader className="p-0 relative">
          <Image
            src={imageUrl}
            alt={title}
            className="w-full h-32 object-cover"
            removeWrapper
          />
          {isNew && (
            <Badge color="primary" className="absolute top-1 right-1 text-xs">
              NEW
            </Badge>
          )}
        </CardHeader>

        <CardBody className="p-2">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-200 uppercase tracking-wide truncate">
              {category}
            </p>
            <h3 className="text-sm font-semibold leading-tight line-clamp-2 h-10">
              {title}
            </h3>
          </div>
        </CardBody>
        <CardFooter className="p-2">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-bold text-red-700 dark:text-red-300">
              {price}
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

const CompactProductGrid: React.FC<CompactProductGridProps> = ({ bandId }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const productsPerPage = 5;

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      if (!bandId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          apiClient.baseURL + `/bands/products/${bandId}/max10`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Handle different response formats
        if (Array.isArray(data)) {
          // Direct array of products from API
          setProducts(data);
        } else if (data.message && !Array.isArray(data)) {
          // No products found message
          setProducts([]);
        } else if (data.error) {
          // Error response
          throw new Error(data.error);
        } else {
          // Unexpected format
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch products"
        );
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [bandId]);

  // Handle product click
  const handleProductClick = (productId: number) => {
    console.log("Navigating to product:", productId); // Debug log
    navigate(`/product/${productId}`);
  };

  // Format price to JPY
  const formatPrice = (price: string) => {
    const numericPrice = parseFloat(price);
    return isNaN(numericPrice)
      ? price
      : `${numericPrice.toLocaleString("ja-JP")} JPY`;
  };

  // Calculate pagination
  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = products.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to page 1 when products change
  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center py-8 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full text-center py-8 text-gray-500">
        <p>No products found for this band.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Compact Product Grid with Navigation Overlay */}
      <div className="relative">
        {/* Navigation Buttons - Positioned over the grid */}
        {totalPages > 1 && (
          <>
            {/* Left Navigation Button - Aligned with first card */}
            <Button
              isIconOnly
              variant="flat"
              onPress={goToPreviousPage}
              isDisabled={currentPage === 1}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border shadow-lg hover:bg-white dark:hover:bg-gray-800"
              size="lg"
            >
              <ChevronLeft size={24} />
            </Button>

            {/* Right Navigation Button - Aligned with last card */}
            <Button
              isIconOnly
              variant="flat"
              onPress={goToNextPage}
              isDisabled={currentPage === totalPages}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border shadow-lg hover:bg-white dark:hover:bg-gray-800"
              size="lg"
            >
              <ChevronRight size={24} />
            </Button>
          </>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {currentProducts.map((product) => (
            <ProductCard
              key={product.product_id}
              category={product.category}
              title={product.name}
              price={formatPrice(product.price)}
              imageUrl={product.image.url[0] || "/placeholder-image.jpg"}
              productId={product.product_id}
              onProductClick={handleProductClick}
              isNew={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompactProductGrid;
