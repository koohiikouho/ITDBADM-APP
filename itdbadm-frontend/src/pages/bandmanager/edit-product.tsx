import DefaultLayout from "@/layouts/default";
import {
    Input,
    Textarea,
    Button,
    Card,
    CardBody,
    Select,
    SelectItem
} from "@heroui/react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save } from "lucide-react";
import { apiClient } from "@/lib/api";

interface Product {
    product_id: number;
    name: string;
    price: string;
    description: string;
    category: string;
    image: {
        url: string[];
    };
    stock?: number;
}

export default function EditProductPage() {
    const navigate = useNavigate();
    const { productId } = useParams();
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description: "",
        category: "",
        stock: "0",
    });

    const categories = [
        { key: "Physical", label: "Physical Merchandise" },
        { key: "Digital", label: "Digital Product" },
        { key: "Physical Music", label: "Physical Music" },
        { key: "Digital Music", label: "Digital Music" }
    ];

    useEffect(() => {
        fetchProduct();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("accessToken");
            const currency = localStorage.getItem("selectedCurrency") || "JPY";

            // Fetch product details with currency parameter
            const response = await fetch(`${apiClient.baseURL}/products/${productId}/${currency}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const productData = await response.json();

                // Correctly fetch stock using the band-manager endpoint
                const stockResponse = await fetch(`${apiClient.baseURL}/band-manager/products/${productId}/stock`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                let stock = 0;
                if (stockResponse.ok) {
                    const stockData = await stockResponse.json();
                    stock = stockData.stock || 0;
                } else {
                    console.warn("Could not fetch stock data, using default 0");
                }

                setProduct(productData);
                setFormData({
                    name: productData.name || "",
                    price: productData.price?.toString() || "",
                    description: productData.description || "",
                    category: productData.category || "",
                    stock: stock.toString(),
                });
            } else {
                console.error("Error fetching product:", response.status);
                alert("Error loading product");
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            alert("Error loading product");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.price || !formData.category || !formData.stock) {
            alert("Please fill in all required fields");
            return;
        }

        // Validate price and stock
        const priceValue = parseFloat(formData.price);
        const stockValue = parseInt(formData.stock);

        if (isNaN(priceValue) || priceValue <= 0) {
            alert("Please enter a valid price");
            return;
        }

        if (isNaN(stockValue) || stockValue < 0) {
            alert("Please enter a valid stock quantity");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`${apiClient.baseURL}/band-manager/products/${productId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    price: priceValue.toString(), // Ensure string format
                    description: formData.description,
                    category: formData.category,
                    stock: stockValue // Send as number
                }),
            });

            if (response.ok) {
                alert("Product updated successfully!");
                navigate("/bandmanager/manage-products");
            } else {
                const errorData = await response.json();
                alert(`Error updating product: ${errorData.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Error updating product");
        } finally {
            setLoading(false);
        }
    };

    // Add debug logging to see what's happening
    useEffect(() => {
        console.log("Current formData:", formData);
        console.log("Current product:", product);
    }, [formData, product]);

    if (loading && !product) {
        return (
            <DefaultLayout>
                <div className="flex justify-center items-center py-16">
                    <div className="text-lg">Loading product...</div>
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout>
            <div className="max-w-2xl mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Edit Product</h1>
                    <p className="text-gray-600">Update product information</p>
                </div>

                <Card>
                    <CardBody className="space-y-6">
                        <Input
                            label="Product Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter product name"
                            isRequired
                        />

                        <Input
                            label="Price (JPY)"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="Enter price"
                            isRequired
                            min="0"
                            step="0.01"
                        />

                        <Input
                            label="Stock Quantity"
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            placeholder="Enter stock quantity"
                            isRequired
                            min="0"
                        />

                        <Select
                            label="Category"
                            selectedKeys={[formData.category]}
                            onSelectionChange={(keys) =>
                                setFormData({ ...formData, category: Array.from(keys)[0] as string })
                            }
                            isRequired
                        >
                            {categories.map((category) => (
                                <SelectItem key={category.key}>
                                    {category.label}
                                </SelectItem>
                            ))}
                        </Select>

                        <Textarea
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter product description"
                            minRows={4}
                        />

                        <div className="flex gap-4 justify-end">
                            <Button
                                variant="light"
                                onPress={() => navigate("/bandmanager/manage-products")}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleSubmit}
                                isLoading={loading}
                                startContent={!loading && <Save className="h-4 w-4" />}
                                isDisabled={!formData.name || !formData.price || !formData.category || !formData.stock}
                            >
                                {loading ? "Updating..." : "Update Product"}
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </DefaultLayout>
    );
}