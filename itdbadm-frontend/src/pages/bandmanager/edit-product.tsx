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
            // You'll need to add a GET endpoint for single product
            const response = await fetch(`${apiClient.baseURL}/products/${productId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setProduct(data);
                setFormData({
                    name: data.name,
                    price: data.price,
                    description: data.description,
                    category: data.category,
                });
            }
        } catch (error) {
            console.error("Error fetching product:", error);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiClient.baseURL}/band-manager/products/${productId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
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

    if (!product) {
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
                                isDisabled={!formData.name || !formData.price || !formData.category}
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