// pages/admin/analytics.tsx
import { useState, useEffect } from "react";
import DefaultLayout from "@/layouts/default";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { BarChart3, TrendingUp, Users, Package, DollarSign, ShoppingCart } from "lucide-react";
import { apiClient } from "@/lib/api";

interface AdminStats {
    user_stats: Array<{ role_type: string; count: number }>;
    band_stats: { total_bands: number; deleted_bands: number };
    product_stats: {
        total_products: number;
        deleted_products: number;
        digital_products: number;
        physical_products: number;
    };
    revenue_stats: {
        total_orders: number;
        total_revenue: number;
        avg_order_value: number
    };
    recent_activity: {
        recent_orders: number;
        recent_users: number;
    };
}

export default function AdminAnalyticsPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState("all");

    // Helper function to safely format numbers
    const formatCurrency = (value: any) => {
        const num = Number(value);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await apiClient.get("/admin/stats");
                console.log("Analytics data:", data);
                console.log("Avg order value:", data?.revenue_stats?.avg_order_value);
                console.log("Type:", typeof data?.revenue_stats?.avg_order_value);
                setStats(data);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [timeRange]);

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
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <BarChart3 size={32} className="text-success" />
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
                                <p className="text-default-600">Detailed system analytics and insights</p>
                            </div>
                        </div>
                        <Select
                            label="Time Range"
                            selectedKeys={[timeRange]}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="w-40"
                        >
                            <SelectItem key="7d" >Last 7 days</SelectItem>
                            <SelectItem key="30d" >Last 30 days</SelectItem>
                            <SelectItem key="90d" >Last 90 days</SelectItem>
                            <SelectItem key="all" >All time</SelectItem>
                        </Select>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-primary/10 border-primary/20">
                        <CardBody className="flex flex-row items-center justify-between">
                            <div>
                                <p className="text-sm text-default-600">Total Revenue</p>
                                <p className="text-2xl font-bold">
                                    ¥{(Number(stats?.revenue_stats.total_revenue) || 0).toLocaleString()}
                                </p>
                            </div>
                            <DollarSign className="text-primary" size={24} />
                        </CardBody>
                    </Card>

                    <Card className="bg-success/10 border-success/20">
                        <CardBody className="flex flex-row items-center justify-between">
                            <div>
                                <p className="text-sm text-default-600">Total Orders</p>
                                <p className="text-2xl font-bold">{stats?.revenue_stats.total_orders || 0}</p>
                            </div>
                            <ShoppingCart className="text-success" size={24} />
                        </CardBody>
                    </Card>

                    <Card className="bg-warning/10 border-warning/20">
                        <CardBody className="flex flex-row items-center justify-between">
                            <div>
                                <p className="text-sm text-default-600">Active Users</p>
                                <p className="text-2xl font-bold">
                                    {stats?.user_stats.reduce((acc, stat) => acc + stat.count, 0) || 0}
                                </p>
                            </div>
                            <Users className="text-warning" size={24} />
                        </CardBody>
                    </Card>

                    <Card className="bg-secondary/10 border-secondary/20">
                        <CardBody className="flex flex-row items-center justify-between">
                            <div>
                                <p className="text-sm text-default-600">Products</p>
                                <p className="text-2xl font-bold">{stats?.product_stats.total_products || 0}</p>
                            </div>
                            <Package className="text-secondary" size={24} />
                        </CardBody>
                    </Card>
                </div>

                {/* Detailed Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Distribution */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold">User Distribution</h3>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-4">
                                {stats?.user_stats.map((stat) => (
                                    <div key={stat.role_type} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${stat.role_type === 'Admin' ? 'bg-danger' :
                                                stat.role_type === 'BandManager' ? 'bg-primary' :
                                                    stat.role_type === 'Staff' ? 'bg-warning' : 'bg-success'
                                                }`} />
                                            <span className="capitalize">{stat.role_type}s</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-semibold">{stat.count}</span>
                                            <div className="w-20 bg-default-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${stat.role_type === 'Admin' ? 'bg-danger' :
                                                        stat.role_type === 'BandManager' ? 'bg-primary' :
                                                            stat.role_type === 'Staff' ? 'bg-warning' : 'bg-success'
                                                        }`}
                                                    style={{
                                                        width: `${(stat.count / (stats.user_stats.reduce((acc, s) => acc + s.count, 0)) * 100)}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Product Categories */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold">Product Categories</h3>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span>Physical Products</span>
                                    <div className="flex items-center gap-4">
                                        <span className="font-semibold">{stats?.product_stats.physical_products}</span>
                                        <div className="w-20 bg-default-200 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full bg-warning"
                                                style={{
                                                    width: `${(stats?.product_stats.physical_products || 0) / (stats?.product_stats.total_products || 1) * 100}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Digital Products</span>
                                    <div className="flex items-center gap-4">
                                        <span className="font-semibold">{stats?.product_stats.digital_products}</span>
                                        <div className="w-20 bg-default-200 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full bg-success"
                                                style={{
                                                    width: `${(stats?.product_stats.digital_products || 0) / (stats?.product_stats.total_products || 1) * 100}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-danger">
                                    <span>Deleted Products</span>
                                    <span className="font-semibold">{stats?.product_stats.deleted_products}</span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Revenue Analytics */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold">Revenue Analytics</h3>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-6">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-primary">
                                        ¥{(Number(stats?.revenue_stats.total_revenue) || 0).toLocaleString()}
                                    </p>
                                    <p className="text-default-600">Total Revenue</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-default-100 rounded-lg">
                                        <p className="text-xl font-bold">{stats?.revenue_stats.total_orders}</p>
                                        <p className="text-sm text-default-600">Total Orders</p>
                                    </div>
                                    <div className="text-center p-4 bg-default-100 rounded-lg">
                                        {/* FIXED LINE - This was causing the error */}
                                        <p className="text-xl font-bold">¥{formatCurrency(stats?.revenue_stats.avg_order_value)}</p>
                                        <p className="text-sm text-default-600">Avg Order Value</p>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold">Recent Activity</h3>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp size={20} className="text-success" />
                                        <div>
                                            <p className="font-medium">Orders (7 days)</p>
                                            <p className="text-sm text-default-600">New customer orders</p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-success">
                                        +{stats?.recent_activity.recent_orders}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Users size={20} className="text-primary" />
                                        <div>
                                            <p className="font-medium">Active Users (30 days)</p>
                                            <p className="text-sm text-default-600">Users who placed orders</p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-primary">
                                        +{stats?.recent_activity.recent_users}
                                    </span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Band Statistics */}
                <Card className="mt-6">
                    <CardHeader>
                        <h3 className="text-lg font-semibold">Band Statistics</h3>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-default-100 rounded-lg">
                                <p className="text-2xl font-bold text-foreground">{stats?.band_stats.total_bands}</p>
                                <p className="text-default-600">Total Bands</p>
                            </div>
                            <div className="text-center p-4 bg-default-100 rounded-lg">
                                <p className="text-2xl font-bold text-foreground">{stats?.band_stats?.total_bands || 0}</p>
                                <p className="text-default-600">Active Bands</p>
                            </div>
                            <div className="text-center p-4 bg-default-100 rounded-lg">
                                <p className="text-2xl font-bold text-danger">{stats?.band_stats.deleted_bands}</p>
                                <p className="text-default-600">Deleted Bands</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </DefaultLayout>
    );
}