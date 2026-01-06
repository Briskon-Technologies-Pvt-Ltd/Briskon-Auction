"use client";

import { FileText, X, Award, TrendingDown, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
interface Document {
  id: string;
  url: string;
}
interface Bid {
     auction: {
    issilentauction?: boolean;
    auctionsubtype?: string;
  };
  id: string;
  user_id: string;
  amount: number;
  profile: {
    fname: string;
    location: string;
  };
  productDocuments: Document[];
}
interface Auction {
  awarded_bid_id?: string;
  issilentauction?: boolean;
  auctionsubtype?: string;
}
interface DeclareSellerWinnerModalProps {
  auctionId: string;
  auction: Auction;
  onClose: () => void;
}
export default function DeclareSellerWinnerModal({
  auctionId,
  auction,
  onClose,
}: DeclareSellerWinnerModalProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(false);
  const [auctionData, setAuctionData] = useState<Auction>(auction);

  const [confirmedBidId, setConfirmedBidId] = useState<string | null>(null);
  // Fetch bids + auction info
  useEffect(() => {
      async function fetchBids() {
          setLoading(true);
          try {
              const res = await fetch(`/api/auction-details/${auctionId}`);
              const data = await res.json();
              if (data.success) {
                    setAuctionData(data.auction);
                  const auction: Auction = data.auction;
                  // Sort bids by amount ascending (reverse auction)
                  const sortedBids = data.bids.sort(
                      (a: Bid, b: Bid) => a.amount - b.amount
                    );
                    setBids(sortedBids);
          // Mark winner from auction table
          setConfirmedBidId(auction.awarded_bid_id || null);
        }
      } catch (error) {
        console.error("Error fetching bids:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBids();
  }, [auctionId]);

  const confirmWinner = async (bidId: string) => {
    try {
      const res = await fetch(`/api/auctions/${auctionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ awarded_bid_id: bidId }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setConfirmedBidId(bidId); // Mark winner in UI
      } else {
        alert("Error confirming winner: " + (json.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error confirming winner:", error);
      alert("An unexpected error occurred.");
    }
  };

  return (
   <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl relative shadow-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Proposals Received</h2>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              <p className="text-sm text-gray-500">Loading proposals...</p>
            </div>
          ) : bids.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <FileText className="w-8 h-8 text-gray-300" />
              <p className="text-sm text-gray-500">No proposals received yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Bidder</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Bid Amount</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-600">Rank</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-600">Documents</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map((bid, index) => (
                    <tr 
                      key={bid.id} 
                      className={`border-b border-gray-100 ${
                        confirmedBidId === bid.id 
                          ? "bg-green-50" 
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium">
                            {bid.profile.fname.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-700">{bid.profile.fname}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">₹{bid.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                          index === 0 
                            ? "bg-gray-900 text-white" 
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-center items-center">
                          {bid.productDocuments && bid.productDocuments.length > 0 ? (
                            bid.productDocuments.map((doc, idx) => (
                              <a
                                key={doc.id || idx}
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                title={`Document ${idx + 1}`}
                              >
                                <FileText className="w-4 h-4 text-gray-600" />
                              </a>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {confirmedBidId === bid.id ? (
                          <span className="inline-flex items-center gap-1 text-green-700 text-xs font-medium">
                            <Award className="w-3.5 h-3.5" />
                            Winner
                          </span>
                        ) : (
                          <button
                            className="bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                            onClick={() => confirmWinner(bid.id)}
                          >
                            Confirm
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && bids.length > 0 && (
          <div className="px-5 py-2.5 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500">
              {bids.length} proposal{bids.length !== 1 ? 's' : ''} • Sorted by lowest bid
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
