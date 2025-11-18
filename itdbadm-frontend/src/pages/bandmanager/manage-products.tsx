import DefaultLayout from "@/layouts/default";
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Input,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Pagination,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Badge
} from "@heroui/react";
import {
    Plus,
    Edit,
    Trash2,
    MoreVertical,
    Search,
    Package
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

export default function ManageProductsPage() {
    const navigate = useNavigate();
    const { productId } = useParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 10;

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${apiClient.baseURL}/band-manager/products`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (productId: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const response = await fetch(`${apiClient.baseURL}/band-manager/products/${productId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            if (response.ok) {
                setProducts(products.filter(p => p.product_id !== productId));
                alert("Product deleted successfully");
            } else {
                const errorData = await response.json();
                alert(`Error deleting product: ${errorData.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Error deleting product");
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
    );

    if (loading) {
        return (
            <DefaultLayout>
                <div className="flex justify-center items-center py-16">
                    <div className="text-lg">Loading products...</div>
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout>
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Manage Products</h1>
                        <p className="text-gray-600">Create and manage your band's merchandise</p>
                    </div>
                    <Button
                        color="primary"
                        onPress={() => navigate("/bandmanager/create-product")}
                        startContent={<Plus className="h-4 w-4" />}
                    >
                        Add Product
                    </Button>
                </div>

                {/* Search and Filters */}
                <Card className="mb-6">
                    <CardBody>
                        <div className="flex gap-4">
                            <Input
                                placeholder="Search products..."
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                                startContent={<Search className="h-4 w-4 text-gray-400" />}
                                className="flex-1"
                            />
                        </div>
                    </CardBody>
                </Card>

                {/* Products Table */}
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold">
                            Products ({filteredProducts.length})
                        </h2>
                    </CardHeader>
                    <CardBody>
                        <Table aria-label="Products table">
                            <TableHeader>
                                <TableColumn>PRODUCT</TableColumn>
                                <TableColumn>CATEGORY</TableColumn>
                                <TableColumn>PRICE</TableColumn>
                                <TableColumn>ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {paginatedProducts.map((product) => (
                                    <TableRow key={product.product_id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={product.image.url[0] || "/api/placeholder/50/50"}
                                                    alt={product.name}
                                                    className="w-10 h-10 rounded object-cover"
                                                />
                                                <div>
                                                    <p className="font-medium">{product.name}</p>
                                                    <p className="text-sm text-gray-600 line-clamp-1">
                                                        {product.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="flat" color="primary">
                                                {product.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            ¥{parseFloat(product.price).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="light"
                                                    onPress={() => navigate(`/bandmanager/edit-product/${product.product_id}`)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    color="danger"
                                                    variant="light"
                                                    onPress={() => deleteProduct(product.product_id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {filteredProducts.length > productsPerPage && (
                            <div className="flex justify-center mt-6">
                                <Pagination
                                    total={Math.ceil(filteredProducts.length / productsPerPage)}
                                    page={currentPage}
                                    onChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </DefaultLayout>
    );
}