"use client";
import React from "react";
import Link from "next/link";
import { Gavel, Trophy, XCircle, Eye } from "lucide-react";
import LiveTimer from "@/app/livetimer/page";
import BuyerLeaderboard from "@/app/buyer-leaderboard/page";

// Utility functions
const formatDateTime = (date: Date): string => {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getEndDate = (
  start: Date,
  duration: { days?: number; hours?: number; minutes?: number }
): Date => {
  const durationMs =
    ((duration.days || 0) * 24 * 60 +
      (duration.hours || 0) * 60 +
      (duration.minutes || 0)) *
    60 *
    1000;
  return new Date(start.getTime() + durationMs);
};

interface BuyerForwardAuctionsViewProps {
  reverseManageAuctionTab: string;
  setReverseManageAuctionTab: (tab: any) => void;
  activeBids: any[];
  wonAuctions: any[];
  lostAuctions: any[];
  showSellerLeaderboard: boolean;
  selectedAuctionId: string | null;
  setShowSellerLeaderboard: (show: boolean) => void;
  setSelectedAuctionId: (id: string | null) => void;
}

export const BuyerForwardAuctionsView: React.FC<
  BuyerForwardAuctionsViewProps
> = ({
  reverseManageAuctionTab,
  setReverseManageAuctionTab,
  activeBids,
  wonAuctions,
  lostAuctions,
  showSellerLeaderboard,
  selectedAuctionId,
  setShowSellerLeaderboard,
  setSelectedAuctionId,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-[12px] border shadow-md border-blue-300">
      {/* Tab Navigation */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => setReverseManageAuctionTab("active")}
            className={`px-7 py-[6px] my-2 rounded-full font-light text-xs shadow-sm ${
              reverseManageAuctionTab === "active"
                ? "bg-[#131eba] text-white shadow-md"
                : "bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
            }`}
          >
            Active Bids ({activeBids.length})
          </button>

          <button
            onClick={() => setReverseManageAuctionTab("won")}
            className={`px-7 py-[6px] my-2 rounded-full font-light text-xs shadow-sm ${
              reverseManageAuctionTab === "won"
                ? "bg-[#131eba] text-white shadow-md"
                : "bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
            }`}
          >
            Won Auctions ({wonAuctions.length})
          </button>

          <button
            onClick={() => setReverseManageAuctionTab("lost")}
            className={`px-7 py-[6px] my-2 rounded-full font-light text-xs shadow-sm ${
              reverseManageAuctionTab === "lost"
                ? "bg-[#131eba] text-white shadow-md"
                : "bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
            }`}
          >
            Lost Auctions ({lostAuctions.length})
          </button>
        </div>
      </div>

      {/* Active Bids Content */}
      {reverseManageAuctionTab === "active" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Gavel className="h-4 w-4 text-violet-500 animate-bounce" />
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
                    <th className="px-4 py-2 text-left">Current Bid</th>
                    <th className="px-4 py-2 text-left">My Bid Amount</th>
                    <th className="px-4 py-2 text-left">Position</th>
                    <th className="px-4 py-2 text-left">Ends In</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBids.map((active, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
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
                      <td className="px-4 py-2 text-gray-600 capitalize">
                        {active.category?.handle || "N/A"}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
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
                      <td className="px-4 py-2 font-bold text-green-600">
                        ${active.currentbid}
                      </td>
                      <td className="px-4 py-2 font-bold text-blue-600">
                        ${active.bidAmount}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {active.position}
                      </td>
                      <td className="px-4 py-2">
                        <LiveTimer
                          startTime={active.scheduledstart}
                          duration={active.auctionduration}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Won Auctions Content */}
      {reverseManageAuctionTab === "won" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500 animate-bounce" />
              Auctions I Won
            </h2>
          </div>
          {wonAuctions.length === 0 ? (
            <p className="text-sm text-gray-500">No won auctions yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-md mt-6">
              <table className="min-w-full text-xs border border-gray-100 dark:border-gray-800">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left">Auction Name</th>
                    <th className="px-4 py-2 text-left">Format</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-left">Seller Name</th>
                    <th className="px-4 py-2 text-left">Starting Bid</th>
                    <th className="px-4 py-2 text-left">My Bid Amount</th>
                    <th className="px-4 py-2 text-left">End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {wonAuctions.map((auction, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
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
                      <td className="px-4 py-2 text-gray-600 capitalize">
                        {auction.auctionsubtype}
                      </td>
                      <td className="px-4 py-2 text-gray-600 capitalize">
                        {auction.category?.handle || "N/A"}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {auction.sellerName}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        ${auction.startAmount?.toLocaleString("en-IN") || "N/A"}
                      </td>
                      <td className="px-4 py-2 font-bold text-green-600">
                        $
                        {auction.winningBidAmount?.toLocaleString("en-IN") ||
                          "N/A"}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {formatDateTime(
                          getEndDate(
                            new Date(auction.scheduledstart),
                            auction.auctionduration ?? {}
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

      {/* Lost Auctions Content */}
      {reverseManageAuctionTab === "lost" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500 animate-bounce" />
              Auctions I Lost
            </h2>
          </div>
          {lostAuctions.length === 0 ? (
            <p className="text-gray-500 italic">No lost Auctions.</p>
          ) : (
            <div className="overflow-x-auto rounded-md mt-6">
              <table className="min-w-full text-xs border border-gray-100 dark:border-gray-800">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left">Auction Name</th>
                    <th className="px-4 py-2 text-left">Format</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-left">Seller Name</th>
                    <th className="px-4 py-2 text-left">Starting Bid</th>
                    <th className="px-4 py-2 text-left">My Bid</th>
                    <th className="px-4 py-2 text-left">Winning Bid</th>
                  </tr>
                </thead>
                <tbody>
                  {lostAuctions.map((auction, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
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
                      <td className="p-2 text-gray-600">
                        {auction.category?.handle || "N/A"}
                      </td>
                      <td className="p-2 text-gray-600">
                        {auction.sellerName}
                      </td>
                      <td className="p-2 text-gray-600">
                        ${auction.startAmount?.toLocaleString("en-IN") || "N/A"}
                      </td>
                      <td className="p-2 text-gray-600">
                        $
                        {auction.userBidAmount?.toLocaleString("en-IN") ||
                          "N/A"}
                      </td>
                      <td className="p-2 text-gray-600">
                        $
                        {auction.winningBidAmount?.toLocaleString("en-IN") ||
                          "N/A"}
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
  );
};
