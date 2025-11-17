import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Textarea,
  Button,
  DatePicker,
  cn,
} from "@heroui/react";
import {
  Calendar,
  FileText,
  Send,
  DollarSign,
  JapaneseYen,
  Coins,
  Landmark,
} from "lucide-react";
import { today, getLocalTimeZone } from "@internationalized/date";
import type { DateValue } from "@internationalized/date";
import { useParams } from "react-router-dom"; // Import useParams
import { apiClient } from "@/lib/api";

interface OfferFormProps {
  className?: string;
  onSubmit?: (data: OfferFormData) => void;
  bandName?: string;
  currency?: string;
}

interface OfferFormData {
  date: DateValue | null;
  price: string;
  description: string;
  currency: string;
}

const OfferForm: React.FC<OfferFormProps> = ({
  className,
  onSubmit,
  bandName = "the band",
  currency = "USD",
}) => {
  const { bandId } = useParams(); // Get bandId from URL params
  const [formData, setFormData] = useState<OfferFormData>({
    date: null,
    price: "",
    description: "",
    currency: currency,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const currencies = {
    USD: {
      label: "US Dollar",
      symbol: "$",
      icon: DollarSign,
      example: "2,000.00",
    },
    PHP: {
      label: "Philippine Peso",
      symbol: "₱",
      icon: Coins,
      example: "100,000.00",
    },
    JPY: {
      label: "Japanese Yen",
      symbol: "¥",
      icon: JapaneseYen,
      example: "200,000",
    },
    VND: {
      label: "Vietnamese Dong",
      symbol: "₫",
      icon: Landmark,
      example: "50,000,000",
    },
  };

  const selectedCurrency =
    currencies[currency as keyof typeof currencies] || currencies.USD;

  const getCurrencyIcon = () => {
    const IconComponent = selectedCurrency.icon;
    return <IconComponent size={20} className="text-default-400" />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      // Validate band ID from URL
      if (!bandId) {
        throw new Error("Band ID is required");
      }

      // Validate date
      if (!formData.date) {
        throw new Error("Event date is required");
      }

      // Convert DateValue to string for API
      const eventDateString = formData.date.toString();

      // Get JWT token
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Authentication required. Please log in.");
      }

      // Prepare request data
      const requestData = {
        band_id: parseInt(bandId),
        event_date: eventDateString,
        offer_amount: parseFloat(formData.price),
        event_details: formData.description,
      };

      // Make API call
      const response = await fetch(apiClient.baseURL + "/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Failed to create booking offer"
        );
      }

      // Success
      setSuccess(result.message || "Booking offer created successfully!");

      // Call the original onSubmit prop if provided
      onSubmit?.(formData);

      // Reset form
      setFormData({
        date: null,
        price: "",
        description: "",
        currency: currency,
      });
    } catch (error) {
      console.error("Error creating booking offer:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create booking offer"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof OfferFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear errors when user starts typing
    if (error) setError(null);
  };

  const isFormValid = formData.date && formData.price && formData.description;

  return (
    <Card className={cn("w-full max-w-md mx-auto shadow-lg", className)}>
      <CardHeader className="flex flex-col items-start gap-2 pb-0">
        <div className="flex items-center gap-2">
          <FileText size={24} className="text-primary-600" />
          <h2 className="text-xl font-bold text-default-700">
            Book {bandName}
          </h2>
        </div>
        <p className="text-default-500 text-sm">
          Send an offer to book the band for your event
        </p>
      </CardHeader>

      <CardBody className="gap-6">
        {/* Success Message */}
        {success && (
          <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
            <p className="text-success-700 text-sm">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-danger-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-1">
          {/* Date Picker */}
          <DatePicker
            label="Event Date"
            value={formData.date}
            onChange={(date) => handleInputChange("date", date)}
            className="w-full"
            labelPlacement="outside"
            startContent={<Calendar size={20} className="text-default-400" />}
            minValue={today(getLocalTimeZone())}
            isRequired
          />

          {/* Price Input */}
          <Input
            type="number"
            label="Your Offer Amount"
            placeholder={selectedCurrency.example}
            value={formData.price}
            onValueChange={(value) => handleInputChange("price", value)}
            className="w-full"
            labelPlacement="outside"
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small font-medium">
                  {selectedCurrency.symbol}
                </span>
              </div>
            }
            endContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">{currency}</span>
              </div>
            }
            description={`Example: ${selectedCurrency.symbol}${selectedCurrency.example}`}
            min="0"
            step={currency === "JPY" ? "1" : "0.01"}
            isRequired
          />

          {/* Description Textarea */}
          <Textarea
            label="Event Details"
            placeholder="Tell us about your event, venue, audience size, special requests, or any other details..."
            value={formData.description}
            onValueChange={(value) => handleInputChange("description", value)}
            className="w-full"
            labelPlacement="outside"
            minRows={4}
            isRequired
          />

          {/* Submit Button */}
          <Button
            type="submit"
            color="primary"
            size="lg"
            className="w-full font-semibold mt-2"
            isDisabled={!isFormValid || isSubmitting}
            isLoading={isSubmitting}
            startContent={!isSubmitting && <Send size={20} />}
          >
            {isSubmitting ? "Sending Offer..." : "Send Offer"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};

export default OfferForm;
