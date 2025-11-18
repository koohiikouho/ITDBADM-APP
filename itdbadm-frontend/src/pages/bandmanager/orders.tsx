import DefaultLayout from "@/layouts/default";
import {
  Card,
  CardHeader,
  CardBody,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Accordion,
  AccordionItem,
  Badge,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { Package, Truck, MapPin, Calendar, DollarSign } from "lucide-react";

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
  image: { url: string[] } | string;
}

interface BandOrder {
  order_id: number;
  order_date: string;
  status: "Ongoing" | "Fulfilled" | "Cancelled";
  customer_name: string;
  first_name: string;
  last_name: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  contact_information: string;
  band_total: string;
  items: OrderItem[];
}

export default function BandOrdersPage() {
  const [orders, setOrders] = useState<BandOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiClient.baseURL + "/band-manager/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Fulfilled":
        return "success";
      case "Cancelled":
        return "danger";
      case "Ongoing":
        return "primary";
      default:
        return "default";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (amount: string | number) => {
    return Number(amount).toLocaleString("ja-JP", {
      style: "currency",
      currency: "JPY",
    });
  };

  const getImageSrc = (img: any) => {
    if (typeof img === 'string') return img;
    if (img?.url && Array.isArray(img.url)) return img.url[0];
    return "/api/placeholder/50/50";
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Merchandise Orders</h1>
          <p className="text-gray-600">
            Track and fulfill orders containing your band's products.
          </p>
        </div>

        <div className="grid gap-4">
          {orders.length === 0 ? (
            <Card>
                <CardBody className="py-12 text-center text-gray-500">
                    <Package size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No orders found yet.</p>
                </CardBody>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.order_id} className="border border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-col sm:flex-row justify-between bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">Order #{order.order_id}</span>
                      <Chip size="sm" color={getStatusColor(order.status)} variant="flat">
                        {order.status}
                      </Chip>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      {formatDate(order.order_date)}
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end mt-2 sm:mt-0">
                    <span className="text-sm text-gray-500">Total Revenue</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatPrice(order.band_total)}
                    </span>
                  </div>
                </CardHeader>
                
                <CardBody className="p-0">
                  <Accordion>
                    <AccordionItem
                      key="1"
                      aria-label="Order Details"
                      title={
                        <div className="flex items-center gap-4 px-2">
                           <User 
                             name={order.first_name ? `${order.first_name} ${order.last_name}` : order.customer_name}
                             description={order.contact_information || "No contact info"}
                            //  placeholder image
                             avatarProps={{
                               src: `https://i.pravatar.cc/150?u=${order.customer_name}`,
                               size: "sm"
                             }}
                           />
                           <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 ml-auto">
                              <MapPin size={14} />
                              <span className="truncate max-w-[200px]">
                                {order.city}, {order.country}
                              </span>
                           </div>
                        </div>
                      }
                    >
                      <div className="px-4 pb-4">
                        <div className="grid md:grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                            <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <Package size={16} /> Shipping Address
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {order.address}<br/>
                                    {order.city}, {order.postal_code}<br/>
                                    {order.country}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <Truck size={16} /> Delivery Status
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Standard Shipping<br/>
                                    Status: <span className={order.status === 'Fulfilled' ? 'text-success' : 'text-primary'}>{order.status}</span>
                                </p>
                            </div>
                        </div>

                        <Table aria-label="Order items" removeWrapper>
                          <TableHeader>
                            <TableColumn>ITEM</TableColumn>
                            <TableColumn>PRICE</TableColumn>
                            <TableColumn>QTY</TableColumn>
                            <TableColumn>SUBTOTAL</TableColumn>
                          </TableHeader>
                          <TableBody>
                            {order.items.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={getImageSrc(item.image)}
                                      alt={item.product_name}
                                      className="w-10 h-10 rounded object-cover bg-gray-100"
                                    />
                                    <span className="font-medium">{item.product_name}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{formatPrice(item.price)}</TableCell>
                                <TableCell>x{item.quantity}</TableCell>
                                <TableCell className="font-semibold">
                                    {formatPrice(item.price * item.quantity)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionItem>
                  </Accordion>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}