// pages/admin/dashboard.tsx
import { useState, useEffect } from "react";
import DefaultLayout from "@/layouts/default";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import {
    Users,
    Package,
    Music,
    DollarSign,
    ShoppingCart,
    TrendingUp,
    BarChart3
} from "lucide-react";
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

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Helper function to safely format numbers
    const formatCurrency = (value: any) => {
        const num = Number(value);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await apiClient.get("/admin/stats");
            console.log("Dashboard stats:", data);
            setStats(data);
        } catch (err) {
            console.error("Error fetching admin stats:", err);
            setError("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DefaultLayout>
                <div className="flex justify-center items-center py-16">
                    <div className="text-lg">Loading dashboard...</div>
                </div>
            </DefaultLayout>
        );
    }

    if (error) {
        return (
            <DefaultLayout>
                <div className="flex justify-center items-center py-16">
                    <div className="text-lg text-red-500">{error}</div>
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout>
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
                    <p className="text-default-600 mt-2">System overview and analytics</p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-primary/10 border-primary/20">
                        <CardBody className="flex flex-row items-center gap-4">
                            <Users className="text-primary" size={24} />
                            <div>
                                <p className="text-sm text-default-600">Total Users</p>
                                <p className="text-2xl font-bold">
                                    {stats?.user_stats.reduce((acc, stat) => acc + stat.count, 0) || 0}
                                </p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-success/10 border-success/20">
                        <CardBody className="flex flex-row items-center gap-4">
                            <Music className="text-success" size={24} />
                            <div>
                                <p className="text-sm text-default-600">Active Bands</p>
                                <p className="text-2xl font-bold">
                                    {stats?.band_stats.total_bands || 0}
                                </p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-warning/10 border-warning/20">
                        <CardBody className="flex flex-row items-center gap-4">
                            <Package className="text-warning" size={24} />
                            <div>
                                <p className="text-sm text-default-600">Products</p>
                                <p className="text-2xl font-bold">
                                    {stats?.product_stats.total_products || 0}
                                </p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-secondary/10 border-secondary/20">
                        <CardBody className="flex flex-row items-center gap-4">
                            <DollarSign className="text-secondary" size={24} />
                            <div>
                                <p className="text-sm text-default-600">Total Revenue</p>
                                <p className="text-2xl font-bold">
                                    ¥{(Number(stats?.revenue_stats.total_revenue) || 0).toLocaleString()}
                                </p>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Statistics */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <h3 className="text-lg font-semibold">User Distribution</h3>
                            <Link href="/admin/users">
                                <Button size="sm" variant="light">View All</Button>
                            </Link>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-3">
                                {stats?.user_stats.map((stat) => (
                                    <div key={stat.role_type} className="flex justify-between items-center">
                                        <span className="text-default-600 capitalize">{stat.role_type}s</span>
                                        <span className="font-semibold">{stat.count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Product Statistics */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <h3 className="text-lg font-semibold">Product Overview</h3>
                            <Link href="/admin/products">
                                <Button size="sm" variant="light">Manage</Button>
                            </Link>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-default-600">Total Products</span>
                                    <span className="font-semibold">{stats?.product_stats.total_products}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-default-600">Digital Products</span>
                                    <span className="font-semibold">{stats?.product_stats.digital_products}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-default-600">Physical Products</span>
                                    <span className="font-semibold">{stats?.product_stats.physical_products}</span>
                                </div>
                                <div className="flex justify-between text-danger">
                                    <span>Deleted Products</span>
                                    <span>{stats?.product_stats.deleted_products}</span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Revenue Stats */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold">Revenue Analytics</h3>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-default-600">Total Orders</p>
                                        <p className="text-2xl font-bold">{stats?.revenue_stats.total_orders}</p>
                                    </div>
                                    <ShoppingCart className="text-default-400" size={32} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-default-600">Average Order Value</p>
                                        {/* FIXED LINE - This was causing the error */}
                                        <p className="text-2xl font-bold">¥{formatCurrency(stats?.revenue_stats.avg_order_value)}</p>
                                    </div>
                                    <TrendingUp className="text-default-400" size={32} />
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
                                <div className="flex justify-between items-center p-3 bg-default-100 rounded-lg">
                                    <div>
                                        <p className="font-medium">Orders (7 days)</p>
                                        <p className="text-default-600 text-sm">Recent customer orders</p>
                                    </div>
                                    <div className="text-2xl font-bold text-primary">
                                        {stats?.recent_activity.recent_orders}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-default-100 rounded-lg">
                                    <div>
                                        <p className="font-medium">Active Users (30 days)</p>
                                        <p className="text-default-600 text-sm">Users who placed orders</p>
                                    </div>
                                    <div className="text-2xl font-bold text-success">
                                        {stats?.recent_activity.recent_users}
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Quick Navigation */}
                <Card className="mt-8">
                    <CardHeader>
                        <h3 className="text-lg font-semibold">Quick Actions</h3>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link href="/admin/users">
                                <Card className="hover:bg-default-100 cursor-pointer transition-colors">
                                    <CardBody className="flex flex-col items-center gap-3 py-6">
                                        <Users size={32} className="text-primary" />
                                        <span className="font-semibold">Manage Users</span>
                                    </CardBody>
                                </Card>
                            </Link>
                            <Link href="/admin/products">
                                <Card className="hover:bg-default-100 cursor-pointer transition-colors">
                                    <CardBody className="flex flex-col items-center gap-3 py-6">
                                        <Package size={32} className="text-warning" />
                                        <span className="font-semibold">Manage Products</span>
                                    </CardBody>
                                </Card>
                            </Link>
                            <Link href="/admin/analytics">
                                <Card className="hover:bg-default-100 cursor-pointer transition-colors">
                                    <CardBody className="flex flex-col items-center gap-3 py-6">
                                        <BarChart3 size={32} className="text-success" />
                                        <span className="font-semibold">View Analytics</span>
                                    </CardBody>
                                </Card>
                            </Link>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </DefaultLayout>
    );
}