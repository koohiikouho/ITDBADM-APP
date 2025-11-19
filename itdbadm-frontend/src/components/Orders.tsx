// src/components/Orders.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ShoppingBagIcon,
  CalendarIcon,
  TagIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { apiClient } from "@/lib/api";
import { formatPrice } from "@/lib/currencyFormatter";

// Types
interface Product {
  product_id: number;
  quantity: number;
  band_id: number;
  name: string;
  price: string | number;
  description: string;
  category: string;
  image: {
    url: string;
  };
  is_deleted: number;
  band: string;
}

interface Order {
  id: number;
  user_id: number;
  order_date: string;
  status: string;
  date_fulfilled: string | null;
  price: string | number;
  offer_id: number | null;
  description: string;
  products: Product[];
}

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

const Orders = () => {
  const navigate = useNavigate();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders from API
  const fetchUserOrders = async (): Promise<Order[]> => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("No access token found. Please log in.");
    }

    const response = await fetch(
      `${apiClient.baseURL}/orders/user/${localStorage.getItem("selectedCurrency")}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      }
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    const data = await response.json();

    // Handle both array and object responses safely
    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.orders)) {
      return data.orders;
    } else if (data && data.message) {
      // If it's a message like "Orders not found", return empty array
      return [];
    } else {
      // Fallback for any other response format
      return [];
    }
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const ordersData = await fetchUserOrders();
        setOrders(ordersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch orders");
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Navigate to product page
  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  // Map API status to OrderStatus type
  const mapApiStatus = (status: string): OrderStatus => {
    const statusMap: Record<string, OrderStatus> = {
      pending: "pending",
      processing: "processing",
      Ongoing: "processing",
      shipped: "shipped",
      delivered: "delivered",
      completed: "delivered",
      cancelled: "cancelled",
      Cancelled: "cancelled",
    };
    return statusMap[status] || "pending";
  };

  const getStatusColor = (status: OrderStatus): string => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      processing: "bg-blue-100 text-blue-800 border-blue-200",
      shipped: "bg-purple-100 text-purple-800 border-purple-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status];
  };

  const getStatusText = (status: OrderStatus): string => {
    const texts = {
      pending: "Pending",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return texts[status];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => mapApiStatus(order.status) === statusFilter);

  const statusOptions: { value: OrderStatus | "all"; label: string }[] = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Calculate statistics
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(
    (o) => mapApiStatus(o.status) === "delivered"
  ).length;
  const processingOrders = orders.filter(
    (o) => mapApiStatus(o.status) === "processing"
  ).length;
  const totalSpent = orders.reduce((sum, order) => {
    const orderTotal =
      typeof order.price === "string" ? parseFloat(order.price) : order.price;
    return sum + orderTotal;
  }, 0);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">View and manage your order history</p>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">View and manage your order history</p>
        </div>
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">View and manage your order history</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-300 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <ShoppingBagIcon className="h-6 w-6 text-gray-700" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-300 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">
                {deliveredOrders}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-300 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TagIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-gray-900">
                {processingOrders}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-300 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(totalSpent)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-300 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Filter by status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as OrderStatus | "all")
              }
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg border border-gray-300 overflow-hidden"
          >
            {/* Order Header */}
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleOrderExpansion(order.id.toString())}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {expandedOrder === order.id.toString() ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      ORD-{order.id.toString().padStart(3, "0")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.order_date)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(mapApiStatus(order.status))}`}
                  >
                    {getStatusText(mapApiStatus(order.status))}
                  </span>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(order.price)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.products?.length || 0} items
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details - Expandable */}
            {expandedOrder === order.id.toString() && (
              <div className="border-t border-gray-300 bg-gray-50 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Items
                </h4>
                <div className="space-y-4">
                  {order.products?.map((product, index) => (
                    <div
                      key={product.product_id || index}
                      className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-300 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleProductClick(product.product_id)}
                    >
                      <div className="flex-shrink-0">
                        {product.image?.url ? (
                          <img
                            src={product.image.url}
                            alt={product.name}
                            className="w-16 h-16 bg-gray-200 rounded-lg object-cover"
                            onError={(e) => {
                              // Fallback if image fails to load
                              e.currentTarget.style.display = "none";
                              const fallback = document.createElement("div");
                              fallback.className =
                                "w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center";
                              fallback.innerHTML =
                                '<svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>';
                              e.currentTarget.parentNode?.appendChild(fallback);
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-md font-medium text-gray-900 truncate hover:text-blue-600 transition-colors">
                          {product.name}
                        </h5>
                        <p className="text-sm text-gray-600">
                          {product.band} • Quantity: {product.quantity}
                        </p>
                        {product.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-md font-semibold text-gray-900">
                          {formatPrice(product.price)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Subtotal:{" "}
                          {formatPrice(
                            (typeof product.price === "string"
                              ? parseFloat(product.price)
                              : product.price) * product.quantity
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-6 border-t border-gray-300">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {order.description}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatPrice(order.price)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && orders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-600 mb-6">
            You haven't placed any orders yet.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Start Shopping
          </button>
        </div>
      )}

      {/* No results for filter */}
      {filteredOrders.length === 0 && orders.length > 0 && (
        <div className="text-center py-12">
          <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-600 mb-6">
            You don't have any {statusFilter} orders.
          </p>
          <button
            onClick={() => setStatusFilter("all")}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            View All Orders
          </button>
        </div>
      )}
    </div>
  );
};

export default Orders;
