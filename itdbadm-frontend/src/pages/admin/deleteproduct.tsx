import { useState, useEffect } from "react";
import { Input, Button, Card, CardBody, Image, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Select, SelectItem } from "@heroui/react";
import { Search, Trash2, AlertTriangle, X, Music, Filter } from "lucide-react";

interface Product {
    id: string;
    name: string;
    band: string;
    category: string;
    price: number;
    stock: number;
    description: string;
    images: string[];
}

export default function DeleteProduct() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [selectedBand, setSelectedBand] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const bands = [
        { id: "kessoku", label: "Kessoku Band", color: "from-purple-500 to-pink-500" },
        { id: "anotherband", label: "Another Band", color: "from-blue-500 to-cyan-500" },
        { id: "all", label: "All Bands", color: "from-gray-500 to-slate-500" },
    ];

    // Mock data - replace with actual API call
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            // Simulate API call
            setTimeout(() => {
                const mockProducts: Product[] = [
                    {
                        id: "1",
                        name: "Kessoku Band T-Shirt",
                        band: "kessoku",
                        category: "Shirt",
                        price: 4851,
                        stock: 25,
                        description: "Official Kessoku Band tour t-shirt with exclusive design",
                        images: ["/api/placeholder/200/200"]
                    },
                    {
                        id: "2",
                        name: "Limited Edition CD",
                        band: "kessoku",
                        category: "CD",
                        price: 3200,
                        stock: 15,
                        description: "Special edition CD with bonus tracks and artwork",
                        images: ["/api/placeholder/200/200"]
                    },
                    {
                        id: "3",
                        name: "Bocchi Nendoroid",
                        band: "kessoku",
                        category: "Figure",
                        price: 6500,
                        stock: 8,
                        description: "Bocchi-chan nendoroid figure with multiple expressions",
                        images: ["/api/placeholder/200/200"]
                    },
                    {
                        id: "4",
                        name: "Tour Poster 2024",
                        band: "anotherband",
                        category: "Poster",
                        price: 1800,
                        stock: 30,
                        description: "Official tour poster with band signatures",
                        images: ["/api/placeholder/200/200"]
                    },
                    {
                        id: "5",
                        name: "Band Sticker Pack",
                        band: "anotherband",
                        category: "Accessory",
                        price: 800,
                        stock: 50,
                        description: "Set of 10 vinyl stickers featuring band logos",
                        images: ["/api/placeholder/200/200"]
                    },
                    {
                        id: "6",
                        name: "Guitar Pick Set",
                        band: "kessoku",
                        category: "Accessory",
                        price: 1200,
                        stock: 20,
                        description: "Custom engraved guitar picks with band logo",
                        images: ["/api/placeholder/200/200"]
                    }
                ];
                setProducts(mockProducts);
                setFilteredProducts(mockProducts);
                setLoading(false);
            }, 1000);
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        let filtered = products;

        // Filter by selected band
        if (selectedBand && selectedBand !== "all") {
            filtered = filtered.filter(product => product.band === selectedBand);
        }

        // Filter by search term
        if (searchTerm.trim() !== "") {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredProducts(filtered);
    }, [selectedBand, searchTerm, products]);

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            Figure: "from-pink-500 to-rose-500",
            CD: "from-blue-500 to-cyan-500",
            Shirt: "from-green-500 to-emerald-500",
            Poster: "from-purple-500 to-indigo-500",
            Accessory: "from-orange-500 to-amber-500",
        };
        return colors[category] || "from-gray-500 to-slate-500";
    };

    const getBandColor = (band: string) => {
        const colors: { [key: string]: string } = {
            kessoku: "from-purple-500 to-pink-500",
            anotherband: "from-blue-500 to-cyan-500",
        };
        return colors[band] || "from-gray-500 to-slate-500";
    };

    const getBandName = (bandId: string) => {
        const bandsMap: { [key: string]: string } = {
            kessoku: "Kessoku Band",
            anotherband: "Another Band",
        };
        return bandsMap[bandId] || bandId;
    };

    const handleDeleteClick = (product: Product) => {
        setSelectedProduct(product);
        onOpen();
    };

    const confirmDelete = async () => {
        if (!selectedProduct) return;

        setDeleteLoading(true);

        // Simulate API call
        setTimeout(async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/products/delete/${selectedProduct.id}`, {
                    method: "DELETE",
                });

                const data = await res.json();

                if (data.success) {
                    // Remove product from state
                    setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
                    setFilteredProducts(prev => prev.filter(p => p.id !== selectedProduct.id));

                    // Show success message
                    alert("Product deleted successfully!");
                } else {
                    alert("Error deleting product.");
                }
            } catch (error) {
                alert("Error deleting product.");
            } finally {
                setDeleteLoading(false);
                onClose();
                setSelectedProduct(null);
            }
        }, 1500);
    };

    const clearFilters = () => {
        setSelectedBand("");
        setSearchTerm("");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-rose-900 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent mb-2">
                        Delete Products
                    </h1>
                    <p className="text-gray-300">Select a band and manage their products</p>
                </div>

                {/* Band Selection Card */}
                <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 mb-6">
                    <CardBody className="p-6">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Filter className="text-white" size={28} />
                            </div>
                            <h2 className="text-2xl font-semibold text-white mb-3">Select Band</h2>
                            <p className="text-gray-400 text-lg">Choose a band to view and manage their products</p>
                        </div>

                        {/* Updated Larger Select */}
                        <div className="max-w-2xl mx-auto">
                            <Select
                                label="Filter by Band"
                                selectedKeys={selectedBand ? [selectedBand] : []}
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as string;
                                    setSelectedBand(selected || "");
                                }}
                                placeholder="Choose band"
                                classNames={{
                                    trigger: "bg-gray-700/50 border-gray-600 hover:border-red-400 transition-colors h-14 min-h-14 text-lg",
                                    label: "text-gray-300 text-base",
                                    value: "text-white text-lg font-medium",
                                    mainWrapper: "w-full",
                                    innerWrapper: "text-lg",
                                }}
                                size="lg"
                            >
                                {bands.map((band) => (
                                    <SelectItem
                                        key={band.id}
                                        classNames={{
                                            base: `bg-gradient-to-r ${band.color} text-white text-lg py-4`,
                                        }}
                                        textValue={band.label}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${band.color}`} />
                                            <span className="text-lg font-medium">{band.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        {/* Selected Band Info */}
                        {selectedBand && (
                            <div className="mt-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${getBandColor(selectedBand === "all" ? "kessoku" : selectedBand)}`} />
                                        <div>
                                            <span className="text-white font-semibold text-lg">
                                                {selectedBand === "all" ? "All Bands" : getBandName(selectedBand)}
                                            </span>
                                            <Chip
                                                classNames={{
                                                    base: "bg-red-500/20 text-red-400 border-red-500/30 ml-3"
                                                }}
                                                size="lg"
                                            >
                                                {filteredProducts.length} product(s)
                                            </Chip>
                                        </div>
                                    </div>
                                    <Button
                                        onPress={clearFilters}
                                        size="lg"
                                        variant="light"
                                        className="text-gray-400 hover:text-white transition-colors text-base"
                                    >
                                        Clear Filter
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Products Section - Only show when band is selected */}
                {selectedBand ? (
                    <>
                        {/* Search Bar */}
                        <div className="mb-6">
                            <Input
                                placeholder={`Search products in ${selectedBand === "all" ? "all bands" : getBandName(selectedBand)}...`}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                startContent={<Search className="text-gray-400" size={20} />}
                                classNames={{
                                    input: "bg-gray-800/50 border-gray-600 text-white placeholder-gray-400",
                                    innerWrapper: "bg-transparent"
                                }}
                            />
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                                <CardBody className="py-12 text-center">
                                    <Music className="mx-auto text-gray-400 mb-4" size={64} />
                                    <h3 className="text-xl text-gray-300 mb-2">No products found</h3>
                                    <p className="text-gray-400 mb-4">
                                        {searchTerm
                                            ? "No products match your search criteria"
                                            : `No products available for ${selectedBand === "all" ? "any band" : getBandName(selectedBand)}`
                                        }
                                    </p>
                                    <Button
                                        onPress={clearFilters}
                                        className="bg-gradient-to-r from-gray-600 to-slate-600 text-white"
                                    >
                                        Clear Filters
                                    </Button>
                                </CardBody>
                            </Card>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredProducts.map((product) => (
                                        <Card
                                            key={product.id}
                                            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-red-400/50 transition-all duration-300 hover:scale-105"
                                        >
                                            <CardBody className="p-4">
                                                {/* Product Image */}
                                                <div className="relative mb-4">
                                                    <Image
                                                        src={product.images[0] || "/api/placeholder/200/200"}
                                                        alt={product.name}
                                                        className="w-full h-48 object-cover rounded-lg bg-gray-700"
                                                    />
                                                    <div className="absolute top-2 right-2 flex gap-2">
                                                        <Chip
                                                            classNames={{
                                                                base: `bg-gradient-to-r ${getBandColor(product.band)} text-white border-none text-xs`
                                                            }}
                                                            size="sm"
                                                        >
                                                            {getBandName(product.band)}
                                                        </Chip>
                                                    </div>
                                                </div>

                                                {/* Product Info */}
                                                <div className="space-y-3">
                                                    <h3 className="text-lg font-semibold text-white line-clamp-1">
                                                        {product.name}
                                                    </h3>

                                                    <div className="flex items-center justify-between">
                                                        <Chip
                                                            classNames={{
                                                                base: `bg-gradient-to-r ${getCategoryColor(product.category)} text-white border-none`
                                                            }}
                                                            size="sm"
                                                        >
                                                            {product.category}
                                                        </Chip>
                                                        <span className="text-lg font-bold text-amber-400">
                                                            ¥{product.price.toLocaleString()}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between text-sm text-gray-300">
                                                        <span>Stock: {product.stock}</span>
                                                        <span className={`px-2 py-1 rounded-full ${product.stock > 10 ? 'bg-green-500/20 text-green-400' : product.stock > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                                                            {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                                                        </span>
                                                    </div>

                                                    <p className="text-gray-400 text-sm line-clamp-2">
                                                        {product.description}
                                                    </p>

                                                    {/* Delete Button */}
                                                    <Button
                                                        onPress={() => handleDeleteClick(product)}
                                                        className="w-full bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium hover:from-red-600 hover:to-rose-600 transition-all mt-2"
                                                        startContent={<Trash2 size={16} />}
                                                    >
                                                        Delete Product
                                                    </Button>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>

                                {/* Results Count */}
                                <div className="mt-6 text-center">
                                    <p className="text-gray-400">
                                        Showing {filteredProducts.length} of {products.filter(p => selectedBand === "all" ? true : p.band === selectedBand).length} products
                                        {selectedBand !== "all" && ` for ${getBandName(selectedBand)}`}
                                    </p>
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    /* Empty State - No band selected */
                    <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                        <CardBody className="py-16 text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-gray-600 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Filter className="text-gray-400" size={32} />
                            </div>
                            <h3 className="text-2xl text-gray-300 mb-2">Select a Band</h3>
                            <p className="text-gray-400 max-w-md mx-auto">
                                Choose a band from the dropdown above to view and manage their products.
                                You can select a specific band or view all products across all bands.
                            </p>
                        </CardBody>
                    </Card>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="md">
                <ModalContent className="bg-gray-800 border border-gray-700">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 border-b border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-500/20 rounded-lg">
                                        <AlertTriangle className="text-red-400" size={24} />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Confirm Deletion</h2>
                                </div>
                            </ModalHeader>
                            <ModalBody className="py-6">
                                {selectedProduct && (
                                    <div className="space-y-4">
                                        <p className="text-gray-300">
                                            Are you sure you want to delete this product? This action cannot be undone.
                                        </p>

                                        <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                                                    <Music className="text-gray-400" size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-semibold">{selectedProduct.name}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Chip
                                                            classNames={{
                                                                base: `bg-gradient-to-r ${getBandColor(selectedProduct.band)} text-white border-none text-xs`
                                                            }}
                                                            size="sm"
                                                        >
                                                            {getBandName(selectedProduct.band)}
                                                        </Chip>
                                                        <Chip
                                                            classNames={{
                                                                base: `bg-gradient-to-r ${getCategoryColor(selectedProduct.category)} text-white border-none text-xs`
                                                            }}
                                                            size="sm"
                                                        >
                                                            {selectedProduct.category}
                                                        </Chip>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-400">¥{selectedProduct.price.toLocaleString()} • Stock: {selectedProduct.stock}</p>
                                        </div>

                                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                            <p className="text-red-400 text-sm flex items-center gap-2">
                                                <AlertTriangle size={16} />
                                                Warning: This will permanently remove the product from your collection.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter className="border-t border-gray-700">
                                <Button
                                    onPress={onClose}
                                    className="bg-gray-600 text-white hover:bg-gray-500 transition-colors"
                                    startContent={<X size={16} />}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onPress={confirmDelete}
                                    className="bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium hover:from-red-600 hover:to-rose-600 transition-all"
                                    isLoading={deleteLoading}
                                    startContent={!deleteLoading && <Trash2 size={16} />}
                                >
                                    {deleteLoading ? "Deleting..." : "Delete Permanently"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}