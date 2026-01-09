"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Gavel,
  Calendar,
  Hourglass,
  XCircle,
  Lock,
  Medal,
  Trophy,
  Edit,
  Trash,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import LiveTimer from "@/app/livetimer/page";
import DeclareSellerWinnerModal from "@/app/declear-winner/declear-seller-winner/page";

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

interface BuyerReverseAuctionsViewProps {
  manageAuctionTab: string;
  setManageAuctionTab: (tab: any) => void;
  liveAuctions: any[];
  upcomingAuctions: any[];
  approvalPendings: any[];
  approvalRejected: any[];
  closedAuctions: any[];
  bidRecevied: any[];
  awardedAuctions: any[];
  awardedAuctionsMap: { [key: string]: string };
  onAcceptBid: (auctionId: string, bidId: string) => void;
  onSelectSection: (section: any) => void;
}

export const BuyerReverseAuctionsView: React.FC<
  BuyerReverseAuctionsViewProps
> = ({
  manageAuctionTab,
  setManageAuctionTab,
  liveAuctions,
  upcomingAuctions,
  approvalPendings,
  approvalRejected,
  closedAuctions,
  bidRecevied,
  awardedAuctions,
  awardedAuctionsMap,
  onAcceptBid,
  onSelectSection,
}) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(
    null
  );

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleViewBids = (auctionId: string) => {
    setSelectedAuctionId(auctionId);
    setShowModal(true);
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow border border-blue-300">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setManageAuctionTab("live")}
          className={`px-7 py-[6px] my-2 rounded-full font-light text-xs shadow-sm ${
            manageAuctionTab === "live"
              ? "bg-[#131eba] text-white shadow-md"
              : "bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
          }`}
        >
          Live ({liveAuctions.length})
        </button>

        <button
          onClick={() => setManageAuctionTab("upcoming")}
          className={`px-7 py-[6px] my-2 rounded-full font-light text-xs shadow-sm ${
            manageAuctionTab === "upcoming"
              ? "bg-[#131eba] text-white shadow-md"
              : "bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
          }`}
        >
          Upcoming ({upcomingAuctions.length})
        </button>

        <button
          onClick={() => setManageAuctionTab("pending")}
          className={`px-7 py-[6px] my-2 rounded-full font-light text-xs shadow-sm ${
            manageAuctionTab === "pending"
              ? "bg-[#131eba] text-white shadow-md"
              : "bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
          }`}
        >
          Pending ({approvalPendings.length})
        </button>

        <button
          onClick={() => setManageAuctionTab("rejected")}
          className={`px-7 py-[6px] my-2 rounded-full font-light text-xs shadow-sm ${
            manageAuctionTab === "rejected"
              ? "bg-[#131eba] text-white shadow-md"
              : "bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
          }`}
        >
          Rejected ({approvalRejected.length})
        </button>

        <button
          onClick={() => setManageAuctionTab("closed")}
          className={`px-7 py-[6px] my-2 rounded-full font-light text-xs shadow-sm ${
            manageAuctionTab === "closed"
              ? "bg-[#131eba] text-white shadow-md"
              : "bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
          }`}
        >
          Closed ({closedAuctions.length})
        </button>

        <button
          onClick={() => setManageAuctionTab("award")}
          className={`px-7 py-[6px] my-2 rounded-full font-light text-xs shadow-sm ${
            manageAuctionTab === "award"
              ? "bg-[#131eba] text-white shadow-md"
              : "bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
          }`}
        >
          Awarded ({awardedAuctions.length})
        </button>

        <button
          onClick={() => setManageAuctionTab("contract")}
          className={`px-7 py-[6px] my-2 rounded-full font-light text-xs shadow-sm ${
            manageAuctionTab === "contract"
              ? "bg-[#131eba] text-white shadow-md"
              : "bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
          }`}
        >
          Contract ({bidRecevied.length})
        </button>
      </div>

      {/* Live Tab */}
      {manageAuctionTab === "live" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Gavel className="h-5 w-5 text-orange-500 animate-bounce" />
              Live Reverse Auctions
            </h2>
            <AnimatedButton
              label="Create Auction"
              onClick={() => onSelectSection("createAuction")}
            />
          </div>
          {liveAuctions.length === 0 ? (
            <p className="text-sm text-gray-500">No live auctions.</p>
          ) : (
            <div className="overflow-x-auto rounded-md mt-6">
              <table className="min-w-full text-xs border border-gray-100 dark:border-gray-800">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left">Auction Name</th>
                    <th className="px-4 py-2 text-left">Format</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-left">Starting Bid</th>
                    <th className="px-4 py-2 text-left">Target Price</th>
                    <th className="px-4 py-2 text-left">End Date</th>
                    <th className="px-4 py-2 text-left">Current Bid</th>
                    <th className="px-4 py-2 text-left">Ends In</th>
                    <th className="px-4 py-2 text-left">Suppliers</th>
                  </tr>
                </thead>
                <tbody>
                  {liveAuctions.map((auction, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="p-2">
                        <Link
                          href={`/auctions/reverse/${auction.id}`}
                          className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                        >
                          <img
                            src={auction.productimages}
                            alt={auction.productname}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          {auction.productname}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-gray-600 capitalize">
                        {auction.auctionsubtype}
                      </td>
                      <td className="px-4 py-2 text-gray-600 capitalize">
                        {auction.category?.handle}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        ${auction.startprice}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        ${auction.targetprice || "N/A"}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {formatDateTime(
                          getEndDate(
                            new Date(auction.scheduledstart),
                            auction.auctionduration ?? {}
                          )
                        )}
                      </td>
                      <td className="px-4 py-2 font-bold text-green-600">
                        {auction.bidder_count === 0
                          ? "N/A"
                          : `$${auction.currentbid}`}
                      </td>
                      <td className="px-4 py-2">
                        <LiveTimer
                          startTime={auction.scheduledstart}
                          duration={auction.auctionduration}
                        />
                      </td>
                      <td className="px-4 py-2 font-bold text-blue-600">
                        {auction.bidder_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Upcoming Tab */}
      {manageAuctionTab === "upcoming" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 animate-bounce" />
              Upcoming Reverse Auctions
            </h2>
            <AnimatedButton
              label="Create Auction"
              onClick={() => onSelectSection("createAuction")}
            />
          </div>
          {upcomingAuctions.length === 0 ? (
            <p className="text-sm text-gray-500">No upcoming auctions.</p>
          ) : (
            <div className="overflow-x-auto rounded-md mt-6">
              <table className="min-w-full text-xs border border-gray-100 dark:border-gray-800">
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
                  {upcomingAuctions.map((auction, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="p-2">
                        <Link
                          href={`/auctions/reverse/${auction.id}`}
                          className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                        >
                          <img
                            src={auction.productimages}
                            alt={auction.productname}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          {auction.productname}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-gray-600 capitalize">
                        {auction.auctionsubtype}
                      </td>
                      <td className="px-4 py-2 text-gray-600 capitalize">
                        {auction.category?.handle}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        ${auction.startprice}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {formatDateTime(new Date(auction.scheduledstart))}
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {formatDateTime(
                          getEndDate(
                            new Date(auction.scheduledstart),
                            auction.auctionduration ?? {}
                          )
                        )}
                      </td>
                      <td>
                        <LiveTimer
                          className="text-green-500 font-bold"
                          startTime={auction.scheduledstart}
                          duration={auction.auctionduration}
                        />
                      </td>
                      <td className="p-2 flex space-x-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleNavigate(
                              `/seller-panel/my-listings/buyer-edit/${auction.id}`
                            )
                          }
                          className="text-green-600 hover:text-green-700 p-1 w-6 h-6 flex items-center justify-center"
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

      {/* Pending Tab */}
      {manageAuctionTab === "pending" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Hourglass className="h-4 w-4 text-yellow-500 animate-bounce" />
              Reverse Auctions Pending Approval
            </h2>
            <AnimatedButton
              label="Create Auction"
              onClick={() => onSelectSection("createAuction")}
            />
          </div>
          {approvalPendings.length === 0 ? (
            <p className="text-sm text-gray-500">No Auction Pending Approval</p>
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
                  </tr>
                </thead>
                <tbody>
                  {approvalPendings.map((approval, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
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
                        {formatDateTime(new Date(approval.scheduledstart))}
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

      {/* Award Tab */}
      {manageAuctionTab === "award" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Medal className="h-4 w-4 text-green-700 animate-bounce" />
              Awarded Suppliers (Winners)
            </h2>
            <AnimatedButton
              label="Create Auction"
              onClick={() => onSelectSection("createAuction")}
            />
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
                      <td className="p-2 text-gray-600">{award.sellerName}</td>
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

      {/* Contract Tab */}
      {manageAuctionTab === "contract" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500 animate-bounce" />
              View Supplier Bids and Declare Winner
            </h2>
            <AnimatedButton
              label="Create Auction"
              onClick={() => onSelectSection("createAuction")}
            />
          </div>
          {bidRecevied.length === 0 ? (
            <p className="text-sm text-gray-500">No Award Contract Auctions</p>
          ) : (
            <div className="overflow-x-auto rounded-md mt-6">
              <table className="min-w-full text-sm border border-gray-100 dark:border-gray-800">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                  <tr>
                    <th className="text-left px-4 p-2">Auction Name</th>
                    <th className="text-left px-4 p-2">Seller Name</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="text-left px-4 p-2">Type</th>
                    <th className="text-left px-4 py-2">Format</th>
                    <th className="text-left px-4 py-2">Target Price</th>
                    <th className="text-left px-4 p-2">Starting Bid</th>
                    <th className="text-left px-4 p-2">Bid Amount</th>
                    <th className="text-center px-4 p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bidRecevied.map((BidRecive, index) => (
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
                          disabled={!!awardedAuctionsMap[BidRecive.auctionId]}
                          onClick={() =>
                            onAcceptBid(BidRecive.auctionId, BidRecive.bidId)
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Rejected Tab */}
      {manageAuctionTab === "rejected" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500 animate-bounce" />
              Reverse Auctions Rejected by Admin
            </h2>
            <AnimatedButton
              label="Create Auction"
              onClick={() => onSelectSection("createAuction")}
            />
          </div>
          {approvalRejected.length === 0 ? (
            <p className="text-sm text-gray-500">No Auction Admin Rejected</p>
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
                  </tr>
                </thead>
                <tbody>
                  {approvalRejected.map((closed, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
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
                          className="text-blue-500 hover:text-blue-500 p-1 w-16 h-6 flex items-center justify-center"
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

      {/* Closed Tab */}
      {manageAuctionTab === "closed" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4 text-red-500 animate-bounce" />
              Completed / Ended Reverse Auctions
            </h2>
            <AnimatedButton
              label="Create Auction"
              onClick={() => onSelectSection("createAuction")}
            />
          </div>
          {closedAuctions.length === 0 ? (
            <p className="text-sm text-gray-500">Closed Auction</p>
          ) : (
            <div className="overflow-x-auto rounded-md mt-6">
              <table className="min-w-full text-sm border border-gray-100 dark:border-gray-800">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left">Auction Name</th>
                    <th className="px-4 py-2 text-left">Format</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-left">End Date</th>
                    <th className="px-4 py-2 text-left">Budget/Target Price</th>
                    <th className="px-4 py-2 text-left">
                      Suppliers Participated
                    </th>
                    <th className="px-4 py-2 text-left">
                      Lowest Bid/Best Offer
                    </th>
                    <th className="px-4 py-2 text-left">Winner (Proposed)</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {closedAuctions.map((upcoming, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
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
                            auction={upcoming}
                            onClose={() => setShowModal(false)}
                          />
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
  );
};
