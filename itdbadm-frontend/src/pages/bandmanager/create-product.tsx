import DefaultLayout from "@/layouts/default";
import {
    Input,
    Textarea,
    Button,
    Card,
    CardBody,
    CardHeader,
    Select,
    SelectItem
} from "@heroui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Upload } from "lucide-react";
import { apiClient } from "@/lib/api";

interface Band {
    band_id: number;
    name: string;
    genre: string;
    description: string;
}

export default function CreateProductPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [band, setBand] = useState<Band | null>(null);
    const [bandLoading, setBandLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description: "",
        category: "",
        stock: "0", // Add stock field
        images: [] as File[]
    });

    const categories = [
        { key: "Physical", label: "Physical Merchandise" },
        { key: "Digital", label: "Digital Product" },
        { key: "Physical Music", label: "Physical Music" },
        { key: "Digital Music", label: "Digital Music" }
    ];

    // Fetch the user's band on component mount
    useEffect(() => {
        const fetchBand = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                console.log("Fetching band with token:", token ? "Present" : "Missing");

                const response = await fetch(`${apiClient.baseURL}/band-manager/band`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });

                console.log("Band fetch response status:", response.status);

                if (response.ok) {
                    const bandData = await response.json();
                    console.log("Band data:", bandData);
                    setBand(bandData);
                } else {
                    const errorText = await response.text();
                    console.error("Error fetching band:", errorText);
                    alert("Error: Unable to fetch your band information");
                }
            } catch (error) {
                console.error("Error fetching band:", error);
                alert("Network error: Unable to fetch band information");
            } finally {
                setBandLoading(false);
            }
        };

        fetchBand();
    }, []);

    const handleSubmit = async () => {
        if (!formData.name || !formData.price || !formData.category) {
            alert("Please fill in all required fields");
            return;
        }

        if (!band) {
            alert("Error: No band associated with your account");
            return;
        }

        // Validate price is a valid number
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
            const submitData = {
                name: formData.name,
                price: priceValue,
                description: formData.description,
                category: formData.category,
                stock: stockValue, // Include stock
            };

            console.log("Submitting product data:", submitData);
            console.log("For band:", band.name, "(ID:", band.band_id + ")");

            const token = localStorage.getItem("accessToken");
            console.log("Using token:", token ? "Present" : "Missing");

            const response = await fetch(`${apiClient.baseURL}/band-manager/products`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submitData),
            });

            console.log("Response status:", response.status);
            console.log("Response headers:", Object.fromEntries(response.headers.entries()));

            if (response.ok) {
                const result = await response.json();
                console.log("Success response:", result);
                alert("Product created successfully!");
                navigate("/bandmanager/manage-products");
            } else {
                const errorText = await response.text();
                console.error("Server error response:", errorText);
                let errorMessage = "Unknown error occurred";

                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorData.message || errorText;
                } catch (e) {
                    errorMessage = errorText || "Unknown error occurred";
                }

                alert(`Error creating product: ${errorMessage}`);
            }
        } catch (error) {
            console.error("Network error creating product:", error);
            alert("Network error: Unable to create product. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFormData({
                ...formData,
                images: Array.from(e.target.files)
            });
        }
    };

    if (bandLoading) {
        return (
            <DefaultLayout>
                <div className="max-w-2xl mx-auto p-6">
                    <div className="flex justify-center items-center py-16">
                        <div className="text-lg">Loading band information...</div>
                    </div>
                </div>
            </DefaultLayout>
        );
    }

    if (!band) {
        return (
            <DefaultLayout>
                <div className="max-w-2xl mx-auto p-6">
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">No Band Found</h2>
                        <p className="text-gray-600 mb-6">
                            You need to have a band associated with your account to create products.
                        </p>
                        <Button
                            color="primary"
                            onPress={() => navigate("/bandmanager")}
                        >
                            Go to Band Management
                        </Button>
                    </div>
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout>
            <div className="max-w-2xl mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Create New Product</h1>
                    <p className="text-gray-600">Add new merchandise to your band's store</p>
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Band:</strong> {band.name}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardBody className="space-y-6">
                        {/* Product Name */}
                        <Input
                            label="Product Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter product name"
                            isRequired
                        />

                        {/* Price */}
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

                        {/* Category */}
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

                        {/* Description */}
                        <Textarea
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter product description"
                            minRows={4}
                        />

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Product Images
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 mb-2">
                                    Drag and drop images here, or click to select
                                </p>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <Button
                                    as="label"
                                    htmlFor="image-upload"
                                    variant="flat"
                                    size="sm"
                                >
                                    Select Images
                                </Button>
                                {formData.images.length > 0 && (
                                    <p className="text-sm text-green-600 mt-2">
                                        {formData.images.length} image(s) selected
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
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
                                isDisabled={!formData.name || !formData.price || !formData.category || !formData.stock || !band}
                            >
                                {loading ? "Creating..." : "Create Product"}
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </DefaultLayout>
    );
}