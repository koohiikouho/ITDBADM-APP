import DefaultLayout from "@/layouts/default";
import {
    Input,
    Textarea,
    Button,
    Card,
    CardBody,
    CardHeader
} from "@heroui/react";
import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Users, Upload, X } from "lucide-react";
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
    const [uploadingPfp, setUploadingPfp] = useState(false);
    const [newMember, setNewMember] = useState({ name: "", role: "" });
    const [pfpPreview, setPfpPreview] = useState<string>("");

    useEffect(() => {
        fetchBandData();
    }, []);

    const fetchBandData = async () => {
        try {
            const response = await fetch(`${apiClient.baseURL}/band-manager/band`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                
                // Sanitize data: Convert nulls to empty strings
                // Handle member_list parsing if it comes as a string
                let members = [];
                if (Array.isArray(data.member_list)) {
                    members = data.member_list;
                } else if (typeof data.member_list === 'string') {
                    try { members = JSON.parse(data.member_list); } catch (e) {}
                }

                setBandData({
                    ...data,
                    genre: data.genre || "",
                    description: data.description || "",
                    iframe_string: data.iframe_string || "",
                    pfp_string: data.pfp_string || "",
                    member_list: members
                });
                
                setPfpPreview(data.pfp_string || "");
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
            // Create a clean payload strictly matching the backend schema
            const payload = {
                band_id: bandData?.band_id,
                name: bandData?.name,
                genre: bandData?.genre,
                description: bandData?.description,
                iframe_string: bandData?.iframe_string,
                pfp_string: bandData?.pfp_string,
                member_list: bandData?.member_list
            };

            const response = await fetch(`${apiClient.baseURL}/band-manager/band`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify(payload), // Send cleaned payload
            });

            if (response.ok) {
                alert("Band updated successfully!");
            } else {
                // Add error handling to see why it fails
                const errorData = await response.json();
                console.error("Update failed:", errorData);
                alert("Failed to update band. Please check your input.");
            }
        } catch (error) {
            console.error("Error updating band:", error);
            alert("Error updating band");
        } finally {
            setSaving(false);
        }
    };

    const handlePfpUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        setUploadingPfp(true);

        try {
            const formData = new FormData();
            formData.append('pfp', file);

            const token = localStorage.getItem("accessToken");
            const response = await fetch(`${apiClient.baseURL}/band-manager/band/pfp`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();

                // Update both the band data and preview
                if (bandData) {
                    setBandData({
                        ...bandData,
                        pfp_string: result.pfp_url
                    });
                }
                setPfpPreview(result.pfp_url);

                alert("Profile picture updated successfully!");
            } else {
                const errorData = await response.json();
                alert(`Error uploading profile picture: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error uploading profile picture:", error);
            alert("Error uploading profile picture");
        } finally {
            setUploadingPfp(false);
            // Clear the file input
            event.target.value = '';
        }
    };

    const removePfp = async () => {
        if (!bandData) return;

        if (!confirm("Are you sure you want to remove the profile picture?")) return;

        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`${apiClient.baseURL}/band-manager/band/pfp`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: new FormData(), // Empty form data to trigger removal
            });

            if (response.ok) {
                const defaultPfp = ""; // Or set to a default image URL

                if (bandData) {
                    setBandData({
                        ...bandData,
                        pfp_string: defaultPfp
                    });
                }
                setPfpPreview(defaultPfp);

                alert("Profile picture removed successfully!");
            } else {
                const errorData = await response.json();
                alert(`Error removing profile picture: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error removing profile picture:", error);
            alert("Error removing profile picture");
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
                            {/* Profile Picture Upload */}
                            <div className="space-y-4">
                                <label className="block text-sm font-medium">Profile Picture</label>
                                <div className="flex items-start gap-6">
                                    {/* Profile Picture Preview */}
                                    <div className="relative">
                                        {pfpPreview ? (
                                            <div className="relative group">
                                                <img
                                                    src={pfpPreview}
                                                    alt="Band profile"
                                                    className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={removePfp}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                                                <Upload className="h-8 w-8 text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Upload Controls */}
                                    <div className="flex-1 space-y-3">
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600 mb-2">
                                                Upload a new profile picture
                                            </p>
                                            <p className="text-xs text-gray-500 mb-3">
                                                JPG, PNG, WEBP • Max 5MB
                                            </p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePfpUpload}
                                                className="hidden"
                                                id="pfp-upload"
                                                disabled={uploadingPfp}
                                            />
                                            <Button
                                                as="label"
                                                htmlFor="pfp-upload"
                                                variant="flat"
                                                size="sm"
                                                isLoading={uploadingPfp}
                                                isDisabled={uploadingPfp}
                                            >
                                                {uploadingPfp ? "Uploading..." : "Choose Image"}
                                            </Button>
                                        </div>
                                        {uploadingPfp && (
                                            <p className="text-sm text-blue-600">Uploading profile picture...</p>
                                        )}
                                    </div>
                                </div>
                            </div>

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