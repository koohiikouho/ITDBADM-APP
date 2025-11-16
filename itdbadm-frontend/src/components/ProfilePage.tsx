// src/components/ProfilePage.tsx
import { useState } from "react";
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
import type {
  UserData,
  EditingState,
  EditValues,
  ProfileField,
  ProfileFieldProps,
} from "../types/profile";

const ProfilePage = () => {
  // User data state
  const [userData, setUserData] = useState<UserData>({
    username: "john_doe",
    email: "john.doe@example.com",
    password: "********",
    currency: "USD",
    branch: "New York",
  });

  // Edit state
  const [isEditing, setIsEditing] = useState<EditingState>({
    username: false,
    email: false,
    password: false,
    currency: false,
    branch: false,
  });

  // Temporary edit values
  const [editValues, setEditValues] = useState<EditValues>({
    username: "",
    email: "",
    password: "",
    currency: "",
    branch: "",
  });

  // Available options - Updated currencies
  const currencyOptions: string[] = ["USD", "PHP", "YEN", "VND"];
  const branchOptions: string[] = [
    "New York",
    "London",
    "Tokyo",
    "Singapore",
    "Sydney",
    "Berlin",
  ];

  // Handle edit start
  const handleEditStart = (field: ProfileField): void => {
    setIsEditing((prev) => ({ ...prev, [field]: true }));
    setEditValues((prev) => ({ ...prev, [field]: userData[field] }));
  };

  // Handle edit cancel
  const handleEditCancel = (field: ProfileField): void => {
    setIsEditing((prev) => ({ ...prev, [field]: false }));
    setEditValues((prev) => ({ ...prev, [field]: "" }));
  };

  // Handle edit save
  const handleEditSave = (field: ProfileField): void => {
    if (editValues[field].trim()) {
      setUserData((prev) => ({ ...prev, [field]: editValues[field] }));
    }
    setIsEditing((prev) => ({ ...prev, [field]: false }));
    setEditValues((prev) => ({ ...prev, [field]: "" }));
  };

  // Handle input change
  const handleInputChange = (field: ProfileField, value: string): void => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  // Handle save all changes
  const handleSaveAllChanges = (): void => {
    console.log("Saving all changes:", userData);
    // API call would go here
  };

  // Profile field component
  const ProfileField: React.FC<ProfileFieldProps> = ({
    icon: Icon,
    label,
    field,
    value,
    isEditing,
    editValue,
    type = "text",
    options = null,
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Icon className="h-5 w-5 text-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              {label}
            </label>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                {options ? (
                  <select
                    value={editValue}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      handleInputChange(field, e.target.value)
                    }
                    className="border border-gray-400 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 bg-white"
                  >
                    {options.map((option: string) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={type}
                    value={editValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange(field, e.target.value)
                    }
                    className="border border-gray-400 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 bg-white"
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                )}
                <button
                  onClick={() => handleEditSave(field)}
                  className="p-1 text-gray-700 hover:bg-gray-100 rounded-full transition-colors border border-gray-300"
                  aria-label={`Save ${label}`}
                >
                  <CheckIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleEditCancel(field)}
                  className="p-1 text-gray-700 hover:bg-gray-100 rounded-full transition-colors border border-gray-300"
                  aria-label={`Cancel editing ${label}`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <p className="text-gray-900">
                {field === "password" ? "••••••••" : value}
              </p>
            )}
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={() => handleEditStart(field)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
            aria-label={`Edit ${label}`}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl shadow-sm border  overflow-hidden">
        {/* Profile Header - Updated to black and white */}
        <div className="bg-gray-700 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16  rounded-full flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-white " />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {userData.username}
              </h2>
              <p className="text-gray-300">{userData.email}</p>
            </div>
          </div>
        </div>

        {/* Profile Fields */}
        <div className="p-6">
          <ProfileField
            icon={UserIcon}
            label="Username"
            field="username"
            value={userData.username}
            isEditing={isEditing.username}
            editValue={editValues.username}
          />

          <ProfileField
            icon={EnvelopeIcon}
            label="Email"
            field="email"
            value={userData.email}
            isEditing={isEditing.email}
            editValue={editValues.email}
            type="email"
          />

          <ProfileField
            icon={LockClosedIcon}
            label="Password"
            field="password"
            value={userData.password}
            isEditing={isEditing.password}
            editValue={editValues.password}
            type="password"
          />

          <ProfileField
            icon={CurrencyDollarIcon}
            label="Currency"
            field="currency"
            value={userData.currency}
            isEditing={isEditing.currency}
            editValue={editValues.currency}
            options={currencyOptions}
          />

          <ProfileField
            icon={BuildingOfficeIcon}
            label="Branch"
            field="branch"
            value={userData.branch}
            isEditing={isEditing.branch}
            editValue={editValues.branch}
            options={branchOptions}
          />
        </div>

        {/* Additional Actions */}
        <div className="border-t border-gray-300 px-6 py-4 ">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </span>
            <button
              onClick={handleSaveAllChanges}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium border border-gray-700"
            >
              Save All Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
