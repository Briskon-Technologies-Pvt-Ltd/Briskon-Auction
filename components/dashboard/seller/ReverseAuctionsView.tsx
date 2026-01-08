"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Gavel } from "lucide-react";
import LiveTimer from "@/app/livetimer/page"; // Verify path
import { formatDateTime, getEndDate } from "./utils";
import { ActiveBid, AwardedAuction, LostBid } from "./types";

interface ReverseAuctionsViewProps {
  manageAuctionReverseTab: string;
  setManageAuctionReverseTab: (tab: any) => void;
  activeBids: ActiveBid[];
  awardedAuctions: AwardedAuction[];
  lostBids: LostBid[];
}

export const ReverseAuctionsView: React.FC<ReverseAuctionsViewProps> = ({
  manageAuctionReverseTab,
  setManageAuctionReverseTab,
  activeBids,
  awardedAuctions,
  lostBids,
}) => {
  return (
    <div>
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setManageAuctionReverseTab("active")}
            className={`px-2 py-2 rounded-full font-light text-sm shadow-sm 
            ${
              manageAuctionReverseTab === "active"
                ? "bg-[#131eba] text-white shadow-md"
                : "bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
            }`}
          >
            Active Bids ({activeBids.length})
          </button>

          <button
            onClick={() => setManageAuctionReverseTab("won")}
            className={`px-2 py-2 rounded-full font-light text-sm shadow-sm 
            ${
              manageAuctionReverseTab === "won"
                ? "bg-[#131eba] text-white shadow-md"
                : "bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
            }`}
          >
            Won Auctions ({awardedAuctions.length})
          </button>
          <button
            onClick={() => setManageAuctionReverseTab("lost")}
            className={`px-2 py-2 rounded-full font-light text-sm shadow-sm 
            ${
              manageAuctionReverseTab === "lost"
                ? "bg-[#131eba] text-white shadow-md"
                : "bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
            }`}
          >
            Lost Auctions ({lostBids.length})
          </button>
        </div>

        {manageAuctionReverseTab === "active" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Gavel className="h-5 w-5 text-violet-500 animate-bounce" />
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
                      <th className="px-4 py-2 text-left">Curent Bid</th>
                      <th className="px-4 py-2 text-left">My Bid Amount </th>
                      <th className="px-4 py-2 text-left">Ends In</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeBids.map((liveAuction, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="p-2">
                          <Link
                            href={`/auctions/reverse/${liveAuction.auctionId}`}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                          >
                            <Image
                              src={
                                liveAuction.productimages || "/placeholder.svg"
                              }
                              alt={liveAuction.productName}
                              width={24}
                              height={24}
                              className="w-6 h-6 rounded-full object-cover"
                              placeholder="blur"
                              blurDataURL="/placeholder.svg"
                            />
                            {liveAuction.productName}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-gray-600 capitalize">
                          {liveAuction.auctionSubtype}
                        </td>
                        <td className="px-4 py-2 text-gray-600 capitalize">
                          {liveAuction.category?.handle}
                        </td>
                        <td className="px-4 py-2 text-gray-600 ">
                          ${liveAuction.startprice}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          ${liveAuction.currentbid}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          ${liveAuction.bidAmount}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {
                            <LiveTimer
                              startTime={liveAuction.scheduledstart}
                              duration={liveAuction.auctionduration}
                            />
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {manageAuctionReverseTab === "won" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Gavel className="h-5 w-5 text-orange-500 animate-bounce" />
                Auctions Awarded to Me
              </h2>
            </div>
            {awardedAuctions.length === 0 ? (
              <p className="text-sm text-gray-500">No Awarded Auctions</p>
            ) : (
              <div className="overflow-x-auto rounded-md mt-6">
                <table className="min-w-full text-xs border border-gray-100 dark:border-gray-800">
                  <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                    <tr>
                      <th className="text-left px-4 p-2">Auction Name</th>
                      <th className="text-left px-4 p-2">Format</th>
                      <th className="px-4 py-2 text-left">Category</th>
                      <th className="text-left px-4 p-2">Buyer</th>
                      <th className="text-left px-4 py-2 ">Target Price</th>
                      <th className="text-left px-4 p-2">Awarded Date</th>
                      <th className="text-left px-4 p-2">My Bid Amount</th>
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

                        <td className="p-2 text-gray-600">
                          {"B-Madhur Uniyal"}
                        </td>
                        <td className="p-2 text-gray-600">
                          ${award.targetPrice}
                        </td>
                        <td className="px-4 text-gray-600 py-2">
                          {award.awardedAt
                            ? formatDateTime(new Date(award.awardedAt))
                            : "—"}
                        </td>
                        <td className="p-2 text-gray-600">
                          ${award.bidAmount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {manageAuctionReverseTab === "lost" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Gavel className="h-5 w-5 text-orange-500 animate-bounce" />
                Auctions Not Awarded
              </h2>
            </div>
            {lostBids.length === 0 ? (
              <p className="text-sm text-gray-500">Auctions Not Awarded</p>
            ) : (
              <div className="overflow-x-auto rounded-md mt-6">
                <table className="min-w-full text-xs border border-gray-100 dark:border-gray-800">
                  <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                    <tr>
                      <th className="text-left px-4 p-2">Auction Name</th>
                      <th className="text-left px-4 py-2 ">Format</th>
                      <th className="px-4 py-2 text-left">Category</th>
                      <th className="text-left px-4 p-2">End Date</th>
                      <th className="text-left px-4 p-2">Buyer</th>
                      <th className="text-left px-4 py-2 ">Target Price</th>
                      <th className="text-left px-4 p-2">My Bid Amount</th>
                      {/* <th className="px-4 py-2 text-left">Action</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {lostBids.map((award, index) => (
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
                              src={award.productimages}
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
                        <td className="px-4 py-2 text-gray-600">
                          {formatDateTime(
                            getEndDate(
                              new Date(award.scheduledstart),
                              award.auctionduration ?? {}
                            )
                          )}
                        </td>
                        <td className="p-2 capitalize text-gray-600">
                          {award.sellerName}
                        </td>
                        <td className="p-2 text-gray-600">
                          ${award.targetprice}
                        </td>
                        <td className="p-2 text-gray-600">
                          ${award.bidAmount?.toLocaleString("en-IN")}
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
