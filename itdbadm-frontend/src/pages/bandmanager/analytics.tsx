import DefaultLayout from "@/layouts/default";
import { Card, CardBody, CardHeader, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Badge } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Package, Users, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

interface AnalyticsData {
    revenueData: Array<{
        month: string;
        revenue: number;
    }>;
    productPerformance: Array<{
        name: string;
        units_sold: number;
        revenue: number;
        current_stock: number;
    }>;
    bookingAnalytics: {
        [key: string]: {
            count: number;
            avg_price: number;
        };
    };
    customerInsights: {
        unique_customers: number;
        total_orders: number;
        avg_order_value: number;
    };
}

export default function BandAnalytics() {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState<AnalyticsData>({
        revenueData: [],
        productPerformance: [],
        bookingAnalytics: {},
        customerInsights: {
            unique_customers: 0,
            total_orders: 0,
            avg_order_value: 0
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await fetch(`${apiClient.baseURL}/band-manager/analytics`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAnalytics(data);
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `¥${amount.toLocaleString()}`;
    };

    // Calculate total revenue safely
    const totalRevenue = analytics.revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0);

    if (loading) {
        return (
            <DefaultLayout>
                <div className="flex justify-center items-center py-16">
                    <div className="text-lg">Loading analytics...</div>
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout>
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="light"
                        onPress={() => navigate("/bandmanager/dashboard")}
                        startContent={<ArrowLeft className="h-4 w-4" />}
                        className="mb-4"
                    >
                        Back to Dashboard
                    </Button>
                    <h1 className="text-3xl font-bold">Band Analytics</h1>
                    <p className="text-gray-600">Detailed insights into your band's performance</p>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="border">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Revenue</p>
                                    <p className="text-2xl font-bold">
                                        {formatCurrency(totalRevenue)}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <DollarSign className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="border">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Unique Customers</p>
                                    <p className="text-2xl font-bold">
                                        {analytics.customerInsights.unique_customers || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <Users className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="border">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Orders</p>
                                    <p className="text-2xl font-bold">
                                        {analytics.customerInsights.total_orders || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <Package className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="border">
                        <CardBody className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Avg Order Value</p>
                                    <p className="text-2xl font-bold">
                                        {formatCurrency(analytics.customerInsights.avg_order_value || 0)}
                                    </p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-full">
                                    <TrendingUp className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Revenue Trend */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold">Revenue Trend (Last 6 Months)</h2>
                        </CardHeader>
                        <CardBody>
                            {analytics.revenueData.length > 0 ? (
                                <div className="space-y-4">
                                    {analytics.revenueData.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                            <span className="font-medium">{item.month}</span>
                                            <Badge color="success" variant="flat">
                                                {formatCurrency(item.revenue || 0)}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">No revenue data available</p>
                            )}
                        </CardBody>
                    </Card>

                    {/* Booking Analytics */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold">Booking Analytics</h2>
                        </CardHeader>
                        <CardBody>
                            {Object.keys(analytics.bookingAnalytics).length > 0 ? (
                                <div className="space-y-4">
                                    {Object.entries(analytics.bookingAnalytics).map(([status, data]) => (
                                        <div key={status} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <span className="font-medium capitalize">{status}</span>
                                                <p className="text-sm text-gray-600">
                                                    {data.count} booking{data.count !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">{formatCurrency(data.avg_price || 0)}</p>
                                                <p className="text-sm text-gray-600">avg. price</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">No booking data available</p>
                            )}
                        </CardBody>
                    </Card>
                </div>

                {/* Product Performance */}
                <Card className="mt-8">
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Product Performance</h2>
                    </CardHeader>
                    <CardBody>
                        {analytics.productPerformance.length > 0 ? (
                            <Table aria-label="Product performance table">
                                <TableHeader>
                                    <TableColumn>PRODUCT</TableColumn>
                                    <TableColumn>UNITS SOLD</TableColumn>
                                    <TableColumn>REVENUE</TableColumn>
                                    <TableColumn>CURRENT STOCK</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {analytics.productPerformance.map((product, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <div className="font-medium">{product.name}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="flat" color="primary">
                                                    {product.units_sold || 0}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">
                                                    {formatCurrency(product.revenue || 0)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="flat"
                                                    color={(product.current_stock || 0) > 10 ? "success" : (product.current_stock || 0) > 0 ? "warning" : "danger"}
                                                >
                                                    {product.current_stock || 0}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No product performance data available</p>
                        )}
                    </CardBody>
                </Card>
            </div>
        </DefaultLayout>
    );
}