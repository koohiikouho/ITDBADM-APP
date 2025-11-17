import DefaultLayout from "@/layouts/default";
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
  Users,
  Heart,
} from "lucide-react";
import { apiClient } from "@/lib/api";

interface Product {
  branch: number;
  id: number;
  band_name: string;
  name: string;
  description: string;
  category: string;
  price: string;
  img: {
    url: string[];
  };
  is_liked?: boolean;
}

interface ProductCardProps {
  bandName: string;
  category: string;
  title: string;
  price: string;
  imageUrl: string;
  type: "digital" | "physical";
  isLiked: boolean;
  onLikeToggle: (productId: number, liked: boolean) => void;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  bandName,
  category,
  title,
  price,
  imageUrl,
  type,
  isLiked,
  onLikeToggle,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);

  useEffect(() => {
    setLocalIsLiked(isLiked);
  }, [isLiked]);

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

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    const newLikedState = !localIsLiked;
    setLocalIsLiked(newLikedState);
    onLikeToggle(parseInt(title), newLikedState);
  };

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
            {getTypeBadge()}
          </div>
          {/* Heart Button */}
          <button
            onClick={handleLikeClick}
            className={`
              absolute top-2 left-2 rounded-full p-2 hover:scale-110 transition-transform duration-200
              ${
                localIsLiked
                  ? "bg-red-500/20 text-red-500"
                  : "bg-white/90 dark:bg-black/90 text-gray-600 hover:bg-red-500/20 hover:text-red-500"
              }
            `}
          >
            <Heart size={20} className={localIsLiked ? "fill-red-500" : ""} />
          </button>
        </CardHeader>

        <CardBody className="p-4 flex flex-col flex-1">
          <div className="space-y-2 flex-1">
            {/* Band Name */}
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <Users size={12} />
              <span className="font-medium">{bandName}</span>
            </div>

            {/* Category */}
            <p className="text-sm text-gray-500 dark:text-gray-200 uppercase tracking-wide">
              {category}
            </p>

            {/* Product Title */}
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

const LikedProducts: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [productType, setProductType] = useState<
    "all" | "digital" | "physical"
  >("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const productsPerPage = 12;

  // Get selected branch from localStorage
  useEffect(() => {
    const updateSelectedBranch = () => {
      const savedBranch = localStorage.getItem("selectedBranch");
      setSelectedBranch(savedBranch || "");
    };

    updateSelectedBranch();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selectedBranch") {
        updateSelectedBranch();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(updateSelectedBranch, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Fetch liked products from API
  useEffect(() => {
    const fetchLikedProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(
          "Fetching liked products from: " +
            apiClient.baseURL +
            "/like/my-likes"
        );

        // First, get the user's liked products
        const likesResponse = await fetch(
          apiClient.baseURL + "/like/my-likes",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (!likesResponse.ok) {
          throw new Error(
            `Failed to fetch liked products: ${likesResponse.status}`
          );
        }

        const likedProductIds = await likesResponse.json();
        console.log("Liked product IDs:", likedProductIds);

        // Then fetch all products and filter only the liked ones
        const productsResponse = await fetch(apiClient.baseURL + "/products");

        if (!productsResponse.ok) {
          throw new Error(
            `Failed to fetch products: ${productsResponse.status}`
          );
        }

        const allProducts: Product[] = await productsResponse.json();

        // Filter and mark liked products
        const likedProducts = allProducts
          .filter((product) => likedProductIds.includes(product.id))
          .map((product) => ({
            ...product,
            is_liked: true,
          }));

        console.log("Liked products:", likedProducts);
        setProducts(likedProducts);
      } catch (err) {
        console.error("Error fetching liked products:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching liked products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLikedProducts();
  }, []);

  // Handle like/unlike action
  const handleLikeToggle = async (productId: number, liked: boolean) => {
    try {
      const endpoint = liked ? "/like" : "/like"; // Use the same endpoint for toggling
      const method = "POST";

      const response = await fetch(
        `${apiClient.baseURL}${endpoint}/${productId}`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${liked ? "like" : "unlike"} product`);
      }

      // Update local state - remove product if unliked
      if (!liked) {
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product.id !== productId)
        );
      }

      console.log(
        `Product ${productId} ${liked ? "liked" : "unliked"} successfully`
      );
    } catch (err) {
      console.error(`Error ${liked ? "liking" : "unliking"} product:`, err);
      // Revert the local state if the API call fails
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId ? { ...product, is_liked: !liked } : product
        )
      );
    }
  };

  // Format price based on selected currency
  const formatPrice = (price: string) => {
    try {
      const numericPrice = parseFloat(price);
      if (isNaN(numericPrice)) return price;

      const selectedCurrency =
        localStorage.getItem("selectedCurrency") || "JPY";

      const currencyFormats: {
        [key: string]: { symbol: string; locale: string };
      } = {
        USD: { symbol: "$", locale: "en-US" },
        PHP: { symbol: "₱", locale: "en-PH" },
        JPY: { symbol: "¥", locale: "ja-JP" },
        VND: { symbol: "₫", locale: "vi-VN" },
      };

      const format = currencyFormats[selectedCurrency] || {
        symbol: "¥",
        locale: "ja-JP",
      };

      return `${format.symbol}${numericPrice.toLocaleString(format.locale)}`;
    } catch {
      return price;
    }
  };

  // Determine product type based on category
  const getProductType = (category: string): "digital" | "physical" => {
    return category.toLowerCase().includes("digital") ? "digital" : "physical";
  };

  // Get first image URL from the array
  const getFirstImageUrl = (imgUrls: string[]): string => {
    return imgUrls && imgUrls.length > 0
      ? imgUrls[0]
      : "/api/placeholder/300/300";
  };

  // Filter and paginate data
  const filteredAndPaginatedData = useMemo(() => {
    // Filter by branch, search query and product type
    let filtered = products.filter((item) => {
      // Filter by branch
      const matchesBranch =
        !selectedBranch || item.branch.toString() === selectedBranch;

      // Filter by search query
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.band_name.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by product type
      const itemType = getProductType(item.category);
      const matchesType = productType === "all" || itemType === productType;

      return matchesBranch && matchesSearch && matchesType;
    });

    // Sort data
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-low":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-high":
          return parseFloat(b.price) - parseFloat(a.price);
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
    selectedBranch,
    searchQuery,
    sortBy,
    productType,
    currentPage,
    productsPerPage,
  ]);

  const handleProductClick = (productId: number): void => {
    console.log("Product pressed", productId);
    navigate(`/product/${productId}`);
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

  // Get current branch name for display
  const getCurrentBranchName = () => {
    if (!selectedBranch) return "All Branches";

    const branchNames: { [key: string]: string } = {
      "1": "Shibuya Music Hub",
      "2": "Akihabara Idol Center",
      "3": "Yokohama Livehouse",
    };

    return branchNames[selectedBranch] || `Branch ${selectedBranch}`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-center items-center py-16">
          <div className="text-lg">Loading your liked products...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-center items-center py-16">
          <div className="text-lg text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center py-16">
          <Heart size={64} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-4">No Liked Products Yet</h2>
          <p className="text-gray-600 mb-8">
            Products you like will appear here. Start exploring and add some
            favorites!
          </p>
          <Button
            color="primary"
            onPress={() => navigate("/products")}
            size="lg"
          >
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Liked Products</h1>
        <p className="text-gray-600">
          Products you've liked. Click the heart to remove them from your list.
        </p>
      </div>

      {/* Enhanced Search and Filter Bar */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 w-full min-w-0">
            <Input
              placeholder="Search your liked products..."
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
        {(searchQuery ||
          sortBy !== "name" ||
          productType !== "all" ||
          selectedBranch) && (
          <div className="flex flex-wrap gap-2 mt-3 items-center text-sm text-default-500">
            <SlidersHorizontal size={14} />
            <span className="text-xs">Active filters:</span>
            {selectedBranch && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                Branch: {getCurrentBranchName()}
              </span>
            )}
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
          {filteredAndPaginatedData.totalItems} liked products
          {selectedBranch && (
            <span>
              {" "}
              from{" "}
              <span className="font-semibold">{getCurrentBranchName()}</span>
            </span>
          )}
          {searchQuery && (
            <span>
              {" "}
              for "<span className="font-semibold">{searchQuery}</span>"
            </span>
          )}
        </p>
        {selectedBranch && (
          <p className="text-sm text-default-500 mt-1">
            Change branch in the navigation bar to see products from other
            locations
          </p>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {filteredAndPaginatedData.data.map((product: Product) => (
          <ProductCard
            key={product.id}
            bandName={product.band_name}
            category={product.category}
            title={product.name}
            price={formatPrice(product.price)}
            imageUrl={getFirstImageUrl(product.img.url)}
            type={getProductType(product.category)}
            isLiked={product.is_liked || false}
            onLikeToggle={handleLikeToggle}
            onClick={() => handleProductClick(product.id)}
          />
        ))}
      </div>

      {/* No Results Message */}
      {filteredAndPaginatedData.data.length === 0 && (
        <div className="text-center text-default-500 py-16">
          <Search size={48} className="mx-auto mb-4 text-default-300" />
          <p className="text-xl font-semibold mb-2">
            {selectedBranch
              ? "No liked products found in this branch"
              : "No liked products found"}
          </p>
          <p className="text-sm mb-4">
            {selectedBranch
              ? "Try changing your branch selection or search terms"
              : "Try adjusting your search terms or filters"}
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="flat" onPress={clearFilters}>
              Clear Search & Filters
            </Button>
            {selectedBranch && (
              <Button
                variant="flat"
                onPress={() => {
                  localStorage.removeItem("selectedBranch");
                  setSelectedBranch("");
                }}
              >
                View All Branches
              </Button>
            )}
          </div>
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

export default function LikesPage() {
  return (
    <DefaultLayout>
      <LikedProducts />
    </DefaultLayout>
  );
}
