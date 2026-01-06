"use client";
import { useEffect, useState } from "react";
import { User, Award, BadgeCheck, FolderOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface Bid {
  auction: {
    issilentauction?: boolean;
    auctionsubtype?: string;
  };
  id: string;
  user_id: string;
  amount: number;
  created_at: string;
  profile: {
    fname: string;
    location: string;
  };
}
interface Document {
  id: string;
  url: string;
}

interface BidWithDocuments {
  id: string; // make sure each bid has an ID for the table row key
  bidder: string;
  user_id: string;
  amount: number;
  time: string;
  productdocuments: Document[];
  profile?: {
    fname?: string;
    lname?: string;
  };
}

interface Auction {
  issilentauction?: boolean;
  auctionsubtype?: string;
}
interface BidLeadersBoardProps {
  auction: Auction;
  auctionId: string;
  loggedInUserId: string;
  currencySymbol: string;
  bidHistory: BidWithDocuments[]; // <-- include bidHistory here
}

export default function BidLeadersBoard({
  auction,
  auctionId,
  loggedInUserId,
  currencySymbol,
  bidHistory,
}: BidLeadersBoardProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [showAllBids, setShowAllBids] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    async function fetchBids() {
      const res = await fetch(`/api/bids/${auctionId}`);
      const json = await res.json();
      if (json.success) {
        setBids(json.data);
      }
    }
    fetchBids(); // fetch immediately on mount
    intervalId = setInterval(fetchBids, 3000); // fetch every 3 seconds
    return () => clearInterval(intervalId); // clean up on unmount
  }, [auctionId]);

  // Filter unique bidders: keep only highest bid per user
  // Filter unique bidders: keep only lowest bid per user
  const uniqueLowestBidsMap = bids.reduce((map, bid) => {
    const existingBid = map.get(bid.user_id);
    if (!existingBid || existingBid.amount > bid.amount) {
      map.set(bid.user_id, bid);
    }
    return map;
  }, new Map<string, Bid>());

  const uniqueBids = Array.from(uniqueLowestBidsMap.values()).sort(
    (a, b) => a.amount - b.amount
  );

  const topBids = uniqueBids.slice(0, 3);
  const otherBids = uniqueBids.slice(3);
  const userBids = bids.filter((b) => b.user_id === loggedInUserId);

  const lowestUserBidAmount =
    userBids.length > 0 ? Math.min(...userBids.map((b) => b.amount)) : 0;

  const [visibleOtherBidsCount, setVisibleOtherBidsCount] = useState(0);
  const loadMoreCount = 10;

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            {auction?.auctionsubtype === "sealed" ? (
              <BadgeCheck className="w-4 h-4 text-yellow-500 animate-bounce" />
            ) : (
              <Award className="w-4 h-4 text-yellow-500 animate-bounce" />
            )}
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {auction?.auctionsubtype === "sealed"
                ? "My Proposal"
                : auction?.auctionsubtype === "silent"
                ? "My Bids"
                : "Bid Leaderboard"}
            </h3>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {auction?.auctionsubtype === "sealed" && (
            <>
              {topBids.filter((bid) => bid.user_id === loggedInUserId).length >
              0 ? (
                topBids
                  .filter((bid) => bid.user_id === loggedInUserId)
                  .map((bid) => (
                    <div
                      key={bid.id}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4"
                    >
                      {/* Bid Amount */}
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm">
                        <p className="text-sm text-gray-500">Bid Amount</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {currencySymbol}
                          {bid.amount.toLocaleString()}
                        </p>
                      </div>

                      {/* Submitted On */}
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm">
                        <p className="text-sm text-gray-500">Submitted On</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {new Date(bid.created_at).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
                  You haven’t placed any bid yet.
                </div>
              )}
            </>
          )}

          {auction?.auctionsubtype === "ranked" ? (
            <table className="min-w-full text-sm border border-gray-300">
              <thead className="bg-blue-100 text-blue-800 text-left text-xs font-medium tracking-wide border-b border-blue-300">
                <tr>
                  <th className="py-2 px-3 border-r border-blue-300">
                    Bidder/Supplier
                  </th>
                  <th className="py-2 px-3">Rank/Position</th>
                </tr>
              </thead>
              <tbody>
                {topBids.map((bid, index) => {
                  const isHighestUserBid =
                    bid.user_id === loggedInUserId &&
                    bid.amount === lowestUserBidAmount;

                  return (
                    <tr
                      key={bid.id}
                      className={`border-t border-gray-300 ${
                        isHighestUserBid
                          ? "bg-green-300 font-semibold cursor-pointer hover:bg-green-400 transition"
                          : "bg-white"
                      }`}
                      onClick={() => isHighestUserBid && setShowModal(true)}
                    >
                      <td className="py-2 px-3 border-r border-gray-300 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                        {bid.user_id === loggedInUserId && (
                          <User className="w-4 h-4" />
                        )}
                        {bid.profile?.fname || "Unknown"}
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-600 dark:text-gray-300">
                        {auction?.auctionsubtype === "ranked"
                          ? index + 1
                          : bid.amount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            // Show full bid leaderboard
            <>
              {auction?.auctionsubtype !== "sealed" && (
                <>
                  <table className="min-w-full text-sm border border-gray-300">
                    <thead className="bg-blue-100 text-blue-800 text-left text-xs font-medium tracking-wide border-b border-blue-300">
                      <tr>
                        <th className="py-2 px-3 border-r border-blue-300">
                          Bidder/Supplier
                        </th>
                        <th className="py-2 px-3">
                          Latest Bid ({currencySymbol})
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topBids.map((bid) => {
                        const isHighestUserBid =
                          bid.user_id === loggedInUserId &&
                          bid.amount === lowestUserBidAmount;
                        return (
                          <tr
                            key={bid.id}
                            className={`border-t border-gray-300 ${
                              isHighestUserBid
                                ? "bg-green-300 font-semibold cursor-pointer hover:bg-green-400 transition"
                                : "bg-white"
                            }`}
                            onClick={() =>
                              isHighestUserBid && setShowModal(true)
                            }
                          >
                            <td className="py-2 px-3 border-r border-gray-300 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                              {bid.user_id === loggedInUserId && (
                                <User className="w-4 h-4" />
                              )}
                              {bid.profile?.fname || "Unknown"}
                            </td>
                            <td className="py-2 px-3 text-xs text-gray-600 dark:text-gray-300">
                              {bid.amount.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}

                      {otherBids.slice(0, visibleOtherBidsCount).map((bid) => (
                        <tr
                          key={bid.id}
                          className="bg-white border-t border-gray-300"
                        >
                          <td className="py-2 px-3 border-r border-gray-300 text-xs text-gray-600 dark:text-gray-300">
                            {bid.profile?.fname || "Unknown"}
                          </td>
                          <td className="py-2 px-3 text-xs text-gray-600 dark:text-gray-300">
                            {bid.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {otherBids.length > 0 && (
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={() => {
                          if (visibleOtherBidsCount >= otherBids.length) {
                            setVisibleOtherBidsCount(0);
                          } else {
                            setVisibleOtherBidsCount((count) =>
                              Math.min(count + loadMoreCount, otherBids.length)
                            );
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                      >
                        {visibleOtherBidsCount >= otherBids.length
                          ? "Hide Bids"
                          : "View More Bids"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
          {/* Documents submitted by each bidder (only for sealed bids) */}
    {auction?.auctionsubtype === "sealed" && (
  <div className="mt-4 space-y-2">
    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 pb-2 pt-2 flex items-center gap-2">
      <FolderOpen className="w-4 h-4 text-blue-500 animate-bounce" />
      My Submitted Documents
    </p>

    <div className="flex flex-col gap-1">
      {(() => {
        if (!loggedInUserId || !bids.length) {
          return (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Loading your bids...
            </span>
          );
        }

        const myBid = bids.find((bid) =>
          String(bid.user_id).trim().toLowerCase() ===
          String(loggedInUserId).trim().toLowerCase()
        );

        console.log("✅ Found my bid:", myBid);

        if (!myBid) {
          return (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              You haven’t uploaded any documents yet.
            </span>
          );
        }

        if (!myBid.productdocuments || myBid.productdocuments.length === 0) {
          return (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              No documents uploaded.
            </span>
          );
        }

        return myBid.productdocuments.map((doc, index) => {
          const fileName = decodeURIComponent(doc.url.split("/").pop() || `Document ${index + 1}`);
          const trimmedName = fileName.includes("_")
            ? fileName.split("_").slice(1).join("_")
            : fileName;

          return (
            <a
              key={index}
              href={doc.url}
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
        });
      })()}
    </div>
  </div>
)}
  
        </CardContent>
      </Card>

      {/* User Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>My Bids</DialogTitle>
          </DialogHeader>

          {userBids.length > 0 ? (
            <div className="overflow-x-auto mt-2">
              <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-200 border border-gray-300 rounded-md">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="py-2 px-3 border-b border-gray-300">
                      Bid Price ({currencySymbol})
                    </th>
                    <th className="py-2 px-3 border-b border-gray-300">
                      Date & Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userBids
                    .slice() // make a shallow copy to avoid mutating original
                    .sort((a, b) => a.amount - b.amount) // ascending order
                    .map((bid) => (
                      <tr
                        key={bid.id}
                        className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800"
                      >
                        <td className="py-2 px-3 border-b border-gray-300 font-semibold">
                          {bid.amount.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 border-b border-gray-300">
                          {new Date(bid.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              No bid history found.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
