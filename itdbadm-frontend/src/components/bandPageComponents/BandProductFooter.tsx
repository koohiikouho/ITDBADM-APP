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

interface ProductCardProps {
  category: string;
  title: string;
  price: string;
  imageUrl: string;
  isNew?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  category,
  title,
  price,
  imageUrl,
  isNew,
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

  return (
    <div
      ref={cardRef}
      className={`
        transition-all duration-500 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
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

const CompactProductGrid: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  const products = [
    {
      category: "アクリルフィギュア",
      title: "通常衣装重音テト アクリルフィギュア",
      price: "2,000 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: true,
    },
    {
      category: "アクリルフィギュア",
      title: "桜ミク アクリルフィギュア",
      price: "2,200 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1635830625698-3b9bd74671ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: false,
    },
    {
      category: "アクリルキーホルダー",
      title: "初音ミク キーホルダー",
      price: "1,500 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: true,
    },
    {
      category: "アクリルフィギュア",
      title: "鏡音リン アクリルフィギュア",
      price: "2,100 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: false,
    },
    {
      category: "アクリルフィギュア",
      title: "鏡音レン アクリルフィギュア",
      price: "2,100 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1635830625698-3b9bd74671ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: true,
    },
    {
      category: "アクリルキーホルダー",
      title: "巡音ルカ キーホルダー",
      price: "1,600 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: false,
    },
    {
      category: "アクリルフィギュア",
      title: "MEIKO アクリルフィギュア",
      price: "2,300 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: true,
    },
    {
      category: "アクリルフィギュア",
      title: "KAITO アクリルフィギュア",
      price: "2,300 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1635830625698-3b9bd74671ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: false,
    },
    {
      category: "アクリルフィギュア",
      title: "雪ミク アクリルフィギュア",
      price: "2,400 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: true,
    },
    {
      category: "アクリルキーホルダー",
      title: "重音テト キーホルダー",
      price: "1,700 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: false,
    },
  ];

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
          {currentProducts.map((product, index) => (
            <ProductCard
              key={`${currentPage}-${index}`}
              category={product.category}
              title={product.title}
              price={product.price}
              imageUrl={product.imageUrl}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompactProductGrid;
