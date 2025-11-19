import { useState, useEffect } from "react";
import {
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { apiClient } from "@/lib/api";

// Types locally defined since we are modifying the component behavior
type ProfileField =
  | "username"
  | "email"
  | "password"
  | "currency_id"
  | "branch";

interface UserData {
  username: string;
  email: string;
  password: string;
  currency_id: string;
  branch: string;
}

interface EditingState {
  [key: string]: boolean;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData>({
    username: "",
    email: "",
    password: "",
    currency_id: "2", // Default to USD (2)
    branch: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState<EditingState>({
    username: false,
    email: false,
    password: false,
    currency_id: false,
    branch: false,
  });

  const [editValues, setEditValues] = useState<UserData>({ ...userData });

  // Mapping for UI display
  const currencyMap: Record<string, string> = {
    "1": "JPY (¥)",
    "2": "USD ($)",
    "3": "PHP (₱)",
    "4": "TRY (₺)",
  };

  // Helper to get ID from Currency Code (if needed for reverse lookup logic) or vice versa
  const currencyOptions = Object.entries(currencyMap).map(([id, label]) => ({
    id,
    label,
  }));

  // Branch options (Client-side only for now)
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchProfile();
    fetchBranches();

    // Load preferred branch from local storage
    const savedBranch = localStorage.getItem("selectedBranch");
    if (savedBranch) {
      setUserData((prev) => ({ ...prev, branch: savedBranch }));
    }
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get("/users/profile");

      setUserData((prev) => ({
        ...prev,
        username: data.username || "",
        email: data.email || "",
        currency_id: data.currency_id?.toString() || "2",
      }));

      // Reset edit values to match fetched data
      setEditValues((prev) => ({
        ...prev,
        username: data.username || "",
        email: data.email || "",
        currency_id: data.currency_id?.toString() || "2",
      }));
    } catch (err) {
      console.error("Failed to fetch profile", err);      
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await fetch("http://localhost:3000/branch/");
      if (res.ok) {
        const data = await res.json();
        setBranches(
          data.map((b: any) => ({
            id: b.branch_id.toString(),
            name: b.branch_name,
          }))
        );
      }
    } catch (e) {
      console.error("Failed to fetch branches", e);
    }
  };

  const handleEditStart = (field: ProfileField) => {
    setIsEditing((prev) => ({ ...prev, [field]: true }));
    setEditValues((prev) => ({
      ...prev,
      [field]: field === "password" ? "" : userData[field],
    }));
  };

  const handleEditCancel = (field: ProfileField) => {
    setIsEditing((prev) => ({ ...prev, [field]: false }));
    setEditValues((prev) => ({
      ...prev,
      [field]: field === "password" ? "" : userData[field],
    }));
    setError(null);
  };

  const handleEditSave = (field: ProfileField) => {
    // We update local state, but actual save happens on "Save All Changes" or we can auto-save here.
    // Let's update local state so the UI reflects the "pending" change before committing.
    setUserData((prev) => ({ ...prev, [field]: editValues[field] }));
    setIsEditing((prev) => ({ ...prev, [field]: false }));
  };

  const handleInputChange = (field: ProfileField, value: string) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAllChanges = async () => {
    setError(null);
    setSuccessMessage(null);

    // Prepare payload
    const payload: any = {};

    if (userData.username) payload.username = userData.username;
    if (userData.email) payload.email = userData.email;
    if (userData.currency_id)
      payload.currency_id = parseInt(userData.currency_id);

    // Only send password if it was edited and is not empty
    // Note: For this flow, we check if password field in editValues differs or if we want to enforce a separate "Change Password" flow.
    // Here we assume if userData.password has a value (set by handleEditSave), we send it.
    // However, userData.password starts as empty string in state (we don't store the hash).
    if (userData.password) {
      if (userData.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      payload.password = userData.password;
    }

    try {
      // Save Branch to LocalStorage (Client-side preference)
      if (userData.branch) {
        localStorage.setItem("selectedBranch", userData.branch);
        // Trigger storage event for navbar
        window.dispatchEvent(new Event("storage"));
      }

      // Save other details to Backend
      const res = await apiClient.put("/users/profile", payload);

      if (res.error) {
        throw new Error(res.error);
      }

      setSuccessMessage("Profile updated successfully!");

      // Clear password from state after save for security
      setUserData((prev) => ({ ...prev, password: "" }));

      // Refresh data
      fetchProfile();

      location.reload();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update profile."
      );
    }
  };

  if (isLoading)
    return <div className="text-center p-10">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        {error && (
          <div className="text-red-500 bg-red-50 p-2 rounded mt-2">{error}</div>
        )}
        {successMessage && (
          <div className="text-green-600 bg-green-50 p-2 rounded mt-2">
            {successMessage}
          </div>
        )}
      </div>

      <div className="rounded-xl shadow-sm border overflow-hidden bg-white dark:bg-gray-900 dark:border-gray-700">
        <div className="bg-gray-800 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-gray-700 rounded-full flex items-center justify-center text-white">
              <UserIcon className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {userData.username || "User"}
              </h2>
              <p className="text-gray-400">{userData.email || "No email"}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Username */}
          <FieldRow
            icon={UserIcon}
            label="Username"
            value={userData.username}
            isEditing={isEditing.username}
            editValue={editValues.username}
            onChange={(v) => handleInputChange("username", v)}
            onSave={() => handleEditSave("username")}
            onCancel={() => handleEditCancel("username")}
            onEdit={() => handleEditStart("username")}
          />

          {/* Email */}
          <FieldRow
            icon={EnvelopeIcon}
            label="Email"
            value={userData.email}
            isEditing={isEditing.email}
            editValue={editValues.email}
            type="email"
            onChange={(v) => handleInputChange("email", v)}
            onSave={() => handleEditSave("email")}
            onCancel={() => handleEditCancel("email")}
            onEdit={() => handleEditStart("email")}
          />

          {/* Password */}
          <FieldRow
            icon={LockClosedIcon}
            label="Password"
            value="••••••••"
            isEditing={isEditing.password}
            editValue={editValues.password}
            type="password"
            onChange={(v) => handleInputChange("password", v)}
            onSave={() => handleEditSave("password")}
            onCancel={() => handleEditCancel("password")}
            onEdit={() => handleEditStart("password")}
            placeholder="New password (min 6 chars)"
          />

          {/* Currency */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Currency
                  </label>
                  {isEditing.currency_id ? (
                    <div className="flex items-center space-x-2">
                      <select
                        value={editValues.currency_id}
                        onChange={(e) =>
                          handleInputChange("currency_id", e.target.value)
                        }
                        className="border rounded p-1 text-sm dark:bg-gray-700 dark:text-white"
                      >
                        {currencyOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ActionButtons
                        onSave={() => handleEditSave("currency_id")}
                        onCancel={() => handleEditCancel("currency_id")}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-900 dark:text-white">
                      {currencyMap[userData.currency_id] || "Unknown"}
                    </p>
                  )}
                </div>
              </div>
              {!isEditing.currency_id && (
                <EditButton onClick={() => handleEditStart("currency_id")} />
              )}
            </div>
          </div>

          {/* Branch (Local Storage Only) */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Preferred Branch
                  </label>
                  {isEditing.branch ? (
                    <div className="flex items-center space-x-2">
                      <select
                        value={editValues.branch}
                        onChange={(e) =>
                          handleInputChange("branch", e.target.value)
                        }
                        className="border rounded p-1 text-sm dark:bg-gray-700 dark:text-white w-40"
                      >
                        <option value="">Select Branch</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                      <ActionButtons
                        onSave={() => handleEditSave("branch")}
                        onCancel={() => handleEditCancel("branch")}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-900 dark:text-white">
                      {branches.find((b) => b.id === userData.branch)?.name ||
                        "Select a branch"}
                    </p>
                  )}
                </div>
              </div>
              {!isEditing.branch && (
                <EditButton onClick={() => handleEditStart("branch")} />
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
          <button
            onClick={handleSaveAllChanges}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            Save All Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper Components for cleaner render
const FieldRow = ({
  icon: Icon,
  label,
  value,
  isEditing,
  editValue,
  type = "text",
  onChange,
  onSave,
  onCancel,
  onEdit,
  placeholder,
}: any) => (
  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3 w-full">
        <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm shrink-0">
          <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </div>
        <div className="grow">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type={type}
                value={editValue}
                onChange={(e) => onChange(e.target.value)}
                className="border rounded p-1 text-sm w-full dark:bg-gray-700 dark:text-white"
                placeholder={placeholder}
              />
              <ActionButtons onSave={onSave} onCancel={onCancel} />
            </div>
          ) : (
            <p className="text-gray-900 dark:text-white break-all">{value}</p>
          )}
        </div>
      </div>
      {!isEditing && <EditButton onClick={onEdit} />}
    </div>
  </div>
);

const EditButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors ml-2"
  >
    <PencilIcon className="h-4 w-4" />
  </button>
);

const ActionButtons = ({
  onSave,
  onCancel,
}: {
  onSave: () => void;
  onCancel: () => void;
}) => (
  <div className="flex space-x-1 shrink-0">
    <button
      onClick={onSave}
      className="p-1 text-green-600 hover:bg-green-50 rounded-full"
    >
      <CheckIcon className="h-5 w-5" />
    </button>
    <button
      onClick={onCancel}
      className="p-1 text-red-600 hover:bg-red-50 rounded-full"
    >
      <XMarkIcon className="h-5 w-5" />
    </button>
  </div>
);
