/* eslint-disable prettier/prettier */
import React, { useState, useMemo } from "react";
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

const CardGrid: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const cardsPerPage = 9;

  // Your card data with TypeScript typing
  const cardData: CardItem[] = [
    {
      id: 1,
      title: "Kessoku Band",
      description:
        "From Bocchi the Rock! - A high school band featuring the socially anxious Hitori Gotō as lead guitarist.",
      image:
        "https://i.discogs.com/BMjajOwTBf2TAm2Z-Oe_pSPqFjRvfpnK3AAEJf_rIdo/rs:fit/g:sm/q:90/h:337/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9BLTEyMjgz/NTQ5LTE2NzM1MzIx/MDMtNzM1OS5qcGVn.jpeg",
    },
    {
      id: 2,
      title: "Girls Dead Monster",
      description:
        "From Angel Beats! - A band formed in the afterlife, performing rock music to reach the hearts of students.",
      image:
        "https://i.discogs.com/60rBt_Ogu736vgrrTjgBg-tGV1NVraqhihFNl1Ca52k/rs:fit/g:sm/q:90/h:353/w:500/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9BLTQ0Mzg4/MzMtMTQzNjIwOTg1/NS0yODI5LmpwZWc.jpeg",
    },
    {
      id: 3,
      title: "Afterglow",
      description:
        "From BanG Dream! - A band of childhood friends who play powerful rock music together.",
      image:
        "https://i.bandori.party/u/asset/Q0lA5TBedroom-Afterglow-aMfppm.png",
    },
    {
      id: 4,
      title: "Poppin'Party",
      description:
        "From BanG Dream! - The main band known for their cheerful pop-rock sound and energetic performances.",
      image:
        "https://espguitars.co.jp/wp-content/uploads/2020/08/poppinparty_202303.jpg",
    },
    {
      id: 5,
      title: "Roselia",
      description:
        "From BanG Dream! - A gothic-style band known for their professional-level skills and dramatic performances.",
      image:
        "https://upload.wikimedia.org/wikipedia/en/d/d3/Roselia_BanG_Dream_Girls_Band_Party.png",
    },
    {
      id: 6,
      title: "RAISE A SUILEN",
      description:
        "From BanG Dream! - An intense electronic rock band known for their powerful sound and technical proficiency.",
      image:
        "https://bang-dream.bushimo.jp/raise-a-suilen/assets/images/common/ogp_01.png",
    },
    {
      id: 7,
      title: "Morfonica",
      description:
        "From BanG Dream! - A band that incorporates violin into their rock sound, creating a unique musical style.",
      image:
        "https://upload.wikimedia.org/wikipedia/en/4/49/Morfonica_BanG_Dream_art.jpg",
    },
    {
      id: 8,
      title: "MyGO!!!!!",
      description:
        "From BanG Dream! - A band formed through complicated relationships, known for their emotional performances.",
      image:
        "https://lh3.googleusercontent.com/Atk5OqGN7c0rncsz6FWt6ct0yK0MEji3m8VkYFq4v1V3jp9vjRw-T43L4xs1J8FA18Y8sg1fs0L0ot4=w2880-h1200-p-l90-rj",
    },
    {
      id: 9,
      title: "Ave Mujica",
      description:
        "From BanG Dream! - A mysterious band with a dark, theatrical style and occult themes.",
      image:
        "https://i.bandori.party/u/asset/r2hkX7Anime-Key-Visual-Ave-Mujica-ZdfRoG.jfif",
    },
    {
      id: 10,
      title: "Ho-kago Tea Time",
      description:
        "From K-ON! - The iconic light music club band known for their fun, pop-oriented songs and slice-of-life adventures.",
      image:
        "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 11,
      title: "SOS Brigade Band",
      description:
        "From The Melancholy of Haruhi Suzumiya - The unofficial band formed by Haruhi and friends for the school festival.",
      image:
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 12,
      title: "Black Heaven",
      description:
        "From Detroit Metal City - A death metal band with an outrageous stage persona contrasting their normal daily lives.",
      image:
        "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 13,
      title: "The Girls' Rock Club",
      description:
        "From Show by Rock!! - Bands of girl musicians in a world where music has magical powers.",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 14,
      title: "Fukashigi no Carte",
      description:
        "From Rascal Does Not Dream of Bunny Girl Senpai - The band that performs the series' iconic ending theme.",
      image:
        "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 15,
      title: "Crescent Moon Band",
      description:
        "From Carole & Tuesday - A band formed by two girls from different backgrounds creating music on Mars.",
      image:
        "https://images.unsplash.com/photo-1571974599782-87624638275f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 16,
      title: "The Zodiac Signs",
      description:
        "From Given - Bands featured in this BL anime about music, relationships, and emotional healing through rock.",
      image:
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 17,
      title: "Togenashi Togeari",
      description:
        "From Nana - Bands in the story of two women both named Nana and their connections to the music world.",
      image:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 18,
      title: "Rin!",
      description:
        "From Tari Tari - A choir club that evolves into performing band arrangements with passionate energy.",
      image:
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 19,
      title: "ST☆RISH",
      description:
        "From Uta no Prince-sama - An idol band of handsome male singers competing in the music industry.",
      image:
        "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 20,
      title: "Plasmagica",
      description:
        "From Show by Rock!! - A rookie band consisting of a cat, dog, sheep, and alien working toward their dreams.",
      image:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
  ];

  // Filter and paginate data
  const filteredAndPaginatedData = useMemo(() => {
    // Filter by search query
    let filtered = cardData.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
  }, [cardData, searchQuery, sortBy, currentPage, cardsPerPage]);

  const handleCardPress = (itemId: number): void => {
    console.log("Card pressed", itemId);
    navigate("/bandinfo");
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
        {(searchQuery || sortBy !== "name") && (
          <div className="flex flex-wrap gap-2 mt-3 items-center text-sm text-default-500">
            <SlidersHorizontal size={14} />
            <span className="text-xs">Active filters:</span>
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
          {searchQuery && (
            <span>
              {" "}
              for "<span className="font-semibold">{searchQuery}</span>"
            </span>
          )}
        </p>
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
          <p className="text-xl font-semibold mb-2">No bands found</p>
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

export default CardGrid;
