"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Gavel,
  Calendar,
  Lock,
  Hourglass,
  XCircle,
  Archive,
  PackageCheck,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import LiveTimer from "@/app/livetimer/page"; // Verify path
// import CreateAuction from "@/app/seller-panel/create-listing/page"; // Removed unused

import WinnerModal from "@/app/declear-winner/winner-modal/page"; // Verify path
import { formatDateTime, getEndDate } from "./utils";
import {
  LiveAuction,
  upcomingAuctionItem,
  closedAuctionItem,
  approvalPendingItem,
  approvalRejectedItem,
  UnsoldSale,
  Sale,
  AuctionItem,
} from "./types";

interface ForwardAuctionsViewProps {
  manageAuctionTab: string;
  setManageAuctionTab: (tab: any) => void;
  setSelectedSection: (section: string) => void;
  // Data Arrays
  liveAuctions: LiveAuction[];
  upcomingAuctions: upcomingAuctionItem[];
  evaluateAuctions: closedAuctionItem[];
  approvalPendings: approvalPendingItem[];
  approvalRejected: approvalRejectedItem[];
  unsoldSales: UnsoldSale[];
  sales: Sale[];
  auctions: AuctionItem[]; // For WinnerModal lookup
  // Counts for badges
  liveCount: number;
  upcomingCount: number;
  unsoldCount: number;
  // Handlers
  onRefreshSales: () => void;
  setShowSellerLeaderboard: (show: boolean) => void;
  setSelectedAuctionId: (id: string | null) => void;
}

export const ForwardAuctionsView: React.FC<ForwardAuctionsViewProps> = ({
  manageAuctionTab,
  setManageAuctionTab,
  setSelectedSection,
  liveAuctions,
  upcomingAuctions,
  evaluateAuctions,
  approvalPendings,
  approvalRejected,
  unsoldSales,
  sales,
  auctions,
  liveCount,
  upcomingCount,
  unsoldCount,
  onRefreshSales,
  setShowSellerLeaderboard,
  setSelectedAuctionId,
}) => {
  const router = useRouter();
  const [openAuctionId, setOpenAuctionId] = useState<string | null>(null);

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div>
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow pt-4">
        {manageAuctionTab !== "create" && (
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setManageAuctionTab("live")}
              className={`px-7 py-[6px] my-2 rounded-full font-light text-xs shadow-sm
        ${
          manageAuctionTab === "live"
            ? "bg-[#131eba] text-white shadow-md"
            : "bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
        }`}
            >
              Live ({liveCount})
            </button>
            <button
              onClick={() => setManageAuctionTab("upcoming")}
              className={`px-7 py-[6px] my-2 rounded-full font-light text-xs shadow-sm 
        ${
          manageAuctionTab === "upcoming"
            ? "bg-[#131eba] text-white shadow-md"
            : "bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
        }`}
            >
              Upcoming ({upcomingCount})
            </button>
            <button
              onClick={() => setManageAuctionTab("pending")}
              className={`px-7 py-[6px] my-2 rounded-full font-light text-xs shadow-sm 
        ${
          manageAuctionTab === "pending"
            ? "bg-[#131eba] text-white shadow-md"
            : "bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
        }`}
            >
              Pending Approval ({approvalPendings.length})
            </button>

            <button
              onClick={() => setManageAuctionTab("rejected")}
              className={`px-7 py-[6px] my-2 rounded-full font-light text-xs shadow-sm 
        ${
          manageAuctionTab === "rejected"
            ? "bg-[#131eba] text-white shadow-md"
            : "bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
        }`}
            >
              Admin Rejected ({approvalRejected.length})
            </button>
            <button
              onClick={() => setManageAuctionTab("unsold")}
              className={`px-7 py-[6px] my-2 rounded-full font-light text-xs shadow-sm 
        ${
          manageAuctionTab === "unsold"
            ? "bg-[#131eba] text-white shadow-md"
            : "bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
        }`}
            >
              Unsold Items ({unsoldCount})
            </button>
            <button
              onClick={() => setManageAuctionTab("Evaluate")}
              className={`px-7 py-[6px] my-2 rounded-full font-light text-xs shadow-sm 
        ${
          manageAuctionTab === "Evaluate"
            ? "bg-[#131eba] text-white shadow-md"
            : "bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
        }`}
            >
              Evaluate Bids ({evaluateAuctions.length})
            </button>
          </div>
        )}

        {/* {manageAuctionTab === "create" ? <CreateAuction /> : null} */}

        {manageAuctionTab === "live" && (
          <div>
            <div className="flex items-center justify-between mb-4 pt-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Gavel className="h-5 w-5 text-orange-500 animate-bounce" />
                Live Auctions
              </h2>
              <AnimatedButton
                label="Create Auction"
                onClick={() => setSelectedSection("createAuction")}
              />
            </div>
            {liveAuctions.length === 0 ? (
              <p className="text-sm text-gray-500">No sold items yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-md mt-6 pb-12">
                <table className="min-w-full text-xs border border-gray-100 dark:border-gray-800">
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
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
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
          <div>
            <div className="flex items-center justify-between mb-4 pt-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 animate-bounce" />
                Upcoming Auctions
              </h2>
              <AnimatedButton
                label="Create Auction"
                onClick={() => setSelectedSection("createAuction")}
              />
            </div>
            {upcomingAuctions.length === 0 ? (
              <p className="text-sm text-gray-500">Upcoming Auction</p>
            ) : (
              <div className="overflow-x-auto rounded-md mt-6 pb-12">
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
                    {upcomingAuctions.map((upcoming, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
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
                          {formatDateTime(new Date(upcoming.scheduledstart))}
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
          <div>
            <div className="flex items-center justify-between mb-4 pt-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-500  animate-bounce" />
                Evaluate Auctions - Declare Winners
              </h2>
              <AnimatedButton
                label="Create Auction"
                onClick={() => setSelectedSection("createAuction")}
              />
            </div>
            {evaluateAuctions.length === 0 ? (
              <p className="text-sm text-gray-500">No Evaluate Auctions</p>
            ) : (
              <div className="overflow-x-auto rounded-md mt-6 pb-12">
                <table className="min-w-full text-xs border border-gray-100 dark:border-gray-800">
                  <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left">Auction Name</th>
                      <th className="px-4 py-2 text-left">Format</th>
                      <th className="px-4 py-2 text-left">Category</th>
                      <th className="px-4 py-2 text-left">Start date</th>
                      <th className="px-4 py-2 text-left">End Date</th>
                      <th className="px-4 py-2 text-left">Starting Bid</th>
                      <th className="px-4 py-2 text-left"> Totlal Bidders</th>
                      <th className="px-4 py-2 text-left">Winning Bid</th>
                      <th className="px-4 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluateAuctions.map((upcoming, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
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
                          {formatDateTime(new Date(upcoming.scheduledstart))}
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
                            onWinnerConfirmed={onRefreshSales}
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
              </div>
            )}
          </div>
        )}
        {manageAuctionTab === "pending" && (
          <div>
            <div className="flex items-center justify-between mb-4 pt-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Hourglass className="h-4 w-4 text-yellow-500 animate-bounce" />
                Approval Pending
              </h2>
              <AnimatedButton
                label="Create Auction"
                onClick={() => setSelectedSection("createAuction")}
              />
            </div>
            {approvalPendings.length === 0 ? (
              <p className="text-sm text-gray-500">Approval Pending</p>
            ) : (
              <div className="overflow-x-auto rounded-md mt-6 pb-12">
                <table className="min-w-full text-xs border border-gray-100 dark:border-gray-800">
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
                                `/seller-panel/my-listings/seller-edit/${approval.id}`
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
        {manageAuctionTab === "rejected" && (
          <div>
            <div className="flex items-center justify-between mb-4 pt-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500 animate-bounce" />
                Rejected
              </h2>
              <AnimatedButton
                label="Create Auction"
                onClick={() => setSelectedSection("createAuction")}
              />
            </div>
            {approvalRejected.length === 0 ? (
              <p className="text-sm text-gray-500">Rejected </p>
            ) : (
              <div className="overflow-x-auto rounded-md mt-6 pb-12">
                <table className="min-w-full text-xs border border-gray-100 dark:border-gray-800">
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
          <div>
            <div className="flex items-center justify-between mb-4 pt-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Archive className="h-5 w-5 text-red-500 animate-bounce" />
                Unsold Items
              </h2>
              <AnimatedButton
                label="Create Auction"
                onClick={() => setSelectedSection("createAuction")}
              />
            </div>
            {unsoldSales.length === 0 ? (
              <p className="text-sm text-gray-500">No sold items yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-md mt-6 pb-12">
                <table className="min-w-full text-xs border border-gray-100 dark:border-gray-800">
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
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
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
      </div>
    </div>
  );
};
