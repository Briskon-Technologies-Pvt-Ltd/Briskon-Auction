"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { SellerSoldItemsView } from "@/components/dashboard/seller/SellerSoldItemsView";
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

  // Independent Data Fetching for Waterfall Effect
  useEffect(() => {
    if (!user?.email || isLoading) return;

    const email = user.email;
    const userId = user.id;

    const fetchData = async (
      url: string,
      setter: (data: any) => void,
      countSetter?: (count: number) => void
    ) => {
      try {
        const res = await fetch(url);
        const data = await res.json();

        let valueToSet = data;
        if (data && typeof data === "object" && "data" in data) {
          valueToSet = data.data;
        }

        const list = Array.isArray(valueToSet) ? valueToSet : [];
        setter(list);

        // Use provided count setter or fallback to list length if count is in data
        if (countSetter) {
          const count =
            data && typeof data === "object" && "count" in data
              ? data.count
              : list.length;
          countSetter(count);
        }
      } catch (err) {
        console.error(`Error fetching ${url}:`, err);
      }
    };

    // Forward Data
    fetchData(
      `/api/seller/live-auctions?email=${encodeURIComponent(
        email
      )}&sale_type=1`,
      setLiveAuctions,
      setLiveCount
    );
    fetchData(
      `/api/seller/upcoming-auctions?email=${encodeURIComponent(
        email
      )}&sale_type=1`,
      setUpcomingAuctions,
      setUpcomingCount
    );
    fetchData(
      `/api/seller/evaluate-auction?email=${encodeURIComponent(email)}`,
      setEvaluateAuctions
    );
    fetchData(
      `/api/seller/approval-Pending?email=${encodeURIComponent(
        email
      )}&sale_type=1`,
      setApprovalPendings
    );
    fetchData(
      `/api/seller/approval-rejected?email=${encodeURIComponent(
        email
      )}&sale_type=1`,
      setApprovalRejected
    );
    fetchData(
      `/api/seller/unsold-items?email=${encodeURIComponent(email)}`,
      setUnsoldSales,
      setUnsoldCount
    );
    fetchData(
      `/api/seller/sales-history?email=${encodeURIComponent(email)}`,
      setSales
    );
    fetchData(
      `/api/seller/manage-auction?email=${encodeURIComponent(email)}`,
      setAuctions
    );

    // Reverse Data
    fetchData(
      `/api/seller/active-bids?id=${userId}&email=${encodeURIComponent(email)}`,
      setActiveBids
    );
    fetchData(
      `/api/seller/lost-auctions?id=${userId}&email=${encodeURIComponent(
        email
      )}`,
      setLostBids
    );
    fetchData(
      `/api/seller/awarded-auctions?email=${encodeURIComponent(email)}`,
      setAwardedAuctions
    );

    // Buy Now Data
    fetchData(
      `/api/seller/live-auctions?email=${encodeURIComponent(
        email
      )}&sale_type=2`,
      setBuyNowProducts,
      setBuyNowCount
    );
    fetchData(
      `/api/seller/upcoming-auctions?email=${encodeURIComponent(
        email
      )}&sale_type=2`,
      setUpcomingBuyNow
    );
    fetchData(
      `/api/seller/approval-Pending?email=${encodeURIComponent(
        email
      )}&sale_type=2`,
      setApprovalPendingsBuynow
    );
    fetchData(
      `/api/seller/approval-rejected?email=${encodeURIComponent(
        email
      )}&sale_type=2`,
      setRejectedBuyNow
    );
    fetchData(
      `/api/seller/sold-buy-now?email=${encodeURIComponent(email)}`,
      setSoldBuyNow
    );
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
            forwardAuctionCount={
              liveAuctions.length +
              upcomingAuctions.length +
              unsoldSales.length +
              approvalPendings.length +
              approvalRejected.length +
              evaluateAuctions.length
            }
            buyNowCount={buyNowProducts.length}
            reverseAuctionCount={activeBids.length}
            soldItemsCount={sales.length}
          />

          <div className="flex-1 min-w-0">
            {selectedMode !== "forward" && selectedMode !== "reverse" && (
              <div className="">{/* Select a mode to view dashboard */}</div>
            )}
            {/* Seller Sold Items View */}
            {selectedSection === "soldItems" && (
              <SellerSoldItemsView
                sales={sales}
                setSelectedSection={setSelectedSection}
              />
            )}

            {/* Forward Autions View */}
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
