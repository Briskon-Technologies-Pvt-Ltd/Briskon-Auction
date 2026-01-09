"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useParams, useRouter } from "next/navigation";
import { DateTime } from "luxon";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@supabase/auth-helpers-react";
import { useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import LocationSelector from "@/components/LocationSelector";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, User, Lock, Mail } from "lucide-react";
import type { Country } from "@/lib/locationTypes";
import { countriesData } from "@/Data/Location";
// import useSWR from "swr";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Profile {
  id: string;
  fname: string;
  lname: string;
  role: string;
  email: string;
  created_at: string;
  avatar_url?: string;
  type: string;
  location: string;
  addressline1?: string;
  addressline2?: string;
  phone?: string;
}

export default function ProfileSettingsPage() {
  const { user } = useAuth();

  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params.id || user?.id;
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [activeTab, setActiveTab] = useState("view");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // For edit form fields
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [phone, setPhone] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Password change fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [countries, setCountries] = useState<Country[]>([]);
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
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/profiles/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        if (!data.success)
          throw new Error(data.error || "Failed to load profile");
        setProfile(data.data);
        // Populate edit fields on load
        setFname(data.data.fname);
        setLname(data.data.lname);
        setAddress1(data.data.addressline1 || "");
        setAddress2(data.data.addressline2 || "");
        setPhone(data.data.phone || "");

        const [city = "", state = "", country = ""] = (data.data.location || "")
          .split(",")
          .map((s: string) => s.trim());
        // Set form values
        setFormData((prev) => ({
          ...prev,
          city,
          state,
          country,
        }));
        // Set selected dropdowns
        setSelectedCity(city);
        setSelectedState(state);
        setSelectedCountry(country);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchProfile();
  }, [userId]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("profileimage") // ✅ bucket name
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Upload failed:", uploadError.message);
      alert("Failed to upload profile picture.");
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("profileimage")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles") // ✅ your actual table name
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to update avatar:", updateError.message);
      alert("Failed to update avatar URL.");
    } else {
      alert("Profile picture updated!");
      setProfile((prev) =>
        prev ? { ...prev, avatar_url: `${publicUrl}?t=${Date.now()}` } : prev
      );
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // --- END handleFileChange ---
  if (loading)
    return (
      <div className="text-center py-20 text-gray-700 dark:text-gray-300">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="text-center py-20 text-red-600 dark:text-red-400">
        {error}
      </div>
    );

  if (!profile)
    return (
      <div className="text-center py-20 text-gray-700 dark:text-gray-300">
        Profile not found
      </div>
    );

  const createdAtIST = DateTime.fromISO(profile.created_at, { zone: "utc" })
    .setZone("Asia/Kolkata")
    .toLocaleString(DateTime.DATE_FULL);

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match!");
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      alert("User session invalid. Please log in again.");
      return;
    }

    // Re-authenticate with old password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });

    if (signInError) {
      alert("Current password is incorrect.");
      return;
    }

    // Update to new password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      alert(`Error updating password: ${error.message}`);
      return;
    }

    alert("Password changed successfully. Please log in again.");
    setTimeout(async () => {
      await supabase.auth.signOut();
      router.push("/login");
    }, 1000); // delay 1 second
  };

  const handleSaveChanges = async () => {
    if (!user?.id) {
      toast.error("User not logged in");
      return;
    }
    const location = [formData.city, formData.state, formData.country]
      .filter(Boolean) // removes any empty strings or nulls
      .join(", ");
    const updates = {
      fname,
      lname,
      addressline1: address1, // ✅ match your DB column
      addressline2: address2,
      phone,
      location,
      // updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update profile.");
      console.error(error);
    } else {
      alert("Profile updated successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Page Header */}
        {/* <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time information and activities of your property.
          </p>
        </div> */}

        <div className="bg-white dark:bg-gray-900 shadow-lg rounded-xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 space-y-10">
          {/* Profile Picture Section */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-24 h-24 shrink-0">
              <Image
                src={
                  profile.avatar_url
                    ? `${profile.avatar_url}?t=${Date.now()}`
                    : "/images/user.png"
                }
                alt="Profile"
                fill
                className="object-cover rounded-full border-2 border-gray-100 dark:border-gray-800"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {fname} {lname}
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                <span>
                  {formData.organizationName ||
                    (profile.type === "individual"
                      ? "Individual Account"
                      : "Organization")}
                </span>
                <span className="hidden md:inline">•</span>
                <span className="capitalize">{profile.role}</span>
                <span className="hidden md:inline">•</span>
                <span>{user?.email}</span>
                <span className="hidden md:inline">•</span>
                <span>Joined {createdAtIST}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={triggerFileInput}
                  className="font-medium bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                >
                  Upload new picture
                </Button>
              </label>
              {/* <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                Delete
              </Button> */}
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* Personal Information */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Personal Information
              </h3>
              <Button
                onClick={handleSaveChanges}
                className="bg-[#131eba] hover:bg-[#0e1690] text-white"
              >
                Save Changes
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label
                  htmlFor="fname"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  First name
                </Label>
                <Input
                  id="fname"
                  value={fname}
                  onChange={(e) => setFname(e.target.value)}
                  className="bg-white rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="lname"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Last name
                </Label>
                <Input
                  id="lname"
                  value={lname}
                  onChange={(e) => setLname(e.target.value)}
                  className="bg-white rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-white rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                {/* Empty placeholder or additional field */}
              </div>
              <div className="col-span-2 md:col-span-1 space-y-1.5">
                <Label
                  htmlFor="address1"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Address Line 1
                </Label>
                <Input
                  id="address1"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  className="bg-white rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="col-span-2 md:col-span-1 space-y-1.5">
                <Label
                  htmlFor="address2"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Address Line 2
                </Label>
                <Input
                  id="address2"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  placeholder="Optional"
                  className="bg-white rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="country"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Country
                  </Label>
                  <select
                    id="country"
                    className="w-full h-10 px-3 bg-white rounded-xl border border-gray-200 shadow-sm text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.country}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        country: value,
                        state: "",
                        city: "",
                      }));
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
                  <Label
                    htmlFor="state"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    State
                  </Label>
                  <select
                    id="state"
                    className="w-full h-10 px-3 bg-white rounded-xl border border-gray-200 shadow-sm text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedState}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        state: value,
                        city: "",
                      }));
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
                  <Label
                    htmlFor="city"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    City
                  </Label>
                  <select
                    id="city"
                    className="w-full h-10 px-3 bg-white rounded-xl border border-gray-200 shadow-sm text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedCity}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData((prev) => ({ ...prev, city: value }));
                      setSelectedCity(value);
                    }}
                  >
                    <option value="">Select City</option>
                    {countries
                      .find((country) => country.name === selectedCountry)
                      ?.states.find((state) => state.name === selectedState)
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

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* Contact Email */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Contact email
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Manage your accounts email address for the invoices.
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  value={user?.email || ""}
                  readOnly
                  disabled
                  className="pl-10 bg-gray-50 text-gray-500 rounded-xl border-gray-200 shadow-sm"
                />
              </div>
              <div className="w-auto">
                {/* Placeholder for alignment if needed, or remove if no content */}
              </div>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          {/* Password */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Password
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Modify your current password.
                </p>
              </div>
              <Button
                onClick={handleUpdatePassword}
                variant="outline"
                className="hover:bg-gray-50 rounded-lg"
              >
                Change Password
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 relative">
                <Label
                  htmlFor="old-password"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Current password
                </Label>
                <div className="relative">
                  <Input
                    id="old-password"
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="bg-white pr-10 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <div
                    className="absolute right-3 top-2.5 cursor-pointer text-gray-400"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 md:col-start-2">
                {/* spacer if needed for layout match */}
              </div>

              <div className="space-y-1.5 relative">
                <Label
                  htmlFor="new-password"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  New password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-white pr-10 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <div
                    className="absolute right-3 top-2.5 cursor-pointer text-gray-400"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <Label
                  htmlFor="confirm-password"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Confirm new password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white pr-10 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <div
                    className="absolute right-3 top-2.5 cursor-pointer text-gray-400"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
