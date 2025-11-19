// src/components/OffersPage.tsx
import { useState, useEffect } from "react";
import {
  MusicalNoteIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import type { Offer, OfferStatus } from "../types/offer";
import { apiClient } from "@/lib/api";
import { formatPrice } from "@/lib/currencyFormatter";

// API Response Type
interface ApiOffer {
  offer_id: number;
  band_id: number;
  booking_date: string;
  description: string;
  price: string;
  status: string;
  date_created: string;
  name: string; // Band name is now included in the response
}

const OffersPage = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OfferStatus | "all">("all");
  const [showRetractModal, setShowRetractModal] = useState<string | null>(null);

  // Fetch offers from API
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError(null);

        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          throw new Error("No access token found. Please log in.");
        }

        const response = await fetch(
          apiClient.baseURL +
            "/bookings/user?currency=" +
            localStorage.getItem("selectedCurrency"),
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Authentication failed. Please log in again.");
          }
          throw new Error(`Failed to fetch offers: ${response.statusText}`);
        }

        const data = await response.json();

        // SAFETY CHECK: Ensure data is an array
        if (!data) {
          setOffers([]);
          return;
        }

        // Handle different response formats safely
        let offersData: ApiOffer[] = [];

        if (Array.isArray(data)) {
          offersData = data;
        } else if (data && Array.isArray(data.offers)) {
          offersData = data.offers;
        } else if (data && data.message) {
          // If it's a message like "No offers found", return empty array
          setOffers([]);
          return;
        } else {
          // Fallback for any other response format
          setOffers([]);
          return;
        }

        // Transform API data to match Offer type with safety checks
        const transformedOffers: Offer[] = offersData
          .filter(
            (offer): offer is ApiOffer =>
              offer &&
              typeof offer.offer_id === "number" &&
              typeof offer.name === "string"
          )
          .map((offer) => ({
            id: `OFF-${offer.offer_id.toString().padStart(3, "0")}`,
            bandName: offer.name || "Unknown Band", // Fallback for missing band name
            bookingDate: offer.booking_date || new Date().toISOString(), // Fallback for missing date
            description: offer.description || "No description provided",
            price: parseFloat(offer.price) || 0, // Fallback for invalid price
            status: mapStatusToOfferStatus(offer.status),
            filedDate: offer.date_created || new Date().toISOString(), // Fallback for missing date
          }));

        setOffers(transformedOffers);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load offers");
        console.error("Error fetching offers:", err);
        // Ensure offers is always an array even on error
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // Map API status to OfferStatus type
  const mapStatusToOfferStatus = (status: string): OfferStatus => {
    const statusMap: Record<string, OfferStatus> = {
      Pending: "pending",
      Accepted: "accepted",
      Rejected: "rejected",
      Retracted: "retracted",
      pending: "pending",
      accepted: "accepted",
      rejected: "rejected",
      retracted: "retracted",
    };
    return statusMap[status] || "pending";
  };

  const retractOffer = async (offerId: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("No access token found");
      }

      // Extract numeric ID from "OFF-001" format
      const numericId = offerId.replace("OFF-", "");

      // Use DELETE method instead of PATCH
      const response = await fetch(
        `http://localhost:3000/bookings/${numericId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete offer");
      }

      // Remove the offer from local state
      setOffers((prev) => {
        // SAFETY CHECK: Ensure prev is an array
        if (!Array.isArray(prev)) {
          return [];
        }
        return prev.filter((offer) => offer.id !== offerId);
      });
      setShowRetractModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete offer");
      console.error("Error deleting offer:", err);
    }
  };

  const getStatusColor = (status: OfferStatus): string => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      accepted: "bg-green-100 text-green-800 border-green-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
      retracted: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[status];
  };

  const getStatusText = (status: OfferStatus): string => {
    const texts = {
      pending: "Pending",
      accepted: "Accepted",
      rejected: "Rejected",
      retracted: "Retracted",
    };
    return texts[status];
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Invalid date:", dateString);
      return "Invalid date";
    }
  };

  const isRetractable = (status: OfferStatus): boolean => {
    return status === "pending";
  };

  // SAFETY CHECK: Ensure offers is always treated as an array
  const safeOffers = Array.isArray(offers) ? offers : [];

  const filteredOffers = (() => {
    if (statusFilter === "all") {
      return safeOffers;
    }
    return safeOffers.filter((offer) => offer.status === statusFilter);
  })();

  const statusOptions: { value: OfferStatus | "all"; label: string }[] = [
    { value: "all", label: "All Offers" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
    { value: "retracted", label: "Retracted" },
  ];

  // Calculate statistics safely
  const totalOffers = safeOffers.length;
  const pendingOffers = safeOffers.filter(
    (offer) => offer.status === "pending"
  ).length;
  const acceptedOffers = safeOffers.filter(
    (offer) => offer.status === "accepted"
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <MusicalNoteIcon className="h-12 w-12 text-black dark:text-white animate-bounce mx-auto mb-4" />
          <p className="text-black dark:text-white">Loading offers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-black dark:text-white mb-2">
            Error Loading Offers
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <MusicalNoteIcon className="h-8 w-8 text-black dark:text-white" />
            <h1 className="text-3xl font-bold text-black dark:text-white">
              Band Offers
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all offers submitted to bands
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <MusicalNoteIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Offers
                </p>
                <p className="text-2xl font-bold text-black dark:text-white">
                  {totalOffers}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <MusicalNoteIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending
                </p>
                <p className="text-2xl font-bold text-black dark:text-white">
                  {pendingOffers}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <MusicalNoteIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Accepted
                </p>
                <p className="text-2xl font-bold text-black dark:text-white">
                  {acceptedOffers}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-black dark:text-white">
              Filter by status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as OfferStatus | "all")
              }
              className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredOffers.length} of {safeOffers.length} offers
            </span>
          </div>
        </div>

        {/* Offers List */}
        <div className="space-y-4">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg p-6 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Column 1: Basic Info */}
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Offer ID
                      </label>
                      <p className="text-lg font-semibold text-black dark:text-white">
                        {offer.id}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Band
                      </label>
                      <p className="text-black dark:text-white font-medium">
                        {offer.bandName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Booking Date
                      </label>
                      <p className="text-black dark:text-white">
                        {formatDate(offer.bookingDate)}
                      </p>
                    </div>
                  </div>

                  {/* Column 2: Description & Price */}
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Description
                      </label>
                      <p className="text-black dark:text-white line-clamp-2">
                        {offer.description}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Price
                      </label>
                      <p className="text-lg font-semibold text-black dark:text-white">
                        {formatPrice(offer.price, "symbol")}
                      </p>
                    </div>
                  </div>

                  {/* Column 3: Status & Actions */}
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </label>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(offer.status)}`}
                      >
                        {getStatusText(offer.status)}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Filed Date
                      </label>
                      <p className="text-black dark:text-white">
                        {formatDate(offer.filedDate)}
                      </p>
                    </div>
                    <div className="pt-2">
                      {isRetractable(offer.status) && (
                        <button
                          onClick={() => setShowRetractModal(offer.id)}
                          className="flex items-center space-x-2 px-3 py-2 text-black dark:text-white border border-black dark:border-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-sm font-medium"
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span>Delete Offer</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOffers.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg">
            <MusicalNoteIcon className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-black dark:text-white mb-2">
              No offers found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {statusFilter === "all"
                ? "You haven't submitted any offers yet."
                : `You don't have any ${statusFilter} offers.`}
            </p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showRetractModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-black dark:text-white" />
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  Delete Offer
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this offer? This action cannot
                be undone.
              </p>
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={() => setShowRetractModal(null)}
                  className="px-4 py-2 text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => retractOffer(showRetractModal)}
                  className="px-4 py-2 bg-red-600 text-white border border-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Offer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersPage;
