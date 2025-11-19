import DefaultLayout from "@/layouts/default";
import { Card, CardBody, CardHeader, Button, Progress, Badge } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import {
    Users,
    Package,
    Calendar,
    DollarSign,
    BarChart3,
    ShoppingCart,
    Star
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

interface BandStats {
    totalProducts: number;
    totalBookings: number;
    pendingOffers: number;
    revenue: number;
    revenueChange: number;
}

interface RecentActivity {
    type: 'order' | 'booking' | 'review';
    title: string;
    description: string;
    timestamp: string;
    amount?: number;
    status?: string;
}

interface PerformanceMetrics {
    salesRate: number;
    bookingConversion: number;
    inventoryHealth: number;
    topSellingProduct?: string;
    totalUnitsSold: number;
    avgBookingPrice: number;
}

export default function BandManagerDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<BandStats>({
        totalProducts: 0,
        totalBookings: 0,
        pendingOffers: 0,
        revenue: 0,
        revenueChange: 0
    });
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [performance, setPerformance] = useState<PerformanceMetrics>({
        salesRate: 0,
        bookingConversion: 0,
        inventoryHealth: 0,
        topSellingProduct: "N/A",
        totalUnitsSold: 0,
        avgBookingPrice: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch band stats
            const statsResponse = await fetch(`${apiClient.baseURL}/band-manager/stats`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setStats(statsData);
            }

            // Fetch recent activity
            const activityResponse = await fetch(`${apiClient.baseURL}/band-manager/recent-activity`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            if (activityResponse.ok) {
                const activityData = await activityResponse.json();
                setRecentActivity(activityData);
            }

            // Fetch performance metrics
            const performanceResponse = await fetch(`${apiClient.baseURL}/band-manager/performance`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            if (performanceResponse.ok) {
                const performanceData = await performanceResponse.json();
                setPerformance(performanceData);
            }

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };


    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'order':
                return <ShoppingCart className="h-4 w-4 text-blue-600" />;
            case 'booking':
                return <Calendar className="h-4 w-4 text-green-600" />;
            case 'review':
                return <Star className="h-4 w-4 text-yellow-600" />;
            default:
                return <Package className="h-4 w-4 text-gray-600" />;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'order':
                return "bg-blue-100";
            case 'booking':
                return "bg-green-100";
            case 'review':
                return "bg-yellow-100";
            default:
                return "bg-gray-100";
        }
    };

    const quickActions = [
        {
            title: "Manage Products",
            description: "Add, edit, or remove merchandise",
            icon: Package,
            action: () => navigate("/bandmanager/manage-products"),
            color: "bg-blue-500"
        },
        {
            title: "Edit Band Info",
            description: "Update band details and members",
            icon: Users,
            action: () => navigate("/bandmanager/edit-band"),
            color: "bg-green-500"
        },
        {
            title: "View Offers",
            description: "Manage booking requests",
            icon: Calendar,
            action: () => navigate("/bandmanager/bookings"),
            color: "bg-purple-500"
        },
        {
            title: "Set Schedule",
            description: "Manage availability",
            icon: Calendar,
            action: () => navigate("/bandmanager/schedule"),
            color: "bg-orange-500"
        }
    ];

    if (loading) {
        return (
            <DefaultLayout>
                <div className="flex justify-center items-center py-16">
                    <div className="text-lg">Loading dashboard...</div>
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout>
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold">Band Manager Dashboard</h1>
                    <p className="text-gray-600">Manage your band's merchandise, bookings, and analytics</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Products Card */}
                    <Card className="border">
                        <CardBody className="flex flex-col items-center justify-center text-center p-6">
                            <div className="p-3 bg-blue-100 rounded-full mb-4">
                                <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Products</p>
                            <p className="text-3xl font-bold">{stats.totalProducts}</p>
                        </CardBody>
                    </Card>

                    {/* Bookings Card */}
                    <Card className="border">
                        <CardBody className="flex flex-col items-center justify-center text-center p-6">
                            <div className="p-3 bg-green-100 rounded-full mb-4">
                                <Calendar className="h-6 w-6 text-green-600" />
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Bookings</p>
                            <p className="text-3xl font-bold">{stats.totalBookings}</p>
                        </CardBody>
                    </Card>

                    {/* Pending Offers Card */}
                    <Card className="border">
                        <CardBody className="flex flex-col items-center justify-center text-center p-6">
                            <div className="p-3 bg-purple-100 rounded-full mb-4">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Pending Offers</p>
                            <p className="text-3xl font-bold">{stats.pendingOffers}</p>
                        </CardBody>
                    </Card>

                    {/* Revenue Card */}
                    <Card className="border">
                        <CardBody className="flex flex-col items-center justify-center text-center p-6 relative">
                            <div className="p-3 bg-orange-100 rounded-full mb-4">
                                <DollarSign className="h-6 w-6 text-orange-600" />
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Revenue</p>
                            <p className="text-3xl font-bold">¥{stats.revenue.toLocaleString()}</p>
                            <Badge
                                color={stats.revenueChange >= 0 ? "success" : "danger"}
                                size="sm"
                                className="absolute top-2 right-2 text-xs scale-90"
                            >
                                {stats.revenueChange >= 0 ? "+" : ""}{stats.revenueChange}%
                            </Badge>
                        </CardBody>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card className="mb-8">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <h2 className="text-xl font-semibold">Quick Actions</h2>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={action.action}
                                    className="flex flex-col items-center p-6 border rounded-lg hover:bg-gray-50 transition-colors text-center"
                                >
                                    <div className={`p-3 rounded-full ${action.color} text-white mb-3`}>
                                        <action.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-semibold mb-1">{action.title}</h3>
                                    <p className="text-sm text-gray-600">{action.description}</p>
                                </button>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                {/* Recent Activity & Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold">Recent Activity</h2>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-4">
                                {recentActivity.length > 0 ? (
                                    recentActivity.slice(0, 5).map((activity, index) => (
                                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                                            <div className={`p-2 ${getActivityColor(activity.type)} rounded`}>
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{activity.title}</p>
                                                <p className="text-sm text-gray-600">{activity.description}</p>
                                                <p className="text-xs text-gray-500">{activity.timestamp}</p>
                                            </div>
                                            {activity.amount && (
                                                <Badge color="success" size="sm">
                                                    +¥{activity.amount.toLocaleString()}
                                                </Badge>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                                )}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Performance Metrics */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <h2 className="text-xl font-semibold">Performance</h2>
                            <Button
                                size="sm"
                                color="primary"
                                onPress={() => navigate("/bandmanager/analytics")}
                                startContent={<BarChart3 className="h-4 w-4" />}
                            >
                                View Analytics
                            </Button>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm">Sales Rate</span>
                                        <span className="text-sm font-medium">{performance.salesRate}%</span>
                                    </div>
                                    <Progress value={performance.salesRate} color="primary" />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {performance.totalUnitsSold} units sold
                                    </p>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm">Booking Conversion</span>
                                        <span className="text-sm font-medium">{performance.bookingConversion}%</span>
                                    </div>
                                    <Progress value={performance.bookingConversion} color="secondary" />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Avg: ¥{performance.avgBookingPrice?.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm">Inventory Health</span>
                                        <span className="text-sm font-medium">{performance.inventoryHealth}%</span>
                                    </div>
                                    <Progress value={performance.inventoryHealth} color="success" />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Stock efficiency
                                    </p>
                                </div>
                                {performance.topSellingProduct && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm font-medium mb-1">Top Selling Product</p>
                                        <p className="text-sm text-gray-600">{performance.topSellingProduct}</p>
                                    </div>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </DefaultLayout>
    );
}