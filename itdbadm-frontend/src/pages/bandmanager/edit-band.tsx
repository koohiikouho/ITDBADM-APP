import DefaultLayout from "@/layouts/default";
import {
    Input,
    Textarea,
    Button,
    Card,
    CardBody,
    CardHeader,
    Select,
    SelectItem
} from "@heroui/react";
import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Users, Music } from "lucide-react";
import { apiClient } from "@/lib/api";

interface BandMember {
    member_name: string;
    band_role: string;
}

interface BandData {
    band_id: number;
    name: string;
    genre: string;
    description: string;
    iframe_string: string;
    pfp_string: string;
    member_list: BandMember[];
}

export default function EditBandPage() {
    const [bandData, setBandData] = useState<BandData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newMember, setNewMember] = useState({ name: "", role: "" });

    useEffect(() => {
        fetchBandData();
    }, []);

    const fetchBandData = async () => {
        try {
            // fetch band
            const response = await fetch(`${apiClient.baseURL}/band-manager/band`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setBandData(data);
            }
        } catch (error) {
            console.error("Error fetching band data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch(`${apiClient.baseURL}/band-manager/band`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify(bandData),
            });

            if (response.ok) {
                alert("Band updated successfully!");
            }
        } catch (error) {
            console.error("Error updating band:", error);
            alert("Error updating band");
        } finally {
            setSaving(false);
        }
    };

    const addMember = () => {
        if (newMember.name && newMember.role && bandData) {
            setBandData({
                ...bandData,
                member_list: [
                    ...bandData.member_list,
                    {
                        member_name: newMember.name,
                        band_role: newMember.role
                    }
                ]
            });
            setNewMember({ name: "", role: "" });
        }
    };

    const removeMember = (index: number) => {
        if (bandData) {
            setBandData({
                ...bandData,
                member_list: bandData.member_list.filter((_, i) => i !== index)
            });
        }
    };

    if (loading) {
        return (
            <DefaultLayout>
                <div className="flex justify-center items-center py-16">
                    <div className="text-lg">Loading band information...</div>
                </div>
            </DefaultLayout>
        );
    }

    if (!bandData) {
        return (
            <DefaultLayout>
                <div className="flex justify-center items-center py-16">
                    <div className="text-lg">Band not found</div>
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout>
            <div className="max-w-4xl mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Edit Band Information</h1>
                    <p className="text-gray-600">Update your band's details and members</p>
                </div>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold">Basic Information</h2>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <Input
                                label="Band Name"
                                value={bandData.name}
                                onChange={(e) => setBandData({ ...bandData, name: e.target.value })}
                                placeholder="Enter band name"
                            />

                            <Input
                                label="Genre"
                                value={bandData.genre}
                                onChange={(e) => setBandData({ ...bandData, genre: e.target.value })}
                                placeholder="Enter music genre"
                            />

                            <Textarea
                                label="Description"
                                value={bandData.description}
                                onChange={(e) => setBandData({ ...bandData, description: e.target.value })}
                                placeholder="Describe your band"
                                minRows={4}
                            />

                            <Input
                                label="Profile Image URL"
                                value={bandData.pfp_string}
                                onChange={(e) => setBandData({ ...bandData, pfp_string: e.target.value })}
                                placeholder="Enter image URL"
                            />

                            <Textarea
                                label="Spotify Embed Code"
                                value={bandData.iframe_string}
                                onChange={(e) => setBandData({ ...bandData, iframe_string: e.target.value })}
                                placeholder="Paste Spotify embed code"
                                minRows={3}
                            />
                        </CardBody>
                    </Card>

                    {/* Band Members */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold">Band Members</h2>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            {/* Add New Member */}
                            <div className="flex gap-4">
                                <Input
                                    placeholder="Member name"
                                    value={newMember.name}
                                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                />
                                <Input
                                    placeholder="Role (e.g., Vocalist, Guitarist)"
                                    value={newMember.role}
                                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                                />
                                <Button onPress={addMember} color="primary">
                                    <Plus className="h-4 w-4" />
                                    Add
                                </Button>
                            </div>

                            {/* Members List */}
                            <div className="space-y-2">
                                {bandData.member_list.map((member, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <Users className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="font-medium">{member.member_name}</p>
                                                <p className="text-sm text-gray-600">{member.band_role}</p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            color="danger"
                                            variant="light"
                                            onPress={() => removeMember(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button
                            color="primary"
                            size="lg"
                            onPress={handleSave}
                            isLoading={saving}
                            startContent={!saving && <Save className="h-4 w-4" />}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
}