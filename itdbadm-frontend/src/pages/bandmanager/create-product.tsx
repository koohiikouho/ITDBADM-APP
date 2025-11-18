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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Upload } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function CreateProductPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description: "",
        category: "",
        images: [] as File[]
    });

    const categories = [
        { key: "Physical", label: "Physical Merchandise" },
        { key: "Digital", label: "Digital Product" },
        { key: "Physical Music", label: "Physical Music" },
        { key: "Digital Music", label: "Digital Music" }
    ];

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const submitData = new FormData();
            submitData.append("name", formData.name);
            submitData.append("price", formData.price);
            submitData.append("description", formData.description);
            submitData.append("category", formData.category);

            formData.images.forEach(image => {
                submitData.append("images", image);
            });

            const response = await fetch(`${apiClient.baseURL}/band-manager/products`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: submitData,
            });

            if (response.ok) {
                alert("Product created successfully!");
                navigate("/bandmanager/manage-products");
            }
        } catch (error) {
            console.error("Error creating product:", error);
            alert("Error creating product");
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

    return (
        <DefaultLayout>
            <div className="max-w-2xl mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Create New Product</h1>
                    <p className="text-gray-600">Add new merchandise to your band's store</p>
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
                                isDisabled={!formData.name || !formData.price || !formData.category}
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