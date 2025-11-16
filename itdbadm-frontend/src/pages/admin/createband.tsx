import { useState } from "react";
import { Input, Textarea, Select, SelectItem, Button, Chip } from "@heroui/react";
import { Plus, X } from "lucide-react";

interface BandMember {
    id: string;
    name: string;
    role: string;
}

export default function CreateBand() {
    const [form, setForm] = useState({
        name: "",
        genre: "",
        description: "",
    });

    const [bandMembers, setBandMembers] = useState<BandMember[]>([]);
    const [newMember, setNewMember] = useState({ name: "", role: "" });
    const [loading, setLoading] = useState(false);

    const roles = ["Vocalist", "Guitarist", "Bassist", "Drummer", "Keyboardist", "Other"];
    const popularGenres = ["Rock", "Pop", "J-Pop", "J-Rock", "Electronic", "Hip-Hop", "R&B", "Jazz", "Metal", "Punk", "Indie", "Alternative"];

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const addBandMember = () => {
        if (newMember.name.trim() && newMember.role) {
            const member: BandMember = {
                id: Date.now().toString(),
                name: newMember.name.trim(),
                role: newMember.role,
            };
            setBandMembers(prev => [...prev, member]);
            setNewMember({ name: "", role: "" });
        }
    };

    const removeBandMember = (id: string) => {
        setBandMembers(prev => prev.filter(member => member.id !== id));
    };

    const getRoleColor = (role: string) => {
        const colors: { [key: string]: string } = {
            Vocalist: "from-pink-500 to-rose-500",
            Guitarist: "from-orange-500 to-red-500",
            Bassist: "from-blue-500 to-cyan-500",
            Drummer: "from-purple-500 to-indigo-500",
            Keyboardist: "from-green-500 to-emerald-500",
            Other: "from-gray-500 to-slate-500",
        };
        return colors[role] || "from-gray-500 to-slate-500";
    };

    const handleSubmit = async () => {
        if (bandMembers.length === 0) {
            alert("Please add at least one band member!");
            return;
        }

        setLoading(true);

        const bandData = {
            ...form,
            members: bandMembers,
        };

        const res = await fetch("http://localhost:8000/api/bands/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(bandData),
        });

        const data = await res.json();
        setLoading(false);

        if (data.success) {
            alert("Band created successfully!");
            // Reset form
            setForm({ name: "", genre: "", description: "" });
            setBandMembers([]);
        } else {
            alert("Error creating band.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header with gradient */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent mb-2">
                        Create New Band
                    </h1>
                    <p className="text-gray-300">Add a new band to your collection</p>
                </div>

                {/* Form Container */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 shadow-2xl">
                    <div className="space-y-6">
                        {/* Band Name */}
                        <div className="group">
                            <Input
                                label="Band Name"
                                placeholder="Enter band name"
                                value={form.name}
                                onChange={e => handleChange("name", e.target.value)}
                                classNames={{
                                    input: "bg-gray-700/50 border-gray-600 text-white group-hover:border-cyan-400 transition-colors",
                                    label: "text-gray-300 group-hover:text-cyan-300 transition-colors"
                                }}
                            />
                        </div>

                        {/* Genre Selection */}
                        <div className="group">
                            <Select
                                label="Genre"
                                selectedKeys={[form.genre]}
                                onSelectionChange={(keys) =>
                                    handleChange("genre", String(Array.from(keys)[0]))
                                }
                                classNames={{
                                    trigger: "bg-gray-700/50 border-gray-600 group-hover:border-purple-400 transition-colors",
                                    label: "text-gray-300 group-hover:text-purple-300 transition-colors",
                                    value: "text-white"
                                }}
                            >
                                {popularGenres.map((genre) => (
                                    <SelectItem
                                        key={genre}
                                        classNames={{
                                            base: "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                                        }}
                                    >
                                        {genre}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        {/* Band Members Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-white">Band Members</h3>
                                <span className="text-sm text-gray-400">
                                    {bandMembers.length} member(s) added
                                </span>
                            </div>

                            {/* Add Member Form */}
                            <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    <div className="group">
                                        <Input
                                            label="Member Name"
                                            placeholder="Enter member name"
                                            value={newMember.name}
                                            onChange={e => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                                            classNames={{
                                                input: "bg-gray-600/50 border-gray-500 text-white group-hover:border-green-400 transition-colors",
                                                label: "text-gray-300 group-hover:text-green-300 transition-colors"
                                            }}
                                        />
                                    </div>

                                    <div className="group">
                                        <Select
                                            label="Role"
                                            selectedKeys={[newMember.role]}
                                            onSelectionChange={(keys) =>
                                                setNewMember(prev => ({ ...prev, role: String(Array.from(keys)[0]) }))
                                            }
                                            classNames={{
                                                trigger: "bg-gray-600/50 border-gray-500 group-hover:border-yellow-400 transition-colors",
                                                label: "text-gray-300 group-hover:text-yellow-300 transition-colors",
                                                value: "text-white"
                                            }}
                                        >
                                            {roles.map((role) => (
                                                <SelectItem
                                                    key={role}
                                                    classNames={{
                                                        base: `bg-gradient-to-r ${getRoleColor(role)} text-white`
                                                    }}
                                                >
                                                    {role}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>
                                </div>

                                <Button
                                    onPress={addBandMember}
                                    isDisabled={!newMember.name.trim() || !newMember.role}
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:from-green-600 hover:to-emerald-600 transition-all"
                                    startContent={<Plus size={16} />}
                                >
                                    Add Member
                                </Button>
                            </div>

                            {/* Members List */}
                            {bandMembers.length > 0 && (
                                <div className="space-y-3">
                                    {bandMembers.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600 hover:border-cyan-400/50 transition-colors group"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getRoleColor(member.role)}`} />
                                                <span className="text-white font-medium">{member.name}</span>
                                                <Chip
                                                    classNames={{
                                                        base: `bg-gradient-to-r ${getRoleColor(member.role)} text-white border-none`
                                                    }}
                                                    size="sm"
                                                >
                                                    {member.role}
                                                </Chip>
                                            </div>
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                onPress={() => removeBandMember(member.id)}
                                                className="text-gray-400 hover:text-red-400 transition-colors"
                                            >
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="group">
                            <Textarea
                                label="Band Description"
                                placeholder="Tell us about the band's history, style, and achievements..."
                                value={form.description}
                                onChange={e => handleChange("description", e.target.value)}
                                classNames={{
                                    input: "bg-gray-700/50 border-gray-600 text-white group-hover:border-blue-400 transition-colors resize-none min-h-[100px]",
                                    label: "text-gray-300 group-hover:text-blue-300 transition-colors"
                                }}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <Button
                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
                                isLoading={loading}
                                onPress={handleSubmit}
                                isDisabled={bandMembers.length === 0 || !form.name.trim()}
                            >
                                {loading ? "Creating Band..." : "🎵 Create Band"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Status Info */}
                {bandMembers.length === 0 && (
                    <div className="mt-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                        <p className="text-amber-400 text-sm">
                            ⚠️ Please add at least one band member to continue
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}