// src/components/OrdersPage.tsx
import { useState } from "react";
import {
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ShoppingBagIcon,
  CalendarIcon,
  TagIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import type { Order, OrderStatus } from "../types/order";

const Orders = () => {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  // Mock data - replace with actual API call
  const orders: Order[] = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      status: "delivered",
      total: 156.75,
      products: [
        {
          id: "PROD-1",
          name: "Wireless Bluetooth Headphones",
          price: 99.99,
          quantity: 1,
          image: "/api/placeholder/80/80",
        },
        {
          id: "PROD-2",
          name: "Phone Case",
          price: 19.99,
          quantity: 2,
          image: "/api/placeholder/80/80",
        },
        {
          id: "PROD-3",
          name: "Screen Protector",
          price: 8.99,
          quantity: 1,
          image: "/api/placeholder/80/80",
        },
      ],
    },
    {
      id: "ORD-002",
      date: "2024-01-12",
      status: "shipped",
      total: 89.5,
      products: [
        {
          id: "PROD-4",
          name: "Laptop Sleeve",
          price: 29.99,
          quantity: 1,
          image: "/api/placeholder/80/80",
        },
        {
          id: "PROD-5",
          name: "USB-C Cable",
          price: 19.99,
          quantity: 3,
          image: "/api/placeholder/80/80",
        },
      ],
    },
    {
      id: "ORD-003",
      date: "2024-01-10",
      status: "processing",
      total: 245.0,
      products: [
        {
          id: "PROD-6",
          name: "Smart Watch",
          price: 199.99,
          quantity: 1,
          image: "/api/placeholder/80/80",
        },
        {
          id: "PROD-7",
          name: "Watch Band",
          price: 45.01,
          quantity: 1,
          image: "/api/placeholder/80/80",
        },
      ],
    },
    {
      id: "ORD-004",
      date: "2024-01-08",
      status: "pending",
      total: 67.25,
      products: [
        {
          id: "PROD-8",
          name: "Wireless Mouse",
          price: 34.99,
          quantity: 1,
          image: "/api/placeholder/80/80",
        },
        {
          id: "PROD-9",
          name: "Mouse Pad",
          price: 12.99,
          quantity: 1,
          image: "/api/placeholder/80/80",
        },
        {
          id: "PROD-10",
          name: "Keyboard Cleaner",
          price: 19.27,
          quantity: 1,
          image: "/api/placeholder/80/80",
        },
      ],
    },
    {
      id: "ORD-005",
      date: "2024-01-05",
      status: "cancelled",
      total: 150.0,
      products: [
        {
          id: "PROD-11",
          name: "Gaming Headset",
          price: 79.99,
          quantity: 1,
          image: "/api/placeholder/80/80",
        },
        {
          id: "PROD-12",
          name: "Controller Charger",
          price: 35.01,
          quantity: 2,
          image: "/api/placeholder/80/80",
        },
      ],
    },
  ];

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
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

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  const statusOptions: { value: OrderStatus | "all"; label: string }[] = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

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
              <p className="text-2xl font-bold text-gray-900">
                {orders.length}
              </p>
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
                {orders.filter((o) => o.status === "delivered").length}
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
                {orders.filter((o) => o.status === "processing").length}
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
                {formatCurrency(
                  orders.reduce((sum, order) => sum + order.total, 0)
                )}
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
                    onClick={() => toggleOrderExpansion(order.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {expandedOrder === order.id ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {order.id}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.date)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(order.total)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.products.length} items
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details - Expandable */}
            {expandedOrder === order.id && (
              <div className="border-t border-gray-300 bg-gray-50 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Items
                </h4>
                <div className="space-y-4">
                  {order.products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-300"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-md font-medium text-gray-900 truncate">
                          {product.name}
                        </h5>
                        <p className="text-sm text-gray-600">
                          Quantity: {product.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-md font-semibold text-gray-900">
                          {formatCurrency(product.price)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Subtotal:{" "}
                          {formatCurrency(product.price * product.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-6 border-t border-gray-300">
                  <div className="flex justify-between items-center">
                    <div></div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(order.total)}
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
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-600 mb-6">
            {statusFilter === "all"
              ? "You haven't placed any orders yet."
              : `You don't have any ${statusFilter} orders.`}
          </p>
          <button className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
            Start Shopping
          </button>
        </div>
      )}
    </div>
  );
};

export default Orders;
