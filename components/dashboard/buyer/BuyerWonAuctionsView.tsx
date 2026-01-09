"use client";
import React from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";

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

interface BuyerWonAuctionsViewProps {
  wonAuctions: any[];
}

export const BuyerWonAuctionsView: React.FC<BuyerWonAuctionsViewProps> = ({
  wonAuctions,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-[12px] border shadow-md border-blue-300">
      <div>
        <div className="flex items-center justify-between mb-4 pt-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500 animate-bounce" />
            Auctions I have won
          </h2>
        </div>
        {wonAuctions.length === 0 ? (
          <p className="text-sm text-gray-500">No won auctions yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-md mt-6 pb-12">
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
    </div>
  );
};
