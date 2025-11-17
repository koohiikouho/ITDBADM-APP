/* eslint-disable prettier/prettier */
import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardBody,
  Input,
  Pagination,
  Button,
  Select,
  SelectItem,
} from "@heroui/react";
import { CardItem } from "../types/types.ts";
import { useNavigate } from "react-router-dom";
import { Search, Filter, SlidersHorizontal, Grid3X3, List } from "lucide-react";
import { apiClient } from "@/lib/api.ts";

// Define the API response type
interface Band {
  id: number;
  name: string;
  genre: string;
  img: string;
  description_short: string;
  branch: number;
  members: number;
}

const CardGrid: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [cardData, setCardData] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const cardsPerPage = 9;

  // Get selected branch from localStorage on component mount and when storage changes
  useEffect(() => {
    const updateSelectedBranch = () => {
      const savedBranch = localStorage.getItem("selectedBranch");
      setSelectedBranch(savedBranch || "");
    };

    // Set initial branch
    updateSelectedBranch();

    // Listen for storage changes (in case branch is changed in another component)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selectedBranch") {
        updateSelectedBranch();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically in case the event doesn't fire (same tab)
    const interval = setInterval(updateSelectedBranch, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Fetch data from API
  useEffect(() => {
    const fetchCardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiClient.baseURL + "/bands");

        if (!response.ok) {
          throw new Error(`Failed to fetch bands: ${response.status}`);
        }

        const data: Band[] = await response.json();

        // Transform API data to match CardItem type
        const transformedData: CardItem[] = data.map((band: Band) => ({
          id: band.id,
          title: band.name,
          description: band.description_short,
          image: band.img,
          genre: band.genre,
          members: band.members,
          branch: band.branch,
        }));

        setCardData(transformedData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load bands");
        console.error("Error fetching bands:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCardData();
  }, []);

  // Filter and paginate data
  const filteredAndPaginatedData = useMemo(() => {
    // First filter by selected branch
    let filtered = cardData;

    if (selectedBranch) {
      filtered = cardData.filter(
        (item) => item.branch.toString() === selectedBranch
      );
    }

    // Then filter by search query
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort data
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        case "newest":
          return b.id - a.id;
        case "oldest":
          return a.id - b.id;
        default:
          return 0;
      }
    });

    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / cardsPerPage);
    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      totalPages,
      totalItems: filtered.length,
    };
  }, [
    cardData,
    selectedBranch,
    searchQuery,
    sortBy,
    currentPage,
    cardsPerPage,
  ]);

  const handleCardPress = (itemId: number): void => {
    console.log("Card pressed", itemId);
    navigate("/bandinfo/" + itemId);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSortBy("name");
    setCurrentPage(1);
  };

  // Get current branch name for display
  const getCurrentBranchName = () => {
    if (!selectedBranch) return "All Branches";

    // In a real app, you might want to fetch branch names from your API
    // For now, we'll use a simple mapping
    const branchNames: { [key: string]: string } = {
      "1": "Shibuya Music Hub",
      "2": "Akihabara Idol Center",
      "3": "Yokohama Livehouse",
    };

    return branchNames[selectedBranch] || `Branch ${selectedBranch}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-default-600">Loading bands...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center text-danger-500 py-16">
          <p className="text-xl font-semibold mb-2">Error loading bands</p>
          <p className="text-sm mb-4">{error}</p>
          <Button variant="flat" onPress={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Enhanced Search and Filter Bar */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Search Bar - Full width on mobile, flexible on desktop */}
          <div className="flex-1 w-full min-w-0">
            <Input
              placeholder="Search bands by name..."
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

          {/* Controls Section - Properly aligned in a row */}
          <div className="flex items-center gap-2 justify-end flex-wrap">
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
            {(searchQuery || sortBy !== "name") && (
              <Button
                variant="light"
                size="md"
                onPress={clearFilters}
                className="text-default-600 hover:text-default-800 whitespace-nowrap"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Indicator */}
        {(searchQuery || sortBy !== "name" || selectedBranch) && (
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
            {sortBy !== "name" && (
              <span className="bg-secondary-100 text-secondary-800 px-2 py-1 rounded-full text-xs font-medium">
                Sort:{" "}
                {sortBy === "name-desc"
                  ? "Name (Z-A)"
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
          {filteredAndPaginatedData.totalItems} bands
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
            Change branch in the navigation bar to see bands from other
            locations
          </p>
        )}
      </div>

      {/* Cards Grid - Updated to support view modes */}
      <div
        className={`mb-8 ${
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-4"
        }`}
      >
        {filteredAndPaginatedData.data.map((item: CardItem) => (
          <Card
            key={item.id}
            isPressable
            className={`hover:scale-105 transition-transform duration-200 shadow-lg ${
              viewMode === "grid" ? "h-64" : "h-32"
            }`}
            onPress={() => handleCardPress(item.id)}
          >
            <CardBody
              className="p-0 relative bg-cover bg-center"
              style={{ backgroundImage: `url(${item.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
                <h3
                  className={`font-semibold ${viewMode === "grid" ? "text-xl mb-1" : "text-lg"}`}
                >
                  {item.title}
                </h3>
                {/* Genre and Members info */}
                <div
                  className={`flex items-center gap-2 mb-1 ${viewMode === "grid" ? "text-xs" : "text-xs"}`}
                >
                  <span className="bg-white/20 px-2 py-1 rounded-full font-medium">
                    {item.genre}
                  </span>
                  <span className="text-gray-300">
                    {item.members} {item.members === 1 ? "member" : "members"}
                  </span>
                </div>
                <p
                  className={`text-gray-200 ${viewMode === "grid" ? "text-sm line-clamp-2" : "text-xs line-clamp-1"}`}
                >
                  {item.description}
                </p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* No Results Message */}
      {filteredAndPaginatedData.data.length === 0 && (
        <div className="text-center text-default-500 py-16">
          <Search size={48} className="mx-auto mb-4 text-default-300" />
          <p className="text-xl font-semibold mb-2">
            {selectedBranch
              ? "No bands found in this branch"
              : "No bands found"}
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

export default CardGrid;
