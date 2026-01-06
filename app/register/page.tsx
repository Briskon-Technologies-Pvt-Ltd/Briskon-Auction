"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { countriesData } from "@/Data/Location";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Building,
  Phone,
  MapPin,
  Briefcase,
  ShoppingBag,
  Shield,
  UserPlus,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
// import LocationDropdownsGeoDB from "@/components/LocationDropdownsGeoDB";
import type { Country } from "@/lib/locationTypes";

export default function RegisterPage() {
  const { register, isLoading: authLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [accountType, setAccountType] = useState("buyer");

  const tabs = [
    {
      value: "buyer",
      label: "Buyer (Bidder)",
      content: "You'll be able to see auctions and participate in bidding.",
    },
    {
      value: "seller",
      label: "Seller (Auctioneer)",
      content: "You can list items for auction and manage your auctions.",
    },
    {
      value: "both",
      label: "Buyer & Seller",
      content: "You have complete platform access with all features.",
    },
  ];

  const [formData, setFormData] = useState({
    accountType: "buyer", // Default to 'buyer'
    sellerType: "individual", // Default to 'individual' for seller/both
    buyerType: "individual", // Default for buyer when accountType is buyer or both
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    addressline1: "",
    addressline2: "",
    city: "",
    state: "",
    country: "",
    confirmPassword: "",
    organizationName: "", // New field for organization
    organizationContact: "", // New field for organization contact
    buyerOrganizationName: "", // new field for buyer organizations
    buyerOrganizationContact: "", // new field for buyer organizations
    location: "",
    agreeToTerms: false,
    subscribeNewsletter: false,
  });

  useEffect(() => {
    setCountries(countriesData); // Only set once on mount
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      switch (user.role) {
        case "buyer":
          router.push("/auctions");
          break;
        case "seller":
          router.push("/dashboard/seller");
          break;
        case "both":
          router.push("/dashboard");
          break;
        default:
          router.push("/");
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isAuthenticated, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
    setSuccessMessage("");
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccessMessage("");
  };

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      accountType: value,
      sellerType: value === "buyer" ? "individual" : "individual",
      buyerType: "individual",
      organizationName: "",
      organizationContact: "",
      buyerOrganizationName: "",
      buyerOrganizationContact: "",
    }));
    setError("");
    setSuccessMessage("");
  };

  const handleSellerTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      sellerType: value,
      organizationName: value === "organization" ? prev.organizationName : "",
      organizationContact:
        value === "organization" ? prev.organizationContact : "",
    }));
    setError("");
    setSuccessMessage("");
  };
  const handleBuyerTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      buyerType: value,
      buyerOrganizationName:
        value === "organization" ? prev.buyerOrganizationName : "",
      buyerOrganizationContact:
        value === "organization" ? prev.buyerOrganizationContact : "",
    }));
    setError("");
    setSuccessMessage("");
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
    setError("");
    setSuccessMessage("");
  };

  const validatePassword = (password: string) => {
    if (password.length < 8)
      return "Password must be at least 8 characters long.";
    if (!/[a-z]/.test(password))
      return "Password must contain a lowercase letter.";
    if (!/[A-Z]/.test(password))
      return "Password must contain an uppercase letter.";
    if (!/\d/.test(password)) return "Password must contain a number.";
    return "";
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (!formData.agreeToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }
    const location = `${formData.city}, ${formData.country}`;
    setIsLoading(true);
    try {
      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fname: formData.firstName,
          lname: formData.lastName,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          location,
          role: formData.accountType,
          type:
            formData.accountType === "seller" || formData.accountType === "both"
              ? formData.sellerType
              : undefined,
          organizationName:
            formData.sellerType === "organization"
              ? formData.organizationName
              : undefined,
          organizationContact:
            formData.sellerType === "organization"
              ? formData.organizationContact
              : undefined,
          addressline1: formData.addressline1,
          addressline2: formData.addressline2,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(
          `Thanks for signing up!  ${formData.firstName}.We've sent a verification link to your email. Please verify your email before logging in.`
        );
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      setError("An error occurred during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const FloatingOrb = ({
    size,
    color,
    position,
    delay,
  }: {
    size: string;
    color: string;
    position: string;
    delay: number;
  }) => (
    <div
      className={`absolute ${position} ${size} ${color} rounded-full blur-xl animate-pulse`}
      style={{ animationDelay: `${delay}ms` }}
    />
  );

  const Floating3DShape = ({
    className,
    shape,
    size,
    color,
  }: {
    className: string;
    shape: string;
    size: number;
    color: string;
  }) => {
    const shapeStyle = {
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color,
    };

    let shapeElement;
    switch (shape) {
      case "cube":
        shapeElement = <div className="cube" style={shapeStyle} />;
        break;
      case "sphere":
        shapeElement = <div className="sphere" style={shapeStyle} />;
        break;
      case "pyramid":
        shapeElement = (
          <div
            className="pyramid"
            style={{
              ...shapeStyle,
              width: 0,
              height: 0,
              borderLeft: `${size / 2}px solid transparent`,
              borderRight: `${size / 2}px solid transparent`,
              borderBottom: `${size}px solid ${color}`,
            }}
          />
        );
        break;
      default:
        shapeElement = <div style={shapeStyle} />;
    }

    return (
      <div
        className={`absolute ${className}`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {shapeElement}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-gray-200 relative overflow-hidden">
      {/* Interactive Background */}
      <div
        className="absolute inset-0 opacity-20 transition-all duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.1), transparent 40%)`,
        }}
      />
      <div className="absolute inset-0 bg-grid-gray-200/[0.04] bg-[size:30px_30px]"></div>

      {/* Floating Elements */}
      <FloatingOrb
        size="w-20 h-20"
        color="bg-blue-200/40"
        position="top-20 left-10"
        delay={0}
      />
      <FloatingOrb
        size="w-32 h-32"
        color="bg-cyan-200/40"
        position="top-40 right-20"
        delay={1000}
      />
      <Floating3DShape
        className="top-32 right-32 animate-rotate-slow"
        shape="cube"
        size={40}
        color="rgba(59, 130, 246, 0.15)"
      />
      <Floating3DShape
        className="bottom-32 left-16 animate-float"
        shape="sphere"
        size={60}
        color="rgba(168, 85, 247, 0.15)"
      />

      <div className="relative container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Header */}
          <div className="mb-6 ml-4">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-200 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-300 to-blue-400 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-700">
                  Join the Premier Auction Platform
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Start your journey in the world of professional auctions
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Elegant Card */}
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-100 shadow-xl rounded-2xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-3 text-center relative">
              <div className="absolute inset-0 bg-grid-gray-200/[0.1] bg-[size:20px_20px]"></div>
              <div className="absolute -top-4 right-6 w-10 h-10 bg-blue-200/30 rounded-full animate-pulse"></div>
              {/* <CardTitle className="text-3xl font-bold text-gray-900 mb-2 z-10 relative">Create Your Account</CardTitle> */}
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="p-10 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-[20px]-">
                  <div className="space-y-4 border-gray-200">
                    <Label className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-2 mb-4">
                      <img
                        src="/images/registration.png"
                        alt="Supplier Icon"
                        className="w-5 h-5" // small size
                      />
                      Choose your registration type:
                    </Label>

                    <div className="flex justify-center gap-4">
                      {[
                        { value: "individual", label: "Individual" },
                        {
                          value: "organization",
                          label: "Company / Organisation",
                        },
                      ].map((item) => {
                        const isSelected =
                          (formData.accountType === "buyer" &&
                            formData.buyerType === item.value) ||
                          (formData.accountType === "seller" &&
                            formData.sellerType === item.value) ||
                          (formData.accountType === "both" &&
                            (formData.buyerType === item.value ||
                              formData.sellerType === item.value));

                        const handleChange = () => {
                          if (formData.accountType === "buyer") {
                            handleBuyerTypeChange(item.value);
                          } else if (formData.accountType === "seller") {
                            handleSellerTypeChange(item.value);
                          } else if (formData.accountType === "both") {
                            handleBuyerTypeChange(item.value);
                            handleSellerTypeChange(item.value);
                          }
                        };
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={handleChange}
                            className={`flex items-center justify-center p-3 rounded-xl cursor-pointer transition-all duration-300 border-2 w-full text-sm font-medium
            ${
              isSelected
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300"
            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-4 border-gray-200">
                    <Label className="text-lg font-semibold text-gray-900 text-center flex items-center justify-center gap-2 mb-6">
                      <img
                        src="/images/trading.png"
                        alt="Supplier Icon"
                        className="w-5 h-5" // small size
                      />
                      Choose your participation type:
                    </Label>

                    <RadioGroup
                      value={formData.accountType}
                      onValueChange={handleRadioChange}
                      className="flex justify-center gap-4"
                    >
                      {[
                        {
                          value: "buyer",
                          label: "Buyer (Bidder)",
                        },
                        {
                          value: "seller",
                          label: "Seller (Auctioneer)",
                        },
                        // {
                        //   value: "both",
                        //   label: "Buyer & Seller",
                        // },
                      ].map((item) => {
                        const isSelected = formData.accountType === item.value;
                        return (
                          <div key={item.value}>
                            <RadioGroupItem
                              value={item.value}
                              id={item.value}
                              className="sr-only"
                            />
                            <Label
                              htmlFor={item.value}
                              className={`p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all duration-300 w-full text-center
      ${
        isSelected
          ? "bg-blue-500 text-white border-blue-500"
          : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300"
      }`}
                            >
                              {item.label}
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>

                    <p className="text-sm text-gray-500 text-center mt-2">
                      You'll be able to see auctions and participate in bidding.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6 pt-8 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-200/50 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-700" />
                      </div>
                      <h3 className="font-semibold text-xl text-gray-900">
                        Login details
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-gray-700 font-medium"
                      >
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white transition-all rounded-lg"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white transition-all rounded-lg"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {/* <p className="text-xs text-gray-500">
                        Min 8 chars, 1 uppercase, 1 lowercase, 1 number.
                      </p> */}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-gray-700"
                      >
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white transition-all rounded-lg"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="mt-1-">
                      <p className="text-xs text-gray-500">
                        1. You will recieve a email verification link on the
                        entered "Email address"
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        2. Password should have : at least 8 characters, with
                        uppercase, lowercase, and a number
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6 pt-8 border-t border-gray-200">
                    {(formData.accountType === "buyer" &&
                      formData.buyerType === "organization") ||
                    (formData.accountType === "seller" &&
                      formData.sellerType === "organization") ||
                    (formData.accountType === "both" &&
                      (formData.buyerType === "organization" ||
                        formData.sellerType === "organization")) ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-200/50 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-700" />
                        </div>
                        <h3 className="font-semibold text-xl text-gray-900">
                          Organization Details
                        </h3>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-200/50 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-700" />
                        </div>
                        <h3 className="font-semibold text-xl text-gray-900">
                          Your Details
                        </h3>
                      </div>
                    )}

                    {formData.buyerType !== "organization" &&
                      formData.sellerType !== "organization" && (
                        <div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="firstName"
                              className="text-gray-700 font-medium"
                            >
                              First Name
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                              <Input
                                id="firstName"
                                name="firstName"
                                placeholder="John"
                                className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white transition-all rounded-lg"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2 mt-6">
                            <Label
                              htmlFor="lastName"
                              className="text-gray-700 font-medium"
                            >
                              Last Name
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                              <Input
                                id="lastName"
                                name="lastName"
                                placeholder="Doe"
                                className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white transition-all rounded-lg"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2 mt-6">
                            <Label
                              htmlFor="phone"
                              className="text-gray-700 font-medium"
                            >
                              Phone Number{" "}
                              <span className="text-gray-500 text-sm">
                                (Optional)
                              </span>
                            </Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                              <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white transition-all rounded-lg"
                                value={formData.phone}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                    {((formData.accountType === "buyer" &&
                      formData.buyerType === "organization") ||
                      (formData.accountType === "seller" &&
                        formData.sellerType === "organization") ||
                      (formData.accountType === "both" &&
                        (formData.buyerType === "organization" ||
                          formData.sellerType === "organization"))) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="buyerOrganizationName"
                            className="text-gray-700 font-medium"
                          >
                            Organization Name
                          </Label>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                            <Input
                              id="buyerOrganizationName"
                              name="buyerOrganizationName"
                              placeholder="e.g., Briskon Ltd"
                              className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white transition-all rounded-lg"
                              value={formData.buyerOrganizationName}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="buyerOrganizationContact"
                            className="text-gray-700 font-medium"
                          >
                            Organization Contact
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                            <Input
                              id="buyerOrganizationContact"
                              name="buyerOrganizationContact"
                              type="tel"
                              placeholder="+1 (555) 987-6543"
                              className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white transition-all rounded-lg"
                              value={formData.buyerOrganizationContact}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="buyerOrganizationContact"
                            className="text-gray-700 font-medium"
                          >
                            Tax ID / GSTIN / EIN
                          </Label>
                          <div className="relative">
                            {/* <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" /> */}
                            <Input
                              id="buyerOrganizationContact"
                              name="buyerOrganizationContact"
                              type="text"
                              placeholder="Tax ID / GSTIN / EIN"
                              className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white transition-all rounded-lg"
                              value={formData.buyerOrganizationContact}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="buyerOrganizationContact"
                            className="text-gray-700 font-medium"
                          >
                            Contact person email
                          </Label>
                          <div className="relative">
                            {/* <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" /> */}
                            <Input
                              id="buyerOrganizationContact"
                              name="buyerOrganizationContact"
                              type="text"
                              placeholder="Contact person's email"
                              className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white transition-all rounded-lg"
                              value={formData.buyerOrganizationContact}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <Label htmlFor="addressline1" className="text-gray-700">
                        Address Line 1
                      </Label>
                      <Input
                        id="addressline1"
                        name="addressline1"
                        placeholder="e.g., 123 Main St"
                        className="bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white transition-all rounded-lg"
                        value={formData.addressline1}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Address Line 2 */}
                    <div className="space-y-1.5">
                      <Label htmlFor="addressline2" className="text-gray-700">
                        Address Line 2 (optional)
                      </Label>
                      <Input
                        id="addressline2"
                        name="addressline2"
                        placeholder="e.g., Apartment, suite, unit, building, etc."
                        className="bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white transition-all rounded-lg"
                        value={formData.addressline2}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* City, State, Country - in one row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="country" className="text-gray-700">
                          Country
                        </Label>
                        <select
                          id="country"
                          name="country"
                          className="w-full bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white transition-all rounded-lg p-2"
                          value={formData.country}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData({
                              ...formData,
                              country: value,
                              state: "",
                              city: "",
                            });
                            setSelectedCountry(value);
                            setSelectedState("");
                            setSelectedCity("");
                          }}
                        >
                          <option value="">Select Country</option>
                          {countries.map((country) => (
                            <option key={country.id} value={country.name}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="state" className="text-gray-700">
                          State
                        </label>
                        <select
                          id="state"
                          className="w-full bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white transition-all rounded-lg p-2"
                          value={selectedState}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData({
                              ...formData,
                              state: value,
                              city: "",
                            });
                            setSelectedState(value);
                            setSelectedCity("");
                          }}
                        >
                          <option value="">Select State</option>
                          {countries
                            .find((country) => country.name === selectedCountry)
                            ?.states?.map((state) => (
                              <option key={state.id} value={state.name}>
                                {state.name}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="city" className="text-gray-700">
                          City
                        </label>
                        <select
                          id="city"
                          className="w-full bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white transition-all rounded-lg p-2"
                          value={selectedCity}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData({ ...formData, city: value });
                            setSelectedCity(value);
                          }}
                        >
                          <option className="text-gray-500" value="">
                            Select City
                          </option>
                          {countries
                            .find((country) => country.name === selectedCountry)
                            ?.states.find(
                              (state) => state.name === selectedState
                            )
                            ?.cities?.map((city) => (
                              <option key={city.id} value={city.name}>
                                {city.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                {(formData.accountType === "buyer" ||
                  formData.accountType === "seller" ||
                  formData.accountType === "both") && (
                  <div className="w-full mx-auto bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3">
                    <div className="flex items-center space-x-2 text-green-700 font-semibold">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.366-.756 1.412-.756 1.778 0l6 12A1 1 0 0115 17H5a1 1 0 01-.894-1.447l6-12zM11 14a1 1 0 11-2 0 1 1 0 012 0zm-1-2a1 1 0 01-1-1V7a1 1 0 112 0v4a1 1 0 01-1 1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        {formData.buyerType === "organization" ||
                        formData.sellerType === "organization"
                          ? "Organisation registration document:"
                          : "Your proof of Identity document:"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 border-b border-gray-300 pb-2">
                      {formData.buyerType === "organization" ||
                      formData.sellerType === "organization"
                        ? "Upload your organization's registration or tax document (Accepted formats: PDF, JPEG, PNG with max 5MB size.)"
                        : "Upload your government-issued ID (Accepted formats: PDF, JPEG, PNG with max 5MB size.)"}
                    </p>
                    <div>
                      <input
                        type="file"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                )}

                {/* Seller Type Section */}
                {/* {formData.buyerType === "organization" && ( */}
                {/* {(formData.accountType === "seller" ||
                  formData.accountType === "both") && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <Label className="text-lg font-semibold text-gray-900 block text-center">
                      Seller Type
                    </Label>
                    <RadioGroup
                      value={formData.sellerType}
                      onValueChange={handleSellerTypeChange}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {[
                        { value: "individual", label: "Individual" },
                        { value: "organization", label: "Organization" },
                      ].map((item) => {
                        const isSelected = formData.sellerType === item.value;
                        const isSeller = formData.accountType === "seller";
                        const isBoth = formData.accountType === "both";

                        // Define gradient classes
                        const selectedGradient = isSeller
                          ? "bg-gradient-to-r from-purple-200 to-violet-300 "
                          : isBoth
                          ? "bg-gradient-to-r from-blue-200 to-indigo-300 "
                          : "";

                        const hoverGradient = isSeller
                          ? "hover:bg-gradient-to-r hover:from-purple-200 hover:to-violet-300 "
                          : isBoth
                          ? "hover:bg-gradient-to-r hover:from-blue-200 hover:to-indigo-300 "
                          : "";

                        return (
                          <div key={item.value} className="relative">
                            <RadioGroupItem
                              value={item.value}
                              id={item.value}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={item.value}
                              className={`flex items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 w-full
          ${
            isSelected
              ? ` ${selectedGradient} `
              : `border-gray-200 bg-white ${hoverGradient}`
          }`}
                            >
                              {item.label}
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>

                    {formData.sellerType === "organization" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="organizationName"
                            className="text-gray-700 font-medium"
                          >
                            Organization Name
                          </Label>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                            <Input
                              id="organizationName"
                              name="organizationName"
                              placeholder="e.g., Acme Auctions"
                              className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white transition-all rounded-lg"
                              value={formData.organizationName}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="organizationContact"
                            className="text-gray-700 font-medium"
                          >
                            Organization Contact
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                            <Input
                              id="organizationContact"
                              name="organizationContact"
                              type="tel"
                              placeholder="+1 (555) 123-4567"
                              className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white transition-all rounded-lg"
                              value={formData.organizationContact}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-lg text-gray-900">
                    Address & Security
                  </h3> */}
                {/* <div className="space-y-1.5">
                    <Label htmlFor="location" className="text-gray-700">
                      Primary Location (City, Country)
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                      <Input
                        id="location"
                        name="location"
                        placeholder="e.g., New York, USA"
                        className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white transition-all rounded-lg"
                        value={formData.location}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div> */}
                {/* <div className="space-y-1.5">
    <Label htmlFor="location" className="text-gray-700">
      Primary Location (City, Country)
    </Label>
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
      <Input
        id="location"
        name="location"
        placeholder="e.g., New York, USA"
        className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white transition-all rounded-lg"
        value={formData.location}
        onChange={handleInputChange}
      />
    </div>
  </div> */}

                {/* Address Line 1 */}
                {/* <div className="space-y-1.5">
                    <Label htmlFor="addressline1" className="text-gray-700">
                      Address Line 1
                    </Label>
                    <Input
                      id="addressline1"
                      name="addressline1"
                      placeholder="e.g., 123 Main St"
                      className="bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white transition-all rounded-lg"
                      value={formData.addressline1}
                      onChange={handleInputChange}
                    />
                  </div> */}

                {/* Address Line 2 */}
                {/* <div className="space-y-1.5">
                    <Label htmlFor="addressline2" className="text-gray-700">
                      Address Line 2 (optional)
                    </Label>
                    <Input
                      id="addressline2"
                      name="addressline2"
                      placeholder="e.g., Apartment, suite, unit, building, etc."
                      className="bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white transition-all rounded-lg"
                      value={formData.addressline2}
                      onChange={handleInputChange}
                    />
                  </div> */}

                {/* City, State, Country - in one row */}

                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex items-start space-x-2">
                    <input
                      id="agreeToTerms"
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={(e) =>
                        handleCheckboxChange("agreeToTerms", e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                    />
                    <label
                      htmlFor="agreeToTerms"
                      className="text-sm leading-relaxed text-gray-700 cursor-pointer"
                    >
                      I agree to the Briskon Auctions{" "}
                      <Link
                        href="/terms"
                        className="text-blue-600 hover:underline"
                      >
                        Terms of Service
                      </Link>
                      ,{" "}
                      <Link
                        href="/privacy"
                        className="text-blue-600 hover:underline"
                      >
                        Privacy Policy
                      </Link>
                      , and{" "}
                      <Link
                        href="/auction-rules"
                        className="text-blue-600 hover:underline"
                      >
                        Auction Rules
                      </Link>
                      .
                    </label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <input
                      id="subscribeNewsletter"
                      type="checkbox"
                      checked={formData.subscribeNewsletter}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "subscribeNewsletter",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                    />
                    <label
                      htmlFor="subscribeNewsletter"
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      Yes, send me auction updates, tips, and exclusive offers
                      from Briskon Auctions.
                    </label>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {successMessage && (
                  <Alert
                    variant="default"
                    className="bg-green-100 border-green-300 text-green-800"
                  >
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="p-10 bg-gray-50 flex flex-col items-center space-y-6">
                <Button
                  type="submit"
                  className="w-full md:w-1/3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md transition-all duration-300 animate-pulse-once"
                  disabled={authLoading || isLoading || !!successMessage}
                >
                  {authLoading || isLoading
                    ? "Creating Account..."
                    : successMessage
                    ? "Account Created!"
                    : "Create Account"}
                </Button>
                <div className="text-center text-sm text-gray-600">
                  <p>
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
