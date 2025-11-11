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
  currency: string; // Add currency to the interface
}

const OfferForm: React.FC<OfferFormProps> = ({
  className,
  onSubmit,
  bandName = "the band",
  currency = "USD",
}) => {
  const [formData, setFormData] = useState<OfferFormData>({
    date: null,
    price: "",
    description: "",
    currency: currency, // Include currency in initial state
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Now formData includes currency, so no need to spread it in
    onSubmit?.(formData);
    setIsSubmitting(false);

    // Reset form (keep the currency prop)
    setFormData({
      date: null,
      price: "",
      description: "",
      currency: currency,
    });
  };

  const handleInputChange = (field: keyof OfferFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
