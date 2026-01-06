"use client";

import type React from "react";
import Select from "react-select";

import { useState, useRef, useEffect } from "react";
import { Inter } from "next/font/google";
import {
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Calendar,
  Hammer,
  HelpCircle,
} from "lucide-react";

import type { Country } from "@/lib/locationTypes";
import { countriesData } from "@/Data/Location";
import FileUploader from "@/components/file-uploader";
import TemplateSelector from "./components/template-selector";
// import QualificationCriteriaManager from "./components/qualification-criteria";
import TermsAndConditionsManager from "@/components/terms-conditions";
import LotManager from "@/components/lot-manager";
import LanguageSelector from "@/components/language-selector";
import ApiKeySetup from "./components/api-key-setup";
import { I18nProvider, useTranslation } from "@/i18n/i18n-context";
import type {
  AuctionFormData,
  AuctionTemplate,
  UploadedFile,
  Currency,
  Language,
} from "@/types/auction-types";
import { createClient } from "@supabase/supabase-js";
import {
  useFileUpload,
  handleImagesOrVideosUploaded,
} from "@/hooks/use-file-upload"; // Adjust path as needed
import { useRouter } from "next/navigation";
// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

import {
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  // validateStep5,
  validateStep7, // Added for Step 7 validation
  isValidEmail,
  type ValidationError,
} from "@/validation-utils";
import ProductClassification from "@/components/product-classification";
import BidIncrementConfig from "@/components/bid-increment-config";
// import { generateText } from "ai";
// import { openai } from "ai-sdk/openai";
import { PRODUCT_CATEGORIES } from "@/Data/product-categories";
// import { useAuth } from "@/components/auth/auth-provider";
import { useAuth } from "@/hooks/use-auth";
// import DescriptionEditor from "./components/ui/descriptionEditor";
const inter = Inter({ subsets: ["latin"] });
// Type for deletion confirmation
type DeletionType = "image" | "document" | "participant" | null;

interface DeletionInfo {
  type: DeletionType;
  index: number;
  name: string;
}

const requiredDocumentOptions = [
  { label: "Experience of Supplier", value: "Experience of Supplier" },
  { label: "Technical Proposal", value: "Technical Proposal" },
  { label: "Cost Proposal", value: "Cost Proposal" },
  { label: "Tax Compliance Certificate", value: "Tax Compliance Certificate" },
  { label: "Business License", value: "Business License" },
  { label: "Industry Certifications", value: "Industry Certifications" },
  {
    label: "NDA / Confidentiality Agreement",
    value: "NDA / Confidentiality Agreement",
  },
  {
    label: "Conflict of Interest Declaration",
    value: "Conflict of Interest Declaration",
  },
  {
    label: "Annual Turnover – Last 3 Years",
    value: "Annual Turnover – Last 3 Years",
  },
  {
    label: "Audited Financial Statements",
    value: "Audited Financial Statements",
  },
  { label: "Experience Summary", value: "Experience Summary" },
  { label: "List of Past Projects", value: "List of Past Projects" },
  { label: "Key Personnel CVs", value: "Key Personnel CVs" },
  { label: "Company Profile", value: "Company Profile" },
  {
    label: "Certificate of Incorporation",
    value: "Certificate of Incorporation",
  },
  {
    label: "Credit Rating Report",
    value: "Credit Rating Report",
  },
  {
    label: "ESS Compliance",
    value: "ESS Compliance",
  },
  {
    label: "Quality / Certifications",
    value: "Quality / Certifications",
  },
  {
    label: "Implementation Schedule",
    value: "Implementation Schedule",
  },
  {
    label: "References / Client Testimonials",
    value: "References / Client Testimonials",
  },
];
type Option = {
  label: string;
  value: string;
};

// Default form data (aligned with assumed AuctionFormData)
const defaultFormData: AuctionFormData = {
  // Step 1: Auction Type
  auctionType: "reverse",
  auctionSubType: "standard",

  // Step 2: Product/Lot Details (moved from step 3)
  isMultiLot: false,
  productName: "",
  productDescription: "",
  is_featured: false, // default to false
  product_heromsg: "",
  buy_now_price: 0,
  productImages: [],
  productDocuments: [],
  lots: [],
  categoryId: "",
  subCategoryId: "",
  attributes: [],
  sku: "",
  brand: "",
  model: "",
  evaluationCriteria: {
    technicalWeightage: 0,
    commercialWeightage: 0,
    contractDuration: 0,
    paymentTerms: "",
    additionalNotes: "",
  },
  // Step 3: Bidding Parameters (moved from step 2)
  startPrice: 0,
  minimumIncrement: 0,
  percent: null, // Added for percentage increment (e.g., 5 for 5%)
  auctionDuration: {
    days: 0,
    hours: 0,
    minutes: 0,
  },
  currency: "USD",
  launchType: "immediate",
  scheduledStart: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
  bidExtension: false,
  bidExtensionTime: 5,
  allowAutoBidding: false,
  bidIncrementType: "fixed",
  bidIncrementRules: [],
  isSilentAuction: false,

  // Step 4: Participation Rules
  participationType: "public",
  participantEmails: [],
  // qualificationCriteria: [],

  // Step 5: Terms & Conditions
  termsAndConditions: [],
  enableDispute: false,

  // Additional Settings
  language: "en",
  enableNotifications: true,
  notificationTypes: ["email"],
  enableAnalytics: true,

  // Step 7: Reverse Auction Details (new fields)
  targetprice: undefined, // Numeric field for reverse auctions
  requireddocuments: "[]", // Array for required documents
  productQuantity: 1, // For multi-lot auctions
};

type ErrorsType = {
  startPrice?: string;
};
interface AuctionWizardContentProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
  initialData?: AuctionFormData;
  isEdit?: boolean;
}

function AuctionWizardForwardContent({
  language,
  onLanguageChange,
  initialData,
  isEdit = false,
}: AuctionWizardContentProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [previousStep, setPreviousStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [showTemplateSelector, setShowTemplateSelector] = useState(true);
  const { user, isLoading, login } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [countries, setCountries] = useState<Country[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<AuctionFormData>({
    ...defaultFormData,
    auctionSubType: "english",
    auctionType: user?.role === "buyer" ? "reverse" : "forward", // 👈 logic here
    language: language,
    country: "",
    city: "",
    state: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Use 5 as the Reverse Details step (we're retiring 7)
  const FORWARD_FLOW = [1, 2, 3, 4, 6]; // normal
  const REVERSE_FLOW = [1, 5, 3, 4, 6]; // reverse: 1 → 5 (Reverse Details) → 3 → 4 → 6 (Summary)

  const flow = formData.auctionType === "reverse" ? REVERSE_FLOW : FORWARD_FLOW;
  const lastStep = flow[flow.length - 1];
  const router = useRouter();

  // API Key management
  const [apiKey, setApiKey] = useState("");
  const [showApiKeySetup, setShowApiKeySetup] = useState(false);
  useEffect(() => {
    setCountries(countriesData); // Only set once on mount
  }, []);
  // Load API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("openai_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);
  // Update formData language when prop changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, language }));
  }, [language]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, startPrice: 0, minimumIncrement: 0 }));
  }, []); // Runs once on mount

  // Validation state
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");

  const [isLaunched, setIsLaunched] = useState(false);
  const [buyNowEnabled, setBuyNowEnabled] = useState(false);

  // For file uploads
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // State for deletion confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletionInfo, setDeletionInfo] = useState<DeletionInfo>({
    type: null,
    index: -1,
    name: "",
  });

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);

  // AI Description Generation state
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [aiGeneratedDescription, setAiGeneratedDescription] = useState("");
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const [hasUserSeenAiSuggestion, setHasUserSeenAiSuggestion] = useState(false);

  // Refs for focusing first error field
  const startPriceRef = useRef<HTMLInputElement>(null);
  const minimumIncrementRef = useRef<HTMLInputElement>(null);
  const daysRef = useRef<HTMLInputElement>(null);
  const productNameRef = useRef<HTMLInputElement>(null);
  const productDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const participantEmailRef = useRef<HTMLInputElement>(null);
  const scheduledDateRef = useRef<HTMLInputElement>(null);
  const scheduledTimeRef = useRef<HTMLInputElement>(null);
  const brandAttr = formData.attributes?.find((attr) => attr.id === "brand");
  const modelAttr = formData.attributes?.find((attr) => attr.id === "model");
  // This handler triggers the hidden input click
  const handleDivClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  // File upload hooks
  const {
    uploadState: fileUploadState,
    uploadFiles,
    removeFile: removeFile,
    resetUploadState: resetFileUpload,
  } = useFileUpload("public");

  const {
    uploadState: documentUploadState,
    uploadFiles: uploadDocuments,
    removeFile: removeDocument,
    resetUploadState: resetDocumentUpload,
  } = useFileUpload("documents");

  // Handle API key setup
  const handleApiKeySet = (newApiKey: string) => {
    setApiKey(newApiKey);
    setShowApiKeySetup(false);
  };

  // Handle language change
  const handleLanguageChange = (newLanguage: Language) => {
    setFormData((prev) => ({ ...prev, language: newLanguage }));
    onLanguageChange(newLanguage);
  };

  // Handle template selection

  // Validate current step
  const validateCurrentStep = (): boolean => {
    let stepValidation = { isValid: true, errors: [] as ValidationError[] };

    switch (currentStep) {
      case 1:
        stepValidation = validateStep1(
          formData.auctionType,
          formData.auctionSubType
        );
        break;
      case 2:
        // Step 2 is now Product Details
        if (formData.isMultiLot) {
          // Validate lots
          if (formData.lots.length === 0) {
            stepValidation = {
              isValid: false,
              errors: [
                { field: "lots", message: "Please add at least one lot" },
              ],
            };
          } else {
            // Check each lot for validity
            const invalidLots = formData.lots.filter(
              (lot) =>
                !lot.name ||
                !lot.description ||
                lot.startPrice <= 0 ||
                lot.minimumIncrement <= 0
            );
            if (invalidLots.length > 0) {
              stepValidation = {
                isValid: false,
                errors: [
                  {
                    field: "lots",
                    message: "Please complete all required fields for each lot",
                  },
                ],
              };
            }
          }
        } else {
          stepValidation = validateStep3(
            formData.productName,
            formData.productDescription,
            formData.auctionSubType,
            formData.productQuantity
          );
          // Also validate category selection
          if (!formData.categoryId) {
            stepValidation.errors.push({
              field: "categoryId",
              message: "Please select a product category",
            });
            stepValidation.isValid = false;
          }
        }
        break;
      case 3:
        // Step 3 is now Bidding Parameters
        stepValidation = validateStep2(
          formData.startPrice,
          formData.minimumIncrement,
          formData.auctionDuration.days,
          formData.auctionDuration.hours,
          formData.auctionDuration.minutes,
          formData.launchType,
          formData.scheduledStart,
          formData.bidExtension,
          formData.bidExtensionTime,
          formData.auctionSubType, // Added for auction sub-type validation
          formData.productQuantity // Added for multi-lot auctions
        );
        break;
      case 4:
        stepValidation = validateStep4(
          formData.participationType,
          formData.participantEmails
        );
        break;
      // case 5:
      //   stepValidation = validateStep5(formData.termsAndConditions);
      //   break;
      case 7:
        if (formData.auctionType === "reverse") {
          stepValidation = validateStep7(
            formData.targetprice ?? 0,
            formData.requireddocuments ?? ""
          );
        }
        break;
    }

    setValidationErrors(stepValidation.errors);
    setShowValidationErrors(!stepValidation.isValid);

    // Focus the first error field
    if (!stepValidation.isValid) {
      focusFirstErrorField(stepValidation.errors[0].field);
    }

    return stepValidation.isValid;
  };

  // Focus the first error field
  const focusFirstErrorField = (fieldName: string) => {
    setTimeout(() => {
      switch (fieldName) {
        case "startPrice":
          startPriceRef.current?.focus();
          break;
        case "minimumIncrement":
          minimumIncrementRef.current?.focus();
          break;
        case "auctionDuration":
          daysRef.current?.focus();
          break;
        case "productName":
          productNameRef.current?.focus();
          break;
        case "productDescription":
          productDescriptionRef.current?.focus();
          break;
        case "participantEmails":
          participantEmailRef.current?.focus();
          break;
        case "scheduledStart":
          scheduledDateRef.current?.focus();
          break;
        case "targetprice":
          // Add targetpriceRef if needed (to be added in Step 7 UI)
          break;
        case "requireddocuments":
          // Add requireddocumentsRef if needed (to be added in Step 7 UI)
          break;
      }
    }, 100);
  };

  // Check if a field has an error
  const hasError = (fieldName: string): boolean => {
    return validationErrors.some((error) => error.field === fieldName);
  };

  // Get error message for a field
  const getErrorMessage = (fieldName: string): string => {
    const error = validationErrors.find((error) => error.field === fieldName);
    return error ? error.message : "";
  };

  // Clear validation errors when changing steps
  useEffect(() => {
    setValidationErrors([]);
    setShowValidationErrors(false);
  }, [currentStep]);

  const handleSaveDraft = () => {
    // In a real app, this would save to backend or localStorage
    alert("Auction draft saved successfully!");
  };

  const handleLaunchAuction = async () => {
    const newErrors: Record<string, string> = {};
    if (formData.startPrice <= 0) {
      newErrors.startPrice = "Start price must be greater than zero";
    }
    let allValid = true;
    const allErrors: ValidationError[] = [];

    const step1Validation = validateStep1(
      formData.auctionType,
      formData.auctionSubType
    );
    if (!step1Validation.isValid) {
      allValid = false;
      allErrors.push(...step1Validation.errors);
    }

    const step2Validation = validateStep2(
      formData.startPrice,
      formData.minimumIncrement,
      formData.auctionDuration.days,
      formData.auctionDuration.hours,
      formData.auctionDuration.minutes,
      formData.launchType,
      formData.scheduledStart,
      formData.bidExtension,
      formData.bidExtensionTime,
      formData.auctionSubType, // Added for auction sub-type validation
      formData.productQuantity // Added for multi-lot auctions
    );
    if (!step2Validation.isValid) {
      allValid = false;
      allErrors.push(...step2Validation.errors);
    }
    setErrors(newErrors);
    if (formData.isMultiLot) {
      if (formData.lots.length === 0) {
        allValid = false;
        allErrors.push({
          field: "lots",
          message: "Please add at least one lot",
        });
      } else {
        const invalidLots = formData.lots.filter(
          (lot) =>
            !lot.name ||
            !lot.description ||
            lot.startPrice <= 0 ||
            lot.minimumIncrement <= 0
        );
        if (invalidLots.length > 0) {
          allValid = false;
          allErrors.push({
            field: "lots",
            message: "Please complete all required fields for each lot",
          });
        }
      }
    } else {
      const step3Validation = validateStep3(
        formData.productName,
        formData.productDescription,
        formData.auctionSubType,
        formData.productQuantity
      );
      if (!step3Validation.isValid) {
        allValid = false;
        allErrors.push(...step3Validation.errors);
      }
    }

    const step4Validation = validateStep4(
      formData.participationType,
      formData.participantEmails
    );
    if (!step4Validation.isValid) {
      allValid = false;
      allErrors.push(...step4Validation.errors);
    }

    // const step5Validation = validateStep5(formData.termsAndConditions);
    // if (!step5Validation.isValid) {
    //   allValid = false;
    //   allErrors.push(...step5Validation.errors);
    // }
    // Validate Step 7 for reverse auctions
    if (formData.auctionType === "reverse") {
      const step7Validation = validateStep7(
        formData.targetprice ?? 0,
        formData.requireddocuments ?? ""
      );
      if (!step7Validation.isValid) {
        allValid = false;
        allErrors.push(...step7Validation.errors);
      }
    }

    if (!allValid) {
      console.log("Validation Errors:", allErrors);
      setValidationErrors(allErrors);
      setShowValidationErrors(true);
      alert("Please fix all validation errors before launching the auction.");
      return;
    }
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (!session) {
      console.error("No active session");
      return;
    }
    const userId = session.user.id;
    try {
      if (!user) {
        alert("Please log in to launch the auction.");
        return;
      }
      const formDataToSend = {
        ...formData,
        city: selectedCity,
        state: selectedState,
        country: selectedCountry,
        createdby: user.email,
        seller: userId,
        productimages: formData.productImages.map((img) => img.url),
        productdocuments: formData.productDocuments.map((doc) => doc.url || ""),
        percent:
          formData.bidIncrementType === "percentage"
            ? formData.minimumIncrement // use the synced value
            : null,
        minimumIncrement:
          formData.bidIncrementType === "fixed" ? formData.minimumIncrement : 0,
        bidIncrementRules:
          formData.bidIncrementType === "fixed"
            ? [{ incrementValue: formData.minimumIncrement }]
            : formData.bidIncrementType === "percentage"
            ? [{ incrementValue: formData.percent }]
            : [],
        buy_now_price:
          formData.buy_now_price && formData.buy_now_price > 0
            ? formData.buy_now_price
            : undefined,
        // e.g., "New York, New York, USA"
      };

      const res = await fetch(
        `/api/wizard-auctions?user=${encodeURIComponent(user.email)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`, // This is important!
          },
          body: JSON.stringify(formDataToSend),
        }
      );
      const result = await res.json();

      if (!result.success) {
        alert(result.error || "Failed to create auction.");
        return;
      }
      setIsLaunched(true);
    } catch (err) {
      alert("Failed to create auction. Please try again.");
    }
  };

  const handleGoToDashboard = () => {
    // Reset wizard state
    setIsLaunched(false);
    setCurrentStep(1);
    if (user?.role === "seller") {
      router.push("/dashboard/seller");
    } else if (user?.role === "buyer") {
      router.push("/dashboard/buyer");
    } else if (user?.role === "both") {
      router.push("/dashboard");
    } else {
      // fallback (guest or unknown role)
      router.push("/");
    }
  };

  const handleEditAuction = async () => {
    if (!formData.id) {
      alert("Auction ID is missing!");
      return;
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      alert("You must be logged in to edit an auction.");
      return;
    }

    try {
      // Prepare payload
      const bodyData = {
        productname: formData.productName,
        productdescription: formData.productDescription,
        startprice: formData.startPrice,
        minimumincrement: formData.minimumIncrement,
        auctionduration: formData.auctionDuration,
        targetprice: formData.targetPrice,
        editable: formData.editable,
        scheduledstart: formData.scheduledStart,
        auctiontype: formData.auctionType,
        auctionsubtype: formData.auctionSubType,
        productimages: formData.productImages.map((img) => img.url),
        productdocuments: formData.productDocuments.map((doc) => doc.url || ""),
        percent:
          formData.bidIncrementType === "percentage"
            ? formData.minimumIncrement
            : null,
        bidincrementrules:
          formData.bidIncrementType === "fixed"
            ? [{ incrementValue: formData.minimumIncrement }]
            : formData.bidIncrementType === "percentage"
            ? [{ incrementValue: formData.percent }]
            : [],
        ...(formData.auctionSubType === "sealed"
          ? { evaluationcriteria: formData.evaluationCriteria }
          : {}),
      };
      // PUT request to update auction
      const res = await fetch(`/api/listings/${formData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(bodyData),
      });

      const result = await res.json();

      if (!result.success) {
        alert(result.error || "Failed to update auction.");
        return;
      }

      setIsLaunched(true);
    } catch (err) {
      console.error(err);
      alert("Error updating auction. Please try again.");
    }
  };

  // Handler for uploaded images
  const handleImagesUploaded = async (newFiles: UploadedFile[]) => {
    console.log("New files (images or videos):", newFiles); // Debug, clarified in log
    const files = newFiles.map((file) => file.file as unknown as File); // Safer cast via unknown
    const uploadedFiles = await handleImagesOrVideosUploaded(
      newFiles,
      uploadFiles
    ); // Use the utility function
    setFormData({
      ...formData,
      productImages: [
        ...formData.productImages,
        ...uploadedFiles.map(
          (file) =>
            ({
              ...file,
              url: file.url || "", // Ensure url is a string
            } as const)
        ), // Type assertion to enforce UploadedFile shape
      ],
    });
  };

  const handleDocumentsUploaded = async (newDocuments: UploadedFile[]) => {
    const files = newDocuments.map((doc) => doc.file as unknown as File); // Safer cast via unknown
    const uploadedFiles = await uploadDocuments(files);
    setFormData({
      ...formData,
      productDocuments: [
        ...formData.productDocuments,
        ...uploadedFiles.map(
          (file) =>
            ({
              ...file,
              url: file.url || "", // Ensure url is a string
            } as const)
        ), // Type assertion to enforce UploadedFile shape
      ],
    });
  };

  // Handler for removed images
  const handleImageRemoved = async (fileId: string) => {
    await removeFile(fileId);
    setFormData({
      ...formData,
      productImages: formData.productImages.filter(
        (file) => file.id !== fileId
      ),
    });
  };

  // Handler for removed documents
  const handleDocumentRemoved = async (fileId: string) => {
    await removeDocument(fileId);
    setFormData({
      ...formData,
      productDocuments: formData.productDocuments.filter(
        (doc) => doc.id !== fileId
      ),
    });
  };

  // Show confirmation modal before deleting a participant
  const confirmRemoveParticipant = (index: number) => {
    const email = formData.participantEmails[index];
    setDeletionInfo({
      type: "participant",
      index,
      name: email,
    });
    setShowDeleteModal(true);
  };
  // Handle actual deletion after confirmation
  const handleConfirmDelete = () => {
    if (!deletionInfo.type) return;

    if (deletionInfo.type === "participant") {
      const updatedEmails = [...formData.participantEmails];
      updatedEmails.splice(deletionInfo.index, 1);

      setFormData({
        ...formData,
        participantEmails: updatedEmails,
      });
    }

    // Close the modal and reset deletion info
    setShowDeleteModal(false);
    setDeletionInfo({ type: null, index: -1, name: "" });
  };

  // Cancel deletion
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletionInfo({ type: null, index: -1, name: "" });
  };

  const handleAddParticipant = (email: string) => {
    if (!email.trim()) {
      setEmailError("Email cannot be empty");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (formData.participantEmails.includes(email)) {
      setEmailError("This email is already added");
      return;
    }

    setFormData({
      ...formData,
      participantEmails: [...formData.participantEmails, email],
    });
    setEmailInput("");
    setEmailError("");
  };

  // Handle scheduled date and time changes
  const handleScheduledDateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const dateValue = e.target.value;

    // Get the time portion from the existing scheduledStart
    const existingDate = new Date(formData.scheduledStart);
    const hours = existingDate.getHours().toString().padStart(2, "0");
    const minutes = existingDate.getMinutes().toString().padStart(2, "0");
    const timeString = `${hours}:${minutes}`;

    // Combine the new date with the existing time
    const newScheduledStart = new Date(`${dateValue}T${timeString}:00`);

    setFormData({
      ...formData,
      scheduledStart: newScheduledStart.toISOString(),
    });
  };

  const handleScheduledTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const timeValue = e.target.value;

    // Get the date portion from the existing scheduledStart
    const existingDate = new Date(formData.scheduledStart);
    const year = existingDate.getFullYear();
    const month = (existingDate.getMonth() + 1).toString().padStart(2, "0");
    const day = existingDate.getDate().toString().padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    // Combine the existing date with the new time
    const newScheduledStart = new Date(`${dateString}T${timeValue}:00`);

    setFormData({
      ...formData,
      scheduledStart: newScheduledStart.toISOString(),
    });
  };

  // Format date for input fields
  const formatDateForInput = (isoString?: string | null): string => {
    if (!isoString) return "";
    return isoString.slice(0, 10); // YYYY-MM-DD
  };

  const formatTimeForInput = (isoString?: string | null): string => {
    if (!isoString) return "00:00";
    return isoString.slice(11, 16); // HH:MM
  };

  // Format date and time for display
  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get animation classes based on direction and animation state0
  // Error message component
  const ErrorMessage = ({ message }: { message: string }) => (
    <div className="flex items-center mt-1 text-destructive-600 dark:text-destructive-400 text-sm">
      <AlertCircle className="h-4 w-4 mr-1" />
      <span>{message}</span>
    </div>
  );
  function mergeDateAndTime(date: string, time: string): string {
    if (!date) return "";
    const [hours, minutes] = time ? time.split(":").map(Number) : [0, 0];
    const merged = new Date(date);
    merged.setHours(hours || 0, minutes || 0, 0, 0);
    return merged.toISOString();
  }

  // Get currency symbol
  const getCurrencySymbol = (currency: Currency) => {
    switch (currency) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "JPY":
        return "¥";
      case "INR":
        return "₹";
      case "AUD":
        return "A$";
      case "CAD":
        return "C$";
      case "CNY":
        return "¥";
      default:
        return "$";
    }
  };

  return (
    <div
      className={`h-auto p-1 md:p-4 transition-colors duration-300 ${inter.className}`}
    >
      <div className="">
        {/* Header with Theme Toggle */}
        <div className="flex items-center mt-2 ml-6">
          <Hammer className="h-5 w-5 text-gray-700  animate-bounce" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 ml-2">
            {isEdit ? "Auction Builder – Edit Mode" : t("auctionBuilder")}
          </h1>
        </div>
        <div className="mb-2 mt-1 p-6">
          <label
            htmlFor="auction-format"
            className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 pl-4"
          >
            Select Auction Format
          </label>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                value: "english",
                label: t("englishAuction"),
                desc: t("englishAuctionDesc"),
              },
              {
                value: "silent",
                label: t("silentAuction"),
                desc: t("silentAuctionDesc"),
              },
              {
                value: "sealed",
                label: t("sealedBidAuction"),
                desc: t("sealedBidAuctionDesc"),
              },
            ].map((option) => (
              <div
                key={option.value}
                onClick={() =>
                  setFormData({
                    ...formData,
                    auctionSubType: option.value,
                    minimumIncrement:
                      option.value === "sealed" ? 0 : formData.minimumIncrement,
                  })
                }
                className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition-all 
          ${
            formData.auctionSubType === option.value
              ? "border-corporate-500 ring-2 ring-corporate-500 bg-corporate-50 dark:bg-corporate-900"
              : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
          }
        `}
              >
                <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {option.label}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {option.desc}
                </p>
              </div>
            ))}
          </div>

          {hasError("auctionSubType") && (
            <p className="text-xs text-red-600 mt-2">
              {getErrorMessage("auctionSubType")}
            </p>
          )}
        </div>

        <div className="w-full mx-auto p-6">
          <p className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 pl-2">
            Product Details
          </p>
          <div className="grid grid-cols-1 gap-6">
            <div className="p-5 card gap-5 w-full bg-[#fcfcfc]">
              <div className="space-y-2">
                <label
                  htmlFor="productName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t("productName")}{" "}
                  <span className="text-destructive-500">*</span>
                </label>
                <input
                  type="text"
                  id="productName"
                  ref={productNameRef}
                  className={`form-input w-full pb-2${
                    hasError("productName")
                      ? "border-destructive-500 dark:border-destructive-400 focus:border-destructive-500 dark:focus:border-destructive-400 focus:ring-destructive-500/20 dark:focus:ring-destructive-400/20"
                      : ""
                  }`}
                  placeholder={t("enterProductName")}
                  value={formData.productName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      productName: e.target.value,
                    })
                  }
                />
                {hasError("productName") && (
                  <ErrorMessage message={getErrorMessage("productName")} />
                )}
              </div>
              {/* Right side: Description */}
              <div className="grid grid-cols-2 space-x-3">
                <div>
                  <label
                    htmlFor="productDescription"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-2"
                  >
                    {t("productDescription")}{" "}
                    <span className="text-destructive-500">*</span>
                  </label>
                  <textarea
                    id="productDescription"
                    ref={productDescriptionRef}
                    rows={4}
                    className={`form-input w-full ${
                      hasError("productDescription")
                        ? "border-destructive-500 dark:border-destructive-400 focus:border-destructive-500 dark:focus:border-destructive-400 focus:ring-destructive-500/20 dark:focus:ring-destructive-400/20"
                        : ""
                    }`}
                    placeholder={t("enterProductDescription")}
                    value={formData.productDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        productDescription: e.target.value,
                      })
                    }
                  />
                  {hasError("productDescription") && (
                    <ErrorMessage
                      message={getErrorMessage("productDescription")}
                    />
                  )}

                  {formData.productDescription && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {formData.productDescription.length} characters
                    </div>
                  )}
                </div>
                {/* Remarks (half width) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-2 flex items-center">
                    Remarks
                    <span
                      className="ml-1 relative text-gray-400 hover:text-gray-600 cursor-pointer"
                      onMouseEnter={(e) => {
                        const tooltip = e.currentTarget.querySelector("span");
                        if (tooltip) tooltip.classList.remove("hidden");
                      }}
                      onMouseLeave={(e) => {
                        const tooltip = e.currentTarget.querySelector("span");
                        if (tooltip) tooltip.classList.add("hidden");
                      }}
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span className="hidden absolute top-0 left-full ml-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                        Mention item condition, features, history, shipping
                        instructions, or any notes for bidders.
                      </span>
                    </span>
                  </label>

                  <textarea
                    id="remarks"
                    rows={4}
                    className={`form-input w-full ${
                      hasError("remarks")
                        ? "border-destructive-500 dark:border-destructive-400 focus:border-destructive-500 dark:focus:border-destructive-400 focus:ring-destructive-500/20 dark:focus:ring-destructive-400/20"
                        : ""
                    }`}
                    placeholder={"Enter Remarks"}
                    value={formData.remarks}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        remarks: e.target.value,
                      })
                    }
                  />
                  {hasError("remarks") && (
                    <ErrorMessage message={getErrorMessage("remarks")} />
                  )}

                  {formData.remarks && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {formData.remarks.length} characters
                    </div>
                  )}
                </div>
              </div>
              {/* City, State, Country - in one row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
                <div className="">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-2">
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    className="w-full bg-white  border-gray-300 text-gray-500 transition-all focus:border-blue-500 focus:bg-white shadow-sm rounded-lg p-2"
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
                    <option className="text-gray-600 text-xs" value="">
                      Select Country
                    </option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="">
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-2">
                    State
                  </label>
                  <select
                    id="state"
                    className="w-full border border-gray-300 focus:border-blue-500 focus:bg-white transition-all shadow-sm  rounded-lg p-2"
                    value={selectedState}
                    onChange={(e) => {
                      const value = e.target.value;

                      // Update formData with selected state, reset city
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        state: value,
                        city: "", // Reset city when state changes
                      }));

                      // Update selected state and reset city
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

                <div className="">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-2">
                    City
                  </label>
                  <select
                    id="city"
                    className="w-full border border-gray-300 focus:border-blue-500 focus:bg-white transition-all shadow-sm  rounded-lg p-2"
                    value={selectedCity}
                    onChange={(e) => {
                      const value = e.target.value;

                      setFormData((prev) => ({
                        ...prev,
                        city: value,
                      }));

                      setSelectedCity(value);
                    }}
                  >
                    <option className="" value="">
                      Select City
                    </option>
                    {countries
                      .find((country) => country.name === selectedCountry)
                      ?.states.find((state) => state.name === selectedState)
                      ?.cities?.map((city) => (
                        <option className="" key={city.id} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              {/* Product Classification */}
              <div className="overflow-visible">
                <ProductClassification
                  categoryId={formData.categoryId}
                  subCategoryId={
                    formData.auctionSubType === "sealed"
                      ? undefined
                      : formData.subCategoryId
                  } // Hide if sealed
                  attributes={formData.attributes || { condition: "" }} // Default empty condition
                  sku={formData.sku || ""}
                  brand={formData.brand || ""}
                  model={formData.model || ""}
                  className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 pl-2"
                  onCategoryChange={(categoryId, subCategoryId) =>
                    setFormData((prev) => ({
                      ...prev,
                      categoryId,
                      subCategoryId,
                    }))
                  }
                  onAttributesChange={(attributes) =>
                    setFormData((prev) => ({ ...prev, attributes }))
                  }
                  onSkuChange={(sku) =>
                    setFormData((prev) => ({ ...prev, sku }))
                  }
                  onBrandChange={(brand) =>
                    setFormData((prev) => ({ ...prev, brand }))
                  }
                  onModelChange={(model) =>
                    setFormData((prev) => ({ ...prev, model }))
                  }
                />

                {hasError("categoryId") && (
                  <ErrorMessage message={getErrorMessage("categoryId")} />
                )}
                {hasError("subCategoryId") && (
                  <ErrorMessage message={getErrorMessage("subCategoryId")} />
                )}
                {hasError("attributes") && (
                  <ErrorMessage message={getErrorMessage("attributes")} />
                )}
                {hasError("sku") && (
                  <ErrorMessage message={getErrorMessage("sku")} />
                )}
                {hasError("brand") && (
                  <ErrorMessage message={getErrorMessage("brand")} />
                )}
                {hasError("model") && (
                  <ErrorMessage message={getErrorMessage("model")} />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full mx-auto p-6 pt-2">
          {/* Grid container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 pl-2">
                Reference Media & Documents
              </p>
              {/* Left side card */}
              <div className="card p-5 space-y-5 bg-[#fcfcfc]">
                <div
                  onClick={handleDivClick}
                  className="cursor-pointer w-full p-2"
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sample images/videos
                  </label>
                  <FileUploader
                    accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                    type="media"
                    uploadedFiles={formData.productImages}
                    onFilesUploaded={handleImagesUploaded}
                    onFileRemoved={handleImageRemoved}
                  />
                  {hasError("productImages") && (
                    <ErrorMessage message={getErrorMessage("productImages")} />
                  )}
                </div>
                <div className="w-full p-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Documents
                  </label>
                  <FileUploader
                    accept="application/*,text/*"
                    maxFiles={10}
                    maxSize={10 * 1024 * 1024} // 10MB
                    uploadedFiles={formData.productDocuments}
                    onFilesUploaded={handleDocumentsUploaded}
                    onFileRemoved={handleDocumentRemoved}
                    type="document"
                  />
                </div>
              </div>
            </div>
            {/* Right side card */}
            <div>
              <p className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 pl-2">
                Bidding Parameters
              </p>

              <div className="card p-5 gap-5 bg-[#fcfcfc]">
                {/* Currency Selection */}
                <div className="pb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Currency
                  </label>
                  <select
                    id="currency"
                    className="form-select w-1/4 pb-2"
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currency: e.target.value as Currency,
                      })
                    }
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                    <option value="INR">INR</option>
                    <option value="AUD">AUD</option>
                    <option value="CAD">CAD</option>
                    <option value="CNY">CNY</option>
                  </select>
                </div>

                {/* Start Price + Minimum Increment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  {/* Start Price */}
                  <div>
                    <label
                      htmlFor="startPrice"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Starting Bid Price
                      <span className="text-destructive-500">*</span>
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400 sm:text-sm">
                          {getCurrencySymbol(formData.currency)}
                        </span>
                      </div>
                      <input
                        type="number"
                        id="startPrice"
                        ref={startPriceRef}
                        className={`form-input pl-7 pr-4 ${
                          errors.startPrice
                            ? "border-destructive-500 dark:border-destructive-400 focus:border-destructive-500 dark:focus:border-destructive-400 focus:ring-destructive-500/20 dark:focus:ring-destructive-400/20"
                            : ""
                        }`}
                        placeholder="0.00"
                        value={formData.startPrice}
                        onChange={(e) => {
                          const value = Number.parseFloat(e.target.value) || 0;
                          setFormData((prev) => ({
                            ...prev,
                            startPrice: value,
                          }));

                          if (value <= 0) {
                            setErrors((prev) => ({
                              ...prev,
                              startPrice:
                                "Start price must be greater than zero",
                            }));
                          } else {
                            setErrors((prev) => {
                              const { startPrice, ...rest } = prev;
                              return rest;
                            });
                          }
                        }}
                      />
                    </div>
                    {errors.startPrice && (
                      <p className="mt-1 text-sm text-destructive-500">
                        {errors.startPrice}
                      </p>
                    )}
                  </div>
                  {/* Minimum Increment (only for forward non-sealed) */}
                  {formData.auctionType === "forward" &&
                    formData.auctionSubType !== "sealed" &&
                    formData.auctionSubType !== "silent" && (
                      <div>
                        <label
                          htmlFor="minimumIncrement"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Minimum Bid Increment
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">
                              {getCurrencySymbol(formData.currency)}
                            </span>
                          </div>
                          <input
                            type="number"
                            id="minimumIncrement"
                            ref={minimumIncrementRef}
                            className="form-input pl-7"
                            placeholder="0.00"
                            value={formData.minimumIncrement}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                minimumIncrement:
                                  Number.parseFloat(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                      </div>
                    )}
                </div>

                {formData.auctionType === "forward" && (
                  <div className="mt-4">
                    <label className="inline-flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={buyNowEnabled}
                        onChange={(e) => setBuyNowEnabled(e.target.checked)}
                        className="cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Enable Buy Now Option
                      </span>
                    </label>

                    {buyNowEnabled && (
                      <div className="mt-3">
                        <label
                          htmlFor="buy_now_price"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Buy Now Price
                        </label>
                        <div className="relative rounded-md shadow-sm w-1/2">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">
                              {getCurrencySymbol(formData.currency)}
                            </span>
                          </div>

                          <input
                            type="number"
                            id="buy_now_price"
                            min="0"
                            step="0.01"
                            className="form-input pl-7"
                            placeholder="0"
                            value={formData.buy_now_price || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Prevent "--" or negative numbers
                              if (value === "" || isNaN(Number(value))) return;
                              const parsed = Number.parseFloat(value);
                              if (parsed < 0) return;

                              setFormData((prev) => ({
                                ...prev,
                                buy_now_price: parsed,
                              }));
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Particpation rule */}
        <div className="w-full mx-auto p-6 pt-2">
          {/* Grid container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 pl-2">
                Participants
              </p>
              {/* Left side card */}
              <div className="card p-5 space-y-5 bg-[#fcfcfc]">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("whoCanParticipate")}{" "}
                    <span className="text-destructive-500">*</span>
                  </label>
                  <div
                    className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                      hasError("participationType")
                        ? "border border-destructive-500 dark:border-destructive-400 p-3 rounded-md"
                        : ""
                    }`}
                  >
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-all-smooth hover-scale 
                                                  ${
                                                    formData.participationType ===
                                                    "public"
                                                      ? "border-corporate-500 bg-corporate-50 dark:border-corporate-400 dark:bg-corporate-900/30"
                                                      : "border-gray-200 hover:border-corporate-200 dark:border-gray-700 dark:hover:border-corporate-700"
                                                  }`}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          participationType: "public",
                        })
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium dark:text-gray-100">
                            {"Verified Users"}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {"Only registered & verified users can participate"}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border transition-all-smooth ${
                            formData.participationType === "public"
                              ? "border-corporate-500 bg-corporate-500 dark:border-corporate-400 dark:bg-corporate-400"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {formData.participationType === "public" && (
                            <CheckCircle className="w-5 h-5 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-all-smooth hover-scale 
                                                  ${
                                                    formData.participationType ===
                                                    "invite-only"
                                                      ? "border-corporate-500 bg-corporate-50 dark:border-corporate-400 dark:bg-corporate-900/30"
                                                      : "border-gray-200 hover:border-corporate-200 dark:border-gray-700 dark:hover:border-corporate-700"
                                                  }`}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          participationType: "invite-only",
                        })
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium dark:text-gray-100">
                            {t("inviteOnly")}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t("onlyInvitedParticipants")}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border transition-all-smooth ${
                            formData.participationType === "invite-only"
                              ? "border-corporate-500 bg-corporate-500 dark:border-corporate-400 dark:bg-corporate-400"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {formData.participationType === "invite-only" && (
                            <CheckCircle className="w-5 h-5 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {hasError("participationType") && (
                    <ErrorMessage
                      message={getErrorMessage("participationType")}
                    />
                  )}
                </div>

                {formData.participationType === "invite-only" && (
                  <div className="space-y-4 mt-6 animate-fade-in">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("participantEmailList")}{" "}
                      {hasError("participantEmails") && (
                        <span className="text-destructive-500">*</span>
                      )}
                    </label>
                    <div className="flex">
                      <input
                        type="email"
                        id="participantEmail"
                        ref={participantEmailRef}
                        className={`form-input rounded-r-none ${
                          emailError
                            ? "border-destructive-500 dark:border-destructive-400 focus:border-destructive-500 dark:focus:border-destructive-400 focus:ring-destructive-500/20 dark:focus:ring-destructive-400/20"
                            : ""
                        }`}
                        placeholder={t("enterEmailAddress")}
                        value={emailInput}
                        onChange={(e) => {
                          setEmailInput(e.target.value);
                          setEmailError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddParticipant(emailInput);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn-primary btn-md rounded-l-none active-scale"
                        onClick={() => handleAddParticipant(emailInput)}
                      >
                        {t("add")}
                      </button>
                    </div>
                    {emailError && <ErrorMessage message={emailError} />}

                    {formData.participantEmails.length > 0 ? (
                      <div className="mt-4 space-y-2">
                        {formData.participantEmails.map((email, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 hover:border-corporate-200 dark:hover:border-corporate-700 transition-colors-smooth animate-fade-in"
                          >
                            <div className="flex items-center">
                              <Users className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                              <span className="text-sm dark:text-gray-200">
                                {email}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="text-destructive-500 dark:text-destructive-400 hover:text-destructive-700 dark:hover:text-destructive-300 transition-colors-smooth active-scale"
                              onClick={() => confirmRemoveParticipant(index)}
                              aria-label={`Remove participant ${email}`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        className={`text-sm text-gray-500 dark:text-gray-400 mt-2 ${
                          hasError("participantEmails")
                            ? "text-destructive-500 dark:text-destructive-400"
                            : ""
                        }`}
                      >
                        {t("noParticipantsAddedYet")}
                      </div>
                    )}
                    {hasError("participantEmails") && (
                      <ErrorMessage
                        message={getErrorMessage("participantEmails")}
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Feature this Auction.
                    </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Highlight this auction on the homepage or featured section to
                  attract more bidders.
                </p>

                <div className="flex items-center gap-2 mb-4">
                  <input
                    id="is_featured"
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_featured: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="is_featured"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Enable Featured Auction
                  </label>
                </div>

                {formData.is_featured && (
                  <div>
                    <label
                      htmlFor="product_heromsg"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Featured Message
                    </label>
                    <textarea
                      id="product_heromsg"
                      rows={3}
                      value={formData.product_heromsg}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          product_heromsg: e.target.value,
                        })
                      }
                      placeholder="Write a short message to promote your featured auction (e.g. 'Limited-time offer!')"
                      className="w-full form-input border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <p className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 pl-2">
                Launch Auction
              </p>
              <div className="card p-5 space-y-5 bg-[#fcfcfc]">
                {/* Add anything you want inside this card */}
                <div className="space-y-4 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {"Auction Start Date & Time"}{" "}
                    <span className="text-destructive-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>

                  <div className="mt-2 space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Start Date */}
                      <div>
                        <label
                          htmlFor="scheduledDate"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          {t("startDate")}{" "}
                          <span className="text-destructive-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                          </div>
                          <input
                            type="date"
                            id="scheduledDate"
                            ref={scheduledDateRef}
                            className={`form-input pl-10 ${
                              hasError("scheduledStart")
                                ? "border-destructive-500 dark:border-destructive-400 focus:border-destructive-500 dark:focus:border-destructive-400 focus:ring-destructive-500/20 dark:focus:ring-destructive-400/20"
                                : ""
                            }`}
                            value={formatDateForInput(formData.scheduledStart)}
                            min={formatDateForInput(new Date().toISOString())}
                            onChange={(e) => {
                              const newDate = e.target.value; // YYYY-MM-DD
                              const time = formatTimeForInput(
                                formData.scheduledStart
                              );
                              setFormData((prev) => ({
                                ...prev,
                                scheduledStart: `${newDate}T${time}`,
                              }));
                            }}
                          />
                        </div>
                      </div>

                      {/* Start Time */}
                      <div>
                        <label
                          htmlFor="scheduledTime"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          {t("startTime")}{" "}
                          <span className="text-destructive-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Clock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                          </div>
                          <input
                            type="time"
                            id="scheduledTime"
                            ref={scheduledTimeRef}
                            className={`form-input pl-10 ${
                              hasError("scheduledStart")
                                ? "border-destructive-500 dark:border-destructive-400 focus:border-destructive-500 dark:focus:border-destructive-400 focus:ring-destructive-500/20 dark:focus:ring-destructive-400/20"
                                : ""
                            }`}
                            value={formatTimeForInput(formData.scheduledStart)}
                            onChange={(e) => {
                              const newTime = e.target.value; // HH:MM
                              const date =
                                formatDateForInput(formData.scheduledStart) ||
                                formatDateForInput(new Date().toISOString());
                              setFormData((prev) => ({
                                ...prev,
                                scheduledStart: `${date}T${newTime}`,
                              }));
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {hasError("scheduledStart") && (
                      <ErrorMessage
                        message={getErrorMessage("scheduledStart")}
                      />
                    )}
                  </div>

                  {/* )} */}
                </div>
              </div>
              {/* anti shipping controll */}
              <div className=" pt-6">
                {/* Auction Duration - MOVED TO AFTER LAUNCH TYPE */}
                <div className="space-y-4">
                  <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
                    {t("auctionDuration")}{" "}
                    <span className="text-destructive-500">*</span>
                  </label>
                  <div
                    className={`flex items-start gap-6 ${
                      hasError("auctionDuration")
                        ? "border border-destructive-500 dark:border-destructive-400 p-3 rounded-md"
                        : ""
                    }`}
                  >
                    {/* Auction Duration Section */}
                    <div className="flex space-x-4">
                      <div>
                        <label
                          htmlFor="days"
                          className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
                        >
                          {t("days")}
                        </label>
                        <input
                          type="number"
                          id="days"
                          ref={daysRef}
                          min={0}
                          max={365}
                          className="form-input"
                          value={formData.auctionDuration.days}
                          onChange={(e) => {
                            let value = Number.parseInt(e.target.value) || 0;
                            if (value > 365) value = 365;
                            setFormData((prev) => ({
                              ...prev,
                              auctionDuration: {
                                ...prev.auctionDuration,
                                days: value,
                              },
                            }));
                          }}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="hours"
                          className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
                        >
                          {t("hours")}
                        </label>
                        <input
                          type="number"
                          id="hours"
                          min={0}
                          max={23}
                          className="form-input"
                          value={formData.auctionDuration.hours}
                          onChange={(e) => {
                            let value = Number.parseInt(e.target.value) || 0;
                            if (value > 23) value = 23;
                            setFormData((prev) => ({
                              ...prev,
                              auctionDuration: {
                                ...prev.auctionDuration,
                                hours: value,
                              },
                            }));
                          }}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="minutes"
                          className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
                        >
                          {t("minutes")}
                        </label>
                        <input
                          type="number"
                          id="minutes"
                          min={0}
                          max={59}
                          className="form-input"
                          value={formData.auctionDuration.minutes}
                          onChange={(e) => {
                            let value = Number.parseInt(e.target.value) || 0;
                            if (value > 59) value = 59;
                            setFormData((prev) => ({
                              ...prev,
                              auctionDuration: {
                                ...prev.auctionDuration,
                                minutes: value,
                              },
                            }));
                          }}
                        />
                      </div>
                    </div>

                    {/* Anti Sniping Control Section */}
                    <div className="dark:border-gray-700 pl-10">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("antiSnipingControls")}
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="bidExtension"
                          className="form-checkbox"
                          checked={formData.bidExtension}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              bidExtension: e.target.checked,
                            }))
                          }
                        />
                        <label
                          htmlFor="bidExtension"
                          className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          {t("enableBidExtension")}
                        </label>
                      </div>

                      {formData.bidExtension && (
                        <div className="ml-6 animate-fade-in">
                          <label
                            htmlFor="bidExtensionTime"
                            className="block text-sm text-gray-700 dark:text-gray-300 mb-1"
                          >
                            {t("extendAuctionIfBid")}
                          </label>
                          <div className="flex items-center">
                            <input
                              type="number"
                              id="bidExtensionTime"
                              min="1"
                              max="30"
                              className="form-input w-20"
                              value={formData.bidExtensionTime}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  bidExtensionTime:
                                    Number.parseInt(e.target.value) || 5,
                                }))
                              }
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              {t("minutes")}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {t("preventsLastSecondBidding")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {hasError("auctionDuration") && (
                    <ErrorMessage
                      message={getErrorMessage("auctionDuration")}
                    />
                  )}

                  <div className="bg-corporate-50 dark:bg-corporate-900/30 p-4 rounded-md flex items-start animate-fade-in">
                    <Clock className="w-5 h-5 text-corporate-500 dark:text-corporate-400 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-corporate-700 dark:text-corporate-300">
                      {t("auctionWillRunFor")} {formData.auctionDuration.days}{" "}
                      {t("days")}, {formData.auctionDuration.hours} {t("hours")}
                      , and {formData.auctionDuration.minutes} {t("minutes")}{" "}
                      {t("afterLaunch")}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-4">
          <button
            type="button"
            className="btn-primary btn-md active-scale"
            onClick={isEdit ? handleEditAuction : handleLaunchAuction} // use edit handler if editing
            disabled={isLaunched}
          >
            {isEdit ? "Save" : t("launchAuction")}
          </button>
        </div>

        {/* Launch Confirmation */}
        {isLaunched && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-md shadow-lg">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-corporate-500 dark:text-corporate-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-4">
                {isEdit ? "Auction Updated" : t("auctionLaunched")}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                {isEdit
                  ? "Your changes have been saved and sent for approval."
                  : t("auctionLaunchedSuccessfully")}
              </p>
              <div className="flex justify-center">
                <button
                  type="button"
                  className="btn-primary btn-md active-scale"
                  onClick={handleGoToDashboard}
                >
                  {t("goToDashboard")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuctionBuilderForward({
  initialData,
  isEdit = false, // ✅ define it here with a default
}: {
  initialData?: AuctionFormData;
  isEdit?: boolean; // optional boolean
}) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en");

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
  };

  return (
    <I18nProvider language={currentLanguage}>
      <AuctionWizardForwardContent
        language={currentLanguage}
        onLanguageChange={handleLanguageChange}
        initialData={initialData}
        isEdit={isEdit} // ✅ now it exists
      />
    </I18nProvider>
  );
}
