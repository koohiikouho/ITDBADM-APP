import DefaultLayout from "@/layouts/default";
import { Card, CardBody, CardHeader, Button, Progress, Badge } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import {
    Users,
    Package,
    Calendar,
    TrendingUp,
    DollarSign,
    Music,
    Edit,
    Plus,
    BarChart3
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

export default function BandManagerDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<BandStats>({
        totalProducts: 0,
        totalBookings: 0,
        pendingOffers: 0,
        revenue: 0,
        revenueChange: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBandStats();
    }, []);

    const fetchBandStats = async () => {
        try {
            // fetch band
            const response = await fetch(`${apiClient.baseURL}/band-manager/stats`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Error fetching band stats:", error);
        } finally {
            setLoading(false);
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
                                {[1, 2, 3].map((item) => (
                                    <div key={item} className="flex items-center space-x-3 p-3 border rounded-lg">
                                        <div className="p-2 bg-blue-100 rounded">
                                            <Package className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">New order received</p>
                                            <p className="text-sm text-gray-600">2 hours ago</p>
                                        </div>
                                        <Badge color="success" size="sm">+¥2,500</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Performance Metrics */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold">Performance</h2>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm">Product Sales</span>
                                        <span className="text-sm font-medium">75%</span>
                                    </div>
                                    <Progress value={75} color="primary" />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm">Booking Conversion</span>
                                        <span className="text-sm font-medium">60%</span>
                                    </div>
                                    <Progress value={60} color="secondary" />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm">Customer Satisfaction</span>
                                        <span className="text-sm font-medium">90%</span>
                                    </div>
                                    <Progress value={90} color="success" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </DefaultLayout>
    );
}