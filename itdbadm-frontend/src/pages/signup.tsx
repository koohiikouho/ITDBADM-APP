import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@heroui/use-theme";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    if (!formData.agreeToTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }

    console.log("Sign up attempt:", formData);
    // Handle sign up logic here
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Theme-based styles
  const themeClasses = {
    background: theme === "dark" ? "bg-gray-900" : "bg-gray-50",
    card:
      theme === "dark"
        ? "bg-gray-800 border-gray-700"
        : "bg-white border-gray-200",
    text: {
      primary: theme === "dark" ? "text-white" : "text-gray-900",
      secondary: theme === "dark" ? "text-gray-300" : "text-gray-600",
      muted: theme === "dark" ? "text-gray-400" : "text-gray-500",
    },
    border: theme === "dark" ? "border-gray-600" : "border-gray-300",
    input: {
      background: theme === "dark" ? "bg-gray-700" : "bg-white",
      border: theme === "dark" ? "border-gray-600" : "border-gray-300",
      focus:
        theme === "dark"
          ? "focus:ring-blue-500 focus:border-blue-500"
          : "focus:ring-blue-500 focus:border-blue-500",
      placeholder:
        theme === "dark" ? "placeholder-gray-400" : "placeholder-gray-500",
    },
    button: {
      primary:
        theme === "dark"
          ? "bg-blue-600 hover:bg-blue-700"
          : "bg-blue-600 hover:bg-blue-700",
      secondary:
        theme === "dark"
          ? "text-gray-300 hover:text-white"
          : "text-gray-500 hover:text-gray-700",
    },
    link:
      theme === "dark"
        ? "text-blue-400 hover:text-blue-300"
        : "text-blue-600 hover:text-blue-500",
  };

  return (
    <div
      className={`min-h-screen ${themeClasses.background} flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200`}
    >
      {/* Back Button */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          onClick={handleBack}
          className={`flex items-center text-sm ${themeClasses.button.secondary} mb-6 transition-colors cursor-pointer`}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to previous page
        </button>
      </div>

      {/* Sign Up Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div
          className={`${themeClasses.card} py-8 px-6 shadow-sm rounded-lg border ${themeClasses.border} transition-colors duration-200`}
        >
          {/* Header */}
          <div className="text-center">
            <h2
              className={`text-2xl font-bold ${themeClasses.text.primary} mb-2`}
            >
              Create your account
            </h2>
            <p className={`${themeClasses.text.secondary} text-sm`}>
              Join us today! Fill in your details to get started.
            </p>
          </div>

          {/* Sign Up Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className={`block text-sm font-medium ${themeClasses.text.primary} mb-1`}
                  >
                    First name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className={`h-5 w-5 ${themeClasses.text.muted}`} />
                    </div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 ${themeClasses.input.background} border ${themeClasses.input.border} rounded-md ${themeClasses.input.placeholder} focus:outline-none focus:ring-2 ${themeClasses.input.focus} transition-colors`}
                      placeholder="John"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className={`block text-sm font-medium ${themeClasses.text.primary} mb-1`}
                  >
                    Last name
                  </label>
                  <div className="relative">
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 ${themeClasses.input.background} border ${themeClasses.input.border} rounded-md ${themeClasses.input.placeholder} focus:outline-none focus:ring-2 ${themeClasses.input.focus} transition-colors`}
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium ${themeClasses.text.primary} mb-1`}
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 ${themeClasses.text.muted}`} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 ${themeClasses.input.background} border ${themeClasses.input.border} rounded-md ${themeClasses.input.placeholder} focus:outline-none focus:ring-2 ${themeClasses.input.focus} transition-colors`}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className={`block text-sm font-medium ${themeClasses.text.primary} mb-1`}
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${themeClasses.text.muted}`} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-2 ${themeClasses.input.background} border ${themeClasses.input.border} rounded-md ${themeClasses.input.placeholder} focus:outline-none focus:ring-2 ${themeClasses.input.focus} transition-colors`}
                    placeholder="Enter your password"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${themeClasses.text.muted} hover:${theme === "dark" ? "text-gray-200" : "text-gray-600"} transition-colors`}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className={`text-xs ${themeClasses.text.muted} mt-1`}>
                  Password must be at least 6 characters long
                </p>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className={`block text-sm font-medium ${themeClasses.text.primary} mb-1`}
                >
                  Confirm password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${themeClasses.text.muted}`} />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-2 ${themeClasses.input.background} border ${themeClasses.input.border} rounded-md ${themeClasses.input.placeholder} focus:outline-none focus:ring-2 ${themeClasses.input.focus} transition-colors`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${themeClasses.text.muted} hover:${theme === "dark" ? "text-gray-200" : "text-gray-600"} transition-colors`}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className={`w-4 h-4 text-blue-600 ${theme === "dark" ? "border-gray-500" : "border-gray-300"} rounded focus:ring-blue-500 mt-0.5`}
                />
              </div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor="agreeToTerms"
                  className={themeClasses.text.secondary}
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className={`${themeClasses.link} transition-colors font-medium`}
                  >
                    Terms and Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className={`${themeClasses.link} transition-colors font-medium`}
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              className={`cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${themeClasses.button.primary} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
            >
              Create account
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className={`${themeClasses.text.secondary} text-sm`}>
                Already have an account?{" "}
                <a
                  href="/login"
                  className={`${themeClasses.link} transition-colors font-medium`}
                >
                  Sign in
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
