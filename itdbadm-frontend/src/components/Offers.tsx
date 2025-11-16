// src/components/OffersPage.tsx
import { useState } from "react";
import {
  MusicalNoteIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import type { Offer, OfferStatus } from "../types/offer";

const OffersPage = () => {
  const [offers, setOffers] = useState<Offer[]>([
    {
      id: "OFF-001",
      bandName: "The Midnight Riders",
      bookingDate: "2024-02-15",
      description: "Summer Music Festival - Main Stage Performance",
      price: 5000,
      status: "pending",
      filedDate: "2024-01-10",
    },
    {
      id: "OFF-002",
      bandName: "Electric Dreams",
      bookingDate: "2024-03-22",
      description: "Private Corporate Event - Evening Entertainment",
      price: 3500,
      status: "accepted",
      filedDate: "2024-01-08",
    },
    {
      id: "OFF-003",
      bandName: "Neon Waves",
      bookingDate: "2024-02-28",
      description: "Club Residency - Weekly Friday Nights",
      price: 1200,
      status: "rejected",
      filedDate: "2024-01-05",
    },
    {
      id: "OFF-004",
      bandName: "Solar Flare",
      bookingDate: "2024-04-10",
      description: "Charity Gala - Live Performance",
      price: 2000,
      status: "pending",
      filedDate: "2024-01-12",
    },
    {
      id: "OFF-005",
      bandName: "The Retrospectives",
      bookingDate: "2024-03-05",
      description: "Wedding Reception - Background Music",
      price: 1800,
      status: "pending",
      filedDate: "2024-01-03",
    },
  ]);

  const [statusFilter, setStatusFilter] = useState<OfferStatus | "all">("all");
  const [showRetractModal, setShowRetractModal] = useState<string | null>(null);

  const retractOffer = (offerId: string) => {
    setOffers((prev) =>
      prev.map((offer) =>
        offer.id === offerId ? { ...offer, status: "retracted" } : offer
      )
    );
    setShowRetractModal(null);
  };

  const getStatusColor = (status: OfferStatus): string => {
    const colors = {
      pending: "bg-white text-black border-black",
      accepted: "bg-black text-white border-black",
      rejected: "bg-white text-black border-black",
      retracted: "bg-black text-white border-black",
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const isRetractable = (status: OfferStatus): boolean => {
    return status === "pending";
  };

  const filteredOffers =
    statusFilter === "all"
      ? offers
      : offers.filter((offer) => offer.status === statusFilter);

  const statusOptions: { value: OfferStatus | "all"; label: string }[] = [
    { value: "all", label: "All Offers" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
    { value: "retracted", label: "Retracted" },
  ];

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
              Showing {filteredOffers.length} of {offers.length} offers
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
                      <p className="text-black dark:text-white">
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
                        {formatCurrency(offer.price)}
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
                          <span>Retract Offer</span>
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

        {/* Retract Confirmation Modal */}
        {showRetractModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-black dark:text-white" />
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  Retract Offer
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to retract this offer? This action cannot
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
                  className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  Retract Offer
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
