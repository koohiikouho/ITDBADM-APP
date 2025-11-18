// pages/admin/products.tsx
import { useState, useEffect } from "react";
import DefaultLayout from "@/layouts/default";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import { Select, SelectItem } from "@heroui/select";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Textarea } from "@heroui/input";
import { Edit, Trash2, Search, Package, Plus } from "lucide-react";
import { apiClient } from "@/lib/api";

interface Product {
    product_id: number;
    name: string;
    price: number;
    description: string;
    category: string;
    image: any;
    is_deleted: boolean;
    band_name: string;
    band_id: number;
    stock: number;
    times_ordered: number;
}

interface Band {
    band_id: number;
    name: string;
}

interface ProductsResponse {
    products: Product[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}

const categoryOptions = [
    { label: "Physical", value: "Physical" },
    { label: "Digital", value: "Digital" },
    { label: "Physical Music", value: "Physical Music" },
    { label: "Digital Music", value: "Digital Music" },
];

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [bands, setBands] = useState<Band[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, total_pages: 0 });
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    // New product form state
    const [newProduct, setNewProduct] = useState({
        band_id: "",
        name: "",
        price: "",
        description: "",
        category: "Physical",
        stock: 10,
    });

    useEffect(() => {
        fetchProducts();
        fetchBands();
    }, [pagination.page]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data: ProductsResponse = await apiClient.get(`/admin/products?page=${pagination.page}&limit=${pagination.limit}`);
            setProducts(data.products);
            setPagination(data.pagination);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBands = async () => {
        try {
            const data: Band[] = await apiClient.get("/admin/bands");
            setBands(data);
        } catch (error) {
            console.error("Error fetching bands:", error);
        }
    };

    const handleCreateProduct = async () => {
        try {
            await apiClient.post("/admin/products", {
                ...newProduct,
                band_id: parseInt(newProduct.band_id),
                price: parseFloat(newProduct.price).toString(),
                stock: parseInt(newProduct.stock.toString()),
            });
            setIsCreateModalOpen(false);
            setNewProduct({
                band_id: "",
                name: "",
                price: "",
                description: "",
                category: "Physical",
                stock: 10,
            });
            fetchProducts(); // Refresh the list
        } catch (error) {
            console.error("Error creating product:", error);
        }
    };

    const handleDeleteProduct = async () => {
        if (!productToDelete) return;

        try {
            await apiClient.delete(`/admin/products/${productToDelete.product_id}`);
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
            fetchProducts(); // Refresh the list
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.band_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DefaultLayout>
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Package size={32} className="text-warning" />
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">Product Management</h1>
                                <p className="text-default-600">Manage products across all bands</p>
                            </div>
                        </div>
                        <Button
                            color="primary"
                            startContent={<Plus size={18} />}
                            onPress={() => setIsCreateModalOpen(true)}
                        >
                            Add Product
                        </Button>
                    </div>
                </div>

                {/* Search and Stats */}
                <Card className="mb-6">
                    <CardBody>
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <Input
                                placeholder="Search products by name or band..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                startContent={<Search size={18} className="text-default-400" />}
                                className="max-w-md"
                            />
                            <div className="text-default-600">
                                Total: {pagination.total} products
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Products Table */}
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">All Products</h3>
                    </CardHeader>
                    <CardBody>
                        <Table aria-label="Products table">
                            <TableHeader>
                                <TableColumn>PRODUCT</TableColumn>
                                <TableColumn>BAND</TableColumn>
                                <TableColumn>PRICE</TableColumn>
                                <TableColumn>CATEGORY</TableColumn>
                                <TableColumn>STOCK</TableColumn>
                                <TableColumn>ORDERS</TableColumn>
                                <TableColumn>STATUS</TableColumn>
                                <TableColumn>ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody
                                items={filteredProducts}
                                isLoading={loading}
                                loadingContent="Loading products..."
                            >
                                {(product) => (
                                    <TableRow key={product.product_id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {product.image?.url?.[0] && (
                                                    <img
                                                        src={product.image.url[0]}
                                                        alt={product.name}
                                                        className="w-10 h-10 object-cover rounded"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-semibold">{product.name}</p>
                                                    <p className="text-sm text-default-600 line-clamp-1">
                                                        {product.description.substring(0, 50)}...
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">{product.band_name}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-semibold">¥{product.price}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 rounded-full text-xs bg-default/20 text-default-600">
                                                {product.category}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`font-semibold ${product.stock === 0 ? 'text-danger' :
                                                    product.stock < 10 ? 'text-warning' : 'text-success'
                                                }`}>
                                                {product.stock}
                                            </span>
                                        </TableCell>
                                        <TableCell>{product.times_ordered}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.is_deleted ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'
                                                }`}>
                                                {product.is_deleted ? 'Deleted' : 'Active'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {!product.is_deleted && (
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        color="danger"
                                                        onPress={() => {
                                                            setProductToDelete(product);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        isIconOnly
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {pagination.total_pages > 1 && (
                            <div className="flex justify-center mt-6">
                                <Pagination
                                    total={pagination.total_pages}
                                    page={pagination.page}
                                    onChange={(page) => setPagination(prev => ({ ...prev, page }))}
                                />
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Create Product Modal */}
                <Modal isOpen={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} size="2xl">
                    <ModalContent>
                        <ModalHeader>Create New Product</ModalHeader>
                        <ModalBody>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select
                                    label="Band"
                                    placeholder="Select a band"
                                    selectedKeys={newProduct.band_id ? [newProduct.band_id] : []}
                                    onChange={(e) => setNewProduct({ ...newProduct, band_id: e.target.value })}
                                >
                                    {bands.map((band) => (
                                        <SelectItem key={band.band_id} value={band.band_id.toString()}>
                                            {band.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <Input
                                    label="Product Name"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                />
                                <Input
                                    label="Price (¥)"
                                    type="number"
                                    value={newProduct.price}
                                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                />
                                <Input
                                    label="Initial Stock"
                                    type="number"
                                    value={newProduct.stock.toString()}
                                    onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                                />
                                <Select
                                    label="Category"
                                    selectedKeys={[newProduct.category]}
                                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                    className="md:col-span-2"
                                >
                                    {categoryOptions.map((category) => (
                                        <SelectItem key={category.value} value={category.value}>
                                            {category.label}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <Textarea
                                    label="Description"
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    className="md:col-span-2"
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={() => setIsCreateModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleCreateProduct}
                                isDisabled={!newProduct.band_id || !newProduct.name || !newProduct.price}
                            >
                                Create Product
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal isOpen={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <ModalContent>
                        <ModalHeader>Delete Product</ModalHeader>
                        <ModalBody>
                            <p>Are you sure you want to delete product <strong>{productToDelete?.name}</strong>?</p>
                            <p className="text-sm text-default-600">
                                This will soft delete the product and remove it from the store.
                            </p>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={() => setIsDeleteModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button color="danger" onPress={handleDeleteProduct}>
                                Delete Product
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </div>
        </DefaultLayout>
    );
}