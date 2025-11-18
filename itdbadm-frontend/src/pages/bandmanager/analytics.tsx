import DefaultLayout from "@/layouts/default";
import {
    Card,
    CardBody,
    CardHeader,
    Select,
    SelectItem
} from "@heroui/react";
import { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
import { apiClient } from "@/lib/api";

interface AnalyticsData {
    revenue: {
        monthly: Array<{ month: string; revenue: number }>;
        byProduct: Array<{ product: string; revenue: number }>;
    };
    bookings: {
        monthly: Array<{ month: string; bookings: number }>;
        status: Array<{ status: string; count: number }>;
    };
    products: {
        topSelling: Array<{ product: string; sales: number }>;
        categories: Array<{ category: string; count: number }>;
    };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState("30");

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            const response = await fetch(
                `${apiClient.baseURL}/band-manager/analytics?range=${timeRange}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );

            if (response.ok) {
                const analyticsData = await response.json();
                setData(analyticsData);
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DefaultLayout>
                <div className="flex justify-center items-center py-16">
                    <div className="text-lg">Loading analytics...</div>
                </div>
            </DefaultLayout>
        );
    }

    if (!data) {
        return (
            <DefaultLayout>
                <div className="flex justify-center items-center py-16">
                    <div className="text-lg">No analytics data available</div>
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout>
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                        <p className="text-gray-600">Track your band's performance and sales</p>
                    </div>
                    <Select
                        selectedKeys={[timeRange]}
                        onSelectionChange={(keys) => setTimeRange(Array.from(keys)[0] as string)}
                        className="w-40"
                    >
                        <SelectItem key="7">Last 7 days</SelectItem>
                        <SelectItem key="30">Last 30 days</SelectItem>
                        <SelectItem key="90">Last 90 days</SelectItem>
                    </Select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Revenue Chart */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold">Revenue Trend</h2>
                        </CardHeader>
                        <CardBody>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data.revenue.monthly}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="revenue" stroke="#0088FE" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardBody>
                    </Card>

                    {/* Product Sales */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold">Product Sales</h2>
                        </CardHeader>
                        <CardBody>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data.products.topSelling}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="product" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="sales" fill="#00C49F" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardBody>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue by Product */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold">Revenue by Product</h2>
                        </CardHeader>
                        <CardBody>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={data.revenue.byProduct}
                                        dataKey="revenue"
                                        nameKey="product"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {data.revenue.byProduct.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardBody>
                    </Card>

                    {/* Booking Status */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold">Booking Status</h2>
                        </CardHeader>
                        <CardBody>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={data.bookings.status}
                                        dataKey="count"
                                        nameKey="status"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {data.bookings.status.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </DefaultLayout>
    );
}