"use client";
import { useEffect, useState } from "react";
import { User, Award, BadgeCheck, FolderOpen, FileText, ClipboardList, UserCheck } from "lucide-react";
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

export default function BidLeadersBoardSupplier({
  auction,
  auctionId,
  loggedInUserId,
  currencySymbol,
  bidHistory,
}: BidLeadersBoardProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [showAllBids, setShowAllBids] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [visibleOtherBidsCount, setVisibleOtherBidsCount] = useState(0);
  const loadMoreCount = 10;

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

  // Keep only the lowest bid per unique seller (user_id)
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

// Show all except current user's bid
const otherBids = uniqueBids.filter(bid => bid.user_id !== loggedInUserId);

// Now this will work even if there are fewer bidders
const lowestUserBidAmount =
    otherBids.length > 0 ? Math.min(...otherBids.map((b) => b.amount)) : 0;

console.log("Other Bids:", otherBids);
console.log("Lowest Bid Amount:", lowestUserBidAmount);

  return (
    <>
    <div className="flex items-center gap-2 mb-2">
  <img
    src="/images/supplier.png"
    alt="Supplier Icon"
    className="w-5 h-5 animate-bounce" // small size
  />
  <h4 className="text-lg font-semibold mb-1 flex items-center gap-2">Supplier Responses</h4>

</div>

<table className="w-full text-[12px] border-collapse border border-gray-200 dark:border-gray-700">
  <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
    <tr>
      <th className="py-1 px-2 text-left">Supplier</th>
      <th className="py-1 px-2 text-left">Bid ($)</th>
      <th className="py-1 px-2 text-left">Date & Time</th>
      <th className="py-1 px-2 text-left">Rank</th>
      <th className="py-1 px-2 text-left">Docs</th>
    </tr>
  </thead>
  <tbody>
    {otherBids.length === 0 ? (
      <tr>
        <td colSpan={5} className="py-4 text-center text-gray-500 dark:text-gray-400">
          No proposals submitted
        </td>
      </tr>
    ) : (
      otherBids.map((bid, index) => (
        <tr
          key={bid.id}
          className={`border-t border-gray-200 dark:border-gray-700 ${
            index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"
          }`}
        >
          <td className="py-1 px-2 flex items-center gap-1 truncate">
            {bid.profile?.fname || "Unknown"}
          </td>
          <td className="py-1 px-2 font-semibold">{bid.amount.toLocaleString()}</td>
          <td className="py-1 px-2 whitespace-nowrap">
            {new Date(bid.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
          </td>
          <td className="py-1 px-2">{index + 1}</td>
          <td className="py-1 px-2 flex gap-1">
            {bid.productdocuments && bid.productdocuments.length > 0 ? (
              bid.productdocuments.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 bg-gray-50 dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <FileText className="w-3 h-3 text-pink-500" />
                </a>
              ))
            ) : (
              <span className="text-gray-500 dark:text-gray-400">-</span>
            )}
          </td>
        </tr>
      ))
    )}
  </tbody>
</table>
    </>
  );
}
