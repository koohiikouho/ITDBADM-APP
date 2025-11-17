import React, { useState, useEffect, useRef } from "react";
import { Pagination } from "@heroui/react";
import { Card, CardHeader, CardBody, CardFooter, Image } from "@heroui/react";
import { useNavigate } from "react-router-dom";

interface Product {
  product_id: number;
  name: string;
  price: string;
  description: string;
  category: string;
  image: {
    url: string;
  };
}

interface ProductCardProps {
  category: string;
  title: string;
  price: string;
  imageUrl: string;
  isNew?: boolean;
  onClick?: () => void;
}

interface ProductGridProps {
  bandId: string | undefined;
}

const ProductCard: React.FC<ProductCardProps & { index: number }> = ({
  category,
  title,
  price,
  imageUrl,
  onClick,
  index, // Add index prop
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(index < 3); // Set first 3 cards as visible immediately

  useEffect(() => {
    // First 3 cards are already visible, no animation needed
    if (index < 3) {
      return;
    }

    // Use intersection observer for the rest
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
  }, [index]);

  return (
    <div
      ref={cardRef}
      className={`
        ${index < 3 ? "opacity-100" : "transition-all duration-700 ease-out"}
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}
      onClick={onClick}
    >
      <Card className="hover:scale-105 transition-transform duration-200 shadow-lg border cursor-pointer">
        <CardHeader className="p-0 relative">
          <Image
            src={imageUrl}
            alt={title}
            className="w-82 h-82 object-cover"
            removeWrapper
          />
        </CardHeader>

        <CardBody className="p-0">
          <div className="space-ty-2 p-2 pb-0 overflow-hidden">
            <p className="text-sm text-gray-500 dark:text-gray-200 uppercase tracking-wide">
              {category}
            </p>
            <h3 className="text-lg font-semibold leading-tight">{title}</h3>
          </div>
        </CardBody>
        <CardFooter>
          <div className="flex items-center justify-between pt-0">
            <span className="text-l text-red-700 dark:text-red-300">
              {price}
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

const ProductGrid: React.FC<ProductGridProps> = ({ bandId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const productsPerPage = 12;

  const navigate = useNavigate();

  console.log("ProductGrid - Received bandId prop:", bandId);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("ProductGrid - Starting fetch with bandId:", bandId);

        if (!bandId) {
          console.error("ProductGrid - No bandId provided");
          throw new Error("No band ID provided");
        }

        // Clean up bandId
        const cleanBandId = bandId.trim();

        console.log(
          "Fetching products from:",
          `http://localhost:3000/bands/products/${cleanBandId}`
        );

        const response = await fetch(
          `http://localhost:3000/bands/products/${cleanBandId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch products: ${response.status} ${response.statusText}`
          );
        }

        const data: Product[] = await response.json();
        console.log("Products API Response:", data);

        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error("Unexpected response format:", data);
          throw new Error("Invalid response format from server");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching products"
        );
      } finally {
        setLoading(false);
      }
    };

    if (bandId) {
      fetchProducts();
    } else {
      console.log("ProductGrid - No bandId, setting loading to false");
      setLoading(false);
      setError("No band ID provided");
    }
  }, [bandId]);

  // Format price to JPY
  const formatPrice = (price: string) => {
    try {
      const numericPrice = parseFloat(price);
      return isNaN(numericPrice)
        ? price
        : `${numericPrice.toLocaleString("ja-JP")} JPY`;
    } catch {
      return price;
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = products.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-lg">Loading products...</div>
        <div className="text-sm text-gray-500 mt-2">
          Band ID: {bandId || "Not provided"}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-lg text-red-500">Error: {error}</div>
        <div className="text-sm text-gray-500 mt-2">
          Band ID: {bandId || "Not provided"}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-lg text-gray-500">
          No products found for this band
        </div>
        <div className="text-sm text-gray-500 mt-2">
          Band ID: {bandId || "Not provided"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentProducts.map((product, index) => (
            <ProductCard
              key={product.product_id}
              category={product.category}
              title={product.name}
              price={formatPrice(product.price)}
              imageUrl={product.image.url}
              index={index} // Pass the index
              onClick={() => handleProductClick(product.product_id)}
            />
          ))}
        </div>

        {/* Pagination Component */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination
              total={totalPages}
              page={currentPage}
              onChange={setCurrentPage}
              color="primary"
              showControls
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;
