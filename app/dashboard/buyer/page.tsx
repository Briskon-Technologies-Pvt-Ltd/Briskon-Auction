"use client";

import { act, useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Gavel,
  TrendingUp,
  Heart,
  ShoppingBag,
  History,
  Bell,
  Settings,
  Trophy,
  XCircle,
  Calendar,
  Clock,
  TrendingDown,
  Eye,
  ArrowUpIcon,
  ArrowDownIcon,
  Repeat,
  Inbox,
  Medal,
  Award,
  AlarmClockOff,
  CirclePlus,
  Trash,
  Edit,
  Lock,
  Trash2,
  Hourglass,
  Circle,
  CircleX,
  Currency,
  Mail,
  ShoppingCart,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import CreateAuction from "@/app/seller-panel/create-listing/page";
import LiveTimer from "@/app/livetimer/page";
import SellerBidLeaderboard from "@/app/seller-bid-leader-board/page";
import ProfileSettingsPage from "@/app/settings/profile/page";
import CreateReverseAuction from "@/app/buyer-panel/create-reverse-listing/page";
import BuyerLeaderboard from "@/app/buyer-leaderboard/page";
import DeclareSellerWinnerModal from "@/app/declear-winner/declear-seller-winner/page";
type Bid = {
  id: string;
  auction_name: string;
  your_bid: number;
  seller_name: string;
  current_bid: number;
  auctionSubtype: string | null;
  status: string;
  scheduledstart?: string | null;
  position?: number;
  productimage: string;
  auctionduration?: {
    days?: number;
    hours?: number;
    minutes?: number;
  } | null;
};

interface ActiveBid {
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
  scheduledstart: string;
  productimages: string;
  auctionduration?: { days?: number; hours?: number; minutes?: number };
}

type WonAuction = {
  id: string;
  sellerName: string;
  auctionId: string;
  productName: string;
  auctionType: "forward" | "reverse" | string;
  startAmount: number;
  targetprice?: number;
  winningBidAmount: number;
};
interface WonAuctionEntry {
  sellerName: string;
  auctionId: string;
  productName: string;
  auctionType: string | null;
  startAmount: number;
  winningBidAmount: number;
  targetprice?: number; // Optional field for target price
  productimage: string;
  auctionsubtype: string;
  category?: { handle: string };
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
  winningBidAmount: number;
  targetPrice?: number; // Optional field for target price
  productimage: string;
  category?: { handle: string };
  auctionSubtype: string;
  currentbid: number;
  bidAmount: number;
}
interface LiveAuction {
  id: string;
  productname: string;
  currentbid: number | null;
  productimages: string;
  startprice: number;
  auctiontype: string;
  auctionsubtype: string;
  category?: { handle: string };
  bidder_count: number;
  auctionduration?: { days?: number; hours?: number; minutes?: number };
  scheduledstart: string;
}
interface closedAuctionItem {
  id: string;
  productname: string;
  currentbid: number | null;
  productimages: string;
  startprice: number;
  auctiontype: string;
  auctionsubtype: string;
    category?: { handle: string };
  bidder_count: number;
  scheduledstart: string;
  targetprice: number;
  auctionduration?: { days?: number; hours?: number; minutes?: number };
}
type LostAuctionEntry = {
  auctionId: string;
  sellerName: string;
  productName: string;
  auctionType: string | null;
  startAmount: number;
  userBidAmount: number | null;
  winningBidAmount: number;
  category?: { handle: string };
  auctionsubtype: string;
  scheduledstart: string;
  auctionduration?: { days?: number; hours?: number; minutes?: number };
  productimage: string;
};
interface upcomingAuctionItem {
  id: string;
  productname: string;
  currentbid: number | null;
  productimages: string;
  startprice: number;
  auctiontype: string;
  auctionsubtype: string;
  category?: { handle: string };
  scheduledstart: string;
  auctionduration?: { days?: number; hours?: number; minutes?: number };
}
interface approvalPendingItem {
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
interface SellerInfo {
  id: string;
  fname: string;
  lname: string;
  location: string;
}

interface PurchasedAuction {
  id: string;
  productname: string;
  categories?: { handle: string };
  productimages: string;
  startprice: number;
  currentbid: number;
  createdat: string;
  buy_now_price: number;
  purchaser: string; // buyer profile id
  seller: SellerInfo | null;
}

interface PurchasedResponse {
  success: boolean;
  data: PurchasedAuction[];
  count: number;
  error?: string;
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
export default function BuyerDashboard() {
  const [stats, setStats] = useState({
    activeBids: 0,
    wonAuctions: 0,
    lostAuctions: 0,
    totalSpend: 0,
    recentActivities: [],
  });

  const [selectedSection, setSelectedSection] = useState<
    | "activeBids"
    | "wonAuctions"
    | "lostAuctions"
    | "reverseAuctions"
    | "forwardAuctions"
    | "buyNow"
    | "bidsRecevied"
    | "profile"
    | "awardedAuctions"
    | "closedAuctions"
    | "createAuction"
  >("reverseAuctions");
  const router = useRouter();
  const [isLoadingBids, setIsLoadingBids] = useState(true);
  const [bids, setBids] = useState<Bid[]>([]);
  const { user, isLoading, selectedMode } = useAuth();
  const [activeBids, setActiveBids] = useState<ActiveBid[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [now, setNow] = useState(new Date());
  const [forwardBids, setForwardBids] = useState<Bid[]>([]);
  const [wonAuctions, setWonAuctions] = useState<WonAuctionEntry[]>([]);
  const [bidRecevied, setBidRecevied] = useState<bidRecevied[]>([]);
  const [awardedAuctions, setAwardedAuctions] = useState<bidRecevied[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [closedAuctions, setClosedAuctions] = useState<closedAuctionItem[]>([]);
  const [lostAuctions, setLostAuctions] = useState<LostAuctionEntry[]>([]);
  const [liveAuctions, setLiveAuctions] = useState<LiveAuction[]>([]);
  const [showSellerLeaderboard, setShowSellerLeaderboard] = useState(false);
  const [allAuctionItems, setAllAuctionItems] = useState([]);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [approvalPendings, setApprovalPendings] = useState<
    approvalPendingItem[]
  >([]);
  const [approvalRejected, setApprovalRejected] = useState<
    approvalRejectedItem[]
  >([]);
  const [auctionCount, setAuctionCount] = useState(0);
  const [purchases, setPurchases] = useState<PurchasedAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveCount, setLiveCount] = useState(0);
  const [awardedAuctionsMap, setAwardedAuctionsMap] = useState<{
    [auctionId: string]: string;
  }>({});
  const [manageAuctionTab, setManageAuctionTab] = useState<
    | "live"
    | "upcoming"
    | "pending"
    | "closed"
    | "rejected"
    | "create"
    | "award"
    | "contract"
  >("live");
  const [reverseManageAuctionTab, setReverseManageAuctionTab] = useState<
    "active" | "won" | "lost"
  >("active");
  // const [upcomingCount, setUpcomingCount] = useState(0);
  const [upcomingAuctions, setUpcomingAuctions] = useState<
    upcomingAuctionItem[]
  >([]);
  const [reverseBids, setReverseBids] = useState<Bid[]>([]);
  // const auctionsWithBids = reverseAuction.filter((a) => a.bidder_count > 0);
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoading && selectedMode) {
      if (selectedMode === "forward") {
        setSelectedSection("forwardAuctions");
        setReverseManageAuctionTab("active");
      } else if (selectedMode === "reverse") {
        setSelectedSection("reverseAuctions");
        setManageAuctionTab("live");
      }
    }
  }, [selectedMode, isLoading]);
  function getEndDate(
    start: Date,
    duration: { days?: number; hours?: number; minutes?: number }
  ) {
    const end = new Date(start.getTime());
    if (duration.days) end.setUTCDate(end.getUTCDate() + duration.days);
    if (duration.hours) end.setUTCHours(end.getUTCHours() + duration.hours);
    if (duration.minutes)
      end.setUTCMinutes(end.getUTCMinutes() + duration.minutes);
    return end;
  }
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

  function formatDuration(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours > 0 ? hours + "h " : ""}${minutes}m ${seconds}s`;
  }
  function getTimeLeftLabel(
    now: Date,
    startTime: string,
    duration: { days?: number; hours?: number; minutes?: number }
  ): string {
    const start = new Date(startTime);
    const end = getEndDate(start, duration);

    if (now < start) {
      return "Starts in " + formatDuration(start.getTime() - now.getTime());
    } else if (now >= start && now < end) {
      return formatDuration(end.getTime() - now.getTime());
    } else {
      return "";
    }
  }
  useEffect(() => {
    const fetchAuctions = async () => {
      if (!user?.email) throw new Error("User email is missing");
      const response = await fetch(
        `/api/buyer/manage-auction?email=${encodeURIComponent(user.email)}`
      );
      const data = await response.json();
      if (data.success) {
        setAuctionCount(data.count);
      }
    };
    if (user) fetchAuctions();
  }, [user]);
  // purchasr
  useEffect(() => {
    if (!user) return;

    const fetchPurchases = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/buynow/purchased?id=${user.id}`);
        const data: PurchasedResponse = await res.json();
        if (!data.success) {
          throw new Error(data.error || "Failed to load purchased auctions");
        }
        setPurchases(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, [user]);

  useEffect(() => {
    if (!user?.id || !user?.email) return;
    const fetchActiveBids = async () => {
      setIsLoadingBids(true);
      try {
        const response = await fetch(
          `/api/buyer/active-bids?id=${user.id}&email=${user.email}`
        );
        if (!response.ok) throw new Error("Failed to fetch active bids");
        const data = await response.json();
        setActiveBids(data);
        setStats((prevStats) => ({
          ...prevStats,
          activeBids: Array.isArray(data) ? data.length : 0,
        }));
      } catch (error) {
        console.error("Error fetching active bids:", error);
        setActiveBids([]);
        setStats((prevStats) => ({ ...prevStats, activeBids: 0 }));
      } finally {
        setIsLoadingBids(false);
      }
    };
    fetchActiveBids();
  }, [user]);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoadingDetails(true);
      try {
        if (selectedSection === "activeBids") {
          // Split active bids by type
          const forward = activeBids
            .filter((a) => a.auctionType === "forward")
            .map((a) => ({
              id: a.auctionId,
              auction_name: a.productName,
              seller_name: a.sellerName,
              your_bid: a.bidAmount,
              current_bid: a.currentbid ?? 0,
              status: a.isWinningBid ? "leading" : "outbid",
              scheduledstart: a.scheduledstart ?? null,
              auctionduration: a.auctionduration ?? null,
              auctionSubtype: a.auctionSubtype,
              position: a.position,
              productimage: a.productimage,
            }));

          const reverse = activeBids
            .filter((a) => a.auctionType === "reverse")
            .map((a) => ({
              id: a.auctionId,
              auction_name: a.productName,
              seller_name: a.sellerName,
              your_bid: a.bidAmount,
              current_bid: a.currentbid ?? 0,
              status: a.isWinningBid ? "leading" : "outbid",
              scheduledstart: a.scheduledstart ?? null,
              auctionduration: a.auctionduration ?? null,
              auctionSubtype: a.auctionSubtype,
              productimage: a.productimage,
            }));

          setForwardBids(forward);
          setReverseBids(reverse);
          return;
        }

        let endpoint = "";
        switch (selectedSection) {
          case "wonAuctions":
            endpoint = "/api/buyer/won-auctions";
            break;
          case "lostAuctions":
            endpoint = "/api/buyer/lost-auctions";
            break;
          default:
            return;
        }
        const res = await fetch(endpoint);
        const data = await res.json();
        const filtered =
          selectedSection === "lostAuctions"
            ? Array.isArray(data)
              ? data.filter((item: any) => item.status === "lost")
              : []
            : data;

        setBids(filtered);
      } catch (err) {
        console.error("Error loading detail data:", err);
        setBids([]);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [selectedSection, activeBids]);

  useEffect(() => {
    const fetchWonAuctions = async () => {
      if (!user) return;
      try {
        const res = await fetch(
          `/api/buyer/won-auctions?email=${encodeURIComponent(
            user.email
          )}&id=${encodeURIComponent(user.id)}`
        );
        const data = await res.json();
        setWonAuctions(data || []);
        setStats((prevStats) => ({
          ...prevStats,
          wonAuctions: Array.isArray(data) ? data.length : 0,
        }));
      } catch (error) {
        console.error("Error fetching won auctions:", error);
      }
    };
    fetchWonAuctions();
  }, [user]);

  // useEffect(() => {
  const fetchWonAuctions = async () => {
    if (!user) return;
    try {
      const res = await fetch(
        `/api/buyer/bid-recevied?email=${encodeURIComponent(
          user.email
        )}&id=${encodeURIComponent(user.id)}`
      );
      const data = await res.json();
      setBidRecevied(data || []);
      // setStats((prevStats) => ({
      //   ...prevStats,
      //   wonAuctions: Array.isArray(data) ? data.length : 0,
      // }));
    } catch (error) {
      console.error("Error fetching won auctions:", error);
    }
  };
  //   fetchWonAuctions();
  // }, [user]);

  // useEffect(() => {
  const fetchliveAuctions = async () => {
    if (!user?.email) throw new Error("User email is missing");
    const response = await fetch(
      `/api/buyer/live-auctions?email=${encodeURIComponent(user.email)}`
    );
    const data = await response.json();
    if (data.success) {
      setLiveAuctions(data.data || []);
    }
  };
  //   if (user) fetchAuctions();
  // }, [user]);

  // useEffect(() => {
  const fetchLostAuctions = async () => {
    if (!user) return;
    try {
      const res = await fetch(
        `/api/buyer/lost-auctions?email=${encodeURIComponent(
          user.email
        )}&id=${encodeURIComponent(user.id)}`
      );
      const data = await res.json();
      setLostAuctions(data || []);
      setStats((prevStats) => ({
        ...prevStats,
        lostAuctions: Array.isArray(data) ? data.length : 0,
      }));
    } catch (error) {
      console.error("Error fetching lost auctions:", error);
    }
  };

  //   fetchLostAuctions();
  // }, [user]);

  const fetchAwardedAuctions = async () => {
    if (!user) return;
    try {
      const res = await fetch(
        `/api/buyer/awarded-auctions?email=${encodeURIComponent(user.email)}`,
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
  // useEffect(() => {
  const fetchrejectAuctions = async () => {
    if (!user?.email) throw new Error("User email is missing");
    const response = await fetch(
      `/api/buyer/approval-rejected?email=${encodeURIComponent(user.email)}`
    );
    const data = await response.json();
    if (data.success) {
      setApprovalRejected(data.data || []);
    }
  };
  //   if (user) fetchAuctions();
  // }, [user]);
  // useEffect(() => {
  const fetchapprovalAuctions = async () => {
    if (!user?.email) throw new Error("User email is missing");
    const response = await fetch(
      `/api/buyer/approval-Pending?email=${encodeURIComponent(user.email)}`
    );
    const data = await response.json();
    if (data.success) {
      setApprovalPendings(data.data || []);
    }
  };
  //   if (user) fetchAuctions();
  // }, [user]);

  const fetchSellerUpcomingCount = async (email: string) => {
    try {
      const response = await fetch(
        `/api/buyer/upcoming-auctions?email=${encodeURIComponent(email)}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to load live auctions");
      }

      setUpcomingAuctions(data.data);
      setError(null);
    } catch (err) {
      console.error(" Network error while fetching upcoming count:", err);
    }
  };
  useEffect(() => {
    if (!isLoading && user?.email) {
      fetchSellerUpcomingCount(user.email);
    }
  }, [user?.email, isLoading]);

  // useEffect(() => {
  const fetchClosedAuctions = async () => {
    if (!user?.email) throw new Error("User email is missing");
    const response = await fetch(
      `/api/buyer/closed-auctions?email=${encodeURIComponent(user.email)}`
    );
    const data = await response.json();
    if (data.success) {
      setClosedAuctions(data.data || []);
    }
  };
  //   if (user) fetchAuctions();
  // }, [user]);
  useEffect(() => {
    if (!user) return;

    const fetchAll = async () => {
      try {
        await Promise.all([
          fetchClosedAuctions(),
          fetchAwardedAuctions(),
          fetchapprovalAuctions(),
          fetchrejectAuctions(),
          fetchLostAuctions(),
          fetchliveAuctions(),
          fetchWonAuctions(),
        ]);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchAll();
  }, [user]);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await fetch("/api/auctions");
        const json = await res.json();
        if (!json.success) return;

        const now = new Date();

        let live = 0;
        let upcoming = 0;

        (json.data || []).forEach((a: any) => {
          const start = a.scheduledstart ? new Date(a.scheduledstart) : null;
          const durationInSeconds = a.auctionduration
            ? ((d: any) =>
                (d.days || 0) * 86400 +
                (d.hours || 0) * 3600 +
                (d.minutes || 0) * 60)(a.auctionduration)
            : 0;
          const end = start
            ? new Date(start.getTime() + durationInSeconds * 1000)
            : null;

          if (start && end) {
            if (now < start) {
              upcoming += 1;
            } else if (now >= start && now < end) {
              live += 1;
            }
          }
        });

        setLiveCount(live);
      } catch (err) {
        console.error("Error fetching auctions:", err);
      }
    };
    fetchAuctions();
  }, []);
  const handleAcceptBid = async (auctionId: string, bidId: string) => {
    if (!user) return;

    try {
      const url = `/api/buyer/awarded-auctions?email=${encodeURIComponent(
        user.email
      )}&auctionId=${encodeURIComponent(auctionId)}&bidId=${encodeURIComponent(
        bidId
      )}`;

      const res = await fetch(url, { method: "POST" });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to accept bid");
      }
      const data = await res.json();
      setAwardedAuctions(data);
      // Optimistically add to awardedAuctions state
      setAwardedAuctions((prev) => [
        ...prev,
        bidRecevied.find((b) => b.auctionId === auctionId)!,
      ]);
      setAwardedAuctionsMap((prev) => ({ ...prev, [auctionId]: bidId }));
    } catch (err: any) {
      console.error(err);
      alert(`Error accepting bid: ${err.message}`);
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading user and dashboard data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Not logged in. Please log in to access the buyer dashboard.</p>
      </div>
    );
  }
  const handleViewBids = (auctionId: string) => {
    setSelectedAuctionId(auctionId);
    setShowModal(true);
  };
  const handleNavigate = (path: string) => {
    console.log("Navigating to:", path);
    router.push(path);
  };

  return (
    <div className="min-h-screen py-12 md:py-20 bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-6">
        <div className={`flex flex-col ${selectedMode === "forward" ? "lg:flex-row" : "flex-col"} gap-8`}>
          {/* Sidebar (Only in Forward Mode) */}
          {selectedMode === "forward" && (
            <div className="lg:w-80 w-full flex flex-col gap-4 flex-shrink-0">
              {/* Forward Auctions Card */}
              <div
                onClick={() => {
                  setSelectedSection("forwardAuctions");
                  setReverseManageAuctionTab("active");
                }}
                className={`cursor-pointer transition-all p-5 rounded-2xl border ${
                  selectedSection === "forwardAuctions"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xl scale-[1.02]"
                    : "bg-white text-gray-900 border-gray-100 hover:border-blue-200 hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className={`h-6 w-6 ${selectedSection === "forwardAuctions" ? "text-green-400" : "text-orange-400"}`} />
                  <span className="text-sm font-bold uppercase tracking-wider">Forward Auctions</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-5xl font-black">{activeBids.length + wonAuctions.length + lostAuctions.length}</span>
                  <p className={`text-[11px] leading-tight font-medium ${selectedSection === "forwardAuctions" ? "text-blue-100" : "text-gray-500"}`}>
                    Auction bids,<br/>I have placed
                  </p>
                </div>
              </div>

              {/* Buy Now Products Card */}
              <div
                onClick={() => setSelectedSection("buyNow")}
                className={`cursor-pointer transition-all p-5 rounded-2xl border border-gray-200 ${
                  selectedSection === "buyNow"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xl scale-[1.02]"
                    : "bg-white text-gray-900 border-gray-100 hover:border-blue-200 hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-2 mb-5">
                  <ShoppingBag className={`h-6 w-6 ${selectedSection === "buyNow" ? "text-green-400" : "text-orange-400"}`} />
                  <span className="text-sm font-bold uppercase tracking-wider">Buy Now Products</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-5xl font-black">{purchases.length}</span>
                  <p className={`text-[11px] leading-tight font-medium ${selectedSection === "buyNow" ? "text-blue-100" : "text-gray-500"}`}>
                    Products,<br/>I have purchased
                  </p>
                </div>
              </div>

              {/* My Profile Card */}
              <div
                onClick={() => setSelectedSection("profile")}
                className={`cursor-pointer transition-all p-5 rounded-2xl border ${
                  selectedSection === "profile"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xl scale-[1.02]"
                    : "bg-white text-gray-900 border-gray-100 hover:border-blue-200 hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-2 mb-5">
                  <Settings className={`h-6 w-6 ${selectedSection === "profile" ? "text-green-400" : "text-orange-400"}`} />
                  <span className="text-sm font-bold uppercase tracking-wider">My Profile</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-[50px]">
                    <User className="h-10 w-10 opacity-50" />
                  </div>
                  <p className={`text-[11px] leading-tight font-medium ${selectedSection === "profile" ? "text-blue-100" : "text-gray-500"}`}>
                    Edit Profile &<br/>Change Password
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Grid Layout (Fallback for Non-Forward Modes) */}
          {selectedMode !== "forward" && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-5">
              <Card
                onClick={() => { setSelectedSection("reverseAuctions"); setManageAuctionTab("live"); }}
                className={`cursor-pointer transition-shadow hover:shadow-lg ${selectedSection === "reverseAuctions" ? "ring-2 ring-blue-500" : ""}`}
              >
                <CardHeader className="pb-1">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-orange-400 animate-bounce" />
                    <CardTitle className="text-lg font-medium">Reverse Auctions</CardTitle>
                  </div>
                  <div className="mt-1">
                    <div className="text-xl font-bold">{auctionCount}</div>
                    <p className="text-xs text-gray-500 mt-4">Reverse Auctions I’ve Created</p>
                  </div>
                </CardHeader>
              </Card>

              <Card
                onClick={() => setSelectedSection("buyNow")}
                className={`cursor-pointer transition-shadow hover:shadow-lg ${selectedSection === "buyNow" ? "ring-2 ring-blue-500" : ""}`}
              >
                <CardHeader className="pb-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-teal-400 animate-bounce" />
                    <CardTitle className="text-sm font-medium">Buy Now Product</CardTitle>
                  </div>
                  <div className="mt-1">
                    <div className="text-xl font-bold">{purchases.length}</div>
                    <p className="text-xs text-gray-500 mt-4">Product I’ve Purchased</p>
                  </div>
                </CardHeader>
              </Card>

              <Card
                className={`cursor-pointer transition-shadow hover:shadow-lg ${selectedSection === "profile" ? "ring-2 ring-blue-500" : ""} relative`}
                onClick={() => setSelectedSection("profile")}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-600 animate-bounce" />
                    <CardTitle className="text-sm font-medium">My Profile</CardTitle>
                  </div>
                  <div className="mt-1">
                    <div className="h-10"></div>
                    <p className="text-xs text-gray-500">Edit Profile & Change Password</p>
                  </div>
                </CardHeader>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-all flex flex-col items-center justify-center p-4 text-center bg-green-400 text-white"
                onClick={() => setSelectedSection("createAuction")}
              >
                <CirclePlus className="h-5 w-5 mb-3 text-white" />
                <CardTitle className="text-sm font-semibold">Create Auction</CardTitle>
                <p className="text-xs opacity-100">Start a New Reverse Auction</p>
              </Card>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1">
        {/* Section Table */}
        {/* <div className="bg-white dark:bg-gray-900 p-4 rounded shadow"> */}
        {/* {selectedSection === "createAuction" && <CreateAuction />} */}
        {selectedSection === "createAuction" && <CreateReverseAuction />}
        {selectedSection === "profile" && <ProfileSettingsPage />}
        {loadingDetails ? (
          <p>Loading...</p>
        ) : selectedSection === "activeBids" ? (
          <div className="">
            <h3 className="flex items-center gap-2 text-lg font-semibold  mt-2 mb-4">
              {/* Icon with soft blue background */}
              <span className="inline-flex items-center justify-center ">
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </span>
              {/* Heading Text */}
              <span>Active Bids: Forward Auctions</span>
            </h3>
            {forwardBids.length === 0 ? (
              <p className="text-gray-500">Not Participated In Any Auction</p>
            ) : (
              <div className="overflow-x-auto rounded-md"></div>
            )}
          </div>
        ) : null}

        {selectedSection === "forwardAuctions" && (
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setReverseManageAuctionTab("active")}
                className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            reverseManageAuctionTab === "active"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300"
          }`}
              >
                Active Bids ({activeBids.length})
              </button>

              <button
                onClick={() => setReverseManageAuctionTab("won")}
                className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            reverseManageAuctionTab === "won"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300"
          }`}
              >
                Won Auctions ({wonAuctions.length})
              </button>
              <button
                onClick={() => setReverseManageAuctionTab("lost")}
                className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            reverseManageAuctionTab === "lost"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300"
          }`}
              >
                Lost Auctions ({lostAuctions.length})
              </button>
            </div>

            {reverseManageAuctionTab === "active" && (
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
                    <table className="min-w-full text-xs border border-gray-100 dark:border-gray-800">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left">Auction Name</th>
                          <th className="px-4 py-2 text-left">Format</th>
                          <th className="px-4 py-2 text-left">Category</th>
                          <th className="px-4 py-2 text-left">Starting Bid</th>
                          <th className="px-4 py-2 text-left">End Date</th>
                          <th className="px-4 py-2 text-left">Curent Bid</th>
                          <th className="px-4 py-2 text-left">My Bid Amount</th>
                          <th className="px-4 py-2 text-left">Position</th>
                          <th className="px-4 py-2 text-left">Ends In</th>
                          {/* <th className="px-4 py-2 text-left">Bidders</th> */}
                          {/* <th className="px-4 py-2 text-left">Action</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {activeBids.map((active, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="p-2">
                              <Link
                                href={`/auctions/${active.auctionId}`}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                              >
                                <img
                                  src={active.productimages}
                                  alt={active.productName}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                {active.productName}
                              </Link>
                            </td>
                            <td className="px-4 py-2 text-gray-600 capitalize">
                              {active.auctionSubtype}
                            </td>
                            <td className="px-4 py-2 text-gray-600  capitalize">
                              {active.category?.handle}
                            </td>
                            <td className="px-4 py-2  text-gray-600">
                              ${active.startprice}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {formatDateTime(
                                getEndDate(
                                  new Date(active.scheduledstart),
                                  active.auctionduration ?? {}
                                )
                              )}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              ${active.currentbid}
                            </td>

                            <td className="px-4 py-2 text-gray-600">
                              ${active.bidAmount}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {active.position === 1 ? (
                                <span className="text-green-600 font-semibold flex items-center gap-1">
                                  <ArrowUpIcon size={16} />
                                  Leading 1
                                </span>
                              ) : active.position ? (
                                <span className="text-red-600 font-semibold flex items-center gap-1">
                                  <ArrowDownIcon size={16} />
                                  Trailing {active.position}
                                </span>
                              ) : (
                                <span className="text-gray-600">No Rank</span>
                              )}
                            </td>

                            <td className="px-4 py-2 text-gray-600">
                              {
                                <LiveTimer
                                  startTime={active.scheduledstart}
                                  duration={active.auctionduration}
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
            {reverseManageAuctionTab === "won" && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Gavel className="h-5 w-5 text-violet-500 animate-bounce" />
                    Auctions I’ve Won
                  </h2>
                </div>
                {wonAuctions.length === 0 ? (
                  <p className="text-sm text-gray-500">No Auctions.</p>
                ) : (
                  <div className="overflow-x-auto rounded-md mt-6">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        <tr>
                          <th className="text-left p-2">Auction Name</th>
                          <th className="text-left p-2">Format</th>
                          <th className="text-left p-2">Category</th>
                          <th className="text-left p-2">End Date</th>
                          <th className="text-left p-2">Seller</th>
                          <th className="text-left p-2">Starting Price</th>
                          <th className="text-left p-2">My Winnning Bid</th>
                          <th className="text-left p-2">
                            Payment and Delivery
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {wonAuctions.map((auction, index) => (
                          <tr
                            key={auction.auctionId}
                            className={`${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } dark:bg-transparent`}
                          >
                            <td className="p-2">
                              <Link
                                href={`/auctions/${auction.auctionId}`}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                              >
                                <img
                                  src={auction.productimage}
                                  alt={auction.productName}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                {auction.productName}
                              </Link>
                            </td>

                            <td className="p-2 capitalize text-gray-600">
                              {auction.auctionsubtype}
                            </td>
                            <td className="p-2 capitalize text-gray-600">
                              {auction.category?.handle}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {formatDateTime(
                                getEndDate(
                                  new Date(auction.scheduledstart),
                                  auction.auctionduration ?? {}
                                )
                              )}
                            </td>
                            <td className="p-2 text-gray-600">
                              {auction.sellerName}
                            </td>
                            <td className="p-2 text-gray-600">
                              ${auction.startAmount}
                            </td>
                            <td className="p-2 font-semibold text-green-700">
                              $
                              {auction.winningBidAmount.toLocaleString("en-IN")}
                            </td>
                            <td className="p-2  text-gray-600">
                              Contact Admin/Seller
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {reverseManageAuctionTab === "lost" ? (
              lostAuctions.length > 0 ? (
                <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <CircleX className="h-5 w-5 text-red-500 animate-bounce" />
                      Auctions I’ve Lost
                    </h2>
                  </div>
                  <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        <tr>
                          <th className="text-left p-2">Auction Name</th>
                          <th className="text-left p-2">Format</th>
                          <th className="text-left p-2">Category</th>
                          <th className="text-left p-2">End Date</th>
                          <th className="text-left p-2">Seller</th>
                          <th className="text-left p-2">Starting Bid</th>
                          <th className="text-left p-2">My Bid</th>
                          <th className="text-left p-2">Winning Bid</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lostAuctions.map((auction, index) => (
                          <tr
                            key={auction.auctionId}
                            className={`${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } dark:bg-transparent`}
                          >
                            <td className="p-2">
                              <Link
                                href={`/auctions/${auction.auctionId}`}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                              >
                                <img
                                  src={auction.productimage}
                                  alt={auction.productName}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                {auction.productName}
                              </Link>
                            </td>
                            <td className="p-2 capitalize text-gray-600">
                              {auction.auctionsubtype}
                            </td>
                            <td className="p-2 capitalize text-gray-600">
                              {auction.category?.handle}
                            </td>
                            <td className=" p-2 text-gray-600">
                              {formatDateTime(
                                getEndDate(
                                  new Date(auction.scheduledstart),
                                  auction.auctionduration ?? {}
                                )
                              )}
                            </td>
                            <td className="p-2 text-gray-600">
                              {auction.sellerName}
                            </td>
                            <td className="p-2 text-gray-600">
                              ${auction.startAmount.toLocaleString("en-IN")}
                            </td>
                            <td className="p-2 text-green-600 font-semibold">
                              ${auction.userBidAmount?.toLocaleString("en-IN")}
                            </td>
                            <td className="p-2 text-gray-600">
                              $
                              {auction.winningBidAmount.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No lost Auctions.</p>
              )
            ) : null}
          </div>
        )}

        {selectedSection === "reverseAuctions" ? (
          <div>
            {manageAuctionTab !== "create" && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setManageAuctionTab("live")}
                  className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            manageAuctionTab === "live"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-gray-700 hover:from-blue-200 hover:to-blue-300"
          }`}
                >
                  Live ({liveAuctions.length})
                </button>

                <button
                  onClick={() => setManageAuctionTab("upcoming")}
                  className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            manageAuctionTab === "upcoming"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-gray-700 hover:from-blue-200 hover:to-blue-300"
          }`}
                >
                  Upcoming ({upcomingAuctions.length})
                </button>
                <button
                  onClick={() => setManageAuctionTab("pending")}
                  className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            manageAuctionTab === "pending"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-gray-700 hover:from-blue-200 hover:to-blue-300"
          }`}
                >
                  Pending ({approvalPendings.length})
                </button>

                <button
                  onClick={() => setManageAuctionTab("rejected")}
                  className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            manageAuctionTab === "rejected"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-gray-700 hover:from-blue-200 hover:to-blue-300"
          }`}
                >
                  Rejected ({approvalRejected.length})
                </button>
                <button
                  onClick={() => setManageAuctionTab("closed")}
                  className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            manageAuctionTab === "closed"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-gray-700 hover:from-blue-200 hover:to-blue-300"
          }`}
                >
                  Closed ({closedAuctions.length})
                </button>
                {/* <button
                    onClick={() => setManageAuctionTab("contract")}
                    className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            manageAuctionTab === "contract"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-gray-700 hover:from-blue-200 hover:to-blue-300"
          }`}
                  >
                    Declare Winner/Award Contracts ({bidRecevied.length})
                  </button> */}

                <button
                  onClick={() => setManageAuctionTab("award")}
                  className={`px-2 py-2 rounded-md font-normal text-sm shadow-sm 
          ${
            manageAuctionTab === "award"
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
              : "bg-gradient-to-r from-blue-100 to-blue-200 text-gray-700 hover:from-blue-200 hover:to-blue-300"
          }`}
                >
                  Awarded ({awardedAuctions.length})
                </button>
              </div>
            )}
            {manageAuctionTab === "live" && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Gavel className="h-5 w-5 text-orange-500 animate-bounce" />
                    Live Reverse Auctions
                  </h2>
                </div>
                {liveAuctions.length === 0 ? (
                  <p className="text-sm text-gray-500">No sold items yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-md mt-6">
                    <table className="min-w-full text-sm border border-gray-100 dark:border-gray-800">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <tr>
                          <th className="text-left p-2">Auction Name</th>
                          <th className="text-left p-2">Format</th>
                          <th className="text-left p-2">Category</th>
                          <th className="text-left p-2">Starting Bid</th>
                          <th className="text-left p-2">End Date</th>
                          <th className="text-left p-2">Current Bid</th>
                          <th className="text-left p-2">Ends In</th>
                          <th className="text-left p-2">Bidders</th>
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
                                href={`/auctions/reverse/${liveAuction.id}`}
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
                            <td className="p-2 text-gray-600 capitalize">
                              {liveAuction.auctionsubtype}
                            </td>
                            <td className="p-2 text-gray-600 capitalize">
                              {liveAuction.category?.handle}
                            </td>
                            <td className="p-2 text-gray-600">
                              ${liveAuction.startprice}
                            </td>
                            <td className=" p-2 text-gray-600">
                              {formatDateTime(
                                getEndDate(
                                  new Date(liveAuction.scheduledstart),
                                  liveAuction.auctionduration ?? {}
                                )
                              )}
                            </td>
                            <td
                              className={`p-2 ${
                                liveAuction.bidder_count === 0
                                  ? " text-gray-600"
                                  : "font-bold text-green-600"
                              }`}
                            >
                              {liveAuction.bidder_count === 0
                                ? "No bid placed"
                                : `$${liveAuction.currentbid}`}
                            </td>

                            <td className="p-2 text-red-600 font-semibold">
                              {
                                <LiveTimer
                                  startTime={liveAuction.scheduledstart}
                                  duration={liveAuction.auctionduration}
                                />
                              }
                            </td>
                            <td
                              className="p-2 flex items-center gap-1 font-bold text-blue-600 cursor-pointer hover:underline"
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
                    Upcoming Reverse Auctions
                  </h2>
                </div>
                {upcomingAuctions.length === 0 ? (
                  <p className="text-sm text-gray-500">No Upcoming Auctions</p>
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
                                href={`/auctions/reverse/${upcoming.id}`}
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
                            <td className=" p-2 text-gray-600">
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
                                    `/seller-panel/my-listings/buyer-edit/${upcoming.id}`
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
                                <Trash className="w-3 h-3" />
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
            {manageAuctionTab === "pending" && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Hourglass className="h-4 w-4 text-yellow-500 animate-bounce" />
                    Reverse Auctions Pending Approval
                  </h2>
                </div>
                {approvalPendings.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No Auction Pending Approval{" "}
                  </p>
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
                                href={`/auctions/reverse/${approval.id}`}
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
                                    `/seller-panel/my-listings/buyer-edit/${approval.id}`
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
            {manageAuctionTab === "award" && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Medal className="h-4 w-4 text-green-700 animate-bounce" />
                    Awarded Suppliers (Winners)
                  </h2>
                </div>
                {awardedAuctions.length === 0 ? (
                  <p className="text-sm text-gray-500">No Awarded Auctions</p>
                ) : (
                  <div className="overflow-x-auto rounded-md mt-6">
                    <table className="min-w-full text-sm border border-gray-100 dark:border-gray-800">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <tr>
                          <th className="p-2 text-left">Auction Name</th>
                          <th className="p-2 text-left">Format</th>
                          <th className="p-2 text-left">Category</th>
                          <th className="p-2 text-left">Supplier</th>
                          <th className="p-2 text-left">Starting Bid</th>
                          <th className="p-2 text-left">Target Price</th>
                          <th className="p-2 text-left">Winning Bid</th>
                          {/* <th className="px-4 py-2 text-left">Action</th> */}
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
                              {award.sellerName}
                            </td>
                            <td className="p-2 text-gray-600">
                              ${award.startAmount.toLocaleString("en-IN")}
                            </td>
                            <td className="p-2 text-gray-600">
                              ${award.targetPrice}
                            </td>
                            <td className="p-2 text-green-600 font-semibold">
                              ${award.currentbid}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {manageAuctionTab === "contract" && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500 animate-bounce" />
                    View Supplier Bids and Declare Winner
                  </h2>
                </div>
                {awardedAuctions.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No Award Contract Auctions
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-md mt-6">
                    <table className="min-w-full text-sm border border-gray-100 dark:border-gray-800">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <tr>
                          <th className="text-left px-4 p-2">Auction Name</th>
                          <th className="text-left px-4 p-2">Seller Name</th>
                          <th className="px-4 py-2 text-left">Category</th>
                          <th className="text-left px-4 p-2">Type</th>
                          <th className="text-left px-4 py-2 ">Format</th>
                          <th className="text-left px-4 py-2 ">Target Price</th>
                          <th className="text-left px-4 p-2">Starting Bid</th>
                          <th className="text-left px-4 p-2">Bid Amount</th>
                          <th className="text-center px-4 p-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bidRecevied.map((BidRecive, index) => {
                          const isAwarded = awardedAuctions.some(
                            (a) => a.auctionId === BidRecive.auctionId
                          );

                          return (
                            <tr
                              key={`${BidRecive.bidId}-${index}`}
                              className={`${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              } dark:bg-transparent`}
                            >
                              <td className="p-2">
                                <Link
                                  href={`/auctions/reverse/${BidRecive.auctionId}`}
                                  className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                                >
                                  <img
                                    src={BidRecive.productimage}
                                    alt={BidRecive.productName}
                                    className="w-6 h-6 rounded-full object-cover"
                                  />
                                  {BidRecive.productName}
                                </Link>
                              </td>
                              <td className="p-2 capitalize text-gray-600">
                                {BidRecive.sellerName}
                              </td>
                              <td className="p-2 capitalize text-gray-600">
                                {BidRecive.category?.handle}
                              </td>
                              <td className="p-2 text-gray-600">
                                {BidRecive.auctionType}
                              </td>
                              <td className="p-2 text-gray-600">
                                {BidRecive.auctionSubtype}
                              </td>
                              <td className="p-2 text-gray-600">
                                {BidRecive.targetPrice}
                              </td>
                              <td className="p-2 text-gray-600">
                                {BidRecive.startAmount}
                              </td>
                              <td className="p-2 text-gray-600">
                                {BidRecive.bidAmount}
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  className={`px-2 py-1 rounded text-white text-sm ${
                                    awardedAuctionsMap[BidRecive.auctionId]
                                      ? "bg-gray-400 cursor-not-allowed"
                                      : "bg-green-500 hover:bg-green-600"
                                  }`}
                                  disabled={
                                    !!awardedAuctionsMap[BidRecive.auctionId]
                                  }
                                  onClick={() =>
                                    handleAcceptBid(
                                      BidRecive.auctionId,
                                      BidRecive.bidId
                                    )
                                  }
                                >
                                  {awardedAuctionsMap[BidRecive.auctionId] ===
                                  BidRecive.bidId
                                    ? "Accepted"
                                    : awardedAuctionsMap[BidRecive.auctionId]
                                    ? "Closed"
                                    : "Accept"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {/* pending reject */}
            {manageAuctionTab === "rejected" && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500 animate-bounce" />
                    Reverse Auctions Rejected by Admin
                  </h2>
                </div>
                {approvalRejected.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No Auction Admin Rejected{" "}
                  </p>
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
                                href={`/auctions/reverse/${closed.id}`}
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
                            <td className="px-4 py-2">
                              <Link
                                href={`/seller-panel/my-listings/buyer-edit/${closed.id}`}
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
            {manageAuctionTab === "closed" && (
              <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Lock className="h-4 w-4 text-red-500  animate-bounce" />
                    Completed / Ended Reverse Auctions
                  </h2>
                </div>
                {closedAuctions.length === 0 ? (
                  <p className="text-sm text-gray-500">Closed Auction</p>
                ) : (
                  <div className="overflow-x-auto rounded-md mt-6">
                    <table className="min-w-full text-sm border border-gray-100 dark:border-gray-800">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left">Auction Name</th>
                          <th className="px-4 py-2 text-left">Format </th>
                          <th className="px-4 py-2 text-left">Category</th>
                          <th className="px-4 py-2 text-left">End Date</th>
                          <th className="px-4 py-2 text-left">
                            Budget/Target Price
                          </th>
                          <th className="px-4 py-2 text-left">
                            Suppliers Participated
                          </th>
                          <th className="px-4 py-2 text-left">
                            Lowest Bid/Best Offer
                          </th>
                          <th className="px-4 py-2 text-left">
                            Winner (Proposed)
                          </th>
                          <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {closedAuctions.map((upcoming, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="p-2">
                              <Link
                                href={`/auctions/reverse/${upcoming.id}`}
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
                            {/* <td className="px-4 py-2 ">
                                {upcoming.auctiontype}
                              </td> */}

                            <td className="px-4 py-2 text-gray-600">
                              {formatDateTime(
                                getEndDate(
                                  new Date(upcoming.scheduledstart),
                                  upcoming.auctionduration ?? {}
                                )
                              )}
                            </td>

                            <td className="px-4 py-2 text-gray-600">
                              ${upcoming.targetprice}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {upcoming.bidder_count}
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {upcoming.bidder_count === 0
                                ? "No Bids"
                                : `$${upcoming.currentbid}`}
                            </td>

                            <td className="px-4 py-2 text-gray-600">{"N/A"}</td>

                            <td className="px-4 py-2">
                              {upcoming.bidder_count === 0 ? (
                                <span
                                  className="text-blue-500 hover:underline cursor-pointer"
                                  onClick={() =>
                                    handleNavigate(
                                      `/seller-panel/my-listings/buyer-edit/${upcoming.id}`
                                    )
                                  }
                                >
                                  Re-List
                                </span>
                              ) : (
                                <span
                                  className="text-blue-500 hover:underline cursor-pointer"
                                  onClick={() => handleViewBids(upcoming.id)}
                                >
                                  {upcoming.auctionsubtype === "sealed"
                                    ? "View Proposals & Award Contract"
                                    : "View Bids & Declare Winner"}
                                </span>
                              )}

                              {showModal && selectedAuctionId && upcoming && (
                                <DeclareSellerWinnerModal
                                  auctionId={selectedAuctionId}
                                  auction={upcoming} // Pass upcoming here, since auction is undefined
                                  onClose={() => setShowModal(false)}
                                />
                              )}
                            </td>

                            {/* <td className="px-4 py-2">
                                {formatDateTime(
                                  new Date(upcoming.scheduledstart)
                                )}
                              </td> */}

                            {/* 
                            <td className="p-2 flex space-x-1">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleNavigate(
                                    `/seller-panel/my-listings/edit/${upcoming.id}`
                                  )
                                }
                                className="text-green-600 hover:text-green-700 p-1 w-6 h-6 flex items-center justify-center"ed
                                // disabled={!auction.editable}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>

                              <Button
                                variant="outline"
                                size="icon"
                                // onClick={() => handleDelete(auction.id)}
                                className="text-red-600 hover:text-red-700 p-1 w-6 h-6  "
                              >
                                <Trash2 className="w-3 h-3" />
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
          </div>
        ) : (
          <p></p>
        )}

        {selectedSection === "buyNow" && (
          <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-green-500 animate-bounce" />
                Buy Now Products I’ve Purchased
              </h2>
            </div>
            {purchases.length === 0 ? (
              <p className="text-sm text-gray-500">No buy now </p>
            ) : (
              <div className="overflow-x-auto rounded-md mt-6">
                <table className="min-w-full text-sm border border-gray-100 dark:border-gray-800">
                  <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left">Product Name</th>

                      <th className="px-4 py-2 text-left">Category</th>
                      <th className="px-4 py-2 text-left">Buy Now Price</th>
                      <th className="px-4 py-2 text-left">Seller Name</th>
                      <th className="px-4 py-2 text-left">Contact Seller</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((buynow, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="p-2">
                          <Link
                            href={`/buyNow/${buynow.id}`}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                          >
                            <img
                              src={buynow.productimages}
                              alt={buynow.productname}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            {buynow.productname}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-gray-600 capitalize">
                          {buynow.categories?.handle}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          $ {buynow.buy_now_price}
                        </td>
                        <td className="px-4 py-2 text-gray-600 capitalize">
                          {buynow.seller?.fname}
                        </td>

                        <td className="px-4 py-2">
                          <Link
                            href={`/`}
                            className="   text-blue-500 hover:text-blue-500 p-1 w-16 h-6 flex items-center justify-center"
                          >
                            <Mail className="w-4 h-4" />
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

        {/* Modal for Seller Leaderboard */}
        {showSellerLeaderboard && selectedAuctionId && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-lg w-full relative">
              <button
                onClick={() => setShowSellerLeaderboard(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <BuyerLeaderboard auctionId={selectedAuctionId} />
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
</div>
);
}

