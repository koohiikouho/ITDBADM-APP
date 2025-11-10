import React, { useState } from "react";
import { Pagination } from "@heroui/react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Image,
  Button,
  Badge,
} from "@heroui/react";

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
}) => {
  return (
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
          <span className="text-l text-red-700 dark:text-red-300">{price}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

const ProductGrid: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12; // 2 rows of 3 items

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
      title: "通常衣装重音テト アクリルフィギュア",
      price: "2,000 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: true,
    },
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
      title: "通常衣装重音テト アクリルフィギュア",
      price: "2,000 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: true,
    },
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
  ];

  // Calculate pagination
  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = products.slice(
    startIndex,
    startIndex + productsPerPage
  );

  return (
    <div className="min-h-screen">
      <div className="">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentProducts.map((product, index) => (
            <ProductCard
              key={index}
              category={product.category}
              title={product.title}
              price={product.price}
              imageUrl={product.imageUrl}
              isNew={product.isNew}
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
