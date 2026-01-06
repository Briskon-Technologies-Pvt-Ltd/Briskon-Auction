"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Bidder {
  id: string;
  name: string;
  amount: number;
  rank: number;
  isWinner?: boolean;
  profile: {
    fname: string;
    location: string;
  };
}

interface WinnerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auctionId: string;
  auctionName: string;
    onWinnerConfirmed?: () => void;
}

  export default function WinnerModal({
    open,
    onOpenChange,
    auctionId,
    auctionName,
    onWinnerConfirmed,
  }: WinnerModalProps) {
    const [bidders, setBidders] = useState<Bidder[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWinner, setSelectedWinner] = useState<string>("");

    // Fetch bidders whenever modal opens or auctionId changes
    useEffect(() => {
      if (!open || !auctionId) return;

      setLoading(true);

      const fetchData = async () => {
        try {
          const res = await fetch(`/api/auction-details/${auctionId}`);
          const json = await res.json();

          if (!json.success) throw new Error("Failed to fetch auction details");

          const { bids: finalBids, auction } = json;

          setBidders(finalBids);
          setSelectedWinner(
            finalBids.find((b: Bidder) => b.isWinner)?.id ||
              finalBids[0]?.id ||
              ""
          );
        } catch (err) {
          console.error("Error fetching auction details:", err);
          setBidders([]);
          setSelectedWinner("");  
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [auctionId, open]);

    const handleConfirm = async (winnerBid: Bidder) => {
      if (!winnerBid) return;

      try {
        const response = await fetch(`/api/auctions/${auctionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ awarded_bid_id: winnerBid.id }), // single UUID
        });

        const result = await response.json();
        if (!response.ok) {
          console.error("Server error:", result);
          alert(`Failed to confirm winner: ${result.error}`);
          return;
        }

        // Update bidders state after successful PATCH
        setBidders((prev) =>
          prev.map((b) => ({ ...b, isWinner: b.id === winnerBid.id }))
        );
              if (onWinnerConfirmed) onWinnerConfirmed();
    // 🔑 Trigger re-fetch of sales history
    // await fetchSalesHistory();
        alert(`Winner confirmed: ${winnerBid.profile.fname}`);
      } catch (err) {
        console.error("Unexpected error:", err);
        alert("Failed to confirm winner");
      }
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl white">
          <DialogHeader>
            <DialogTitle>
              Auction: <span className="font-semibold">{auctionName}</span> —
              Bidder Results
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <p className="py-4 text-center text-gray-500 animate-pulse">
              Loading bidders...
            </p>
          ) : bidders.length === 0 ? (
            <p className="py-4 text-center text-gray-500">
              No bids for this auction yet.
            </p>
          ) : (
            <table className="w-full border text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-2 border">Bidder</th>
                  <th className="p-2 border">Best Bid</th>
                  <th className="p-2 border">Rank</th>
                  <th className="p-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {bidders.map((b) => (
                <tr
                  key={b.id}
                  className={`border-b hover:bg-gray-50 ${
                    b.isWinner ? "bg-green-50 font-semibold" : ""
                  }`}
                >
                  <td className="p-2">{b.profile.fname}</td>
                  <td className="p-2">${b.amount}</td>
                  <td className="p-2">{b.rank}</td>
                  <td className="p-2 text-right">
                    {b.isWinner ? (
                      <span className="font-semibold text-green-600">
                        Winner
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-blue-600"
                        onClick={() => handleConfirm(b)}
                      >
                        Confirm Winner
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DialogContent>
    </Dialog>
  );
}
