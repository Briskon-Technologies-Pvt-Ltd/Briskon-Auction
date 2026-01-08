"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { SellerSidebar } from "@/components/dashboard/seller/SellerSidebar";
import { ForwardAuctionsView } from "@/components/dashboard/seller/ForwardAuctionsView";
import { ReverseAuctionsView } from "@/components/dashboard/seller/ReverseAuctionsView";
import { BuyNowProductsView } from "@/components/dashboard/seller/BuyNowProductsView";
import CreateForwardAuction from "@/app/sellerPanel/create-forward-listing/page";
import Createbuynow from "@/app/sellerPanel/create-buy-now-listing/page";
import ProfileSettingsPage from "@/app/settings/profile/page"; // Attempt to use existing if visible in imports, else generic

// Types
import {
  LiveAuction,
  upcomingAuctionItem,
  closedAuctionItem,
  approvalPendingItem,
  approvalRejectedItem,
  UnsoldSale,
  Sale,
  AuctionItem,
  ActiveBid,
  lostBid as LostBid,
  bidRecevied as AwardedAuction,
  BuyNowProduct,
  upcomingBuyNowItem,
  approvalPendingBufNowItem,
  SoldBuyNowProduct,
} from "@/components/dashboard/seller/types";

export default function SellerDashboard() {
  const router = useRouter();
  const { user, isLoading, selectedMode } = useAuth();

  // --- State Variables ---

  // Navigation State
  const [selectedSection, setSelectedSection] =
    useState<string>("manageAuction");

  // Forward Auctions State
  const [manageAuctionTab, setManageAuctionTab] = useState("live");
  const [liveAuctions, setLiveAuctions] = useState<LiveAuction[]>([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState<
    upcomingAuctionItem[]
  >([]);
  const [evaluateAuctions, setEvaluateAuctions] = useState<closedAuctionItem[]>(
    []
  );
  const [approvalPendings, setApprovalPendings] = useState<
    approvalPendingItem[]
  >([]);
  const [approvalRejected, setApprovalRejected] = useState<
    approvalRejectedItem[]
  >([]);
  const [unsoldSales, setUnsoldSales] = useState<UnsoldSale[]>([]);
  const [sales, setSales] = useState<Sale[]>([]); // Winners/Sold Items
  const [auctions, setAuctions] = useState<AuctionItem[]>([]); // All auctions for lookup
  const [liveCount, setLiveCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [unsoldCount, setUnsoldCount] = useState(0);

  // Reverse Auctions State
  const [manageAuctionReverseTab, setManageAuctionReverseTab] =
    useState("active");
  const [activeBids, setActiveBids] = useState<ActiveBid[]>([]);
  const [awardedAuctions, setAwardedAuctions] = useState<AwardedAuction[]>([]);
  const [lostBids, setLostBids] = useState<LostBid[]>([]);

  // Buy Now Products State
  const [buyNowTab, setBuyNowTab] = useState("live");
  const [buyNowProducts, setBuyNowProducts] = useState<BuyNowProduct[]>([]);
  const [upcomingBuyNow, setUpcomingBuyNow] = useState<upcomingBuyNowItem[]>(
    []
  );
  const [approvalPendingsBuynow, setApprovalPendingsBuynow] = useState<
    approvalPendingBufNowItem[]
  >([]);
  const [rejectedBuyNow, setRejectedBuyNow] = useState<approvalRejectedItem[]>(
    []
  );
  const [soldBuyNow, setSoldBuyNow] = useState<SoldBuyNowProduct[]>([]);
  const [buyNowCount, setBuyNowCount] = useState(0);

  // Stats / Misc
  const [showSellerLeaderboard, setShowSellerLeaderboard] = useState(false);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // --- Effects ---

  // 1. Set Default Section based on Mode
  useEffect(() => {
    if (!isLoading && selectedMode) {
      if (selectedMode === "forward") {
        setSelectedSection("manageAuction");
        setManageAuctionTab("live");
      } else if (selectedMode === "reverse") {
        setSelectedSection("reverseAuction");
        setManageAuctionReverseTab("active");
      }
    }
  }, [selectedMode, isLoading]);

  // Consolidated Data Fetching - runs all requests in parallel
  useEffect(() => {
    if (!user?.email || isLoading) return;

    const email = user.email;
    const userId = user.id;

    const fetchAllDashboardData = async () => {
      try {
        // Step 1: Fire all fetch requests in parallel
        const fetchPromises = [
          // Forward Data
          fetch(
            `/api/seller/live-auctions?email=${encodeURIComponent(
              email
            )}&sale_type=1`
          ),
          fetch(
            `/api/seller/upcoming-auctions?email=${encodeURIComponent(
              email
            )}&sale_type=1`
          ),
          fetch(
            `/api/seller/evaluate-auction?email=${encodeURIComponent(email)}`
          ),
          fetch(
            `/api/seller/approval-Pending?email=${encodeURIComponent(
              email
            )}&sale_type=1`
          ),
          fetch(
            `/api/seller/approval-rejected?email=${encodeURIComponent(
              email
            )}&sale_type=1`
          ),
          fetch(`/api/seller/unsold-items?email=${encodeURIComponent(email)}`),
          fetch(`/api/seller/sales-history?email=${encodeURIComponent(email)}`),
          fetch(
            `/api/seller/manage-auction?email=${encodeURIComponent(email)}`
          ),

          // Reverse Data
          fetch(
            `/api/seller/active-bids?id=${userId}&email=${encodeURIComponent(
              email
            )}`
          ),
          fetch(
            `/api/seller/lost-auctions?id=${userId}&email=${encodeURIComponent(
              email
            )}`
          ),
          fetch(
            `/api/seller/awarded-auctions?email=${encodeURIComponent(email)}`
          ),

          // Buy Now Data
          fetch(
            `/api/seller/live-auctions?email=${encodeURIComponent(
              email
            )}&sale_type=2`
          ),
          fetch(
            `/api/seller/upcoming-auctions?email=${encodeURIComponent(
              email
            )}&sale_type=2`
          ),
          fetch(
            `/api/seller/approval-Pending?email=${encodeURIComponent(
              email
            )}&sale_type=2`
          ),
          fetch(
            `/api/seller/approval-rejected?email=${encodeURIComponent(
              email
            )}&sale_type=2`
          ),
          fetch(`/api/seller/sold-buy-now?email=${encodeURIComponent(email)}`),
        ];

        const responses = await Promise.all(fetchPromises);

        // Step 2: Parse all JSON responses in parallel (True parallelism)
        const dataPromises = responses.map((res) => res.json());
        const [
          liveData,
          upcomingData,
          evaluateData,
          pendingData,
          rejectedData,
          unsoldData,
          salesData,
          manageData,
          activeData,
          lostData,
          awardedData,
          liveBuyNowData,
          upcomingBuyNowData,
          pendingBuyNowData,
          rejectedBuyNowData,
          soldBuyNowData,
        ] = await Promise.all(dataPromises);

        // Step 3: Update all state in one batch to minimize re-renders
        // Forward State
        if (liveData.success) {
          setLiveAuctions(liveData.data || []);
          setLiveCount(liveData.count || 0);
        }
        if (upcomingData.success) {
          setUpcomingAuctions(upcomingData.data || []);
          setUpcomingCount(upcomingData.count || 0);
        }
        if (evaluateData.success) setEvaluateAuctions(evaluateData.data || []);
        if (pendingData.success) setApprovalPendings(pendingData.data || []);
        if (rejectedData.success) setApprovalRejected(rejectedData.data || []);
        if (unsoldData.success) {
          setUnsoldSales(unsoldData.data || []);
          setUnsoldCount((unsoldData.data || []).length);
        }
        if (salesData.success) setSales(salesData.data || []);
        if (manageData.success) setAuctions(manageData.data || []);

        // Reverse State
        if (activeData.success) setActiveBids(activeData.data || []);
        if (lostData.success) setLostBids(lostData.data || []);
        if (Array.isArray(awardedData)) setAwardedAuctions(awardedData);
        else if (awardedData.success && Array.isArray(awardedData.data))
          setAwardedAuctions(awardedData.data);

        // Buy Now State
        if (liveBuyNowData.success) {
          setBuyNowProducts(liveBuyNowData.data || []);
          setBuyNowCount(liveBuyNowData.count || 0);
        }
        if (upcomingBuyNowData.success)
          setUpcomingBuyNow(upcomingBuyNowData.data || []);
        if (pendingBuyNowData.success)
          setApprovalPendingsBuynow(pendingBuyNowData.data || []);
        if (rejectedBuyNowData.success)
          setRejectedBuyNow(rejectedBuyNowData.data || []);
        if (soldBuyNowData.success) setSoldBuyNow(soldBuyNowData.data || []);
      } catch (err) {
        console.error("Error fetching Dashboard Data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      }
    };

    fetchAllDashboardData();
  }, [user?.email, user?.id, isLoading]);

  // --- Render ---

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Not logged in.</p>
      </div>
    );
  if (user.role == "both")
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Access Denied. See Buyer Dashboard.</p>
      </div>
    );

  return (
    <div className="min-h-screen py-12 md:py-20 bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-6">
        <div
          className={`flex flex-col ${
            selectedMode === "forward" ||
            selectedMode === "reverse" ||
            selectedMode === "marketplace"
              ? "lg:flex-row"
              : "flex-col"
          } gap-8`}
        >
          <SellerSidebar
            selectedMode={selectedMode}
            selectedSection={selectedSection}
            onSelectSection={setSelectedSection}
            onSelectManageAuctionTab={setManageAuctionTab}
            onSelectBuyNowTab={setBuyNowTab}
            forwardAuctionCount={liveCount + unsoldCount + sales.length}
            reverseAuctionCount={
              activeBids.length + awardedAuctions.length + lostBids.length
            }
            buyNowCount={buyNowCount}
          />

          <div className="flex-1 min-w-0">
            {selectedMode !== "forward" && selectedMode !== "reverse" && (
              <div className="">{/* Select a mode to view dashboard */}</div>
            )}

            {selectedSection === "manageAuction" && (
              <ForwardAuctionsView
                manageAuctionTab={manageAuctionTab}
                setManageAuctionTab={setManageAuctionTab}
                setSelectedSection={setSelectedSection}
                liveAuctions={liveAuctions}
                upcomingAuctions={upcomingAuctions}
                evaluateAuctions={evaluateAuctions}
                approvalPendings={approvalPendings}
                approvalRejected={approvalRejected}
                unsoldSales={unsoldSales}
                sales={sales}
                auctions={auctions}
                liveCount={liveCount}
                upcomingCount={upcomingCount}
                unsoldCount={unsoldCount}
                onRefreshSales={() => {
                  window.location.reload();
                }}
                setShowSellerLeaderboard={setShowSellerLeaderboard}
                setSelectedAuctionId={setSelectedAuctionId}
              />
            )}

            {selectedSection === "reverseAuction" && (
              <ReverseAuctionsView
                manageAuctionReverseTab={manageAuctionReverseTab}
                setManageAuctionReverseTab={setManageAuctionReverseTab}
                activeBids={activeBids}
                awardedAuctions={awardedAuctions}
                lostBids={lostBids}
              />
            )}

            {selectedSection === "buynow" && (
              <BuyNowProductsView
                buyNowTab={buyNowTab}
                setBuyNowTab={setBuyNowTab}
                selectedMode={selectedMode || "forward"}
                setSelectedSection={setSelectedSection}
                liveProducts={buyNowProducts}
                upcomingProducts={upcomingBuyNow}
                pendingProducts={approvalPendingsBuynow}
                rejectedProducts={rejectedBuyNow}
                soldProducts={soldBuyNow}
              />
            )}

            {selectedSection === "profile" && (
              <div className="bg-white p-6 rounded-xl shadow">
                {/* Placeholder content until Profile code is migrated or confirmed */}
                <ProfileSettingsPage />
              </div>
            )}

            {selectedSection === "createAuction" && (
              <div>
                <CreateForwardAuction />
              </div>
            )}

            {selectedSection === "createbuynow" && (
              <div>
                <Createbuynow />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
