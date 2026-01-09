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
import { BuyerSidebar } from "@/components/dashboard/buyer/BuyerSidebar";
import { BuyerReverseAuctionsView } from "@/components/dashboard/buyer/BuyerReverseAuctionsView";
import { BuyerForwardAuctionsView } from "@/components/dashboard/buyer/BuyerForwardAuctionsView";
import { BuyerBuyNowView } from "@/components/dashboard/buyer/BuyerBuyNowView";
import { BuyerWonAuctionsView } from "@/components/dashboard/buyer/BuyerWonAuctionsView";
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
  // Independent data fetching for waterfall/streaming effect
  useEffect(() => {
    if (!user?.id || !user?.email) return;

    const email = encodeURIComponent(user.email);
    const userId = encodeURIComponent(user.id);

    // Helper to handle independent fetches
    const fetchData = async (
      url: string,
      setter: (data: any) => void,
      statsKey?: keyof typeof stats
    ) => {
      try {
        const res = await fetch(url);
        const data = await res.json();

        let valueToSet = data;
        // Handle { success: true, data: [...] } structure
        if (data && typeof data === "object" && "data" in data) {
          valueToSet = data.data;
        }

        setter(Array.isArray(valueToSet) ? valueToSet : []);

        if (statsKey) {
          setStats((prev) => ({
            ...prev,
            [statsKey]: Array.isArray(valueToSet) ? valueToSet.length : 0,
          }));
        }
      } catch (err) {
        console.error(`Error fetching ${url}:`, err);
      }
    };

    setIsLoadingBids(true);

    // Fire off all requests independently
    fetchData(
      `/api/buyer/active-bids?id=${userId}&email=${email}`,
      setActiveBids,
      "activeBids"
    );
    fetchData(
      `/api/buyer/won-auctions?email=${email}&id=${userId}`,
      setWonAuctions,
      "wonAuctions"
    );
    fetchData(
      `/api/buyer/lost-auctions?email=${email}&id=${userId}`,
      setLostAuctions,
      "lostAuctions"
    );

    fetchData(`/api/buyer/closed-auctions?email=${email}`, (data) =>
      setClosedAuctions(data)
    );
    fetchData(`/api/buyer/awarded-auctions?email=${email}`, setAwardedAuctions);
    fetchData(
      `/api/buyer/approval-Pending?email=${email}`,
      setApprovalPendings
    );
    fetchData(
      `/api/buyer/approval-rejected?email=${email}`,
      setApprovalRejected
    );

    // Live auctions - also update liveCount
    fetch(`/api/buyer/live-auctions?email=${email}`)
      .then((res) => res.json())
      .then((data) => {
        const list = data?.success ? data.data : [];
        setLiveAuctions(list || []);
        setLiveCount(list?.length || 0);
      })
      .catch((err) => console.error("Error fetching live-auctions:", err));

    fetchData(
      `/api/buyer/upcoming-auctions?email=${email}`,
      setUpcomingAuctions
    );
    fetchData(`/api/buynow/purchased?id=${user.id}`, setPurchases);

    // Manage Auction Count
    fetch(`/api/buyer/manage-auction?email=${email}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setAuctionCount(data.count);
        }
      })
      .catch((err) => console.error("Error fetching manage-auction:", err));

    // We don't strictly need to wait for all to finish to "stop loading"
    // because we want data to pop in. But we can set loading to false immediately
    // or after a short timeout if we want to show generic skeleton.
    // For "pop-in" effect, simply done:
    setIsLoadingBids(false);
    setLoading(false);
  }, [user?.id, user?.email]);

  // Lazy load details only when section changes
  useEffect(() => {
    if (!user) return;

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
              productimage: a.productimages,
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
              productimage: a.productimages,
            }));

          setForwardBids(forward);
          setReverseBids(reverse);
        }
      } catch (err) {
        console.error("Error loading detail data:", err);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [selectedSection, activeBids, user]);

  // Removed duplicate useEffect hooks - all consolidated above
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Always visible */}
          <BuyerSidebar
            selectedMode={selectedMode}
            selectedSection={selectedSection}
            onSelectSection={setSelectedSection}
            onSelectReverseTab={setManageAuctionTab}
            onSelectForwardTab={setReverseManageAuctionTab}
            activeForwardAuctionCount={activeBids.length + lostAuctions.length}
            wonAuctionCount={wonAuctions.length}
            reverseAuctionCount={auctionCount}
            buyNowCount={purchases.length}
          />

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Create Auction */}
            {selectedSection === "createAuction" && <CreateReverseAuction />}

            {/* Profile */}
            {selectedSection === "profile" && <ProfileSettingsPage />}

            {/* Forward Auctions */}
            {selectedSection === "forwardAuctions" && (
              <BuyerForwardAuctionsView
                reverseManageAuctionTab={reverseManageAuctionTab}
                setReverseManageAuctionTab={setReverseManageAuctionTab}
                activeBids={activeBids}
                wonAuctions={wonAuctions}
                lostAuctions={lostAuctions}
                showSellerLeaderboard={showSellerLeaderboard}
                selectedAuctionId={selectedAuctionId}
                setShowSellerLeaderboard={setShowSellerLeaderboard}
                setSelectedAuctionId={setSelectedAuctionId}
              />
            )}

            {/* Won Auctions View */}
            {selectedSection === "wonAuctions" && (
              <BuyerWonAuctionsView wonAuctions={wonAuctions} />
            )}

            {/* Reverse Auctions */}
            {selectedSection === "reverseAuctions" && (
              <BuyerReverseAuctionsView
                manageAuctionTab={manageAuctionTab}
                setManageAuctionTab={setManageAuctionTab}
                liveAuctions={liveAuctions}
                upcomingAuctions={upcomingAuctions}
                approvalPendings={approvalPendings}
                approvalRejected={approvalRejected}
                closedAuctions={closedAuctions}
                bidRecevied={bidRecevied}
                awardedAuctions={awardedAuctions}
                awardedAuctionsMap={awardedAuctionsMap}
                onAcceptBid={handleAcceptBid}
                onSelectSection={setSelectedSection}
              />
            )}

            {/* Buy Now View */}
            {selectedSection === "buyNow" && (
              <BuyerBuyNowView purchases={purchases} />
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
