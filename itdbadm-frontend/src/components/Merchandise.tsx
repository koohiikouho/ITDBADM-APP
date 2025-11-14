/* eslint-disable prettier/prettier */
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Card,
  CardBody,
  Input,
  Pagination,
  Button,
  Select,
  SelectItem,
  Badge,
  Image,
  CardHeader,
  CardFooter,
} from "@heroui/react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Grid3X3,
  List,
  Download,
  Package,
} from "lucide-react";

interface Product {
  id: number;
  category: string;
  title: string;
  price: string;
  imageUrl: string;
  isNew?: boolean;
  type: "digital" | "physical";
  description?: string;
}

interface ProductCardProps {
  category: string;
  title: string;
  price: string;
  imageUrl: string;
  isNew?: boolean;
  type: "digital" | "physical";
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  category,
  title,
  price,
  imageUrl,
  isNew,
  type,
  onClick,
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

  const getTypeBadge = () => {
    if (type === "digital") {
      return (
        <Badge color="secondary" variant="flat" size="sm">
          <Download size={12} className="mr-1" />
          Digital
        </Badge>
      );
    } else {
      return (
        <Badge color="primary" variant="flat" size="sm">
          <Package size={12} className="mr-1" />
          Physical
        </Badge>
      );
    }
  };

  return (
    <div
      ref={cardRef}
      className={`
        transition-all duration-700 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}
      onClick={onClick}
    >
      <Card className="hover:scale-105 transition-transform duration-200 shadow-lg border cursor-pointer h-full">
        <CardHeader className="p-0 relative">
          <Image
            src={imageUrl}
            alt={title}
            className="w-full h-48 object-cover"
            removeWrapper
          />
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {isNew && (
              <Badge color="primary" size="sm">
                NEW
              </Badge>
            )}
            {getTypeBadge()}
          </div>
        </CardHeader>

        <CardBody className="p-4 flex flex-col flex-1">
          <div className="space-y-2 flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-200 uppercase tracking-wide">
              {category}
            </p>
            <h3 className="text-lg font-semibold leading-tight line-clamp-2">
              {title}
            </h3>
          </div>
        </CardBody>
        <CardFooter className="pt-0">
          <div className="flex items-center justify-between w-full">
            <span className="text-lg font-bold text-red-700 dark:text-red-300">
              {price}
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

const ProductGrid: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [productType, setProductType] = useState<
    "all" | "digital" | "physical"
  >("all");
  const productsPerPage = 12;

  // Product data with digital and physical types
  const products: Product[] = [
    {
      id: 1,
      category: "Acrylic Figure",
      title: "Casual Outfit Kasane Teto Acrylic Figure",
      price: "2,000 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: true,
      type: "physical",
      description:
        "High-quality acrylic figure. Faithfully reproduces Kasane Teto's casual outfit.",
    },
    {
      id: 2,
      category: "Digital Art",
      title: "Hatsune Miku Digital Illustration Collection",
      price: "1,500 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1635830625698-3b9bd74671ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: true,
      type: "digital",
      description:
        "High-resolution digital illustration collection. Available for download in PNG and JPG formats.",
    },
    {
      id: 3,
      category: "Acrylic Keychain",
      title: "Kagamine Rin Keychain",
      price: "1,200 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: false,
      type: "physical",
      description:
        "Convenient acrylic keychain for carrying. Can be attached to bags or keys.",
    },
    {
      id: 4,
      category: "Digital Music",
      title: "Kessoku Band Digital Album",
      price: "2,500 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: true,
      type: "digital",
      description:
        "Digital album available for download in MP3 and FLAC formats.",
    },
    {
      id: 5,
      category: "Acrylic Figure",
      title: "Sakura Miku Acrylic Figure",
      price: "2,200 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: false,
      type: "physical",
      description:
        "Limited edition Sakura Miku acrylic figure with spring theme.",
    },
    {
      id: 6,
      category: "Digital Stickers",
      title: "Vocaloid Digital Sticker Set",
      price: "800 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: true,
      type: "digital",
      description:
        "PNG sticker set usable on social media and digital devices.",
    },
    {
      id: 7,
      category: "Acrylic Figure",
      title: "Kagamine Len Acrylic Figure",
      price: "2,100 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1635830625698-3b9bd74671ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: true,
      type: "physical",
      description:
        "Colorful Kagamine Len acrylic figure. Perfect for desktop display.",
    },
    {
      id: 8,
      category: "Digital Wallpaper",
      title: "4K Anime Wallpaper Collection",
      price: "1,000 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: false,
      type: "digital",
      description:
        "High-resolution 4K wallpaper collection for smartphones and PCs.",
    },
    {
      id: 9,
      category: "Acrylic Keychain",
      title: "Megurine Luka Keychain",
      price: "1,600 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: false,
      type: "physical",
      description:
        "Limited edition keychain featuring the popular character Megurine Luka.",
    },
    {
      id: 10,
      category: "Digital Font",
      title: "Anime Style Japanese Font",
      price: "3,000 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: true,
      type: "digital",
      description:
        "Commercially usable anime-style Japanese font. Available in OTF and TTF formats.",
    },
    {
      id: 11,
      category: "Acrylic Figure",
      title: "MEIKO Acrylic Figure",
      price: "2,300 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: true,
      type: "physical",
      description:
        "MEIKO acrylic figure exuding mature charm. A must-have for collectors.",
    },
    {
      id: 12,
      category: "Digital Brushes",
      title: "Clip Studio Paint Brush Set",
      price: "1,800 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1571974599782-87624638275f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: false,
      type: "digital",
      description: "High-quality digital brush set for professional creators.",
    },
    {
      id: 13,
      category: "Acrylic Figure",
      title: "KAITO Acrylic Figure",
      price: "2,300 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1635830625698-3b9bd74671ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: false,
      type: "physical",
      description:
        "Acrylic figure expressing the cool KAITO. Limited production item.",
    },
    {
      id: 14,
      category: "Digital 3D Model",
      title: "Vocaloid Character 3D Model",
      price: "5,000 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: true,
      type: "digital",
      description:
        "High-quality 3D character model compatible with Blender and Maya.",
    },
    {
      id: 15,
      category: "Acrylic Stand",
      title: "Oshi no Ko Acrylic Stand",
      price: "1,800 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: true,
      type: "physical",
      description:
        "Cute acrylic stand to decorate your desk or shelf. Self-standing.",
    },
    {
      id: 16,
      category: "Digital Course",
      title: "Anime Art Digital Painting Course",
      price: "8,000 JPY",
      imageUrl:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      isNew: false,
      type: "digital",
      description:
        "Online digital painting course to learn professional techniques.",
    },
  ];

  // Filter and paginate data
  const filteredAndPaginatedData = useMemo(() => {
    // Filter by search query and product type
    let filtered = products.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = productType === "all" || item.type === productType;
      return matchesSearch && matchesType;
    });

    // Sort data
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        case "price-low":
          return (
            parseFloat(a.price.replace(/[^0-9.]/g, "")) -
            parseFloat(b.price.replace(/[^0-9.]/g, ""))
          );
        case "price-high":
          return (
            parseFloat(b.price.replace(/[^0-9.]/g, "")) -
            parseFloat(a.price.replace(/[^0-9.]/g, ""))
          );
        case "newest":
          return b.id - a.id;
        case "oldest":
          return a.id - b.id;
        default:
          return 0;
      }
    });

    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      totalPages,
      totalItems: filtered.length,
    };
  }, [
    products,
    searchQuery,
    sortBy,
    productType,
    currentPage,
    productsPerPage,
  ]);

  const handleProductClick = (productId: number): void => {
    console.log("Product pressed", productId);
    navigate("/product");
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSortBy("name");
    setProductType("all");
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Enhanced Search and Filter Bar */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 w-full min-w-0">
            <Input
              placeholder="Search by product name or category..."
              value={searchQuery}
              onValueChange={handleSearchChange}
              startContent={<Search size={20} className="text-default-400" />}
              endContent={
                searchQuery && (
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onPress={() => setSearchQuery("")}
                    className="text-default-400 hover:text-default-600 min-w-8 h-8"
                  >
                    ×
                  </Button>
                )
              }
              className="w-full"
              size="lg"
              variant="flat"
              classNames={{
                input: "text-lg",
                inputWrapper:
                  "bg-default-100/50 hover:bg-default-100 border-1 border-default-200 shadow-sm h-12",
              }}
            />
          </div>

          {/* Controls Section */}
          <div className="flex items-center gap-2 justify-end flex-wrap">
            {/* Product Type Filter */}
            <Select
              selectedKeys={[productType]}
              onSelectionChange={(keys) =>
                setProductType(
                  Array.from(keys)[0] as "all" | "digital" | "physical"
                )
              }
              className="w-32"
              size="md"
              variant="flat"
            >
              <SelectItem key="all" textValue="All Products">
                All
              </SelectItem>
              <SelectItem key="digital" textValue="Digital Products">
                Digital
              </SelectItem>
              <SelectItem key="physical" textValue="Physical Products">
                Physical
              </SelectItem>
            </Select>

            {/* Sort Dropdown */}
            <Select
              selectedKeys={[sortBy]}
              onSelectionChange={(keys) =>
                setSortBy(Array.from(keys)[0] as string)
              }
              className="w-40"
              size="md"
              variant="flat"
              startContent={<Filter size={16} className="text-default-400" />}
            >
              <SelectItem key="name" textValue="Name (A-Z)">
                Name (A-Z)
              </SelectItem>
              <SelectItem key="name-desc" textValue="Name (Z-A)">
                Name (Z-A)
              </SelectItem>
              <SelectItem key="price-low" textValue="Price (Low to High)">
                Price (Low to High)
              </SelectItem>
              <SelectItem key="price-high" textValue="Price (High to Low)">
                Price (High to Low)
              </SelectItem>
              <SelectItem key="newest" textValue="Newest First">
                Newest First
              </SelectItem>
              <SelectItem key="oldest" textValue="Oldest First">
                Oldest First
              </SelectItem>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex bg-default-100 rounded-lg p-1 border-1 border-default-200">
              <Button
                isIconOnly
                variant={viewMode === "grid" ? "solid" : "light"}
                size="sm"
                onPress={() => setViewMode("grid")}
                className="min-w-9 h-9"
              >
                <Grid3X3 size={16} />
              </Button>
              <Button
                isIconOnly
                variant={viewMode === "list" ? "solid" : "light"}
                size="sm"
                onPress={() => setViewMode("list")}
                className="min-w-9 h-9"
              >
                <List size={16} />
              </Button>
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || sortBy !== "name" || productType !== "all") && (
              <Button
                variant="light"
                size="md"
                onPress={clearFilters}
                className="text-default-600 hover:text-default-800 whitespace-nowrap"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Indicator */}
        {(searchQuery || sortBy !== "name" || productType !== "all") && (
          <div className="flex flex-wrap gap-2 mt-3 items-center text-sm text-default-500">
            <SlidersHorizontal size={14} />
            <span className="text-xs">Active filters:</span>
            {searchQuery && (
              <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium">
                Search: "{searchQuery}"
              </span>
            )}
            {productType !== "all" && (
              <span className="bg-secondary-100 text-secondary-800 px-2 py-1 rounded-full text-xs font-medium">
                Type: {productType === "digital" ? "Digital" : "Physical"}
              </span>
            )}
            {sortBy !== "name" && (
              <span className="bg-warning-100 text-warning-800 px-2 py-1 rounded-full text-xs font-medium">
                Sort:{" "}
                {sortBy === "name-desc"
                  ? "Name (Z-A)"
                  : sortBy === "price-low"
                    ? "Price (Low to High)"
                    : sortBy === "price-high"
                      ? "Price (High to Low)"
                      : sortBy === "newest"
                        ? "Newest First"
                        : sortBy === "oldest"
                          ? "Oldest First"
                          : ""}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-6 text-center">
        <p className="text-default-600">
          Showing {filteredAndPaginatedData.data.length} of{" "}
          {filteredAndPaginatedData.totalItems} products
          {searchQuery && (
            <span>
              {" "}
              for "<span className="font-semibold">{searchQuery}</span>"
            </span>
          )}
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {filteredAndPaginatedData.data.map((product: Product) => (
          <ProductCard
            key={product.id}
            category={product.category}
            title={product.title}
            price={product.price}
            imageUrl={product.imageUrl}
            isNew={product.isNew}
            type={product.type}
            onClick={() => handleProductClick(product.id)}
          />
        ))}
      </div>

      {/* No Results Message */}
      {filteredAndPaginatedData.data.length === 0 && (
        <div className="text-center text-default-500 py-16">
          <Search size={48} className="mx-auto mb-4 text-default-300" />
          <p className="text-xl font-semibold mb-2">No products found</p>
          <p className="text-sm mb-4">
            Try adjusting your search terms or filters
          </p>
          <Button variant="flat" onPress={clearFilters}>
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Pagination */}
      {filteredAndPaginatedData.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            total={filteredAndPaginatedData.totalPages}
            page={currentPage}
            onChange={setCurrentPage}
            color="primary"
            size="lg"
            showControls
            classNames={{
              cursor: "bg-gradient-to-r from-primary-500 to-secondary-500",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
