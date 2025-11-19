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
import { Save, Upload } from "lucide-react";
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
        images: [] as File[],
        existingImages: [] as string[],
        removedImages: [] as string[] // NEW: Track removed images
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
                    images: [],
                    existingImages: productData.image?.url || [],
                    removedImages: [] // Reset removed images
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            const validFiles: File[] = [];
            const invalidFiles: string[] = [];

            filesArray.forEach(file => {
                const validation = validateImageFile(file);
                if (validation.isValid) {
                    validFiles.push(file);
                } else {
                    invalidFiles.push(`${file.name}: ${validation.error}`);
                }
            });

            if (invalidFiles.length > 0) {
                alert(`Some files were invalid:\n${invalidFiles.join('\n')}`);
            }

            if (validFiles.length > 0) {
                setFormData({
                    ...formData,
                    images: [...formData.images, ...validFiles]
                });
            }
        }
    };

    const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
        const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

        // Check file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return {
                isValid: false,
                error: `Invalid file type`
            };
        }

        // Check file size
        if (file.size > MAX_SIZE) {
            const currentSizeMB = (file.size / 1024 / 1024).toFixed(2);
            return {
                isValid: false,
                error: `File too large (${currentSizeMB}MB)`
            };
        }

        // Check file extension
        const fileName = file.name.toLowerCase();
        const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
        if (!hasValidExtension) {
            return {
                isValid: false,
                error: `Invalid extension`
            };
        }

        return { isValid: true };
    };

    const removeExistingImage = (index: number) => {
        const newExistingImages = [...formData.existingImages];
        const removedImage = newExistingImages.splice(index, 1)[0];
        setFormData({
            ...formData,
            existingImages: newExistingImages,
            removedImages: [...formData.removedImages, removedImage] // Track removed image
        });
    };

    const removeNewImage = (index: number) => {
        const newImages = [...formData.images];
        newImages.splice(index, 1);
        setFormData({
            ...formData,
            images: newImages
        });
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.price || !formData.category || !formData.stock) {
            alert("Please fill in all required fields");
            return;
        }

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

            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('price', priceValue.toString());
            formDataToSend.append('description', formData.description);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('stock', stockValue.toString());

            // NEW: Send the existing images that should remain
            formDataToSend.append('existingImages', JSON.stringify(formData.existingImages));

            // NEW: Send the removed images
            formDataToSend.append('removedImages', JSON.stringify(formData.removedImages));

            // Append new images if any
            formData.images.forEach((image: File) => {
                formDataToSend.append('images', image);
            });

            console.log("Sending form data:", {
                name: formData.name,
                price: priceValue,
                category: formData.category,
                stock: stockValue,
                existingImages: formData.existingImages,
                removedImages: formData.removedImages,
                newImagesCount: formData.images.length
            });

            const response = await fetch(`${apiClient.baseURL}/band-manager/products/${productId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formDataToSend,
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

                        {/* Existing Images Display */}
                        {formData.existingImages.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Current Images ({formData.existingImages.length})
                                </label>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {formData.existingImages.map((imageUrl, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={imageUrl}
                                                alt={`Product ${index + 1}`}
                                                className="w-20 h-20 object-cover rounded border-2 border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500 mb-4">
                                    Click × to remove images. New images will be added to these.
                                </p>
                            </div>
                        )}

                        {/* New Image Upload */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Add New Images
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 mb-2">
                                    Drag and drop images here, or click to select multiple images
                                </p>
                                <p className="text-xs text-gray-500 mb-3">
                                    <strong>Supported formats:</strong> JPG, PNG, WEBP, GIF<br />
                                    <strong>Maximum file size:</strong> 5MB per image
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

                                {/* New Images Preview */}
                                {formData.images.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-sm text-green-600 mb-2">
                                            {formData.images.length} new image(s) selected
                                        </p>
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {formData.images.map((file, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`New preview ${index + 1}`}
                                                        className="w-16 h-16 object-cover rounded border-2 border-green-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

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