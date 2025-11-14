// Checkout.tsx
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Button,
  Checkbox,
  Divider,
} from "@heroui/react";
import { Trash2, ShoppingBag } from "lucide-react";

const Checkout = () => {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    saveInfo: false,
  });

  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Wireless Headphones",
      price: 99.99,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 2,
      name: "Phone Case",
      price: 19.99,
      quantity: 2,
      image:
        "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 3,
      name: "USB-C Cable",
      price: 14.99,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&h=150&fit=crop&crop=center",
    },
  ]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRemoveItem = (itemId: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Checkout data:", formData);
    console.log("Cart items:", cartItems);
    setLoading(false);
    // Handle successful checkout here
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

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
          <Button color="primary" onPress={() => window.history.back()}>
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
                label="Email Address"
                type="email"
                value={formData.email}
                onValueChange={(value) => handleInputChange("email", value)}
                placeholder="your@email.com"
                isRequired
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
                <Input
                  label="City"
                  value={formData.city}
                  onValueChange={(value) => handleInputChange("city", value)}
                  isRequired
                />
                <Input
                  label="Country"
                  value={formData.country}
                  onValueChange={(value) => handleInputChange("country", value)}
                  isRequired
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
                    key={item.id}
                    className="flex items-start gap-4 p-3 border rounded-lg"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-default-500">
                        ${item.price.toFixed(2)} each
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
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
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    {/* Price and Remove Button */}
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-semibold text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleRemoveItem(item.id)}
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
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Divider />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
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
                onPress={() => window.history.back()}
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
