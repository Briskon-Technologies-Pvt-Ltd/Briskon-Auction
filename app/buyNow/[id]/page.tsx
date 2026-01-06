"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {  usePathname, useSearchParams } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateTime } from "luxon";
import BidLeadersBoard from "@/app/bid-Leader-board/page";
import AuctionCard from "@/app/buyNow/page";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import LiveTimer from "@/app/livetimer/page";
import {
  Clock,
  Users,
  Gavel,
  TrendingUp,
  Facebook,
  Instagram,
  Twitter,
  Heart,
  Share2,
  AlertCircle,
  CheckCircle,
  Star,
  MessageSquare,
  Hourglass,
  Timer,
  CircleStop,
  Tag,
  PersonStanding,
  MapPin,
  User,
  Eye,
  Award,
  ArrowLeft,
  ChevronLeft,
  MoveLeft,
  ChevronDown,
  ChevronRight,
  FileQuestion,
  Package,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { LoginPrompt } from "@/components/login-prompt";
import { ReactNode } from "react";

// start and end time logic
function formatDateTime(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  return date.toLocaleString("en-US", options);
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

// Dummy calculateTimeLeft function (replace with actual implementation if needed)
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
    const parsed: any[] =
      typeof data === "string" ? JSON.parse(data) : data ?? [];

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
  } catch {
    return (
      <span className="text-gray-600 dark:text-gray-300 ml-4">
        Invalid attributes data
      </span>
    );
  }
}

// Updated Auction interface
interface Auction {
  id: string;
  productname?: string;
  title?: string;
  categoryid?: string;
  currency?: string;
  bidder_count?: number;

  sellerAuctionCount?: number;
  auctiontype: "forward" | "reverse";
  currentbid?: number;
  bidincrementtype?: "fixed" | "percentage";
  minimumincrement?: number;
  startprice?: number;
  buy_now_price?: number;
  question_count?: number;
  scheduledstart?: string;
  auctionduration?: { days?: number; hours?: number; minutes?: number };
  bidders?: number;
  watchers?: number;
  profiles?: {
    fname: string;
    location: string;
    role: string;
  };
  auctionId: string;
  loggedInUserId: string;
  bids?: {
    user_id: string;
    username?: string;
    amount: number;
  }[];
  questions?: {
    user: string;
    question: string;
    answer: string | null;
    question_time: string | null;
    answer_time: string | null;
  }[];
  productimages?: string[];
  productdocuments?: string[];
  productdescription?: string;
  specifications?: string; // JSON string or null
  buyNowPrice?: number;
  participants?: string[]; // Array of user IDs (UUIDs), parsed from jsonb
  bidcount?: number;
  createdby?: string; // Email of the user who created the auction
  timeLeft?: string;
  starttime: string; // or Date, depending on your data
  duration: {
    days?: number;
    hours?: number;
    minutes?: number;
  };
  issilentauction?: boolean; // New field to indicate silent auction
  currentbidder?: string; // New field for current highest bidder email
  percent?: number; // New field for percentage increment (if applicable)
  attributes?: string; // JSON string or null
  sku?: string;
  brand?: string;
  model?: string;
  reserveprice?: number;
  auctionsubtype?: string; // New field for auction subtype (e.g., "sealed", "silent")
  ended?: boolean; // New field to indicate if the auction has ended
  editable?: boolean; // New field to indicate if the auction is editable by the creator
  approved?: boolean;
  seller?: string;
}

// Bid interface
interface Bid {
  id: string;
  auction_id: string;
  is_buy_now: boolean;
  buy_now_amount: number;
  user_id: string;
  amount: number;
  profiles?: {
    fname: string;
  };
  created_at: string;
}

export default function AuctionDetailPage() {
  const params = useParams<{ id: string }>();
  const auctionId = params.id;
  const [bidAmount, setBidAmount] = useState("");
  const [watchlisted, setWatchlisted] = useState(false);
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("Loading...");
  const [showBuyNowConfirm, setShowBuyNowConfirm] = useState(false);
const [isProcessingBuyNow, setIsProcessingBuyNow] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [answerInput, setAnswerInput] = useState<{
    index: number;
    value: string;
  } | null>(null);
  const [showAllBids, setShowAllBids] = useState(false);
  const router = useRouter();
  const [bids, setBids] = useState<
    {
      auction_id: string;
      userid: string;
      amount?: number; // optional
      created_at: string;
      is_buy_now: boolean;
      buy_now_amount: number;
    }[]
  >([]);

  const [bidHistory, setBidHistory] = useState<
    { bidder: string; amount: number; time: string }[]
  >([]);

  const { isAuthenticated, user } = useAuth();
  const isLoggedIn = !!user;
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

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
 const pathname = usePathname();
   const searchParams = useSearchParams();
     const currentPath =
    pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "")
  useEffect(() => {
    if (!auctionId) return;
    fetch(`/api/views/${auctionId}`, {
      method: "POST",
    });
  }, [auctionId]);
  // slide show every five second

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === (auction?.productimages?.length || 1) - 1
          ? 0
          : prevIndex + 1
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [auction?.productimages]);

  useEffect(() => {
    const fetchAuctionDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/auctions/${auctionId}`);
        const json = await res.json();
        // console.log("Auction API Response (Raw):", json);
        if (!json.success)
          throw new Error(json.error || "Failed to fetch auction");
        const participants = Array.isArray(json.data.participants)
          ? json.data.participants
          : [];
        const updatedAuction = { ...json.data, participants };
        // console.log("Processed Auction Data:", updatedAuction);
        setAuction(updatedAuction);

        const bidRes = await fetch(`/api/bids/${auctionId}`);
        const bidJson = await bidRes.json();
        // console.log("Bid API Response (Raw):", bidJson);
        if (bidJson.success) {
          const bids = bidJson.data || [];
          // console.log("Fetched Bids (Raw):", bids);
          const historyPromises = bids.map(async (bid: Bid) => {
            const profileRes = await fetch(`/api/profiles/${bid.user_id}`);
            const profileJson = await profileRes.json();
            // console.log(
            //   "Profile API Response for user_id",
            //   bid.user_id,
            //   " (Raw):",
            //   profileJson
            // );
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
            };
          });
          const history = await Promise.all(historyPromises);
          // console.log("Processed Bid History (Raw):", history);
          setBidHistory(history);
        } else {
          // console.log("No bid data available from API:", bidJson);
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

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const res = await fetch(`/api/bids/${auctionId}`);
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          const sorted = json.data
            .sort((a: any, b: any) => b.amount - a.amount)
            .map((bid: any) => ({
              userid: bid.user_id,
              amount: bid.amount,
              is_buy_now: bid.is_buy_now,
              created_at: bid.created_at,
            }));
          setBids(sorted);
        }
      } catch (error) {
        console.error("Failed to load bids:", error);
      }
    };

    if (auction?.id) fetchBids();
  }, [auction?.id]);

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
    try {
      // console.log("Placing bid:", { auctionId, userId: user.id, amount });
      const formData = new FormData();
      formData.append("action", "bid");
      formData.append("user_id", user.id ?? "");
      formData.append("user_email", user.email ?? "");
      formData.append("amount", amount.toString());
      // formData.append("created_at", new Date().toISOString());
      const createdAt = DateTime.now().setZone("Asia/Kolkata").toUTC().toISO();
      if (createdAt) formData.append("created_at", createdAt);
      // Optionally append images and documents if available (e.g., from a file input)
      // Example: if (selectedImages) formData.append("images[0]", selectedImages[0]);

      const bidRes = await fetch(`/api/auctions/${auctionId}`, {
        method: "PUT",
        body: formData,
      });
      const bidJson = await bidRes.json();
      if (!bidJson.success)
        throw new Error(bidJson.error || "Failed to record bid");

      const auctionRes = await fetch(`/api/auctions/${auctionId}`); // Refresh auction data
      const auctionJson = await auctionRes.json();
      if (!auctionJson.success)
        throw new Error(auctionJson.error || "Failed to fetch updated auction");

      const start = new Date(auctionJson.data.scheduledstart || "");
      const duration = auctionJson.data.auctionduration
        ? ((d) =>
            (d.days || 0) * 24 * 60 * 60 +
            (d.hours || 0) * 60 * 60 +
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
          const bidderName = profileJson.success
            ? `${profileJson.data.fname ?? ""} ${
                profileJson.data.lname ?? ""
              }`.trim() ||
              profileJson.data.email ||
              bid.user_id
            : `User ${bid.user_id} (Profile not found)`;
          const bidTimeIST = DateTime.fromISO(bid.created_at)
            .setZone("Asia/Kolkata")
            .toLocaleString({
              hour12: true,
              hour: "2-digit",
              minute: "2-digit",
            });
          return {
            bidder: bidderName,
            amount: bid.amount,
            time: bidTimeIST,
          };
        });
        const history = await Promise.all(historyPromises);
        console.log("Processed Updated Bid History (Raw):", history);
        setBidHistory(history);
      }

      setBidAmount("");
      alert(`Amount of $${amount.toLocaleString()} placed successfully!`);
    } catch (err) {
      console.error("Bid placement error:", err);
      alert(
        err instanceof Error ? err.message : "An error occurred while Buying"
      );
    }
  };
  // function BidLeadersBoard({ bids, loggedInUserId }: { bids: Bid[]; loggedInUserId: string }) {
  // if (!bids.length) return <p>No bids yet.</p>;
  // }

  const handleBuyNow = async () => {
    if (!auction || !user) return;

    const formData = new FormData();
    formData.append("user_id", user.id);
    formData.append("user_email", user.email ?? "");
    formData.append("is_buy_now", "true");
    formData.append("buy_now_amount", auction.buy_now_price?.toString() ?? "");
    formData.append("amount", auction.buy_now_price?.toString() ?? "0"); // for DB
    formData.append("created_at", new Date().toISOString());
    formData.append("action", "buy_now");

    try {
      const res = await fetch(`/api/auctions/${auction.id}`, {
        method: "PUT",
        body: formData,
      });

      const json = await res.json();
      if (!json.success) {
        alert(json.error);
        return;
      }

      // Update local bids state immediately
      setBids((prev) => [
        ...prev,
        {
          auction_id: auction.id,
          userid: user.id,
          amount: auction.buy_now_price ?? 0,
          buy_now_amount: auction.buy_now_price ?? 0,
          is_buy_now: true,
          created_at: new Date().toISOString(),
        },
      ]);

      // Update auction state locally
      setAuction((prev) =>
        prev
          ? { ...prev, ended: true, purchaser: user.id } // store profile id in purchaser
          : prev
      );

      alert(
        `You successfully bought this item for $${auction.buy_now_price?.toLocaleString()}!`
      );
    } catch (err: any) {
      console.error("Buy Now error:", err);
      alert(err.message || "An error occurred while purchasing.");
    }
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

    try {
      const formData = new FormData();
      formData.append("action", "postQuestion");
      formData.append("user_id", user?.id ?? "");
      formData.append("user_email", user?.email ?? "");
      formData.append("question", newQuestion);

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
    if (
      !isAuthenticated ||
      (user?.email !== auction?.createdby && auction?.createdby !== null)
    ) {
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
      formData.append("user_email", user?.email ?? "");
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

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (error)
    return <div className="text-center py-20 text-red-600">{error}</div>;
  if (!auction)
    return <div className="text-center py-20">Auction not found</div>;

  // Calculate auction status
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
  const bidAmountNumber = Number(bidAmount);
  const baseBid = auction?.currentbid ?? auction?.startprice ?? 0;
  const isButtonDisabled =
    !bidAmount ||
    isNaN(bidAmountNumber) ||
    bidAmountNumber < 0 ||
    (user?.email === auction?.createdby && auction?.createdby !== null) ||
    isAuctionNotStarted ||
    isAuctionEnded ||
    (auction?.auctionsubtype === "sealed"
      ? auction?.participants?.some(
          (p) => user?.id && p.includes(user.id ?? "")
        ) || // added this logic to make bid multile of min incremement one time
        bidAmountNumber < (auction?.startprice ?? 0) ||
        (bidAmountNumber - (auction?.startprice ?? 0)) %
          (auction?.minimumincrement || 1) !==
          0
      : auction?.bidincrementtype === "fixed" && auction?.minimumincrement
      ? bidAmountNumber <= baseBid ||
        Math.abs((bidAmountNumber - baseBid) % auction.minimumincrement) > 0.01
      : !isSameAmount(
          bidAmountNumber,
          baseBid * (1 + (auction?.percent ?? 0) / 100)
        ));

  const isSilentAuction =
    auction?.issilentauction || auction?.auctionsubtype === "silent";

  const currentMedia =
    auction?.productimages?.[currentImageIndex] || "/placeholder.svg";
  const isVideo =
    currentMedia.toLowerCase().endsWith(".mp4") ||
    currentMedia.toLowerCase().endsWith(".webm") ||
    currentMedia.toLowerCase().endsWith(".mov");

  return (
    <div className="min-h-screen py-20">
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 mb-4 -mt-4">
        <nav className="flex items-center text-sm text-gray-600 space-x-1">
          <button
            onClick={() => router.push("/buyNow")}
            className="flex items-center space-x-1 text-gray-400 font-medium hover:text-gray-800 transition-colors"
          >
            <span>All Products</span>
          </button>
          <ChevronRight className="w-4 h-4 text-gray-600" />
          <span className="text-gray-800 font-medium">Buy Now Details</span>
        </nav>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative">
              <Card className="hover-lift transition-smooth">
                <CardContent className="p-0 relative">
                  {isVideo ? (
                    <video
                      src={currentMedia}
                      controls
                      className="w-full h-96 object-cover rounded-t-lg transition-smooth hover:scale-105"
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <Image
                      src={currentMedia}
                      alt={
                        auction.productname || auction.title || "Auction Item"
                      }
                      width={600}
                      height={400}
                      className="w-full h-80 object-cover rounded-t-lg transition-smooth hover:scale-105"
                    />
                  )}
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {`${currentImageIndex + 1}/${
                      auction.productimages?.length ?? 1
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
                  <div className="p-4">
                    <div className="flex gap-2">
                      {auction.productimages?.map(
                        (media: string, index: number) => {
                          const isVideoThumbnail =
                            media.toLowerCase().endsWith(".mp4") ||
                            media.toLowerCase().endsWith(".webm") ||
                            media.toLowerCase().endsWith(".mov");
                          return (
                            <div key={index} className="relative">
                              {isVideoThumbnail ? (
                                <video
                                  src={media}
                                  autoPlay
                                  loop
                                  className="w-20 h-16 object-cover rounded cursor-pointer border-2 border-transparent hover:border-blue-500 transition-smooth hover-lift"
                                  onClick={() => setCurrentImageIndex(index)}
                                  muted
                                  playsInline
                                />
                              ) : (
                                <Image
                                  src={media || "/placeholder.svg"}
                                  alt={`${
                                    auction.productname || auction.title
                                  } ${index + 1}`}
                                  width={100}
                                  height={80}
                                  className="w-20 h-16 object-cover rounded cursor-pointer border-2 border-transparent hover:border-blue-500 transition-smooth hover-lift"
                                  onClick={() => setCurrentImageIndex(index)}
                                />
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Auction Details */}
            
                        <Card>
                            <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <img
                      src="/images/trait.png"
                      alt="Supplier Icon"
                      className="w-5 h-5 animate-bounce" // small size
                    />
                    Description
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
                       </div>
                      </CardContent>
                       <CardContent className="p-6">
                    {/* Title with Icon */}
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-600 animate-bounce" />
                      Product Specification
                    </h3>

                    <div className="divide-y text-xs">
                  

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
                          <div className="space-6 pb-2">
                        {auction.productdocuments &&
                    auction.productdocuments.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {auction.productdocuments.map((docUrl, index) => (
                          <a
                            key={index}
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                          >
                            <svg
                              className="w-6 h-6 text-pink-500"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M6 2h9l6 6v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h12V9h-5V4H6zm2 2h3v4H8V6zm4 0h3v2h-3V6zm0 3h3v2h-3V9zm-4 0h3v2H8V9z" />
                              <path d="M10 12h4v2h-4v-2zm0 3h4v2h-4v-2z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Document {index + 1}
                            </span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p>No documentation available</p>
                    )}
                    </div>
                  </CardContent>
                      </Card>
                    
          </div>
                    
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bidding Card */}
            <Card>
              <div className="space-y-3 mb-5 px-4 gap-2">
                {/* Top Row: Left and Right Labels */}
                <div className="flex mt-4 mb-2">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    <Gavel className="w-5 h-5 text-blue-600 animate-bounce" />
                    {/* <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      Auction Details:
                    </span> */}
                  </h2>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white ml-2">
                    {auction.productname || "Auction Item"}
                  </p>
                </div>

                {/* Start Date */}
                {auction.scheduledstart && (
                  <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <Timer className="w-[12px] h[12px] text-green-500" />
                      <span>Starts:</span>
                    </div>
                    <span>
                      {formatDateTime(new Date(auction.scheduledstart))}
                    </span>
                  </div>
                )}

                {/* End Date */}
                {auction.scheduledstart && auction.auctionduration && (
                  <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <CircleStop className="w-[11px] h-[11px] text-red-500" />
                      <span>Ends:</span>
                    </div>
                    <span className="">
                      {formatDateTime(
                        getEndDate(
                          new Date(auction.scheduledstart),
                          auction.auctionduration
                        )
                      )}
                    </span>
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <Tag className="w-[11px] h-[11px] text-red-500" />
                      <span>Buy Now Price</span>
                    </div>
                    <span className="font-semibold text-green-600 text-base">
                      {currencySymbol}
                      {auction.buy_now_price || "N/A"}
                    </span>
                  </div>
                  {/* minimum bid increment */}
                </div>

                {auction.scheduledstart &&
                  auction.auctionduration &&
                  !isAuctionEnded && ( // ✅ Only show if not ended
                    <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <Hourglass className="w-[11px] h-[11px] text-red-500" />
                        <span>Ends In:</span>
                      </div>

                      <LiveTimer
                        startTime={auction.scheduledstart}
                        duration={auction.auctionduration}
                      />
                    </div>
                  )}

                {!isLoggedIn ? (
                  <div className="mt-3 text-center">
                    {isAuctionEnded ? (
                      <p className="text-sm text-red-600 text-left">ended</p>
                    ) : (
                      <Button
                        className="w-full text-sm bg-gray-500 text-white hover:bg-gray-600 transition-smooth hover-lift transform-3d"
                        onClick={() =>
          router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
        }
                      >
                        Login to Buy
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
              </div>
              
              {isLoggedIn && (
                <CardContent className="space-y-3">
                  {/* <div className="text-center"> */}
                  {/* <div className="text-3xl font-bold text-green-600 mb-1 animate-pulse-gow">
                      {auction.auctionsubtype === "sealed"
                        ? `$${auction.startprice?.toLocaleString() || "N/A"}`
                        : auction.issilentauction &&
                          auction.bidcount &&
                          auction.bidcount > 0
                        ? `$${auction.currentbid?.toLocaleString() || "N/A"}`
                        : `$${auction.startprice?.toLocaleString() || "N/A"}`}
                    </div> */}
                  {/*
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {auction.auctionsubtype === "sealed"
                        ? "Starting Price"
                        : auction.issilentauction &&
                          auction.bidcount &&
                          auction.bidcount > 0
                        ? "Current Highest Bid"
                        : "Starting Price"}
                    </div>
                    {!auction.issilentauction &&
                      auction.auctionsubtype !== "sealed" &&
                      auction.currentbidder &&
                      auction.bidcount &&
                      auction.bidcount > 0 && (
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          By: {auction.currentbidder}
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                      Start Price:
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      ${auction.startprice?.toLocaleString() || "N/A"}
                    </div>
                  </div> */}

                  {/* <div className="flex items-center justify-center gap-4 text-sm"> */}
                  {/* <div className="flex items-center gap-1 hover-lift">
                    <Clock className="h-4 w-4 text-red-600 animate-bounce-gentle" />
                    <span className="font-semibold text-red-600">
                      {auction.timeLeft || "N/A"}
                    </span>
                  </div> */}
                  {/* <div className="flex items-center gap-1 hover-lift">
                    <Users className="h-4 w-4" />
                    <span>
                      {auction.issilentauction
                        ? "Silent Auction"
                        : `${auction.bidcount || 0} bidders`}
                    </span>
                  </div> */}
                  {/* </div> */}
                  {(isAuctionNotStarted || isAuctionEnded) && (
                    <p className="text-sm text-red-600 mt-2">
                      {isAuctionNotStarted
                        ? "Auction has not started yet"
                        : ""}
                    </p>
                  )}
                 {isLoggedIn && !isAuctionEnded && user?.role !== "seller" && (
  <div className="space-y-3">
    {bids.some((b) => b.is_buy_now) ? (
      <p className="text-red-600 font-medium text-center">
        This item has already been purchased. Sold out!
      </p>
    ) : (
      <>
        <button
          type="button"
          className="w-full text-sm bg-gray-500 text-white hover:bg-gray-600 transition-smooth hover-lift transform-3d rounded-md px-4 py-2"
          onClick={() => setShowBuyNowConfirm(true)}
        >
          Buy Now
        </button>

        {/* Confirm Modal */}
        {showBuyNowConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* backdrop */}
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => !isProcessingBuyNow && setShowBuyNowConfirm(false)}
            />

            {/* modal */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-auto z-10">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Purchase</h3>
              <p className="text-sm text-gray-600 mb-4">
                You are about to buy this item for{" "}
                <span className="font-medium">${(auction?.buy_now_price ?? 0).toLocaleString()}</span>.
                This will complete the purchase immediately. Do you want to continue?
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                  onClick={() => !isProcessingBuyNow && setShowBuyNowConfirm(false)}
                  disabled={isProcessingBuyNow}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 flex items-center gap-2"
                  onClick={async () => {
                    if (isProcessingBuyNow) return;
                    try {
                      setIsProcessingBuyNow(true);
                      // call your existing handler
                      await handleBuyNow();
                    } finally {
                      setIsProcessingBuyNow(false);
                      setShowBuyNowConfirm(false);
                    }
                  }}
                  disabled={isProcessingBuyNow}
                >
                  {isProcessingBuyNow ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Confirm & Buy"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )}
  </div>
)}

                  {isLoggedIn && isAuctionEnded && user?.role !== "seller" && (
                    <p className="text-red-600 font-medium text-center">
                      This item has already been purchased. Sold out!
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
               <div className="space-y-6 card g-5 p-4">
                        {user?.role === "buyer" && (
                     <div className="flex items-center gap-2 mb-2">
                    <img
                      src="/images/contact.png"
                      alt="Supplier Icon"
                      className="w-5 h-5 animate-bounce" // small size
                    />
                <h3 className="text-lg font-bold">Contact Seller</h3>
                </div>
              )}
                {user?.role === "seller" && (
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src="/images/contact.png"
                      alt="Supplier Icon"
                      className="w-5 h-5 animate-bounce" // small size
                    />
                    <h3 className="text-lg font-bold mb-2">Question From  Buyer</h3>
                  </div>
                )}
                      {auction.questions?.length ? (
                        auction.questions.map((qa, index) => (
                          <div key={index} className="border-b pb-4">
                            <div className="mb-2">
                              <span className="font-medium text-sm">
                                {qa.user}
                              </span>
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
                          <h4 className="font-semibold mb-3">Ask a Question</h4>
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

            {/* Seller Info */}
            {isLoggedIn &&
              user?.id &&
              auctionId &&
              user?.role === "seller" &&
              auction?.auctiontype === "forward" &&
              auction?.seller !== user.id && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
                      <User className="w-5 h-5 text-green-600 animate-bounce" />
                      <CardTitle className="text-lg font-semibold tracking-wide">
                        Seller Information
                      </CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mt-2">
                    {/* Seller Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                        <PersonStanding className="w-3 h-3 text-green-500 " />
                        <span className="font-xs">Seller:</span>
                      </div>
                      <span className="font-medium">
                        {auction.profiles?.fname || "Unknown Seller"}
                      </span>
                    </div>

                    {/* Location Row */}
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
      {!isAuctionEnded && isLoggedIn && (
        <AuctionCard
          customHide={false}
          category={auction.categoryid}
          excludeId={auction.id}
          heading={`Related Products for ${auction.categoryid}`}
        />
      )}
      <LoginPrompt
        open={showLoginPrompt}
        onOpenChange={setShowLoginPrompt}
        title="Sign in to place your bid"
        description="Join the auction and start bidding on this exclusive item"
        onSuccess={() => {
          // console.log("User logged in successfully");
        }}
      />
    </div>
  );
}
