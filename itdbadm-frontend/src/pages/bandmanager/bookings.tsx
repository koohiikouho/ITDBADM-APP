import DefaultLayout from "@/layouts/default";
import {
  Card,
  CardHeader,
  CardBody,
  Chip,
  Button,
  Divider,
  Spinner,
  Tabs,
  Tab,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  DollarSign,
  AlertCircle,
} from "lucide-react";

interface BookingOffer {
  offer_id: number;
  user_id: number;
  user_name: string;
  booking_date: string;
  description: string;
  price: string; // Decimal comes as string from JSON usually
  status: "Pending" | "Accepted" | "Rejected";
  date_created: string;
}

export default function BandBookingsPage() {
  const [bookings, setBookings] = useState<BookingOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // Using the specific endpoint for band managers to get incoming offers
      const response = await fetch(apiClient.baseURL + "/bookings/band", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array before setting
        setBookings(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    offerId: number,
    action: "accept" | "reject"
  ) => {
    if (!confirm(`Are you sure you want to ${action} this booking?`)) return;

    try {
      setProcessingId(offerId);
      const response = await fetch(
        `${apiClient.baseURL}/bookings/${offerId}/${action}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.ok) {
        // Refresh list to reflect status change
        await fetchBookings();
      } else {
        const err = await response.json();
        alert(`Failed to ${action}: ${err.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      alert(`Error processing request`);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: string) => {
    return parseFloat(amount).toLocaleString("ja-JP", {
      style: "currency",
      currency: "JPY",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Accepted":
        return "success";
      case "Rejected":
        return "danger";
      default:
        return "warning";
    }
  };

  // Filter bookings for tabs
  const pendingBookings = bookings.filter((b) => b.status === "Pending");
  const historyBookings = bookings.filter((b) => b.status !== "Pending");

  const BookingCard = ({ booking }: { booking: BookingOffer }) => (
    <Card className="w-full mb-4 border border-default-200 shadow-sm hover:shadow-md transition-all">
      <CardHeader className="flex justify-between items-start pb-2">
        <div className="flex gap-3">
          <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg h-fit">
            <Calendar className="text-primary w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">
              Event on {formatDate(booking.booking_date)}
            </h3>
            <div className="flex items-center gap-2 text-small text-default-500">
              <User size={14} />
              <span>Booked by: {booking.user_name}</span>
              <span>•</span>
              <Clock size={14} />
              <span>Sent: {new Date(booking.date_created).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <Chip
          color={getStatusColor(booking.status)}
          variant="flat"
          className="capitalize"
        >
          {booking.status}
        </Chip>
      </CardHeader>
      <Divider />
      <CardBody className="py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <p className="text-sm font-semibold text-default-600">
              Event Details:
            </p>
            <p className="text-default-800 whitespace-pre-wrap bg-default-50 p-3 rounded-md border border-default-100">
              {booking.description}
            </p>
          </div>
          <div className="flex flex-col justify-center items-center md:items-end gap-2 bg-default-50 md:bg-transparent p-4 md:p-0 rounded-lg">
            <span className="text-sm text-default-500">Offer Amount</span>
            <span className="text-2xl font-bold text-success flex items-center gap-1">
              {formatCurrency(booking.price)}
            </span>
            
            {booking.status === "Pending" && (
              <div className="flex gap-2 mt-2 w-full md:w-auto">
                <Button
                  color="danger"
                  variant="flat"
                  onPress={() => handleAction(booking.offer_id, "reject")}
                  isLoading={processingId === booking.offer_id}
                  isDisabled={!!processingId}
                  startContent={!processingId && <XCircle size={18} />}
                  className="flex-1 md:flex-none"
                >
                  Reject
                </Button>
                <Button
                  color="success"
                  variant="solid"
                  onPress={() => handleAction(booking.offer_id, "accept")}
                  isLoading={processingId === booking.offer_id}
                  isDisabled={!!processingId}
                  startContent={!processingId && <CheckCircle2 size={18} />}
                  className="flex-1 md:flex-none text-white"
                >
                  Accept
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <Spinner size="lg" label="Loading bookings..." color="primary" />
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Booking Requests</h1>
          <p className="text-default-500">
            Manage incoming offers for your band performances.
          </p>
        </div>

        <Tabs aria-label="Booking Options" color="primary" variant="underlined">
          <Tab
            key="pending"
            title={
              <div className="flex items-center gap-2">
                <AlertCircle size={16} />
                <span>Pending Requests ({pendingBookings.length})</span>
              </div>
            }
          >
            <div className="mt-4">
              {pendingBookings.length === 0 ? (
                <div className="text-center py-12 text-default-400 bg-default-50 rounded-xl border border-dashed border-default-200">
                  <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No pending booking requests at the moment.</p>
                </div>
              ) : (
                pendingBookings.map((booking) => (
                  <BookingCard key={booking.offer_id} booking={booking} />
                ))
              )}
            </div>
          </Tab>
          <Tab
            key="history"
            title={
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>History</span>
              </div>
            }
          >
            <div className="mt-4">
              {historyBookings.length === 0 ? (
                <div className="text-center py-12 text-default-400">
                  <p>No booking history available.</p>
                </div>
              ) : (
                historyBookings.map((booking) => (
                  <BookingCard key={booking.offer_id} booking={booking} />
                ))
              )}
            </div>
          </Tab>
        </Tabs>
      </div>
    </DefaultLayout>
  );
}