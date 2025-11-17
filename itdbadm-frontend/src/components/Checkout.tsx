// Checkout.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Button,
  Checkbox,
  Divider,
  Select,
  SelectItem,
} from "@heroui/react";
import { Trash2, ShoppingBag } from "lucide-react";
import { apiClient } from "@/lib/api";

// Types
interface CartItem {
  user_id: number;
  product_id: number;
  quantity: number;
  name: string;
  price: string | number;
  description: string;
  category: string;
  band_id: number;
  image: {
    url: string;
  };
  is_deleted: number;
}

interface FormData {
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  country: string;
  city: string;
  postalCode: string;
  saveInfo: boolean;
}

interface Country {
  code: string;
  name: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    phone: "",
    firstName: "",
    lastName: "",
    address: "",
    country: "",
    city: "",
    postalCode: "",
    saveInfo: false,
  });

  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2"
        );
        const data = await response.json();

        const sortedCountries = data
          .map((country: any) => ({
            code: country.cca2,
            name: country.name.common,
          }))
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

        setCountries(sortedCountries);
      } catch (error) {
        console.error("Error fetching countries:", error);
        // Fallback countries in case API fails
        setCountries([
          { code: "US", name: "United States" },
          { code: "CA", name: "Canada" },
          { code: "GB", name: "United Kingdom" },
          { code: "AU", name: "Australia" },
          { code: "JP", name: "Japan" },
          { code: "FR", name: "France" },
          { code: "DE", name: "Germany" },
          { code: "IT", name: "Italy" },
          { code: "ES", name: "Spain" },
          { code: "BR", name: "Brazil" },
        ]);
      }
    };

    fetchCountries();
  }, []);

  // Fetch cart items from API
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setCartLoading(true);
        setCartError(null);

        const token = localStorage.getItem("accessToken");

        if (!token) {
          throw new Error("No access token found. Please log in.");
        }

        const response = await fetch(apiClient.baseURL + "/carts/user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Authentication failed. Please log in again.");
          }
          throw new Error(`Failed to fetch cart items: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle case where API returns message instead of cart items
        if (data.message) {
          setCartItems([]);
        } else {
          setCartItems(data);
        }
      } catch (err) {
        setCartError(
          err instanceof Error ? err.message : "Failed to fetch cart items"
        );
        console.error("Error fetching cart items:", err);
      } finally {
        setCartLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRemoveItem = async (productId: number) => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("No access token found");
      }

      // Use the PUT endpoint with "delete" operation
      const response = await fetch(apiClient.baseURL + "/carts/item", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "delete",
          product_id: productId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove item from cart");
      }

      // Remove item from local state
      setCartItems((prev) =>
        prev.filter((item) => item.product_id !== productId)
      );
    } catch (err) {
      console.error("Error removing item:", err);
      alert("Failed to remove item from cart. Please try again.");
    }
  };

  const handleUpdateQuantity = async (
    productId: number,
    newQuantity: number
  ) => {
    if (newQuantity < 1) {
      // If quantity becomes 0, remove the item
      handleRemoveItem(productId);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("No access token found");
      }

      // Use the PUT endpoint with "change" operation
      const response = await fetch(apiClient.baseURL + "/carts/item", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "change",
          product_id: productId,
          new_quantity: newQuantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update item quantity");
      }

      const result = await response.json();

      // Update item in local state
      setCartItems((prev) =>
        prev.map((item) =>
          item.product_id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (err) {
      console.error("Error updating quantity:", err);
      alert("Failed to update quantity. Please try again.");
    }
  };

  // Navigate to product page
  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Validate form data
      if (
        !formData.phone ||
        !formData.firstName ||
        !formData.lastName ||
        !formData.address ||
        !formData.country ||
        !formData.city ||
        !formData.postalCode
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Validate phone number format (basic validation)
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ""))) {
        throw new Error("Please enter a valid phone number");
      }

      // Get country name from code
      const selectedCountry = countries.find(
        (country) => country.code === formData.country
      );
      const countryName = selectedCountry
        ? selectedCountry.name
        : formData.country;

      // Prepare order data according to API specification
      const orderData = {
        contact_information: formData.phone,
        first_name: formData.firstName,
        last_name: formData.lastName,
        address: formData.address,
        city: formData.city,
        country: countryName,
        postal_code: formData.postalCode,
      };

      // Make API call to create order using the correct endpoint
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(apiClient.baseURL + "/carts/place-order", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to place order: ${response.status} - ${errorText}`
        );
      }

      const orderResult = await response.json();

      console.log("Order placed successfully:", orderResult);

      // Clear cart after successful order
      setCartItems([]);

      // Redirect to orders page
      navigate("/orders");
    } catch (err) {
      console.error("Error placing order:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to place order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: string | number): number => {
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;
    return numericAmount;
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + formatCurrency(item.price) * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // Loading state for cart
  if (cartLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-600 mb-2">
            Loading your cart...
          </h2>
        </div>
      </div>
    );
  }

  // Error state for cart
  if (cartError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
            <p className="text-red-600 mb-4">{cartError}</p>
            <Button onPress={() => window.location.reload()} color="danger">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-6">
            Add some items to proceed with checkout
          </p>
          <Button color="primary" onPress={() => navigate("/")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Customer Information */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold">1</span>
              </div>
              <h2 className="text-xl font-semibold">Contact Information</h2>
            </CardHeader>
            <CardBody>
              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onValueChange={(value) => handleInputChange("phone", value)}
                placeholder="+1 (555) 123-4567"
                isRequired
                description="We'll use this to contact you about your order"
              />
            </CardBody>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold">2</span>
              </div>
              <h2 className="text-xl font-semibold">Shipping Address</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onValueChange={(value) =>
                    handleInputChange("firstName", value)
                  }
                  isRequired
                />
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onValueChange={(value) =>
                    handleInputChange("lastName", value)
                  }
                  isRequired
                />
              </div>
              <Input
                label="Address"
                value={formData.address}
                onValueChange={(value) => handleInputChange("address", value)}
                isRequired
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Country"
                  selectedKeys={formData.country ? [formData.country] : []}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;
                    handleInputChange("country", selectedKey);
                  }}
                  isRequired
                >
                  {countries.map((country) => (
                    <SelectItem key={country.code} textValue={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  label="City"
                  value={formData.city}
                  onValueChange={(value) => handleInputChange("city", value)}
                  isRequired
                  placeholder="Enter your city"
                />

                <Input
                  label="Postal Code"
                  value={formData.postalCode}
                  onValueChange={(value) =>
                    handleInputChange("postalCode", value)
                  }
                  isRequired
                />
              </div>
              <Checkbox
                isSelected={formData.saveInfo}
                onValueChange={(value) => handleInputChange("saveInfo", value)}
              >
                Save shipping information for next time
              </Checkbox>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          <Card className="sticky top-4">
            <CardHeader>
              <h2 className="text-xl font-semibold">Order Summary</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex items-start gap-4 p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleProductClick(item.product_id)}
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image?.url || "/api/placeholder/80/80"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = "/api/placeholder/80/80";
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate hover:text-blue-600 transition-colors">
                        {item.name}
                      </p>
                      <p className="text-sm text-default-500">
                        ¥{formatCurrency(item.price).toFixed(2)} each
                      </p>
                      <div
                        className="flex items-center gap-2 mt-2"
                        onClick={(e) => e.stopPropagation()} // Prevent navigation when clicking quantity controls
                      >
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() =>
                            handleUpdateQuantity(
                              item.product_id,
                              item.quantity - 1
                            )
                          }
                        >
                          -
                        </Button>
                        <span className="text-sm font-medium min-w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() =>
                            handleUpdateQuantity(
                              item.product_id,
                              item.quantity + 1
                            )
                          }
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    {/* Price and Remove Button */}
                    <div
                      className="flex flex-col items-end gap-2"
                      onClick={(e) => e.stopPropagation()} // Prevent navigation when clicking remove button
                    >
                      <p className="font-semibold text-sm">
                        ¥
                        {(formatCurrency(item.price) * item.quantity).toFixed(
                          2
                        )}
                      </p>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleRemoveItem(item.product_id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Divider />

              {/* Pricing Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>¥{subtotal.toFixed(2)}</span>
                </div>
                <Divider />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>¥{total.toFixed(2)}</span>
                </div>
              </div>
            </CardBody>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                color="primary"
                size="lg"
                className="w-full"
                isLoading={loading}
                onPress={handleSubmit}
              >
                {loading ? "Processing..." : "Place Order"}
              </Button>

              <p className="text-xs text-center text-default-500">
                By completing your purchase you agree to our Terms of Service
              </p>
            </CardFooter>
          </Card>

          {/* Continue Shopping */}
          <Card>
            <CardBody>
              <Button
                variant="flat"
                className="w-full"
                onPress={() => navigate("/")}
              >
                Continue Shopping
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
