export interface UserData {
  username: string;
  email: string;
  password: string;
  currency: string;
  branch: string;
}

export interface EditingState {
  username: boolean;
  email: boolean;
  password: boolean;
  currency: boolean;
  branch: boolean;
}

export interface EditValues {
  username: string;
  email: string;
  password: string;
  currency: string;
  branch: string;
}

export type ProfileField = keyof UserData;

export interface ProfileFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  field: ProfileField;
  value: string;
  isEditing: boolean;
  editValue: string;
  type?: "text" | "email" | "password";
  options?: string[];
}
