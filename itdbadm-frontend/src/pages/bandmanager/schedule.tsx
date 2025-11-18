import DefaultLayout from "@/layouts/default";
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Switch,
    Badge
} from "@heroui/react";
import { useState, useEffect } from "react";
import { Save, Calendar } from "lucide-react";
import { apiClient } from "@/lib/api";

interface Schedule {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
    vacation: boolean;
}

export default function SchedulePage() {
    const [schedule, setSchedule] = useState<Schedule>({
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
        vacation: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const response = await fetch(`${apiClient.baseURL}/band-manager/schedule`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setSchedule(data);
            }
        } catch (error) {
            console.error("Error fetching schedule:", error);
        } finally {
            setLoading(false);
        }
    };

    const saveSchedule = async () => {
        setSaving(true);
        try {
            const response = await fetch(`${apiClient.baseURL}/band-manager/schedule`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify(schedule),
            });

            if (response.ok) {
                alert("Schedule updated successfully!");
            }
        } catch (error) {
            console.error("Error updating schedule:", error);
            alert("Error updating schedule");
        } finally {
            setSaving(false);
        }
    };

    const toggleDay = (day: keyof Schedule) => {
        setSchedule(prev => ({
            ...prev,
            [day]: !prev[day]
        }));
    };

    const days = [
        { key: 'monday', label: 'Monday' },
        { key: 'tuesday', label: 'Tuesday' },
        { key: 'wednesday', label: 'Wednesday' },
        { key: 'thursday', label: 'Thursday' },
        { key: 'friday', label: 'Friday' },
        { key: 'saturday', label: 'Saturday' },
        { key: 'sunday', label: 'Sunday' }
    ] as const;

    if (loading) {
        return (
            <DefaultLayout>
                <div className="flex justify-center items-center py-16">
                    <div className="text-lg">Loading schedule...</div>
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout>
            <div className="max-w-4xl mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Band Schedule</h1>
                    <p className="text-gray-600">Set your band's availability for bookings</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Availability Settings */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <h2 className="text-xl font-semibold">Weekly Availability</h2>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            {days.map((day) => (
                                <div key={day.key} className="flex items-center justify-between p-4 border rounded-lg">
                                    <span className="font-medium">{day.label}</span>
                                    <Switch
                                        isSelected={schedule[day.key]}
                                        onValueChange={() => toggleDay(day.key)}
                                    />
                                </div>
                            ))}
                        </CardBody>
                    </Card>

                    {/* Vacation Mode & Summary */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-semibold">Vacation Mode</h2>
                            </CardHeader>
                            <CardBody className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span>Enable Vacation Mode</span>
                                    <Switch
                                        isSelected={schedule.vacation}
                                        onValueChange={() => toggleDay('vacation')}
                                    />
                                </div>
                                {schedule.vacation && (
                                    <Badge color="warning" variant="flat">
                                        All bookings will be paused while vacation mode is active
                                    </Badge>
                                )}
                            </CardBody>
                        </Card>

                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-semibold">Availability Summary</h2>
                            </CardHeader>
                            <CardBody>
                                <div className="space-y-2">
                                    <p className="text-sm">
                                        Available Days: {Object.values(schedule).slice(0, 7).filter(Boolean).length}
                                    </p>
                                    <p className="text-sm">
                                        Status: {schedule.vacation ? "On Vacation" : "Active"}
                                    </p>
                                </div>
                            </CardBody>
                        </Card>

                        <Button
                            color="primary"
                            size="lg"
                            onPress={saveSchedule}
                            isLoading={saving}
                            startContent={!saving && <Save className="h-4 w-4" />}
                            className="w-full"
                        >
                            {saving ? "Saving..." : "Save Schedule"}
                        </Button>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
}