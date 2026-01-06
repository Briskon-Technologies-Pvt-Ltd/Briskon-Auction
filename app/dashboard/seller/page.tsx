"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Package,
  DollarSign,
  TrendingUp,
  Settings,
  Trophy,
  Gavel,
  Calendar,
  XCircle,
  PackageCheck,
  Archive,
  BarChart,
  BarChart3,
  MessageCircle,
  CheckCircle,
  Hourglass,
  Ban,
  LucideVault,
  Plus,
  Eye,
  Trash,
  Trash2,
  Edit,
  Lock,
  CirclePlus,
  TrendingDown,
  Medal,
  ShoppingCart,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import LiveTimer from "@/app/livetimer/page";
import CreateAuction from "@/app/seller-panel/create-listing/page";
import SellerBidLeaderboard from "@/app/seller-bid-leader-board/page";
import ProfileSettingsPage from "@/app/settings/profile/page";
import WinnerModal from "@/app/declear-winner/winner-modal/page";
import CreateForwardAuction from "@/app/sellerPanel/create-forward-listing/page";
import Createbuynow from "@/app/sellerPanel/create-buy-now-listing/page";

interface Winner {
  id: string;
  productname: string;
  productimages: string;
  soldprice: number;
  buyername: string;
  buyeremail: string;
  closedat: string;
}
interface lostBid {
  sellerName: string;
  auctionId: string;
  productName: string;
  auctionType: string | null;
  startprice: number;
  category?: { handle: string };
  currentbid: number;
  auctionSubtype: string | null;
  bidAmount: number;
  totalBids: number;
  isWinningBid: boolean;
  position: number;
  targetprice: number;
  productimages: string;
  scheduledstart: string; //
  auctionduration?: {
    days?: number;
    hours?: number;
    minutes?: number;
  };
}
// types.ts (optional)
interface Sale {
  id: string;
  productname: string;
  productimages: string;
  salePrice: number;
  buyer: string;
  category?: { handle: string };
  type: string;
  format: string;
  starting_bid: number;
  saleDate: string | null;
  bidder_count: number;
}

interface UnsoldSale {
  id: string;
  productname: string;
  auction_type: string;
  auction_subtype: string;
  productimages: string;
  salePrice: number;
  buyer: string;
  category?: { handle: string };
  saleDate: string | null;
  starting_bid: number;
  auctionduration?: { days?: number; hours?: number; minutes?: number };
  scheduledstart: string;
}

interface Stats {
  activeListings: number;
  totalSales: number;
  totalBids: number;
  topAuctions: {
    id: string;
    productname: string;
    productimages: string;
    category: string;
    type: string;
    format: string;
    starting_bid: number;
    current_bid: number;
    gain: number;
    bidders: number;
    auctionduration?: { days?: number; hours?: number; minutes?: number };
    scheduledstart: string;
  }[];
}

interface LiveAuction {
  id: string;
  productname: string;
  currentbid: number | null;
  productimages: string;
  startprice: number;
  auctiontype: string;
  buy_now_price: number;
  auctionsubtype: string;
  category?: { handle: string };
  bidder_count: number;
  auctionduration?: { days?: number; hours?: number; minutes?: number };
  scheduledstart: string;
}
interface upcomingAuctionItem {
  id: string;
  productname: string;
  currentbid: number | null;
  productimages: string;
  startprice: number;
  buy_now_price: number;
  auctiontype: string;
  auctionsubtype: string;
  category?: { handle: string };
  scheduledstart: string;
  auctionduration?: { days?: number; hours?: number; minutes?: number };
}

interface closedAuctionItem {
  id: string;
  productname: string;
  currentbid: number | null;
  productimages: string;
  startprice: number;
  auctiontype: string;
  bidder_count: number;
  auctionsubtype: string;
   category?: { handle: string };
  scheduledstart: string;
  auctionduration?: { days?: number; hours?: number; minutes?: number };
}
interface AuctionItem {
  id: string;
  productname: string;
  productimages: string;
  salePrice: number;
  starting_bid: number;
  category: string;
  type: string | number;
  format: string | number;
  created_at: string;
}
interface approvalPendingItem {
  id: string;
  productname: string;
  productimages: string;
  salePrice: number;
  starting_bid: number;
  category?: { handle: string };
  buy_now_price: number;
  type: string | number;
  format: string | number;
  created_at: string;
  scheduledstart: string;
  auctionduration?: { days?: number; hours?: number; minutes?: number };
}
interface ActiveBid {
  sellerName: string;
  auctionId: string;
  productName: string;
  auctionType: string | null;
  category?: { handle: string };
  auctionSubtype: string | null;
  bidAmount: number;
  currentbid: number;
  startprice: number;
  totalBids: number;
  isWinningBid: boolean;
  position: number;
  scheduledstart?: string; //
  productimages: string;
  auctionduration?: {
    days?: number;
    hours?: number;
    minutes?: number;
  };
}

interface approvalRejectedItem {
  id: string;
  productname: string;
  productimages: string;
  salePrice: number;
  starting_bid: number;
    category?: { handle: string };
  type: string | number;
  format: string | number;
  created_at: string;
  scheduledstart: string;
  auctionduration?: { days?: number; hours?: number; minutes?: number };
}

interface bidRecevied {
  sellerName: string;
  auctionId: string;
  productName: string;
  bidId: string;
  auctionType: string | null;
  startAmount: number;
  awardedAt: string;
  buyerName: string;
  winningBidAmount: number;
  targetPrice?: number; // Optional field for target price
  productimage: string;
  category?: { handle: string };
  scheduledstart: string;
  auctionduration?: { days?: number; hours?: number; minutes?: number };
  auctionSubtype: string;
  currentbid: number;
  bidAmount: number;
}
interface RecentAuction {
  id: string;
  title: string;
  productname?: string; // Added as optional in case it's not always present
  currentbid: number;
}
interface Bidder {
  id: string;
  name: string;
  bestBid: number;
  rank: number;
  isWinner?: boolean;
}

interface AuctionItems {
  id: string;
  productname: string;
}
export default function SellerDashboard() {
  const router = useRouter();
  const { user, isLoading, selectedMode } = useAuth();
  const [winners, setWinners] = useState<Winner[]>([]);
  const [manageAuctionTab, setManageAuctionTab] = useState<
    | "live"
    | "upcoming"
    | "pending"
    | "Evaluate"
    | "rejected"
    | "create"
    | "winners"
    | "unsold"
  >("live");
  const [manageAuctionReverseTab, setManageAuctionReverseTab] = useState<
    "active" | "won" | "lost"
  >("active");
  const [buyNowTab, setBuyNowTab] = useState<
    "live" | "upcoming" | "Sold" | "rejected" | "approval"
  >("live");
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(
    null
  );
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [unsoldCount, setUnsoldCount] = useState(0);
  const [liveCount, setLiveCount] = useState(0);
  const [BuyNowCount, setBuyNowCount] = useState(0);
  const [lostBids, setLostBids] = useState<lostBid[]>([]);
  const [activeBids, setActiveBids] = useState<ActiveBid[]>([]);
  const [recentAuctions, setRecentAuctions] = useState<RecentAuction[]>([]);
  const [liveAuctions, setLiveAuctions] = useState<LiveAuction[]>([]);
  const [BuyNowProducts, setBuyNowProducts] = useState<LiveAuction[]>([]);
  const [approvalPendings, setApprovalPendings] = useState<
    approvalPendingItem[]
  >([]);
  const [approvalPendingsBuynow, setApprovalPendingsBuynow] = useState<
    approvalPendingItem[]
  >([]);
  const [soldBuyNow, setSoldBuyNow] = useState<LiveAuction[]>([]);
  const [approvalRejected, setApprovalRejected] = useState<
    approvalRejectedItem[]
  >([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState<
    upcomingAuctionItem[]
  >([]);
  const [upcomingBuyNow, setUpcomingBuyNow] = useState<upcomingAuctionItem[]>(
    []
  );
  const [evaluateAuctions, setEvaluateAuctions] = useState<closedAuctionItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [openAuctionId, setOpenAuctionId] = useState<string | null>(null);
  const [selectedAuction, setSelectedAuction] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [awardedAuctions, setAwardedAuctions] = useState<bidRecevied[]>([]);
  const [unsoldSales, setUnsoldSale] = useState<UnsoldSale[]>([]);
  const [showSellerLeaderboard, setShowSellerLeaderboard] = useState(false);
  const [auctionCount, setAuctionCount] = useState(0);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoadingSales, setIsLoadingSales] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<
    | "leaderboard"
    | "activeBids"
    | "winners"
    | "liveAuction"
    | "upcomingAuctions"
    | "reverseAuction"
    | "profile"
    | "buynow"
    | "createAuction"
    | "itemUnsold"
    | "createbuynow"
    | "manageAuction"
    | "approvalPending"
  >("reverseAuction");
  const handleViewWinner = async (auctionId: string, auctionName: string) => {
    setSelectedAuction({ id: auctionId, name: auctionName });

    // fetch bidders for this auction
    const res = await fetch(`/api/bids/${auctionId}`);
    const json = await res.json();

    if (json.success) {
      const mappedBidders: Bidder[] = json.data
        .sort((a: any, b: any) => b.amount - a.amount) // highest bid first
        .map((b: any, index: number) => ({
          id: b.id,
          name: b.profile?.fname || "Unknown",
          bestBid: b.amount,
          rank: index + 1,
          isWinner: b.id === b.awarded_bid_id, // mark winner if awarded
        }));
      setBidders(mappedBidders);
    }

    setOpen(true); // open modal
  };

  // start and end time logic
  function formatDateTime(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleString("en-US", options).replace(" at ", ", "); // remove "at"
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

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await fetch(
        `/api/seller/stats?email=${encodeURIComponent(user?.email || "")}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to load stats");
      }

      setStats(data.data);
    } catch (err) {
      console.error("Stats fetch error:", err);
      setErrorStats(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingStats(false);
    }
  };
  const fetchSold = async (email: string) => {
    try {
      const response = await fetch(
        `/api/seller/sold-buy-now?email=${encodeURIComponent(email)}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to load live auctions ss");
      }

      // Use data directly without interface
      setSoldBuyNow(data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching live auctions:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const fetchSellerLiveAuctions = async (email: string) => {
    try {
      const response = await fetch(
        `/api/seller/live-auctions?email=${encodeURIComponent(
          email
        )}&sale_type=1`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to load live auctions ss");
      }
      // Use data directly without interface
      setLiveCount(data.count);
      setLiveAuctions(data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching live auctions:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };
  const fetchSellerBuyNowProducts = async (email: string) => {
    try {
      const response = await fetch(
        `/api/seller/live-auctions?email=${encodeURIComponent(
          email
        )}&sale_type=2`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to load buy now products");
      }

      setBuyNowCount(data.count);
      setBuyNowProducts(data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching buy now products:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const fetchSellerUpcomingCount = async (email: string) => {
    try {
      const response = await fetch(
        `/api/seller/upcoming-auctions?email=${encodeURIComponent(
          email
        )}&sale_type=1`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to load upcoming auctions");
      }

      setUpcomingCount(data.count);
      setUpcomingAuctions(data.data);
      setError(null);
    } catch (err) {
      console.error(" Network error while fetching upcoming count:", err);
    }
  };
  const fetchUpcomingBuyNow = async (email: string) => {
    try {
      const response = await fetch(
        `/api/seller/upcoming-auctions?email=${encodeURIComponent(
          email
        )}&sale_type=2`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to load upcoming auctions");
      }

      setUpcomingBuyNow(data.data);
      setError(null);
    } catch (err) {
      console.error(" Network error while fetching upcoming count:", err);
    }
  };

  useEffect(() => {
    if (!user?.id || !user?.email) return;

    const fetchActiveBids = async () => {
      try {
        const response = await fetch(
          `/api/seller/active-bids?id=${user.id}&email=${encodeURIComponent(
            user.email
          )}`
        );
        if (!response.ok) throw new Error("Failed to fetch active bids");

        const data = await response.json();

        // If your API wraps the data in { success: true, data: [...] }
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch active bids");
        }

        setActiveBids(data.data); // set the array of active bids
      } catch (error) {
        console.error("Error fetching active bids:", error);
        setActiveBids([]); // fallback to empty array
      }
    };

    fetchActiveBids();
  }, [user?.id, user?.email]);

  useEffect(() => {
    if (!user?.id || !user?.email) return;
    const fetchLostBids = async () => {
      try {
        const response = await fetch(
          `/api/seller/lost-auctions?id=${user.id}&email=${encodeURIComponent(
            user.email
          )}`
        );
        if (!response.ok) throw new Error("Failed to fetch active bids");

        const data = await response.json();

        // If your API wraps the data in { success: true, data: [...] }
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch active bids");
        }
        setLostBids(data.data); // set the array of active bids
      } catch (error) {
        console.error("Error fetching active bids:", error);
        setLostBids([]); // fallback to empty array
      }
    };
    fetchLostBids();
  }, [user?.id, user?.email]);

  const fetchAwardedAuctions = async () => {
    if (!user) return;
    try {
      const res = await fetch(
        `/api/seller/awarded-auctions?email=${encodeURIComponent(user.email)}`,
        { method: "GET" }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch awarded auctions");
      }
      const data = await res.json();
      // Ensure API returns an array
      setAwardedAuctions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching awarded auctions:", err);
    }
  };

  useEffect(() => {
    if (!isLoading && user?.email) {
      Promise.all([
        fetchStats(),
        fetchSellerLiveAuctions(user.email),
        fetchUpcomingBuyNow(user.email),
        fetchSellerBuyNowProducts(user.email),
        fetchSold(user.email),
        fetchSellerUpcomingCount(user.email),
      ]).catch((err) => console.error(err));
    }
  }, [user?.email, isLoading]);

  // useEffect(() => {
  const controller = new AbortController();
  const fetchSales = async () => {
    if (!user?.email) return;
    setIsLoadingSales(true);
    try {
      const response = await fetch(
        `/api/seller/sales-history?email=${encodeURIComponent(user.email)}`,
        { signal: controller.signal }
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch sales history: ${response.statusText}`
        );
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to load sales history");
      }
      setSales(data.data || []);
      // await fetchSales()
    } catch (error) {
      if (error.name !== "AbortError") {
        setError(error instanceof Error ? error.message : "An error occurred");
        console.error("Fetch error:", error);
      }
    } finally {
      setIsLoadingSales(false);
    }
  };

  // useEffect(() => {
  const fetchUnsoldSales = async () => {
    setIsLoadingSales(true);
    try {
      if (!user?.email) throw new Error("User email is missing");
      const response = await fetch(
        `/api/seller/unsold-items?email=${encodeURIComponent(user.email)}`
      );
      console.log("Fetch response status:", response.status); // Debug status
      if (!response.ok)
        throw new Error(
          `Failed to fetch sales history: ${response.statusText}`
        );
      const data = await response.json();
      if (!data.success)
        throw new Error(data.error || "Failed to load sales history");
      setUnsoldSale(data.data || []);
      setUnsoldCount((data.data || []).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoadingSales(false);
    }
  };

  //   if (user) fetchSales();
  // }, [user]);

  // Manage-auctions
  // useEffect(() => {
  const fetchmanageAuctions = async () => {
    if (!user?.email) throw new Error("User email is missing");
    const response = await fetch(
      `/api/seller/manage-auction?email=${encodeURIComponent(user.email)}`
    );
    const data = await response.json();
    if (data.success) {
      setAuctions(data.data || []);
      setAuctionCount(data.count);
    }
  };
  //   if (user) fetchAuctions();
  // }, [user]);

  // useEffect(() => {
  const fetchPendingAuctions = async () => {
    if (!user?.email) throw new Error("User email is missing");
    const response = await fetch(
      `/api/seller/approval-Pending?email=${encodeURIComponent(
        user.email
      )}&sale_type=1`
    );
    const data = await response.json();
    if (data.success) {
      setApprovalPendings(data.data || []);
    }
  };
  const fetchPendingBuynow = async () => {
    if (!user?.email) throw new Error("User email is missing");
    const response = await fetch(
      `/api/seller/approval-Pending?email=${encodeURIComponent(
        user.email
      )}&sale_type=2`
    );
    const data = await response.json();
    if (data.success) {
      setApprovalPendingsBuynow(data.data || []);
    }
  };
  // if (user) fetchAuctions();
  // }, [user]);

  // useEffect(() => {
  const fetchRejectedAuctions = async () => {
    if (!user?.email) throw new Error("User email is missing");
    const response = await fetch(
      `/api/seller/approval-rejected?email=${encodeURIComponent(
        user.email
      )}&sale_type=1`
    );
    const data = await response.json();
    if (data.success) {
      setApprovalRejected(data.data || []);
    }
  };
  const fetchRejectedBuynow = async () => {
    if (!user?.email) throw new Error("User email is missing");
    const response = await fetch(
      `/api/seller/approval-rejected?email=${encodeURIComponent(
        user.email
      )}&sale_type=2`
    );
    const data = await response.json();
    if (data.success) {
      setApprovalRejected(data.data || []);
    }
  };
  // if (user) fetchAuctions();
  // }, [user]);
  const fetchEvaluateAuctions = async () => {
    if (!user?.email) throw new Error("User email is missing");
    const response = await fetch(
      `/api/seller/evaluate-auction?email=${encodeURIComponent(user.email)}`
    );
    const data = await response.json();
    if (data.success) {
      setEvaluateAuctions(data.data || []);
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        await Promise.all([
          fetchEvaluateAuctions(),
          fetchRejectedAuctions(),
          fetchPendingAuctions(),
          fetchPendingBuynow(),
          fetchRejectedBuynow(),
          fetchSales(),
          fetchmanageAuctions(),
          fetchUnsoldSales(),
          fetchAwardedAuctions(),
        ]);
      } catch (error) {
        console.error("Error fetching auction data:", error);
      }
    };
    fetchData();
  }, [user]);
  // const filteredAuctions = auctions.filter((auction) => {
  //   const approvedMatch = filterApproved === "all" || (filterApproved === "approved" ? auction.approved : !auction.approved);
  //   const editableMatch = filterEditable === "all" || (filterEditable === "editable" ? auction.editable : !auction.editable);
  //   return approvedMatch && editableMatch;
  // }
  //   const handleDelete = async (id: string) => {
  //   if (confirm("Are you sure you want to delete this listing?")) {
  //     try {
  //       const res = await fetch(`/api/listings/${id}`, {
  //         method: "DELETE",
  //         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //       });
  //       const data = await res.json();
  //       if (data.success) {
  //         setAuctions(auctions.filter((auction) => auction.id !== id));
  //         setStats((prev) => ({
  //           ...prev,
  //           totalAuctions: prev.totalAuctions - 1,
  //           approvedAuctions: prev.approvedAuctions - (auctions.find(a => a.id === id)?.approved ? 1 : 0),
  //           pendingAuctions: prev.pendingAuctions - (!auctions.find(a => a.id === id)?.approved ? 1 : 0),
  //           editableAuctions: prev.editableAuctions - (auctions.find(a => a.id === id)?.editable ? 1 : 0),
  //           nonEditableAuctions: prev.nonEditableAuctions - (!auctions.find(a => a.id === id)?.editable ? 1 : 0),
  //         }));
  //         window.location.reload(); // Reload the page after deletion
  //       } else {
  //         console.error("Delete error:", data.error);
  //       }
  //     } catch (error) {
  //       console.error("Failed to delete auction:", error);
  //     }
  //   }
  // };
  const handleOpenWinnerModal = async (
    auctionId: string,
    auctionName: string
  ) => {
    setSelectedAuction({ id: auctionId, name: auctionName });

    // Fetch all bids for this auction
    const res = await fetch(`/api/auctions/${auctionId}/bids`);
    const data = await res.json();

    const formattedBidders = data.map((bid: any, idx: number) => ({
      id: bid.id,
      name: bid.profiles?.fname || `User ${bid.user_id}`,
      bestBid: bid.amount,
      rank: idx + 1,
      isWinner: bid.id === bid.awarded_bid_id,
    }));

    setBidders(formattedBidders);
    setOpen(true);
  };
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Not logged in. Please log in to access the seller dashboard.</p>
      </div>
    );
  }

  if (user.role == "both") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Access Denied. This dashboard is for sellers.</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {error}
      </div>
    );
  }
  const handleNavigate = (path: string) => {
    console.log("Navigating to:", path);
    router.push(path);
  };

  return (
    <div className="min-h-screen py-12 md:py-20 bg-gray-100 dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3  gap-4 mb-5">
          {/* Active Bids - hide in forward mode */}
          {selectedMode !== "forward" && (
            <Card
              onClick={() => {
                setSelectedSection("reverseAuction");
                setManageAuctionReverseTab("active"); // ensure it always opens listings
              }}
              className={`cursor-pointer transition-shadow hover:shadow-lg ${
                selectedSection === "reverseAuction" ? "ring-2 ring-blue-500" : ""
              } relative`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-orange-400 animate-bounce" />
                  <CardTitle className="text-lg font-medium">
                    Reverse Auctions
                  </CardTitle>
                </div>
                <div className="mt-1 flex items-center gap-3">
                  <div className="text-xl font-bold">{activeBids.length}</div>
                </div>
              </CardHeader>

              <div className="absolute bottom-2 left-4 text-xs text-gray-500">
                Auction Bids I’ve placed
              </div>
            </Card>
          )}

          {/* Forward Auctions - hide in reverse mode */}
          {selectedMode !== "reverse" && (
            <Card
              onClick={() => {
                setSelectedSection("manageAuction");
                setManageAuctionTab("live"); // ensure it always opens listings
              }}
              className={`cursor-pointer transition-shadow hover:shadow-lg ${
                selectedSection === "manageAuction" ? "ring-2 ring-blue-500" : ""
              } relative`}
            >
              <CardHeader className="">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-teal-400 animate-bounce" />
                  <CardTitle className="text-lg font-medium">
                    Forward Auctions
                  </CardTitle>
                </div>
                <div className="mt-1 flex items-center gap-3">
                  <div className="text-xl font-bold">{auctionCount}</div>
                </div>
              </CardHeader>

              <div className="absolute bottom-2 left-4 text-xs text-gray-500">
                Auctions I’ve created
              </div>
            </Card>
          )}

          <Card
            onClick={() => {
              setSelectedSection("buynow");
              setBuyNowTab("live"); // ensure it always opens listings
            }}
            className={`cursor-pointer transition-shadow hover:shadow-lg ${
              selectedSection === "buynow" ? "ring-2 ring-blue-500" : ""
            } relative`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-green-500 animate-bounce" />
                <CardTitle className="text-lg font-medium">Buy Now</CardTitle>
              </div>
              <div className="mt-1 flex items-center gap-3">
                <div className="text-xl font-bold">
                  {BuyNowCount + upcomingBuyNow.length + soldBuyNow.length}
                </div>
              </div>
            </CardHeader>

            <div className="absolute bottom-2 left-4 text-xs text-gray-500">
              My Products
            </div>
          </Card>

          {/* My Profile */}
          <Card
            className={`cursor-pointer transition-shadow hover:shadow-lg ${
              selectedSection === "profile" ? "ring-2 ring-blue-500" : ""
            } relative`}
            onClick={() => setSelectedSection("profile")}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-blue-600 animate-bounce" />
                <CardTitle className="text-lg font-medium">
                  My Profile
                </CardTitle>
              </div>
              <div className="mt-1">
                <div className="h-10">
                  <div className="text-2xl font-bold invisible">1</div>
                </div>
                <p className="text-xs text-gray-500">
                  Edit Profile & Change Password
                </p>
              </div>
            </CardHeader>
          </Card>

          {/* create auction - hide in reverse mode */}
          {selectedMode !== "reverse" && (
            <Card
              className="cursor-pointer hover:shadow-lg transition-all flex flex-col items-center justify-center p-4 text-center bg-green-400 text-white"
              onClick={() => {
                setSelectedSection("createAuction");
              }}
            >
              <CirclePlus className="h-5 w-5 mb-3 text-white" />
              <CardTitle className="text-sm font-semibold">
                Create Auction
              </CardTitle>
              <p className="text-xs opacity-100">Start a New Forward Auction</p>
            </Card>
          )}

          {/* create buynow - hide in reverse mode */}
          {selectedMode !== "reverse" && (
            <Card
              className="cursor-pointer hover:shadow-lg transition-all flex flex-col items-center justify-center p-4 text-center bg-blue-400 text-white"
              onClick={() => {
                setSelectedSection("createbuynow");
              }}
            >
              <CirclePlus className="h-5 w-5 mb-3 text-white" />
              <CardTitle className="text-sm font-semibold">
                Start a Buy Now Sale
              </CardTitle>
              <p className="text-xs opacity-100">List a New Buy Now Product</p>
            </Card>
          )}
        </div>
        {selectedSection === "createAuction" && <CreateForwardAuction />}
        {selectedSection === "createbuynow" && <Createbuynow />}
        {/* {selectedSection === "createAuction" && <CreateAuction />} */}
        {selectedSection === "profile" && <ProfileSettingsPage />}
        {/* Table here */}
        {showSellerLeaderboard && selectedAuctionId && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-lg w-full relative">
              <button
                onClick={() => setShowSellerLeaderboard(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <SellerBidLeaderboard auctionId={selectedAuctionId} />
            </div>
          </div>
        )}

        {selectedSection === "winners" && (
          <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-blue-500 animate-bounce" />
              Sold Items (Winners)
            </h2>
            {sales.length === 0 ? (
              <p className="text-sm text-gray-500">No sold items yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-md mt-6">
                <table className="min-w-full text-sm border border-gray-100 dark:border-gray-800">
                  <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left">Auction Name</th>
                      <th className="px-4 py-2 text-left">Category</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Format</th>
                      <th className="px-4 py-2 text-left">Starting Bid</th>
                      <th className="px-4 py-2 text-left">Winning Bid </th>
                      <th className="px-4 py-2 text-left">Winner</th>
                      <th className="px-4 py-2 text-left">Sold On</th>
                      <th className="px-4 py-2 text-left">Bidders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="p-2">
                          <Link
                            href={`/auctions/${sale.id}`}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                          >
                            <img
                              src={sale.productimages}
                              alt={sale.productname}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            {sale.productname}
                          </Link>
                        </td>
                        <td className="px-4 py-2">{sale.category?.handle}</td>
                        <td className="px-4 py-2">{sale.type}</td>
                        <td className="px-4 py-2">{sale.format}</td>
                        <td className="px-4 py-2">{sale.starting_bid}</td>
                        <td className="px-4 py-2 font-semibold text-green-700">
                          ${sale.salePrice}
                        </td>
                        <td className="px-4 py-2">
                          {/* <div className="text-sm">{sale.buyername}</div> */}
                          {/* <div className="p-2 text-gray-600"> */}
                          {sale.buyer}
                          {/* </div> */}
                        </td>
                        <td className="px-4 py-2">
                          {sale.saleDate
                            ? DateTime.fromISO(sale.saleDate).toLocaleString(
                                DateTime.DATETIME_MED
                              )
                            : "N/A"}
                        </td>
                        <td
                          className="px-4 py-2 text-blue-600 hover:underline cursor-pointer font-semibold flex items-center gap-1"
                          onClick={() => {
                            setSelectedAuctionId(sale.id);
                            setShowSellerLeaderboard(true);
                          }}
                        >
                          <Eye className="w-4 h-4 text-blue-500" />
                          {sale.bidder_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {selectedSection === "reverseAuction" && (
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setManageAuctionReverseTab("active")}
                className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            manageAuctionReverseTab === "active"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300"
          }`}
              >
                Active Bids ({activeBids.length})
              </button>

              <button
                onClick={() => setManageAuctionReverseTab("won")}
                className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            manageAuctionReverseTab === "won"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300"
          }`}
              >
                Won Auctions ({awardedAuctions.length})
              </button>
              <button
                onClick={() => setManageAuctionReverseTab("lost")}
                className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            manageAuctionReverseTab === "lost"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300"
          }`}
              >
                Lost Auctions ({lostBids.length})
              </button>
            </div>

            {manageAuctionReverseTab === "active" && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Gavel className="h-5 w-5 text-violet-500 animate-bounce" />
                    Auctions I’m Bidding On
                  </h2>
                </div>
                {activeBids.length === 0 ? (
                  <p className="text-sm text-gray-500">No Auctions.</p>
                ) : (
                  <div className="overflow-x-auto rounded-md mt-6">
                    <table className="min-w-full text-sm border border-gray-100 dark:border-gray-800">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left">Auction Name</th>
                          <th className="px-4 py-2 text-left">Format</th>
                          <th className="px-4 py-2 text-left">Category</th>
                          <th className="px-4 py-2 text-left">Starting Bid</th>
                          <th className="px-4 py-2 text-left">Curent Bid</th>
                          <th className="px-4 py-2 text-left">
                            My Bid Amount{" "}
                          </th>
                          <th className="px-4 py-2 text-left">Ends In</th>
                          {/* <th className="px-4 py-2 text-left">Bidders</th> */}
                          {/* <th className="px-4 py-2 text-left">Action</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {activeBids.map((liveAuction, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="p-2">
                              <Link
                                href={`/auctions/reverse/${liveAuction.auctionId}`}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                              >
                                <Image
                                  src={
                                    liveAuction.productimages ||
                                    "/placeholder.svg"
                                  }
                                  alt={liveAuction.productName}
                                  width={24}
                                  height={24}
                                  className="w-6 h-6 rounded-full object-cover"
                                  placeholder="blur"
                                  blurDataURL="/placeholder.svg" // optional blurred placeholder
                                />
                                {liveAuction.productName}
                              </Link>
                            </td>
                            <td className="px-4 py-2 text-gray-600 capitalize">
                              {liveAuction.auctionSubtype}
                            </td>
                            <td className="px-4 py-2 text-gray-600 capitalize">
                              {liveAuction.category?.handle}
                            </td>
                            <td className="px-4 py-2 text-gray-600 ">
                              ${liveAuction.startprice}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              ${liveAuction.currentbid}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              ${liveAuction.bidAmount}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {
                                <LiveTimer
                                  startTime={liveAuction.scheduledstart}
                                  duration={liveAuction.auctionduration}
                                />
                              }
                            </td>
                            {/* <td
                              className="px-4 py-2 flex items-center gap-1 font-bold text-blue-600 cursor-pointer hover:underline"
                              onClick={() => {
                                setSelectedAuctionId(liveAuction.auctionId);
                                setShowSellerLeaderboard(true);
                              }}
                            >
                              <Eye className="w-4 h-4 text-blue-500" />
                              {liveAuction.totalBids}
                            </td> */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {manageAuctionReverseTab === "won" && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Gavel className="h-5 w-5 text-orange-500 animate-bounce" />
                    Auctions Awarded to Me
                  </h2>
                </div>
                {awardedAuctions.length === 0 ? (
                  <p className="text-sm text-gray-500">No Awarded Auctions</p>
                ) : (
                  <div className="overflow-x-auto rounded-md mt-6">
                    <table className="min-w-full text-sm border border-gray-100 dark:border-gray-800">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <tr>
                          <th className="text-left px-4 p-2">Auction Name</th>
                          <th className="text-left px-4 p-2">Format</th>
                          <th className="px-4 py-2 text-left">Category</th>
                          <th className="text-left px-4 p-2">Buyer</th>
                          <th className="text-left px-4 py-2 ">Target Price</th>
                          <th className="text-left px-4 p-2">Awarded Date</th>
                          <th className="text-left px-4 p-2">My Bid Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {awardedAuctions.map((award, index) => (
                          <tr
                            key={award.auctionId}
                            className={`${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } dark:bg-transparent`}
                          >
                            <td className="p-2">
                              <Link
                                href={`/auctions/reverse/${award.auctionId}`}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                              >
                                <img
                                  src={award.productimage}
                                  alt={award.productName}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                {award.productName}
                              </Link>
                            </td>
                            <td className="p-2 capitalize text-gray-600">
                              {award.auctionSubtype}
                            </td>
                            <td className="p-2 text-gray-600">
                              {award.category?.handle}
                            </td>

                            <td className="p-2 text-gray-600">
                              {"B-Madhur Uniyal"}
                            </td>
                            <td className="p-2 text-gray-600">
                              ${award.targetPrice}
                            </td>
                            <td className="px-4 text-gray-600 py-2">
                              {award.awardedAt
                                ? formatDateTime(new Date(award.awardedAt))
                                : "—"}
                            </td>
                            <td className="p-2 text-gray-600">
                              ${award.bidAmount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {manageAuctionReverseTab === "lost" && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Gavel className="h-5 w-5 text-orange-500 animate-bounce" />
                    Auctions Not Awarded
                  </h2>
                </div>
                {lostBids.length === 0 ? (
                  <p className="text-sm text-gray-500">Auctions Not Awarded</p>
                ) : (
                  <div className="overflow-x-auto rounded-md mt-6">
                    <table className="min-w-full text-sm border border-gray-100 dark:border-gray-800">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <tr>
                          <th className="text-left px-4 p-2">Auction Name</th>
                          <th className="text-left px-4 py-2 ">Format</th>
                          <th className="px-4 py-2 text-left">Category</th>
                          <th className="text-left px-4 p-2">End Date</th>
                          <th className="text-left px-4 p-2">Buyer</th>
                          <th className="text-left px-4 py-2 ">Target Price</th>
                          <th className="text-left px-4 p-2">My Bid Amount</th>
                          {/* <th className="px-4 py-2 text-left">Action</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {lostBids.map((award, index) => (
                          <tr
                            key={award.auctionId}
                            className={`${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } dark:bg-transparent`}
                          >
                            <td className="p-2">
                              <Link
                                href={`/auctions/reverse/${award.auctionId}`}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                              >
                                <img
                                  src={award.productimages}
                                  alt={award.productName}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                {award.productName}
                              </Link>
                            </td>
                            <td className="p-2 capitalize text-gray-600">
                              {award.auctionSubtype}
                            </td>
                            <td className="p-2 text-gray-600">
                              {award.category?.handle}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {formatDateTime(
                                getEndDate(
                                  new Date(award.scheduledstart),
                                  award.auctionduration ?? {}
                                )
                              )}
                            </td>
                            <td className="p-2 capitalize text-gray-600">
                              {award.sellerName}
                            </td>
                            <td className="p-2 text-gray-600">
                              ${award.targetprice}
                            </td>
                            <td className="p-2 text-gray-600">
                              ${award.bidAmount?.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {selectedSection === "manageAuction" && (
          <div>
            {manageAuctionTab !== "create" && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setManageAuctionTab("live")}
                  className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            manageAuctionTab === "live"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300"
          }`}
                >
                  Live ({liveCount})
                </button>

                <button
                  onClick={() => setManageAuctionTab("upcoming")}
                  className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            manageAuctionTab === "upcoming"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300"
          }`}
                >
                  Upcoming ({upcomingCount})
                </button>
                <button
                  onClick={() => setManageAuctionTab("pending")}
                  className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            manageAuctionTab === "pending"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300"
          }`}
                >
                  Pending Approval ({approvalPendings.length})
                </button>

                <button
                  onClick={() => setManageAuctionTab("rejected")}
                  className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            manageAuctionTab === "rejected"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300"
          }`}
                >
                  Admin Rejected ({approvalRejected.length})
                </button>
                <button
                  onClick={() => setManageAuctionTab("unsold")}
                  className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            manageAuctionTab === "unsold"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300"
          }`}
                >
                  Unsold Items ({unsoldCount})
                </button>
                <button
                  onClick={() => setManageAuctionTab("Evaluate")}
                  className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            manageAuctionTab === "Evaluate"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300"
          }`}
                >
                  Evaluate Bids ({evaluateAuctions.length})
                </button>
                <button
                  onClick={() => setManageAuctionTab("winners")}
                  className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            manageAuctionTab === "winners"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300"
          }`}
                >
                  Winners - Sold Items ({sales.length})
                </button>
              </div>
            )}

            {manageAuctionTab === "create" ? <CreateAuction /> : null}
            {manageAuctionTab === "live" && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Gavel className="h-5 w-5 text-orange-500 animate-bounce" />
                    Live Auctions
                  </h2>
                </div>
                {liveAuctions.length === 0 ? (
                  <p className="text-sm text-gray-500">No sold items yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-md mt-6">
                    <table className="min-w-full text-sm border border-gray-100 dark:border-gray-800">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left">Auction Name</th>
                          <th className="px-4 py-2 text-left">Format</th>
                          <th className="px-4 py-2 text-left">Category</th>
                          <th className="px-4 py-2 text-left">Starting Bid</th>
                          <th className="px-4 py-2 text-left">Buy Now Price</th>
                          <th className="px-4 py-2 text-left">End Date</th>
                          <th className="px-4 py-2 text-left">Highest Bid</th>
                          <th className="px-4 py-2 text-left">Ends In</th>
                          <th className="px-4 py-2 text-left">Bidders</th>
                          {/* <th className="px-4 py-2 text-left">Action</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {liveAuctions.map((liveAuction, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="p-2">
                              <Link
                                href={`/auctions/${liveAuction.id}`}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                              >
                                <img
                                  src={liveAuction.productimages}
                                  alt={liveAuction.productname}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                {liveAuction.productname}
                              </Link>
                            </td>
                            <td className="px-4 py-2 text-gray-600 capitalize">
                              {liveAuction.auctionsubtype}
                            </td>
                            <td className="px-4 py-2 text-gray-600 capitalize">
                              {liveAuction.category?.handle}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              ${liveAuction.startprice}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {liveAuction.buy_now_price
                                ? `$${liveAuction.buy_now_price}`
                                : "N/A"}
                            </td>

                            <td className="px-4 py-2 text-gray-600">
                              {formatDateTime(
                                getEndDate(
                                  new Date(liveAuction.scheduledstart),
                                  liveAuction.auctionduration ?? {}
                                )
                              )}
                            </td>
                            <td className="px-4 py-2 font-bold text-green-600">
                              {liveAuction.bidder_count === 0
                                ? "N/A"
                                : `$${liveAuction.currentbid}`}
                            </td>
                            <td className="px-4 py-2 ">
                              {
                                <LiveTimer
                                  startTime={liveAuction.scheduledstart}
                                  duration={liveAuction.auctionduration}
                                />
                              }
                            </td>
                            <td
                              className="px-4 py-2 flex items-center gap-1 font-bold text-blue-600 cursor-pointer hover:underline"
                              onClick={() => {
                                setSelectedAuctionId(liveAuction.id);
                                setShowSellerLeaderboard(true);
                              }}
                            >
                              <Eye className="w-4 h-4 text-blue-500" />
                              {liveAuction.bidder_count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {manageAuctionTab === "upcoming" && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 animate-bounce" />
                    Upcoming Auctions
                  </h2>
                </div>
                {upcomingAuctions.length === 0 ? (
                  <p className="text-sm text-gray-500">Upcoming Auction</p>
                ) : (
                  <div className="overflow-x-auto rounded-md mt-6">
                    <table className="min-w-full text-sm border border-gray-100 dark:border-gray-800">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left">Auction Name</th>
                          <th className="px-4 py-2 text-left">Format</th>
                          <th className="px-4 py-2 text-left">Category</th>
                          <th className="px-4 py-2 text-left">Starting Bid</th>
                          <th className="px-4 py-2 text-left">Start Date</th>
                          <th className="px-4 py-2 text-left">End Date</th>
                          <th className="px-4 py-2 text-left">Starts In</th>
                          <th className="px-4 py-2 text-left">Actions</th>
                          {/* <th className="px-4 py-2 text-left">Action</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {upcomingAuctions.map((upcoming, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="p-2">
                              <Link
                                href={`/auctions/${upcoming.id}`}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                              >
                                <img
                                  src={upcoming.productimages}
                                  alt={upcoming.productname}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                {upcoming.productname}
                              </Link>
                            </td>
                            <td className="px-4 py-2 text-gray-600 capitalize">
                              {upcoming.auctionsubtype}
                            </td>
                            <td className="px-4 py-2 text-gray-600 capitalize">
                              {upcoming.category?.handle}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              ${upcoming.startprice}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {formatDateTime(
                                new Date(upcoming.scheduledstart)
                              )}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {formatDateTime(
                                getEndDate(
                                  new Date(upcoming.scheduledstart),
                                  upcoming.auctionduration ?? {}
                                )
                              )}
                            </td>
                            <td>
                              <LiveTimer
                                className="text-green-500 font-bold"
                                startTime={upcoming.scheduledstart}
                                duration={upcoming.auctionduration}
                              />
                            </td>
                            <td className="p-2 flex space-x-1">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleNavigate(
                                    `/seller-panel/my-listings/seller-edit/${upcoming.id}`
                                  )
                                }
                                className="text-green-600 hover:text-green-700 p-1 w-6 h-6 flex items-center justify-center"
                                // disabled={!auction.editable}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const confirmed = window.confirm(
                                    "Are you sure you want to delete this auction?"
                                  );
                                  if (confirmed) {
                                    // handleDelete(auction.id);
                                  }
                                }}
                                className="text-red-600 hover:text-red-700 p-1 w-6 h-6"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {manageAuctionTab === "Evaluate" && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Lock className="h-4 w-4 text-blue-500  animate-bounce" />
                    Evaluate Auctions - Declare Winners
                  </h2>
                </div>
                {evaluateAuctions.length === 0 ? (
                  <p className="text-sm text-gray-500">No Evaluate Auctions</p>
                ) : (
                  <div className="overflow-x-auto rounded-md mt-6">
                    <table className="min-w-full text-sm border border-gray-100 dark:border-gray-800">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left">Auction Name</th>
                          <th className="px-4 py-2 text-left">Format</th>
                          <th className="px-4 py-2 text-left">Category</th>
                          <th className="px-4 py-2 text-left">Start date</th>
                          <th className="px-4 py-2 text-left">End Date</th>
                          <th className="px-4 py-2 text-left">Starting Bid</th>
                          <th className="px-4 py-2 text-left">
                            {" "}
                            Totlal Bidders
                          </th>
                          <th className="px-4 py-2 text-left">Winning Bid</th>
                          <th className="px-4 py-2 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evaluateAuctions.map((upcoming, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="p-2">
                              <Link
                                href={`/auctions/${upcoming.id}`}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                              >
                                <img
                                  src={upcoming.productimages}
                                  alt={upcoming.productname}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                {upcoming.productname}
                              </Link>
                            </td>
                            <td className="px-4 py-2 text-gray-600 capitalize">
                              {upcoming.auctionsubtype}
                            </td>
                            <td className="px-4 py-2 text-gray-600 capitalize">
                              {upcoming.category?.handle}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {formatDateTime(
                                new Date(upcoming.scheduledstart)
                              )}
                            </td>

                            <td className="px-4 py-2 text-gray-600">
                              {formatDateTime(
                                getEndDate(
                                  new Date(upcoming.scheduledstart),
                                  upcoming.auctionduration ?? {}
                                )
                              )}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              ${upcoming.startprice}
                            </td>

                            <td className="px-4 py-2 text-gray-600">
                              {upcoming.bidder_count}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {upcoming.currentbid}
                            </td>

                            {/* Inside your table row */}
                            <td className="p-2">
                              <button
                                className="text-xs bg-blue-600 px-2 py-1 rounded-sm text-white"
                                onClick={() => setOpenAuctionId(upcoming.id)} // track which auction to show
                              >
                                View Winner
                              </button>
                            </td>
                            {openAuctionId && (
                              <WinnerModal
                                open={true}
                                onOpenChange={() => setOpenAuctionId(null)} // close modal
                                auctionId={openAuctionId}
                                onWinnerConfirmed={fetchSales}
                                auctionName={
                                  auctions.find((a) => a.id === openAuctionId)
                                    ?.productname || ""
                                }
                              />
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* WinnerModal */}
                  </div>
                )}
              </div>
            )}
            {manageAuctionTab === "pending" && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Hourglass className="h-4 w-4 text-yellow-500 animate-bounce" />
                    Approval Pending
                  </h2>
                </div>
                {approvalPendings.length === 0 ? (
                  <p className="text-sm text-gray-500">Approval Pending</p>
                ) : (
                  <div className="overflow-x-auto rounded-md mt-6">
                    <table className="min-w-full text-sm border border-gray-100 dark:border-gray-800">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left">Auction Name</th>
                          <th className="px-4 py-2 text-left">Format</th>
                          <th className="px-4 py-2 text-left">Category</th>
                          <th className="px-4 py-2 text-left">Starting Bid</th>
                          <th className="px-4 py-2 text-left">Start Date</th>
                          <th className="px-4 py-2 text-left">End Date</th>
                          <th className="px-4 py-2 text-left">Actions</th>

                          {/* <th className="px-4 py-2 text-left">Action</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {approvalPendings.map((approval, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="p-2">
                              <Link
                                href={`/auctions/${approval.id}`}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                              >
                                <img
                                  src={approval.productimages}
                                  alt={approval.productname}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                {approval.productname}
                              </Link>
                            </td>
                            <td className="px-4 py-2 text-gray-600 capitalize">
                              {approval.format}
                            </td>
                            <td className="px-4 py-2 text-gray-600 capitalize">
                              {approval.category?.handle}
                            </td>

                            <td className="px-4 py-2 text-gray-600">
                              ${approval.starting_bid}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {formatDateTime(
                                new Date(approval.scheduledstart)
                              )}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {formatDateTime(
                                getEndDate(
                                  new Date(approval.scheduledstart),
                                  approval.auctionduration ?? {}
                                )
                              )}
                            </td>
                            <td className="p-2 flex space-x-1">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleNavigate(
                                    `/seller-panel/my-listings/seller-edit/${approval.id}`
                                  )
                                }
                                className="text-green-600 hover:text-green-700 p-1 w-6 h-6 flex items-center justify-center"
                                // disabled={!auction.editable}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>

                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const confirmed = window.confirm(
                                    "Are you sure you want to delete this auction?"
                                  );
                                  if (confirmed) {
                                    // handleDelete(auction.id);
                                  }
                                }}
                                className="text-red-600 hover:text-red-700 p-1 w-6 h-6"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {manageAuctionTab === "rejected" && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500 animate-bounce" />
                    Rejected
                  </h2>
                </div>
                {approvalRejected.length === 0 ? (
                  <p className="text-sm text-gray-500">Rejected </p>
                ) : (
                  <div className="overflow-x-auto rounded-md mt-6">
                    <table className="min-w-full text-sm border border-gray-100 dark:border-gray-800">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left">Auction Name</th>
                          <th className="px-4 py-2 text-left">Format</th>
                          <th className="px-4 py-2 text-left">Category</th>
                          <th className="px-4 py-2 text-left">Starting Bid</th>
                          <th className="px-4 py-2 text-left">Start Date</th>
                          <th className="px-4 py-2 text-left">End Date</th>
                          <th className="px-4 py-2 text-left">Reason</th>
                          <th className="px-4 py-2 text-left">Actions</th>
                          {/* <th className="px-4 py-closed text-left">Action</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {approvalRejected.map((closed, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="p-2">
                              <Link
                                href={`/auctions/${closed.id}`}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                              >
                                <img
                                  src={closed.productimages}
                                  alt={closed.productname}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                {closed.productname}
                              </Link>
                            </td>
                            <td className="px-4 py-2 text-gray-600 capitalize">
                              {closed.format}
                            </td>
                            <td className="px-4 py-2 text-gray-600 capitalize">
                              {closed.category?.handle}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              ${closed.starting_bid}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {formatDateTime(new Date(closed.scheduledstart))}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {formatDateTime(
                                getEndDate(
                                  new Date(closed.scheduledstart),
                                  closed.auctionduration ?? {}
                                )
                              )}
                            </td>
                            <td className="px-4 py-2 text-gray-600">{"N/A"}</td>
                            <td className="px-4 py-2 text-gray-600">
                              <Link
                                href={`/seller-panel/my-listings/seller-edit/${closed.id}`}
                                className="   text-blue-500 hover:text-blue-500 p-1 w-16 h-6 flex items-center justify-center"
                              >
                                Re-list
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {manageAuctionTab === "unsold" && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Archive className="h-5 w-5 text-red-500 animate-bounce" />
                  Unsold Items
                </h2>
                {unsoldSales.length === 0 ? (
                  <p className="text-sm text-gray-500">No sold items yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-md mt-6">
                    <table className="min-w-full text-sm border border-gray-100 dark:border-gray-800">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <tr>

                          
                          <th className="px-4 py-2 text-left">Auction Name</th>
                          <th className="px-4 py-2 text-left">Format</th>
                          <th className="px-4 py-2 text-left">Category</th>
                          <th className="px-4 py-2 text-left">Starting Bid</th>
                          <th className="px-4 py-2 text-left">Closed On</th>
                          <th className="px-4 py-2 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unsoldSales.map((unsoldSale, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="p-2">
                              <Link
                                href={`/auctions/${unsoldSale.id}`}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                              >
                                <img
                                  src={unsoldSale.productimages}
                                  alt={unsoldSale.productname}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                {unsoldSale.productname}
                              </Link>
                            </td>
                            <td className="px-4 py-2 text-gray-600 capitalize">
                              {unsoldSale.auction_subtype}
                            </td>
                            <td className="px-4 py-2 text-gray-600  capitalize">
                              {unsoldSale.category?.handle}
                            </td>
                            <td className="px-4 py-2 text-gray-600 ">
                              {unsoldSale.starting_bid}
                            </td>
                            <td className="px-4 py-2 text-gray-600 ">
                              {formatDateTime(
                                getEndDate(
                                  new Date(unsoldSale.scheduledstart),
                                  unsoldSale.auctionduration ?? {}
                                )
                              )}
                            </td>
                            <td className="px-4 py-2">
                              <Link
                                href={`/seller-panel/my-listings/seller-edit/${unsoldSale.id}`}
                                className="   text-blue-500 hover:text-blue-500 p-1 w-16 h-6 flex items-center justify-center"
                              >
                                Re-list
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {manageAuctionTab === "winners" && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <PackageCheck className="h-5 w-5 text-blue-500 animate-bounce" />
                  Sold Items (Winners)
                </h2>
                {sales.length === 0 ? (
                  <p className="text-sm text-gray-500">No sold items yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-md mt-6">
                    <table className="min-w-full text-sm border border-gray-100 dark:border-gray-800">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left">Auction Name</th>
                          <th className="px-4 py-2 text-left">Format</th>
                          <th className="px-4 py-2 text-left">Category</th>
                          <th className="px-4 py-2 text-left">Starting Bid</th>
                          <th className="px-4 py-2 text-left">Winning Bid </th>
                          <th className="px-4 py-2 text-left">Winner</th>
                          <th className="px-4 py-2 text-left">Sold On</th>
                          <th className="px-4 py-2 text-left">Bidders</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales.map((sale, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="p-2">
                              <Link
                                href={`/auctions/${sale.id}`}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                              >
                                <img
                                  src={sale.productimages}
                                  alt={sale.productname}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                {sale.productname}
                              </Link>
                            </td>
                            <td className="px-4 py-2 capitalize text-gray-600 ">
                              {sale.format}
                            </td>
                            <td className="px-4 py-2 capitalize text-gray-600">
                              {sale.category?.handle}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {sale.starting_bid}
                            </td>
                            <td className="px-4 py-2 font-semibold text-green-700">
                              ${sale.salePrice}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {/* <div className="text-sm">{sale.buyername}</div> */}
                              {/* <div className="p-2 text-gray-600"> */}
                              {sale.buyer}
                              {/* </div> */}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {sale.saleDate
                                ? DateTime.fromISO(
                                    sale.saleDate
                                  ).toLocaleString(DateTime.DATETIME_MED)
                                : "N/A"}
                            </td>
                            <td
                              className="px-4 py-2 text-blue-600 hover:underline cursor-pointer font-semibold flex items-center gap-1"
                              onClick={() => {
                                setSelectedAuctionId(sale.id);
                                setShowSellerLeaderboard(true);
                              }}
                            >
                              <Eye className="w-4 h-4 text-blue-500" />
                              {sale.bidder_count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {selectedSection === "buynow" && (
          <div>
            {manageAuctionTab !== "create" && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setBuyNowTab("live")}
                  className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            buyNowTab === "live"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300"
          }`}
                >
                  Live ({BuyNowProducts.length})
                </button>
                <button
                  onClick={() => setBuyNowTab("approval")}
                  className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            buyNowTab === "approval"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300"
          }`}
                >
                  Pending Approval ({approvalPendingsBuynow.length})
                </button>
                <button
                  onClick={() => setBuyNowTab("rejected")}
                  className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            buyNowTab === "rejected"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300"
          }`}
                >
                  Admin Rejected ({approvalRejected.length})
                </button>
                <button
                  onClick={() => setBuyNowTab("upcoming")}
                  className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            buyNowTab === "upcoming"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300"
          }`}
                >
                  Upcoming ({upcomingBuyNow.length})
                </button>
                <button
                  onClick={() => setBuyNowTab("Sold")}
                  className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            buyNowTab === "Sold"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300"
          }`}
                >
                  Sold Out ({soldBuyNow.length})
                </button>
              </div>
            )}
            {buyNowTab === "live" && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-500 animate-bounce" />
                    Buy Now Products
                  </h2>
                </div>
                {BuyNowProducts.length === 0 ? (
                  <p className="text-sm text-gray-500">No Live items</p>
                ) : (
                  <div className="overflow-x-auto rounded-md mt-6">
                    <table className="min-w-full text-sm border border-gray-100 dark:border-gray-800">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left">Product Name</th>
                          <th className="px-4 py-2 text-left">Category</th>
                          <th className="px-4 py-2 text-left">Buy Now Price</th>
                          <th className="px-4 py-2 text-left">Start Date In</th>
                          <th className="px-4 py-2 text-left">End Date</th>
                          <th className="px-4 py-2 text-left">Ends In</th>
                          {/* <th className="px-4 py-2 text-left">Action</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {BuyNowProducts.map((liveAuction, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="p-2">
                              <Link
                                href={`/buyNow/${liveAuction.id}`}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                              >
                                <img
                                  src={liveAuction.productimages}
                                  alt={liveAuction.productname}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                {liveAuction.productname}
                              </Link>
                            </td>
                            <td className="px-4 py-2 text-gray-600 capitalize">
                              {liveAuction.category?.handle}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              ${liveAuction.buy_now_price}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {formatDateTime(
                                new Date(liveAuction.scheduledstart)
                              )}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {formatDateTime(
                                getEndDate(
                                  new Date(liveAuction.scheduledstart),
                                  liveAuction.auctionduration ?? {}
                                )
                              )}
                            </td>
                            <td className="px-4 py-2 ">
                              {
                                <LiveTimer
                                  startTime={liveAuction.scheduledstart}
                                  duration={liveAuction.auctionduration}
                                />
                              }
                            </td>
                            {/* <td className="p-2 flex space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const confirmed = window.confirm(
                                    "Are you sure you want to mark this auction as inactive?"
                                  );
                                  if (confirmed) {
                                 
                                    setBuyNowProducts(
                                      (prev) =>
                                        prev.filter(
                                          (item) => item.id !== liveAuction.id
                                        ) 
                                    );
                                  }
                                }}
                                className="text-gray-600 hover:text-gray-800 px-2 py-1 text-xs rounded-md border border-gray-300"
                              >
                                Inactive
                              </Button>
                            </td> */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {buyNowTab === "upcoming" && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 animate-bounce" />
                    Upcoming
                  </h2>
                </div>
                {upcomingBuyNow.length === 0 ? (
                  <p className="text-sm text-gray-500">No Products</p>
                ) : (
                  <div className="overflow-x-auto rounded-md mt-6">
                    <table className="min-w-full text-sm border border-gray-100 dark:border-gray-800">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left">Product Name</th>
                          <th className="px-4 py-2 text-left">Category</th>
                          <th className="px-4 py-2 text-left">Buy Now Price</th>
                          <th className="px-4 py-2 text-left">Start Date</th>
                          <th className="px-4 py-2 text-left">End Date</th>
                          <th className="px-4 py-2 text-left">Starts In</th>
                          <th className="px-4 py-2 text-left">Actions</th>
                          {/* <th className="px-4 py-2 text-left">Action</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {upcomingBuyNow.map((upcoming, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="p-2">
                              <Link
                                href={`/buyNow/${upcoming.id}`}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                              >
                                <img
                                  src={upcoming.productimages}
                                  alt={upcoming.productname}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                {upcoming.productname}
                              </Link>
                            </td>

                            <td className="px-4 py-2 text-gray-600 capitalize">
                              {upcoming.category?.handle}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              ${upcoming.buy_now_price}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {formatDateTime(
                                new Date(upcoming.scheduledstart)
                              )}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {formatDateTime(
                                getEndDate(
                                  new Date(upcoming.scheduledstart),
                                  upcoming.auctionduration ?? {}
                                )
                              )}
                            </td>
                            <td>
                              <LiveTimer
                                className="text-green-500 font-bold"
                                startTime={upcoming.scheduledstart}
                                duration={upcoming.auctionduration}
                              />
                            </td>
                            <td className="p-2 flex items-center">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleNavigate(
                                    `/seller-panel/my-listings/seller-edit/${upcoming.id}`
                                  )
                                }
                                className="text-green-600 hover:text-green-700 p-1 w-6 h-6 flex items-center justify-center"
                                // disabled={!auction.editable}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {buyNowTab === "rejected" && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 animate-bounce" />
                    Rejected Product
                  </h2>
                </div>
                {approvalRejected.length === 0 ? (
                  <p className="text-sm text-gray-500">No Products</p>
                ) : (
                  <div className="overflow-x-auto rounded-md mt-6">
                    <table className="min-w-full text-sm border border-gray-100 dark:border-gray-800">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left">Product Name</th>
                          <th className="px-4 py-2 text-left">Category</th>
                          <th className="px-4 py-2 text-left">Buy Now Price</th>
                          <th className="px-4 py-2 text-left">Start Date</th>
                          <th className="px-4 py-2 text-left">End Date</th>
                          <th className="px-4 py-2 text-left">Starts In</th>
                          <th className="px-4 py-2 text-left">Actions</th>
                          {/* <th className="px-4 py-2 text-left">Action</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {approvalRejected.map((upcoming, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="p-2">
                              <Link
                                href={`/buyNow/${upcoming.id}`}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                              >
                                <img
                                  src={upcoming.productimages}
                                  alt={upcoming.productname}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                {upcoming.productname}
                              </Link>
                            </td>
                            {/* <td className="px-4 py-2 text-gray-600 capitalize">
                              {upcoming.categoryid}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              ${upcoming.buy_now_price}
                            </td> */}
                            <td className="px-4 py-2 text-gray-600">
                              {formatDateTime(
                                new Date(upcoming.scheduledstart)
                              )}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {formatDateTime(
                                getEndDate(
                                  new Date(upcoming.scheduledstart),
                                  upcoming.auctionduration ?? {}
                                )
                              )}
                            </td>
                            <td>
                              <LiveTimer
                                className="text-green-500 font-bold"
                                startTime={upcoming.scheduledstart}
                                duration={upcoming.auctionduration}
                              />
                            </td>
                            <td className="p-2 flex items-center">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleNavigate(
                                    `/seller-panel/my-listings/seller-edit/${upcoming.id}`
                                  )
                                }
                                className="text-green-600 hover:text-green-700 p-1 w-6 h-6 flex items-center justify-center"
                                // disabled={!auction.editable}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {buyNowTab === "approval" && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 animate-bounce" />
                    Pending Approval
                  </h2>
                </div>
                {approvalPendingsBuynow.length === 0 ? (
                  <p className="text-sm text-gray-500">No Products</p>
                ) : (
                  <div className="overflow-x-auto rounded-md mt-6">
                    <table className="min-w-full text-sm border border-gray-100 dark:border-gray-800">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left">Product Name</th>
                          <th className="px-4 py-2 text-left">Category</th>
                          <th className="px-4 py-2 text-left">Buy Now Price</th>
                          <th className="px-4 py-2 text-left">Start Date</th>
                          <th className="px-4 py-2 text-left">End Date</th>
                          <th className="px-4 py-2 text-left">Actions</th>
                          {/* <th className="px-4 py-2 text-left">Action</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {approvalPendingsBuynow.map((upcoming, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="p-2">
                              <Link
                                href={`/buyNow/${upcoming.id}`}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                              >
                                <img
                                  src={upcoming.productimages}
                                  alt={upcoming.productname}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                {upcoming.productname}
                              </Link>
                            </td>

                            <td className="px-4 py-2 text-gray-600 capitalize">
                              {upcoming.category?.handle}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              ${upcoming.buy_now_price}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {formatDateTime(
                                new Date(upcoming.scheduledstart)
                              )}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {formatDateTime(
                                getEndDate(
                                  new Date(upcoming.scheduledstart),
                                  upcoming.auctionduration ?? {}
                                )
                              )}
                            </td>
                            <td className="p-2 flex items-center">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleNavigate(
                                    `/seller-panel/my-listings/buynow-edit/${upcoming.id}`
                                  )
                                }
                                className="text-green-600 hover:text-green-700 p-1 w-6 h-6 flex items-center justify-center"
                                // disabled={!auction.editable}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {buyNowTab === "Sold" && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 animate-bounce" />
                    Sold Out
                  </h2>
                </div>
                {soldBuyNow.length === 0 ? (
                  <p className="text-sm text-gray-500">Sold Out</p>
                ) : (
                  <div className="overflow-x-auto rounded-md mt-6">
                    <table className="min-w-full text-sm border border-gray-100 dark:border-gray-800">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left">Product Name</th>
                          <th className="px-4 py-2 text-left">Category</th>
                          <th className="px-4 py-2 text-left">Buy Now Price</th>
                          <th className="px-4 py-2 text-left">Start Date</th>
                          <th className="px-4 py-2 text-left">End Date</th>
                          {/* <th className="px-4 py-2 text-left">Purchaser</th> */}
                          {/* <th className="px-4 py-2 text-left">Action</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {soldBuyNow.map((upcoming, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="p-2">
                              <Link
                                href={`/buyNow/${upcoming.id}`}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                              >
                                <img
                                  src={upcoming.productimages}
                                  alt={upcoming.productname}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                {upcoming.productname}
                              </Link>
                            </td>

                            <td className="px-4 py-2 text-gray-600 capitalize">
                              {upcoming.category?.handle}
                            </td>

                            <td className="px-4 py-2 text-gray-600">
                              ${upcoming.buy_now_price}
                            </td>

                            <td className="px-4 py-2 text-gray-600">
                              {formatDateTime(
                                new Date(upcoming.scheduledstart)
                              )}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {formatDateTime(
                                getEndDate(
                                  new Date(upcoming.scheduledstart),
                                  upcoming.auctionduration ?? {}
                                )
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
