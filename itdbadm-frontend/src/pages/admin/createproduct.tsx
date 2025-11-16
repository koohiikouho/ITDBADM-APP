import { useState } from "react";
import { Input, Textarea, Select, SelectItem, Button } from "@heroui/react";

export default function CreateProduct() {
  const [form, setForm] = useState({
    name: "",
    band: "",
    category: "",
    price: "",
    stock: "",
    description: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = ["Figure", "CD", "Shirt", "Poster", "Accessory"];

  const bands = [
    { id: "kessoku", label: "Kessoku Band", color: "from-purple-500 to-pink-500" },
    { id: "anotherband", label: "Another Band", color: "from-blue-500 to-cyan-500" },
  ];

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    const formData = new FormData();
    for (const key in form) formData.append(key, (form as any)[key]);
    images.forEach(img => formData.append("images", img));

    const res = await fetch("http://localhost:8000/api/products/create", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      alert("Product created successfully!");
    } else {
      alert("Error creating product.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with gradient */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-2">
            Create New Product
          </h1>
          <p className="text-gray-300">Add a new item to your merchandise collection</p>
        </div>

        {/* Form Container */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 shadow-2xl">
          <div className="space-y-6">
            {/* Product Name */}
            <div className="group">
              <Input
                label="Product Name"
                placeholder="Enter product name"
                onChange={e => handleChange("name", e.target.value)}
                classNames={{
                  input: "bg-gray-700/50 border-gray-600 text-white group-hover:border-purple-400 transition-colors",
                  label: "text-gray-300 group-hover:text-purple-300 transition-colors"
                }}
              />
            </div>

            {/* Band Selection */}
            <div className="group">
              <Select
                label="Band"
                selectedKeys={[form.band]}
                onSelectionChange={(keys) =>
                  handleChange("band", String(Array.from(keys)[0]))
                }
                classNames={{
                  trigger: "bg-gray-700/50 border-gray-600 group-hover:border-blue-400 transition-colors",
                  label: "text-gray-300 group-hover:text-blue-300 transition-colors",
                  value: "text-white"
                }}
              >
                {bands.map((b) => (
                  <SelectItem
                    key={b.id}
                    classNames={{
                      base: `bg-gradient-to-r ${b.color} text-white`
                    }}
                  >
                    {b.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Category Selection */}
            <div className="group">
              <Select
                label="Category"
                selectedKeys={[form.category]}
                onSelectionChange={(keys) =>
                  handleChange("category", String(Array.from(keys)[0]))
                }
                classNames={{
                  trigger: "bg-gray-700/50 border-gray-600 group-hover:border-green-400 transition-colors",
                  label: "text-gray-300 group-hover:text-green-300 transition-colors",
                  value: "text-white"
                }}
              >
                {categories.map((c) => (
                  <SelectItem
                    key={c}
                    classNames={{
                      base: "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                    }}
                  >
                    {c}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Price and Stock Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group">
                <Input
                  label="Price (JPY)"
                  type="number"
                  placeholder="4851"
                  onChange={e => handleChange("price", e.target.value)}
                  classNames={{
                    input: "bg-gray-700/50 border-gray-600 text-white group-hover:border-yellow-400 transition-colors",
                    label: "text-gray-300 group-hover:text-yellow-300 transition-colors"
                  }}
                />
              </div>

              <div className="group">
                <Input
                  label="Stock Quantity"
                  type="number"
                  onChange={e => handleChange("stock", e.target.value)}
                  classNames={{
                    input: "bg-gray-700/50 border-gray-600 text-white group-hover:border-orange-400 transition-colors",
                    label: "text-gray-300 group-hover:text-orange-300 transition-colors"
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <div className="group">
              <Textarea
                label="Description"
                placeholder="Enter product description…"
                onChange={e => handleChange("description", e.target.value)}
                classNames={{
                  input: "bg-gray-700/50 border-gray-600 text-white group-hover:border-indigo-400 transition-colors resize-none",
                  label: "text-gray-300 group-hover:text-indigo-300 transition-colors"
                }}
              />
            </div>

            {/* File Upload */}
            <div className="group">
              <Input
                type="file"
                multiple
                label="Upload Images"
                onChange={handleFileChange}
                classNames={{
                  input: "file:bg-gradient-to-r file:from-purple-500 file:to-pink-500 file:border-0 file:text-white file:rounded-lg file:cursor-pointer cursor-pointer",
                  label: "text-gray-300 group-hover:text-pink-300 transition-colors"
                }}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                isLoading={loading}
                onPress={handleSubmit}
              >
                {loading ? "Creating Product..." : "🎸 Create Product 🎸"}
              </Button>
            </div>
          </div>
        </div>

        {/* Form Status */}
        {images.length > 0 && (
          <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-sm">
              📸 {images.length} image(s) selected
            </p>
          </div>
        )}
      </div>
    </div>
  );
}