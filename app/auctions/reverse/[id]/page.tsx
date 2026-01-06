"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {  usePathname, useSearchParams } from "next/navigation";
import { DateTime } from "luxon";
import BidLeadersBoard from "@/app/reverseAuction-leaderboard/page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Users,
  Gavel,
  Heart,
  Share2,
  AlertCircle,
  CheckCircle,
  Star,
  MessageSquare,
  Package,
  FileText,
  Info,
  Timer,
  CircleStop,
  Tag,
  Hourglass,
  Send,
  PersonStanding,
  MapPin,
  ChevronRight,
  FileQuestion,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { LoginPrompt } from "@/components/login-prompt";
import { createClient } from "@supabase/supabase-js";
import LiveTimer from "@/app/livetimer/page";
import { useRouter } from "next/navigation";
import SupplierResponseCard from "@/app/SupplierResponseCard/page";
import SupplierResponseTable from "@/app/SupplierResponseCard/page";
import BidLeadersBoardSeller from "@/app/SupplierResponseCard/page";
import BidLeadersBoardSupplier from "@/app/SupplierResponseCard/page";
import AuctionCard from "@/app/auctions/page";
// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export type UploadedFile = {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  file: File;
};

interface Auction {
  id: string;
  productname?: string;
  title?: string;
  seller?: string;
  buyer?: string;
  currency?: string;
  // categoryid?: string;
  categories?: { handle: string };
  auctiontype: "forward" | "reverse";
  currentbid?: number;
  bidder_count?: number;
  bidincrementtype?: "fixed" | "percentage";
  minimumincrement?: number;
  startprice?: number;
  sellerAuctionCount?: number;
  targetprice?: number;
  scheduledstart?: string;
  auctionduration?: { days?: number; hours?: number; minutes?: number };
  bidders?: number;
  watchers?: number;
  productimages?: string[]; // Changed to string[] to match API response
  productdocuments?: string[]; // Changed to string[] to match API response
  productdescription?: string;
  specifications?: string;
  buyNowPrice?: number;
  participants?: string[];
  bidcount?: number;
  createdby?: string;
  timeLeft?: string;
  // questions?: {
  //   user: string;
  //   question: string;
  //   answer?: string;
  //   time: string;
  // }[];
  profiles?: {
    fname: string;
    location: string;
    role: string;
  };
  approved?: boolean;
  issilentauction?: boolean;
  currentbidder?: string;
  percent?: number;
  attributes?: string;
  sku?: string;
  brand?: string;
  model?: string;
  reserveprice?: number;
  questions?: {
    user: string;
    question: string;
    answer: string | null;
    question_time: string | null;
    answer_time: string | null;
  }[];
  auctionsubtype?: string;
  requireddocuments?: string;
  question_count?: number;
  evaluationcriteria: string;
}
interface BidWithDocuments {
  id?: string; // optional if not available yet
  user_id?: string;
  bidder: string;
  amount: number;
  time: string;
  productdocuments: { id: string; url: string }[];
}
interface Bid {
  id: string;
  auction_id: string;
  user_id: string;
  amount: number;
  created_at: string;
  productdocuments: { id: string; url: string }[];
}

interface UploadedDocument {
  name: string;
  files: UploadedFile[] | null;
}
// start and end time logic
function formatDateTime(date: Date): string {
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  const datePart = date.toLocaleDateString("en-US", dateOptions);
  const timePart = date.toLocaleTimeString("en-US", timeOptions);

  return `${datePart}, ${timePart}`;
}

function getEndDate(
  start: Date,
  duration: { days?: number; hours?: number; minutes?: number }
) {
  const end = new Date(start);
  if (duration.days) end.setDate(end.getDate() + duration.days);
  if (duration.hours) end.setHours(end.getHours() + duration.hours);
  if (duration.minutes) end.setMinutes(end.getMinutes() + duration.minutes);
  return end;
}
const DragDropUpload = ({
  onDocumentUpload,
  onImageUpload,
  setUploadedImages,
  requiredDocuments,
  uploadedDocuments,
  uploadedImages,
}: {
  onDocumentUpload: (index: number, files: UploadedFile[] | null) => void;
  onImageUpload: (files: UploadedFile[]) => void;
  setUploadedImages: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  requiredDocuments: { name: string }[];
  uploadedDocuments: UploadedDocument[];
  uploadedImages: UploadedFile[];
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const uploadFiles = useCallback(
    async (
      files: File[],
      folder: "public" | "documents" = "public"
    ): Promise<UploadedFile[]> => {
      if (!files.length) return [];

      setUploadState({ isUploading: true, progress: 0, error: null });
      const uploadedFiles: UploadedFile[] = [];

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setUploadState((prev) => ({
            ...prev,
            progress: Math.round((i / files.length) * 100),
          }));

          const fileName = `${Date.now()}_${file.name}`;
          const filePath = `${folder}/${fileName}`;
          const { data, error } = await supabase.storage
            .from("auctions")
            .upload(filePath, file, { upsert: true });

          if (error)
            throw new Error(`Error uploading ${file.name}: ${error.message}`);

          const { data: urlData } = supabase.storage
            .from("auctions")
            .getPublicUrl(filePath);

          uploadedFiles.push({
            id: data.path,
            name: file.name,
            url: urlData.publicUrl,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            file,
          });
        }

        setUploadState({ isUploading: false, progress: 100, error: null });
        return uploadedFiles;
      } catch (error) {
        console.error("Upload error:", error);
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          error:
            error instanceof Error ? error.message : "Unknown upload error",
        }));
        return uploadedFiles;
      }
    },
    []
  );

  const removeFile = useCallback(async (fileId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from("auctions")
        .remove([fileId]);
      if (error) throw new Error(error.message);
      return true;
    } catch (error) {
      console.error("Delete error:", error);
      setUploadState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Unknown deletion error",
      }));
      return false;
    }
  }, []);

  const handleFileChange = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    const uploadedFiles = await uploadFiles(files, "documents");
    onDocumentUpload(index, uploadedFiles.length > 0 ? uploadedFiles : null);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const uploadedFiles = await uploadFiles(files, "public");
    onImageUpload(uploadedFiles);
  };

  const removeDocumentFile = async (docIndex: number, fileIndex: number) => {
    const fileToRemove = uploadedDocuments[docIndex].files?.[fileIndex];
    if (fileToRemove && (await removeFile(fileToRemove.id))) {
      onDocumentUpload(
        docIndex,
        uploadedDocuments[docIndex].files?.filter((_, i) => i !== fileIndex) ||
          null
      );
    }
  };

  const removeImageFile = async (fileIndex: number) => {
    const fileToRemove = uploadedImages[fileIndex];
    if (fileToRemove && (await removeFile(fileToRemove.id))) {
      setUploadedImages((prev) => prev.filter((_, i) => i !== fileIndex));
    }
  };

  return (
    <div className="space-y-8 p-4">
      <div>
        <h4 className="text-sm font-semibold mb-2">Required Documents</h4>
        {requiredDocuments.map((doc, index) => (
          <div key={index} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {doc.name} <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                onChange={(e) => handleFileChange(index, e)}
                className="hidden"
                id={`document-upload-${index}`}
                disabled={uploadState.isUploading}
              />
              <label
                htmlFor={`document-upload-${index}`}
                className="text-xs cursor-pointer bg-gray-100 text-gray-600 border border-gray-400 rounded-md px-3 py-1.5 hover:bg-gray-200 transition-all shadow-sm"
              >
                {uploadState.isUploading ? "Uploading..." : "Select Files"}
              </label>

              {uploadedDocuments[index]?.files &&
                uploadedDocuments[index].files.length > 0 && (
                  <div className="ml-4 flex flex-wrap gap-2">
                    {uploadedDocuments[index].files.map((file, fileIndex) => (
                      <div
                        key={fileIndex}
                        className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded"
                      >
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          {file.name}
                        </span>
                        <button
                          onClick={() => removeDocumentFile(index, fileIndex)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              {!uploadedDocuments[index]?.files?.length && (
                <p className="text-xs text-red-600 ml-2">Required</p>
              )}
              {uploadState.error && (
                <p className="text-xs text-red-600 ml-2">{uploadState.error}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* <div>
        <h4 className="text-lg font-semibold mb-2">Upload Images</h4>
        <div className="mt-1">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
            id="image-upload"
            disabled={uploadState.isUploading}
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer bg-white text-green-600 border border-green-600 rounded-lg px-4 py-2 hover:bg-green-50 transition-all shadow-md"
          >
            {uploadState.isUploading ? "Uploading..." : "Select Images"}
          </label>
          {uploadedImages.length > 0 && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image.url}
                    alt={`Uploaded ${index + 1}`}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <button
                    onClick={() => removeImageFile(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          {uploadState.error && (
            <p className="text-sm text-red-600 mt-2">{uploadState.error}</p>
          )}
        </div>
      </div> */}
    </div>
  );
};

// Dummy calculateTimeLeft function
const calculateTimeLeft = (endDate: Date): string => {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  if (diff <= 0) return "Auction ended";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${days}d ${hours}h ${minutes}m`;
};

function renderKeyValueBlock(
  data: string | Record<string, any> | undefined,
  fallback: string
): React.ReactNode {
  try {
    let parsed: any[];
    if (typeof data === "string") {
      parsed = JSON.parse(data);
    } else if (typeof data === "object" && data !== null) {
      parsed = [data];
      console.warn("Data was an object, treated as single entry:", data);
    } else {
      return (
        <span className="text-gray-600 dark:text-gray-300 ml-4">
          {fallback}
        </span>
      );
    }
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return (
        <span className="text-gray-600 dark:text-gray-300 ml-4">
          {fallback}
        </span>
      );
    }
    return (
      <>
        {parsed.map((attr, index) =>
          attr.value ? (
            <div key={index} className="text-gray-600 dark:text-gray-300 ml-4">
              {attr.name}:{" "}
              {attr.type === "color" ? (
                <span
                  className="inline-block w-4 h-4 rounded-sm border ml-1"
                  style={{ backgroundColor: attr.value }}
                  title={attr.value}
                ></span>
              ) : (
                attr.value
              )}
            </div>
          ) : null
        )}
      </>
    );
  } catch (e) {
    console.error(
      "Failed to parse data in renderKeyValueBlock:",
      e,
      "Raw value:",
      data
    );
    return (
      <span className="text-gray-600 dark:text-gray-300 ml-4">
        Invalid data
      </span>
    );
  }
}

export default function ReverseAuctionDetailPage() {
  const params = useParams<{ id: string }>();
  const auctionId = params.id;
  const [bidAmount, setBidAmount] = useState("");
  const [watchlisted, setWatchlisted] = useState(false);
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bidHistory, setBidHistory] = useState<BidWithDocuments[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [bidError, setBidError] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedFile[]>([]);
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const isLoggedIn = !!user;
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [answerInput, setAnswerInput] = useState<{
    index: number;
    value: string;
  } | null>(null);
  const currencySymbol = useMemo(() => {
    const symbols: { [key: string]: string } = {
      USD: "$",
      INR: "₹",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      CAD: "CA$",
      AUD: "A$",
    };
    return symbols[auction?.currency ?? ""] ?? "";
  }, [auction?.currency]);
  const hasSubmittedBid =
    auction?.auctionsubtype === "sealed" &&
    auction?.participants?.includes(user?.id ?? "");
 const pathname = usePathname();
   const searchParams = useSearchParams();
     const currentPath =
    pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "")
  useEffect(() => {
    const fetchAuctionDetails = async () => {
      try {
        setLoading(true);

        const [auctionRes, bidRes] = await Promise.all([
          fetch(`/api/auctions/${auctionId}`),
          fetch(`/api/bids/${auctionId}`),
        ]);

        const json = await auctionRes.json();
        const bidJson = await bidRes.json();

        // Process Auction Data
        if (!json.success)
          throw new Error(json.error || "Failed to fetch auction");

        const participants = Array.isArray(json.data.participants)
          ? json.data.participants
          : [];
        const updatedAuction = { ...json.data, participants };

        let requiredDocs: { name: string }[] = [];
        if (updatedAuction.requireddocuments) {
          if (typeof updatedAuction.requireddocuments === "string") {
            try {
              requiredDocs = JSON.parse(updatedAuction.requireddocuments) as {
                name: string;
              }[];
            } catch (e) {
              console.error(
                "Failed to parse requireddocuments:",
                e,
                "Raw value:",
                updatedAuction.requireddocuments
              );
              requiredDocs = [];
            }
          } else if (
            typeof updatedAuction.requireddocuments === "object" &&
            updatedAuction.requireddocuments !== null
          ) {
            requiredDocs = updatedAuction.requireddocuments as {
              name: string;
            }[];
          }
        }
        setUploadedDocuments(
          requiredDocs.map((doc) => ({ name: doc.name, files: null }))
        );
        setAuction(updatedAuction);

        // Process Bid Data
        if (bidJson.success) {
          const bids = bidJson.data || [];
          const history = bids.map((bid: any) => {
            const bidderName = bid.profile
              ? `${bid.profile.fname || ""} ${bid.profile.lname || ""}`.trim() ||
                bid.profile.email ||
                bid.user_id
              : `User ${bid.user_id}`;

            return {
              bidder: bidderName,
              amount: bid.amount,
              time: new Date(bid.created_at).toLocaleString("en-US", {
                hour12: true,
                hour: "2-digit",
                minute: "2-digit",
              }),
              productdocuments: bid.productdocuments || [],
            };
          });
          setBidHistory(history);
        } else {
          console.log("No bid data available from API:", bidJson);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctionDetails();
  }, [auctionId]);

  const handleDocumentUpload = (
    index: number,
    files: UploadedFile[] | null
  ) => {
    setUploadedDocuments((prev) =>
      prev.map((doc, i) =>
        i === index ? { ...doc, files: files || null } : doc
      )
    );
  };

  const handleImageUpload = (files: UploadedFile[]) => {
    setUploadedImages((prev) => [...prev, ...files]);
  };

  const handleSubmitQuestion = async () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      alert("Please log in to ask a question.");
      return;
    }

    if (!newQuestion.trim()) {
      alert("Please enter a question.");
      return;
    }

    if (
      auction?.participants &&
      !auction.participants.some((p) => user?.id && p.includes(user!.id!))
    ) {
      alert("Only registered participants can ask questions.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("action", "postQuestion");
      formData.append("user_id", user!.id); // Non-null assertion since authenticated
      formData.append("user_email", user!.email!); // Non-null assertion since authenticated
      formData.append("question", newQuestion);

      // Debug: Log FormData entries
      for (let [key, value] of formData.entries()) {
        console.log("FormData Entry:", key, value);
      }

      const res = await fetch(`/api/auctions/${auctionId}`, {
        method: "PUT",
        body: formData,
      });
      const json = await res.json();
      if (!json.success)
        throw new Error(json.error || "Failed to submit question");

      const updatedAuction: Auction = {
        ...auction!,
        questions: json.data.questions,
        question_count: json.data.question_count,
      };

      setAuction(updatedAuction);
      setNewQuestion("");
      alert("Question submitted successfully!");
    } catch (err) {
      console.error("Question submission error:", err);
      alert(
        err instanceof Error
          ? err.message
          : "An error occurred while submitting question"
      );
    }
  };

  const handleSubmitAnswer = async (index: number) => {
    if (!isAuthenticated || user?.email !== auction?.createdby) {
      alert("Only the auction creator can answer questions.");
      return;
    }

    if (!answerInput || !answerInput.value.trim()) {
      alert("Please enter an answer.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("action", "answerQuestion");
      formData.append("user_email", user!.email!); // Non-null assertion since authenticated
      formData.append("questionIndex", answerInput.index.toString());
      formData.append("answer", answerInput.value);

      const res = await fetch(`/api/auctions/${auctionId}`, {
        method: "PUT",
        body: formData,
      });
      const json = await res.json();
      if (!json.success)
        throw new Error(json.error || "Failed to submit answer");

      const updatedAuction: Auction = {
        ...auction!,
        questions: json.data.questions,
      };

      setAuction(updatedAuction);
      setAnswerInput(null);
      alert("Answer submitted successfully!");
    } catch (err) {
      console.error("Answer submission error:", err);
      alert(
        err instanceof Error
          ? err.message
          : "An error occurred while submitting answer"
      );
    }
  };

  const handlePlaceBid = async () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      alert("Please log in to place a bid.");
      return;
    }

    if (!user?.role || user.role == "both") {
      alert(
        "Only buyers and seller can place bids. Please update your account type."
      );
      return;
    }

    const amount = Number(bidAmount);
    if (isNaN(amount)) {
      alert("Please enter a valid bid amount.");
      return;
    }

    if (!auction) {
      alert("Auction data is not available.");
      return;
    }

    const bidCount = auction.bidcount ?? 0;
    const targetPrice = auction.targetprice ?? 0;
    const isSealed = auction.auctionsubtype === "sealed";
    const isSilent =
      auction.issilentauction || auction.auctionsubtype === "silent";
    const isReverse = auction.auctiontype === "reverse";
    const incrementType = auction.bidincrementtype ?? "fixed";
    const userId = user?.id ?? "";
    const userEmail = user?.email ?? "";

    // 🔒 Document check
    if (
      !isRankedOrStandard &&
      uploadedDocuments.some((doc) => !doc.files || doc.files.length === 0)
    ) {
      alert(
        "Please upload at least one file for all required documents before placing a bid."
      );
      return;
    }

    // 🚫 Sealed auction: reject if user already participated
    // if (isSealed && auction.participants?.includes(userId)) {
    //   alert(
    //     "You have already submitted a bid for this auction and cannot bid again."
    //   );
    //   return;
    // }

    // ❌ Reject any bid < target price
    // if (!(isRankedOrStandard && isReverse) && amount < targetPrice) {
    //   alert(`Bid must be at least $${targetPrice.toLocaleString()}.`);
    //   return;
    // }

    const currentBid = auction.currentbid ?? targetPrice;

    // Calculate increment/decrement
    const incrementValue =
      incrementType === "percentage" && auction.minimumincrement
        ? (currentBid * auction.minimumincrement) / 100
        : auction.minimumincrement ?? 0;

    const expectedBid = currentBid - incrementValue;

    const isSameAmount = (a: number, b: number, epsilon = 0.01) =>
      Math.abs(a - b) < epsilon;

    // ✅ Sealed auction: bid is valid after previous checks
    // ✅ First bid: any bid ≥ targetPrice allowed
    const bidAmountNumber = Number(amount);
    const minInc = currentBid - minDecrement;

    // Reset error before validation
    setBidError("");

    if (!isSealed && isRankedOrStandard && isReverse) {
      if (minDecrement === 0) {
        // Free bidding mode
        if (bidCount === 0) {
          // First bid: can equal startingBid
          if (bidAmountNumber > startingBid) {
            setBidError(
              `Bid must be less than or equal to $${startingBid.toLocaleString()}.`
            );
            return; // stop submission
          } else {
            setBidError(""); // valid
          }
        } else {
          // Subsequent bids: must be strictly less than currentBid
          if (bidAmountNumber >= currentBid) {
            setBidError(
              `Bid must be less than the current bid of $${currentBid.toLocaleString()}.`
            );
            return; // stop submission
          } else {
            setBidError(""); // valid
          }
        }
      } else {
        // Normal decrement validation
        const decrement =
          bidCount === 0
            ? startingBid - bidAmountNumber
            : currentBid - bidAmountNumber;

        if (
          bidAmountNumber < (bidCount === 0 ? startingBid + 1 : currentBid) &&
          (minDecrement === 0 || decrement % minDecrement === 0)
        ) {
          setBidError(""); // valid
        } else {
          setBidError(
            `Your bid must be less than the current bid and follow the minimum decrement of $${minDecrement}.`
          );
          return; // stop submission
        }
      }
    }

    // ✅ All validations passed, place bid
    try {
      console.log("Placing bid:", { auctionId, userId, amount });

      const formData = new FormData();
      formData.append("action", "bid");
      formData.append("user_id", userId);
      formData.append("user_email", userEmail);
      formData.append("amount", amount.toString());
      formData.append("created_at", new Date().toISOString());

      uploadedDocuments.forEach((doc, index) => {
        if (doc.files) {
          doc.files.forEach((file) => {
            formData.append(
              `documents[${index}]`,
              JSON.stringify({ id: file.id, url: file.url })
            );
          });
        }
      });

      uploadedImages.forEach((image, index) => {
        formData.append(
          `images[${index}]`,
          JSON.stringify({ id: image.id, url: image.url })
        );
      });

      const bidRes = await fetch(`/api/auctions/${auctionId}`, {
        method: "PUT",
        body: formData,
      });

      const bidJson = await bidRes.json();
      if (!bidJson.success)
        throw new Error(bidJson.error || "Failed to record bid");

      // Refresh auction
      const auctionRes = await fetch(`/api/auctions/${auctionId}`);
      const auctionJson = await auctionRes.json();
      if (!auctionJson.success)
        throw new Error(auctionJson.error || "Failed to fetch updated auction");

      const start = new Date(auctionJson.data.scheduledstart || "");
      const duration = auctionJson.data.auctionduration
        ? ((d) =>
            (d.days || 0) * 86400 +
            (d.hours || 0) * 3600 +
            (d.minutes || 0) * 60)(auctionJson.data.auctionduration)
        : 0;
      const end = new Date(start.getTime() + duration * 1000);
      const timeLeft = calculateTimeLeft(end);

      setAuction({ ...auctionJson.data, timeLeft });

      // Refetch bid history after successful bid
      const bidResUpdated = await fetch(`/api/bids/${auctionId}`);
      const bidJsonUpdated = await bidResUpdated.json();
      if (bidJsonUpdated.success) {
        const bids = bidJsonUpdated.data || [];
        console.log("Fetched Updated Bids (Raw):", bids);
        const historyPromises = bids.map(async (bid: Bid) => {
          const profileRes = await fetch(`/api/profiles/${bid.user_id}`);
          const profileJson = await profileRes.json();
          console.log(
            "Profile API Response for user_id",
            bid.user_id,
            " (Raw):",
            profileJson
          );
          const bidderName = profileJson.success
            ? `${profileJson.data.fname || ""} ${
                profileJson.data.lname || ""
              }`.trim() ||
              profileJson.data.email ||
              bid.user_id
            : `User ${bid.user_id} (Profile not found)`;
          return {
            bidder: bidderName,
            amount: bid.amount,
            time: new Date(bid.created_at).toLocaleString("en-US", {
              hour12: true,
              hour: "2-digit",
              minute: "2-digit",
            }),
            productdocuments: bid.productdocuments || [],
          };
        });
        const history = await Promise.all(historyPromises);
        console.log("Processed Updated Bid History (Raw):", history);
        setBidHistory(history);
      }

      setBidAmount("");
      setUploadedDocuments(
        uploadedDocuments.map((doc) => ({ ...doc, files: null }))
      );
      setUploadedImages([]);
      alert(`Bid of $${amount.toLocaleString()} placed successfully!`);
    } catch (err) {
      console.error("Bid placement error:", err);
      alert(
        err instanceof Error
          ? err.message
          : "An error occurred while placing bid"
      );
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    if (!user?.role || (user.role !== "buyer" && user.role !== "both")) {
      alert("Only buyers can purchase items. Please update your account type.");
      return;
    }

    console.log("Buy now clicked");
    alert(
      `Item purchased for $${auction?.buyNowPrice?.toLocaleString() || "N/A"}!`
    );
  };

  const handleWatchlist = () => {
    setWatchlisted(!watchlisted);
    console.log("Watchlist toggled:", !watchlisted);
  };

  const getMinimumBid = () => {
    if (!auction) return 0;

    const hasBids = (auction.bidder_count || 0) > 0;

    if (hasBids) {
      return (auction.currentbid || 0) + (auction.minimumincrement || 0);
    }

    return auction.startprice || 0;
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (auction?.productimages?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === (auction?.productimages?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  if (loading) return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8 min-h-[1200px]">
          {/* Left column skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image skeleton */}
            <div className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg h-96 w-full"></div>
            {/* Content skeleton */}
            <div className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg h-64 w-full"></div>
            <div className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg h-48 w-full"></div>
          </div>
          {/* Right column skeleton */}
          <div className="space-y-6">
            <div className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg h-96 w-full"></div>
            <div className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg h-48 w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
  if (error)
    return <div className="text-center py-20 text-red-600">{error}</div>;
  if (!auction)
    return <div className="text-center py-20">Auction not found</div>;

  const now = new Date();
  const start = new Date(auction.scheduledstart || now);
  const duration = auction.auctionduration
    ? ((d) =>
        (d.days || 0) * 24 * 60 * 60 +
        (d.hours || 0) * 60 * 60 +
        (d.minutes || 0) * 60)(auction.auctionduration)
    : 0;
  const end = new Date(start.getTime() + duration * 1000);
  const isAuctionNotStarted = now < start;
  const isAuctionEnded = now > end;
  const isSameAmount = (a: number, b: number, epsilon = 0.01) =>
    Math.abs(a - b) < epsilon;

  const expectedBid = (() => {
    if (auction?.bidcount && auction.bidcount > 0) {
      const current = auction.currentbid || 0;

      if (auction.bidincrementtype === "fixed" && auction.minimumincrement) {
        return current - auction.minimumincrement;
      } else if (auction.bidincrementtype === "percentage" && auction.percent) {
        const decrement = current * (auction.percent / 100);
        return current - decrement;
      }
    }
    return auction?.targetprice || 0;
  })();

  const isRankedOrStandard =
    auction?.auctionsubtype === "ranked" ||
    auction?.auctionsubtype === "standard";

  const minDecrement = auction?.minimumincrement ?? 0;
  const startingBid = auction?.startprice ?? 0;
  const currentBid = auction?.currentbid ?? startingBid;
  const targetPrice = auction.targetprice ?? 0;
  const isReverse = auction.auctiontype === "reverse";
  const bidAmountNumber = Number(bidAmount);
  const bidCount = auction?.bidcount ?? 0;

  // Check if bid is valid for ranked/standard reverse auction
  // Check if bid is valid for ranked/standard reverse auction
  let isValidDecrementBid = true;
  if (isRankedOrStandard && isReverse) {
    if (isRankedOrStandard && isReverse) {
      if (minDecrement === 0) {
        // Free bidding
        if (bidCount === 0) {
          // First bid: between startPrice and any positive number
          isValidDecrementBid =
            bidAmountNumber > 0 && bidAmountNumber <= startingBid;
        } else {
          // Subsequent bids: less than current bid but still positive
          isValidDecrementBid =
            bidAmountNumber > 0 && bidAmountNumber < currentBid;
        }
      }
    } else {
      // Normal decrement rule
      if (bidCount === 0) {
        // First bid: between startPrice and any lower amount, multiple of minDecrement
        const decrement = startingBid - bidAmountNumber;
        isValidDecrementBid =

        
          bidAmountNumber <= startingBid &&
          (minDecrement === 0 || decrement % minDecrement === 0);
      } else {
        // Subsequent bids: less than currentBid, multiple of minDecrement
        const decrement = currentBid - minDecrement;
        isValidDecrementBid =
          bidAmountNumber < currentBid &&
          (minDecrement === 0 || decrement % minDecrement === 0);
      }
    }
  }
  const isButtonDisabled =
    !bidAmount ||
    isNaN(bidAmountNumber) ||
    bidAmountNumber < 0 ||
    user?.email === auction?.createdby ||
    isAuctionNotStarted ||
    isAuctionEnded ||
    (auction?.auctionsubtype === "sealed" &&
      auction?.participants?.includes(user?.id ?? "")) ||
    (!isRankedOrStandard &&
      uploadedDocuments.some((doc) => !doc.files || doc.files.length === 0));

  console.log("isButtonDisabled:", isButtonDisabled, {
    bidAmount,
    getMinimumBid: getMinimumBid(),
    targetPrice: auction?.targetprice,
    currentBid: auction?.currentbid,
    userEmail: user?.email,
    creator: auction?.createdby,
    isAuctionNotStarted,
    isAuctionEnded,
    documents: uploadedDocuments,
  });
  function renderKeyValueBlock(
    data: string | Record<string, any> | undefined,
    fallback: string
  ): React.ReactNode {
    try {
      const parsed: Record<string, any> =
        typeof data === "string" ? JSON.parse(data) : data ?? {};

      const entries = Object.entries(parsed);

      if (entries.length === 0) {
        return (
          <span className="text-gray-600 dark:text-gray-300 ml-4">
            {fallback}
          </span>
        );
      }

      return (
        <>
          {entries.map(([key, value], index) =>
            value !== undefined && value !== null && value !== "" ? (
              <div key={key} className="text-gray-600 dark:text-gray-300">
                <span className="text-xs">• {formatKey(key)}:</span>{" "}
                <span className="text-xs text-gray-800 dark:text-gray-200">
                  {value}
                </span>
              </div>
            ) : null
          )}
        </>
      );
    } catch (error) {
      console.error("Error parsing evaluation criteria:", error);
      return (
        <span className="text-red-500 ml-4">
          Invalid evaluation criteria data
        </span>
      );
    }
  }

  // Helper function to format keys to human-readable form
  function formatKey(key: string): string {
    switch (key) {
      case "technicalweightage":
        return "Technical Weightage";
      case "commercialweightage":
        return "Commercial Weightage";
      case "contractduration":
        return "Contract Duration";
      case "paymentterms":
        return "Payment Terms";
      case "additionalnotes":
        return "Additional Notes";
      default:
        // Capitalize the first letter and replace camelCase with spaces
        return key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
    }
  }

  return (
    <div className="min-h-screen py-20">
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 mb-4 -mt-4">
        <nav className="flex items-center text-sm text-gray-600 space-x-1">
          <button
            onClick={() => router.push("/auctions")}
            className="flex items-center space-x-1 text-gray-400 font-medium hover:text-gray-800 transition-colors"
          >
            <span>All Auctions</span>
          </button>
          <ChevronRight className="w-4 h-4 text-gray-600" />
          <span className="text-gray-800 font-medium">Auction Details</span>
        </nav>
      </div>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex mt-2 mb-2">
              <Gavel className="w-5 h-5 text-blue-600 animate-bounce" />
              <p className="text-xl font-semibold text-gray-900 dark:text-white ml-2">
                {auction.productname || "Auction Item"}
              </p>
            </div>
            <Card className="shadow-sm border rounded-lg">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <img
                    src="/images/law.png"
                    alt="Supplier Icon"
                    className="w-5 h-5 animate-bounce" // small size
                  />
                  Auction Information
                </h2>{" "}
                <div className="grid grid-cols-3 md:grid-cols-3 gap-y-2 text-sm">
                  <p>
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                      Auction Type:
                    </span>{" "}
                    <span className="text-gray-600 dark:text-gray-300 font-semibold text-sm">
                      {auction.auctiontype === "reverse"
                        ? "Reverse Auction"
                        : "Forward Auction"}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-xs text-gray-800  dark:text-gray-200">
                      Auction Format:
                    </span>{" "}
                    <span className="text-gray-600 text-sm font-semibold dark:text-gray-300 capitalize">
                      {auction.auctionsubtype}
                    </span>
                  </p>
                  {auction.scheduledstart && auction.auctionduration && (
                    <p>
                      <span className="font-medium text-xs text-gray-800 dark:text-gray-200">
                        End Date:
                      </span>{" "}
                      <span className="text-gray-600 text-sm font-semibold dark:text-gray-300 capitalize">
                        {formatDateTime(
                          getEndDate(
                            new Date(auction.scheduledstart),
                            auction.auctionduration
                          )
                        )}
                      </span>
                    </p>
                  )}
                  {auction.auctionsubtype != "sealed" && (
                    <p>
                      <span className="font-medium text-xs text-gray-800 dark:text-gray-200">
                        Starting Bid Price:
                      </span>{" "}
                      <span className="text-gray-600 text-sm font-semibold dark:text-gray-300">
                        {currencySymbol}
                        {auction.startprice ?? 0}
                      </span>
                    </p>
                  )}
                  {auction.auctionsubtype != "sealed" && (
                    <p>
                      <span className="font-medium text-xs text-gray-800 dark:text-gray-200">
                        Minimum Decrement:
                      </span>{" "}
                      <span className="text-gray-600 font-semibold text-sm dark:text-gray-300">
                        {currencySymbol}
                        {auction.minimumincrement === 0 ||
                        auction.minimumincrement == null
                          ? "N/A"
                          : auction.minimumincrement}
                      </span>
                    </p>
                  )}
                  <p>
                    <span className="font-medium text-xs text-gray-800 dark:text-gray-200 ">
                      Target Price:
                    </span>{" "}
                    <span className="text-gray-600 text-sm font-semibold dark:text-gray-300">
                      {auction.targetprice
                        ? `${currencySymbol}${auction.targetprice.toLocaleString()}`
                        : "—"}
                    </span>
                  </p>
                  {/* <p>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      Reserve Price:
                    </span>{" "}
                    <span className="text-gray-600 dark:text-gray-300">
                      {auction.reserveprice
                        ? `$${auction.reserveprice.toLocaleString()}`
                        : "—"}
                    </span>
                  </p> */}
                  {auction.auctionsubtype != "sealed" && (
                    <p className="">
                      <span className="font-medium text-xs text-gray-800 dark:text-gray-200">
                        Current Bid: <span> </span>
                      </span>
                      {auction.auctionsubtype === "sealed" ||
                      auction.auctionsubtype === "silent" ? (
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Bids are confidential until opening
                        </span>
                      ) : (auction.bidder_count || 0) > 0 ? (
                        <span className="text-green-600 font-semibold text-sm">
                          {currencySymbol}
                          {auction.currentbid?.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-600 text-sm dark:text-gray-300">
                          &nbsp;No Bids Placed
                        </span>
                      )}
                    </p>
                  )}
                  <p>
                    <span className="font-medium text-gray-800 text-xs dark:text-gray-200">
                      Total Bidders:
                    </span>{" "}
                    <span className="text-gray-600 text-sm font-semibold dark:text-gray-300">
                      {auction.bidder_count ?? 0}
                    </span>
                  </p>

                  <p className="flex items-center text-xs">
                    <span className="font-medium text-gray-800 text-xs dark:text-gray-200 mr-1">
                      Time Remaining:
                    </span>
                    <span
                      className={
                        auction.scheduledstart &&
                        auction.auctionduration &&
                        !isAuctionEnded
                          ? "text-red-600 font-semibold text-xs"
                          : "text-gray-500 font-semibold text-xs"
                      }
                    >
                      {auction.scheduledstart &&
                      auction.auctionduration &&
                      !isAuctionEnded ? (
                        <LiveTimer
                          className="text-sm font-semibold"
                          startTime={auction.scheduledstart}
                          duration={auction.auctionduration}
                        />
                      ) : (
                        "Ended"
                      )}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
         
            {/* description */}
            {auction.auctionsubtype != "sealed" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600 animate-bounce" />
                    Product Description
                  </h2>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-line text-xs">
                      {auction.productdescription || "No description available"}
                    </p>
                     <div className="space-6 pb-2">
                      {auction.productdocuments &&
                        auction.productdocuments.length > 0 && (
                          <div className="flex flex-col gap-2">
                            {/* Title */}
                            <p className="text-sm font-semibold text-gray-800 mt-2">
                              Reference Documents:
                            </p>

                            {/* Documents inline */}
                            {auction.productdocuments.map((doc, index) => {
                              // Extract file name from URL
                              const fileName = decodeURIComponent(
                                doc.split("/").pop() || `Document ${index + 1}`
                              );
                              const trimmedName = fileName.includes("_")
                                ? fileName.split("_").slice(1).join("_")
                                : fileName;
                              return (
                                <a
                                  key={index}
                                  href={doc}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-2 py-1 w-max bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                                >
                                  <svg
                                    className="w-4 h-4 text-pink-500"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path d="M6 2h9l6 6v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h12V9h-5V4H6zm2 2h3v4H8V6zm4 0h3v2h-3V6zm0 3h3v2h-3V9zm-4 0h3v2H8V9z" />
                                    <path d="M10 12h4v2h-4v-2zm0 3h4v2h-4v-2z" />
                                  </svg>
                                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {trimmedName}
                                  </span>
                                </a>
                              );
                            })}
                          </div>
                        )}
                    </div>
                    {auction.requireddocuments &&
                      auction.auctionsubtype !== "ranked" &&
                      auction.auctionsubtype !== "standard" && (
                        <div className="mt-2">
                          <h2 className="text-sm font-semibold mb-4">
                            Required Documents:
                          </h2>
                          <ul className="list-disc ml-5 mt-2 text-gray-700 text-xs">
                            {(() => {
                              let docs: { name: string }[] = [];
                              if (
                                typeof auction.requireddocuments === "string"
                              ) {
                                try {
                                  docs = JSON.parse(auction.requireddocuments);
                                } catch {
                                  return (
                                    <li className="text-red-500">
                                      Invalid document list
                                    </li>
                                  );
                                }
                              } else if (
                                Array.isArray(auction.requireddocuments)
                              ) {
                                docs = auction.requireddocuments;
                              }
                              return docs.map((doc, index) => (
                                <li key={index}>{doc.name}</li>
                              ));
                            })()}
                          </ul>
                          <p className="mt-2 text-xs text-red-500">
                            Please upload all required documents in the
                            Documentation tab.
                          </p>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            )}
            {auction.auctionsubtype === "sealed" && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <img
                      src="/images/trait.png"
                      alt="Supplier Icon"
                      className="w-5 h-5 animate-bounce" // small size
                    />
                    Requirement Details
                  </h2>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-line text-xs">
                      <span className="font-semibold text-sm">Title:</span>{" "}
                      {auction.productname || "N/a"}
                    </p>
                    <p className="whitespace-pre-line text-xs">
                      <span className="block font-semibold text-sm mt-2">
                        Description:
                      </span>
                      {auction.productdescription || "No description available"}
                    </p>
                    <div className="space-6 pb-2">
                      {auction.productdocuments &&
                        auction.productdocuments.length > 0 && (
                          <div className="flex flex-col gap-2">
                            {/* Title */}
                            <p className="text-sm font-semibold text-gray-800 mt-2">
                              Reference Documents:
                            </p>

                            {/* Documents inline */}
                            {auction.productdocuments.map((doc, index) => {
                              // Extract file name from URL
                              const fileName = decodeURIComponent(
                                doc.split("/").pop() || `Document ${index + 1}`
                              );
                              const trimmedName = fileName.includes("_")
                                ? fileName.split("_").slice(1).join("_")
                                : fileName;
                              return (
                                <a
                                  key={index}
                                  href={doc}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-2 py-1 w-max bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                                >
                                  <svg
                                    className="w-4 h-4 text-pink-500"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path d="M6 2h9l6 6v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h12V9h-5V4H6zm2 2h3v4H8V6zm4 0h3v2h-3V6zm0 3h3v2h-3V9zm-4 0h3v2H8V9z" />
                                    <path d="M10 12h4v2h-4v-2zm0 3h4v2h-4v-2z" />
                                  </svg>
                                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {trimmedName}
                                  </span>
                                </a>
                              );
                            })}
                          </div>
                        )}
                    </div>
                    {auction.requireddocuments && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-1 gap-6">
                        <div>
                          <h2 className="text-sm font-semibold mb-2">
                            Required Documents:
                          </h2>
                          <ul className="list-disc ml-5 mt-1 text-gray-700 text-xs">
                            {(() => {
                              let docs: { name: string }[] = [];
                              if (
                                typeof auction.requireddocuments === "string"
                              ) {
                                try {
                                  docs = JSON.parse(auction.requireddocuments);
                                } catch {
                                  return (
                                    <li className="text-red-500">
                                      Invalid document list
                                    </li>
                                  );
                                }
                              } else if (
                                Array.isArray(auction.requireddocuments)
                              ) {
                                docs = auction.requireddocuments;
                              }
                              if (docs.length === 0) {
                                return <li>No documents available</li>;
                              }
                              return docs.map((doc, index) => (
                                <li key={index}>{doc.name}</li>
                              ));
                            })()}
                          </ul>
                        </div>

                        {auction.evaluationcriteria &&
                          Object.keys(auction.evaluationcriteria).length >
                            0 && (
                            <div>
                              <h2 className="text-sm font-semibold">
                                Evaluation Criteria:
                              </h2>
                              {renderKeyValueBlock(
                                auction.evaluationcriteria,
                                "No evaluation criteria available"
                              )}
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            {auction.auctionsubtype != "sealed" && (
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    {/* Title with Icon */}
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-600 animate-bounce" />
                      Product Specification
                    </h3>

                    <div className="divide-y text-xs">
                      {/* SKU */}
                      <div className="grid grid-cols-2 py-2">
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          SKU
                        </span>
                        <span className="text-gray-600 dark:text-gray-300">
                          {auction.sku || "N/A"}
                        </span>
                      </div>

                      {/* Reserve Price */}
                      <div className="grid grid-cols-2 py-2">
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          Reserve Price
                        </span>
                        <span className="text-gray-600 dark:text-gray-300">
                          {auction.reserveprice || "N/A"}
                        </span>
                      </div>

                      {/* Attributes */}

                      {auction.attributes?.length > 0 &&
                        auction.attributes.map((attr, index) =>
                          attr.value ? ( // only render if value exists
                            <div key={index} className="grid grid-cols-2 py-2">
                              <span className="font-medium text-gray-800 dark:text-gray-200">
                                {attr.name}
                              </span>
                              <span className="text-gray-600 dark:text-gray-300">
                                {attr.value}
                              </span>
                            </div>
                          ) : null
                        )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          <div className="space-y-6">
            <Card className="hover-lift transition-smooth">
              <CardContent className="p-0 relative">
                <Image
                  src={
                    auction.productimages?.[currentImageIndex] ||
                    "/placeholder.svg"
                  } // Updated to use the URL directly
                  alt={auction.productname || auction.title || "Auction Item"}
                  width={600}
                  height={400}
                  className="w-full h-60 object-cover rounded-t-lg transition-smooth hover:scale-105"
                  priority
                />
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {`${currentImageIndex + 1}/${
                    auction.productimages?.length || 1
                  }`}
                </div>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-smooth"
                >
                  ←
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-smooth"
                >
                  →
                </button>
              </CardContent>
            </Card>
            {/* right sidebar product detals */}
            {!isLoggedIn ? (
  <div className="mt-3 text-center">
    {isAuctionEnded ? (
      <p className="text-sm text-red-600 text-left">Auction has ended</p>
    ) : (
      <Button
        className="w-full text-sm bg-gray-500 text-white hover:bg-gray-600 transition-smooth hover-lift transform-3d"
        onClick={() =>
          router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
        }
      >
        Login to place bid
      </Button>
    )}
  </div>
) : (
            <>
            {isLoggedIn &&
              user?.id &&
              auctionId &&
              user?.role === "seller" &&
              auction?.auctiontype === "reverse" &&
              auction?.seller !== user.id && (
                <div className="space-y-6">
                  <Card>
                    <div className="space-y-3 mb-5 px-4 gap-2">
                      {!isLoggedIn ? (
                        <div className="mt-3 text-center">
                          {isAuctionEnded ? (
                            <p className="text-sm text-red-600 text-left">
                              Auction has ended
                            </p>
                          ) : (
                            <Button
                              className="w-full text-sm bg-gray-500 text-white hover:bg-gray-600 transition-smooth hover-lift transform-3d"
                              onClick={() => router.push("/login")}
                            >
                              Login to place bid
                            </Button>
                          )}
                        </div>
                      ) : auction.approved === false ? (
                        <p className="text-sm text-red-600 text-left">
                          Auction is pending approval from admin
                        </p>
                      ) : (
                        // The rest of your normal auction content for logged-in and approved users
                        <div>{/* Auction bidding form or other content */}</div>
                      )}
                      {isLoggedIn &&
                        !isAuctionEnded &&
                        user?.role == "seller" && (
                          <>
                            {auction?.auctionsubtype === "sealed" &&
                            auction?.participants?.includes(user?.id ?? "") ? (
                              // ✅ Show green message with tick
                              <div className="flex items-start gap-2 p-4 bg-green-100 border border-green-300 rounded-lg shadow-sm">
                                <svg
                                  className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <p className="text-green-800 text-sm font-medium">
                                  You have already submitted a bid for this
                                  auction and cannot bid again.
                                </p>
                              </div>
                            ) : (
                              <CardContent className="space-y-4">
                                <div className="space-y-3">
                                  <div className="relative">
                                    <label className="text-lg font-semibold flex items-center gap-2">
                                      <Send className="w-4 h-4 text-blue-500 animate-bounce" />
                                      Submit Proposal
                                    </label>
                                    {!hasSubmittedBid && (
                                      <Input
                                        type="number"
                                        // placeholder={`Minimum: $${getMinimumBid().toLocaleString()}`}
                                        placeholder={"Enter Bid Amount"}
                                        value={bidAmount}
                                        onChange={(e) =>
                                          setBidAmount(e.target.value)
                                        }
                                        className="mt-1 transition-smooth"
                                        disabled={
                                          isAuctionNotStarted || isAuctionEnded
                                        }
                                      />
                                    )}
                                  </div>
                                  <div
                                    style={{
                                      width: "100%",
                                      display: "block",
                                      position: "relative",
                                      zIndex: 1,
                                      pointerEvents: "auto",
                                    }}
                                  >
                                    {auction.auctionsubtype !== "sealed" && (
                                      <Button
                                        className="w-full transition-smooth hover-lift transform-3d"
                                        onClick={handlePlaceBid}
                                        disabled={isButtonDisabled}
                                        style={{
                                          display: "block",
                                          width: "100%",
                                          padding: "0.5rem",
                                          boxSizing: "border-box",
                                          position: "relative",
                                          zIndex: 1,
                                          pointerEvents: "auto",
                                        }}
                                      >
                                        Place Bid
                                      </Button>
                                    )}
                                    {(!isAuctionNotStarted ||
                                      !isAuctionEnded) && (
                                      <p className="text-sm text-red-600 mt-2">
                                        {bidError}
                                      </p>
                                    )}
                                    {(isAuctionNotStarted ||
                                      isAuctionEnded) && (
                                      <p className="text-sm text-red-600 mt-2">
                                        {isAuctionNotStarted
                                          ? "Auction has not started yet"
                                          : "Auction has ended"}
                                      </p>
                                    )}
                                    {auction.auctionsubtype !== "ranked" &&
                                      auction.auctionsubtype !== "standard" &&
                                      !uploadedDocuments.some(
                                        (doc) =>
                                          doc.files && doc.files.length > 0
                                      ) &&
                                      !auction?.participants?.includes(
                                        user?.id ?? ""
                                      ) && ( // <-- hide after bid placed
                                        <p className="text-xs text-red-600 mt-2">
                                          Upload all required document to submit
                                          proposal.
                                        </p>
                                      )}
                                  </div>
                                  {auction.buyNowPrice && (
                                    <>
                                      <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                                        or
                                      </div>
                                      <Button
                                        variant="outline"
                                        className="w-full transition-smooth hover-lift"
                                        onClick={handleBuyNow}
                                        disabled={
                                          isAuctionNotStarted || isAuctionEnded
                                        }
                                      >
                                        Buy Now - $
                                        {auction.buyNowPrice.toLocaleString()}
                                      </Button>
                                    </>
                                  )}
                                  {auction.auctionsubtype !== "ranked" &&
                                    auction.auctionsubtype !== "standard" &&
                                    !(
                                      auction?.auctionsubtype === "sealed" &&
                                      auction?.participants?.includes(
                                        user?.id ?? ""
                                      )
                                    ) && (
                                      <div className="pb-4">
                                        <Card>
                                          {/* hide "No documentation available" too */}
                                          {auction.requireddocuments && (
                                            <DragDropUpload
                                              onDocumentUpload={
                                                handleDocumentUpload
                                              }
                                              onImageUpload={handleImageUpload}
                                              setUploadedImages={
                                                setUploadedImages
                                              }
                                              requiredDocuments={(() => {
                                                let docs: { name: string }[] =
                                                  [];
                                                if (
                                                  typeof auction.requireddocuments ===
                                                  "string"
                                                ) {
                                                  try {
                                                    docs = JSON.parse(
                                                      auction.requireddocuments
                                                    );
                                                  } catch {
                                                    docs = [];
                                                  }
                                                } else if (
                                                  Array.isArray(
                                                    auction.requireddocuments
                                                  )
                                                ) {
                                                  docs =
                                                    auction.requireddocuments;
                                                }
                                                return docs;
                                              })()}
                                              uploadedDocuments={
                                                uploadedDocuments
                                              }
                                              uploadedImages={uploadedImages}
                                            />
                                          )}
                                        </Card>
                                      </div>
                                    )}

                                  {auction?.auctionsubtype === "sealed" &&
                                    !auction?.participants?.includes(
                                      user?.id ?? ""
                                    ) && ( // <-- hide if bid already placed
                                      <Button
                                        className="w-full transition-smooth hover-lift transform-3d"
                                        onClick={handlePlaceBid}
                                        disabled={isButtonDisabled}
                                        style={{
                                          display: "block",
                                          width: "100%",
                                          padding: "0.5rem",
                                          boxSizing: "border-box",
                                          position: "relative",
                                          zIndex: 1,
                                          pointerEvents: "auto",
                                        }}
                                      >
                                        Place Bid
                                      </Button>
                                    )}
                                </div>
                              </CardContent>
                            )}
                          </>
                        )}
                    </div>
                  </Card>
                </div>
              )}
</>
)}
            {/* Bid Leaders Board */}
            {isLoggedIn && user?.id && auctionId && user?.role !== "buyer" && (
              <div className="mt-6">
                <BidLeadersBoard
                  auctionId={auctionId}
                  loggedInUserId={user.id}
                  currencySymbol={currencySymbol}
                  auction={auction}
                  bidHistory={bidHistory}
                />
              </div>
            )}

            {isLoggedIn &&
              user?.id &&
              auctionId &&
              user?.role === "buyer" &&
              auction?.auctiontype === "reverse" &&
              auction?.auctionsubtype !== "sealed" &&
              auction?.seller === user.id && (
                <div className="mt-6">
                  <BidLeadersBoard
                    auctionId={auctionId}
                    loggedInUserId={user.id}
                    currencySymbol={currencySymbol}
                    auction={auction}
                  />
                </div>
              )}
            {isLoggedIn &&
              user?.id &&
              auctionId &&
              user?.role === "buyer" &&
              auction?.auctionsubtype === "sealed" &&
              auction?.auctiontype === "reverse" &&
              auction?.seller === user.id && (
                <BidLeadersBoardSupplier
                  auctionId={auctionId}
                  loggedInUserId={user.id}
                  currencySymbol={currencySymbol}
                  auction={auction}
                />
              )}
            {/* <TabsContent value="qa" className="mt-6"> */}
            <div>
              <div className="space-y-6 card g-5 p-4">
                  {user?.role === "buyer" && (
                     <div className="flex items-center gap-2 mb-2">
                    <img
                      src="/images/contact.png"
                      alt="Supplier Icon"
                      className="w-5 h-5 animate-bounce" // small size
                    />
                <h3 className="text-lg font-bold">Questions from Seller</h3>
                </div>
              )}
                {user?.role === "seller" && (
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src="/images/contact.png"
                      alt="Supplier Icon"
                      className="w-5 h-5 animate-bounce" // small size
                    />
                    <h3 className="text-lg font-bold mb-2">Contact buyer</h3>
                  </div>
                )}
                {auction.questions?.length ? (
                  auction.questions.map((qa, index) => (
                    <div key={index} className="pb-4">
                      <div className="mb-2">
                        <span className="font-medium text-sm">{qa.user}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-300 ml-2">
                          {DateTime.fromISO(qa.question_time ?? "")
                            .setZone("Asia/Kolkata")
                            .toLocaleString({
                              hour12: true,
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                        </span>
                      </div>
                      <div className="mb-2">
                        <FileQuestion className="h-4 w-4 inline mr-2 text-xs text-blue-500" />
                        <span className="text-sm">{qa.question}</span>
                      </div>
                      {qa.answer ? (
                        <div className="ml-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <CheckCircle className="h-4 w-4 inline mr-2 text-green-600" />
                          <span className="text-sm">{qa.answer}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
                            {DateTime.fromISO(qa.answer_time ?? "")
                              .setZone("Asia/Kolkata")
                              .toLocaleString({
                                hour12: true,
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                          </span>
                        </div>
                      ) : user?.email === auction?.createdby &&
                        !isAuctionEnded ? (
                        <div>
                          <Textarea
                            placeholder="Type your answer here..."
                            value={
                              answerInput?.index === index
                                ? answerInput.value
                                : ""
                            }
                            onChange={(e) =>
                              setAnswerInput({
                                index,
                                value: e.target.value,
                              })
                            }
                            className="mt-2 text-sm"
                          />
                          <Button
                            onClick={() => handleSubmitAnswer(index)}
                            className="mt-2"
                            disabled={!answerInput?.value.trim()}
                          >
                            Submit Answer
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p>No questions available</p>
                )}
                {user?.email !== auction?.createdby && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Ask a Question
                    </h4>
                    <Textarea
                      placeholder="Type your question here..."
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="mb-3"
                      disabled={isAuctionNotStarted || isAuctionEnded}
                    />
                    <Button
                      onClick={handleSubmitQuestion}
                      disabled={
                        !newQuestion.trim() ||
                        isAuctionNotStarted ||
                        isAuctionEnded
                      }
                    >
                      Submit Question
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {isLoggedIn &&
              user?.id &&
              auctionId &&
              user?.role === "buyer" &&
              auction?.auctiontype === "reverse" &&
              auction?.seller !== user.id && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-600 animate-bounce" />
                      Buyer Information
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                        <PersonStanding className="w-3 h-3 text-green-500 " />
                        <span className="font-xs">Buyer:</span>
                      </div>
                      <span className="text-xs text-gray-600 ">
                        {auction.profiles?.fname || "Unknown Seller"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3text-blue-500" />
                        <span className="font-xs">Location:</span>
                      </div>
                      <span className="font-xs">
                        {auction.profiles?.location
                          ? auction.profiles.location
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean)
                              .slice(0, 1)
                              .concat(
                                auction.profiles.location
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean)
                                  .slice(2)
                              )
                              .join(", ")
                          : "Unknown Location"}
                      </span>
                    </div>
                    {/* Completed Projects */}
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-purple-500" />
                        <span className="">Auctions:</span>
                      </div>
                      <span className="font-xs">
                        {auction.sellerAuctionCount}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        </div>
      </div>
      {/* Related Auctions Section - Moved up for better visibility */}
      {!isAuctionEnded && isLoggedIn && (
        <div className="">
          <AuctionCard
            customHide={false}
            category={auction.categories?.handle || "Unknown"}
            excludeId={auction.id}
            heading={`Related Auctions for ${auction.categories?.handle || "Unknown"}`}
          />
        </div>
      )}
      <LoginPrompt
        open={showLoginPrompt}
        onOpenChange={setShowLoginPrompt}
        title="Sign in to place your bid"
        description="Join the auction and start bidding on this exclusive item"
        onSuccess={() => {
          console.log("User logged in successfully");
        }}
      />
    </div>
    
  );
}
