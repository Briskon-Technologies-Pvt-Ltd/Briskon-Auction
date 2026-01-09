"use client";
import React from "react";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Settings,
  User,
} from "lucide-react";

interface BuyerSidebarProps {
  selectedMode: string | undefined;
  selectedSection: string;
  onSelectSection: (section: any) => void;
  onSelectReverseTab: (tab: any) => void;
  onSelectForwardTab: (tab: any) => void;
  forwardAuctionCount: number;
  reverseAuctionCount: number;
  buyNowCount: number;
}

export const BuyerSidebar: React.FC<BuyerSidebarProps> = ({
  selectedMode,
  selectedSection,
  onSelectSection,
  onSelectReverseTab,
  onSelectForwardTab,
  forwardAuctionCount,
  reverseAuctionCount,
  buyNowCount,
}) => {
  return (
    <div className="lg:w-80 w-full flex flex-col gap-4 flex-shrink-0">
      {/* Conditionally show Forward Auctions in Forward or Marketplace Mode */}
      {(selectedMode === "forward" || selectedMode === "marketplace") && (
        <div
          onClick={() => {
            onSelectSection("forwardAuctions");
            onSelectForwardTab("active");
          }}
          className={`cursor-pointer transition-all p-5 rounded-2xl border ${
            selectedSection === "forwardAuctions"
              ? "bg-[#131eba] text-white border border-[#131eba]"
              : "bg-white text-gray-900 border-blue-300 hover:border-blue-200 hover:shadow-md"
          }`}
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp
              className={`h-7 w-7 ${
                selectedSection === "forwardAuctions"
                  ? "text-white"
                  : "text-orange-400"
              }`}
            />
            <span className="text-sm font-bold uppercase tracking-wider">
              Forward Auctions
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-5xl font-black">{forwardAuctionCount}</span>
            <p
              className={`text-[11px] leading-tight font-medium ${
                selectedSection === "forwardAuctions"
                  ? "text-blue-100"
                  : "text-gray-500"
              }`}
            >
              Auction bids,
              <br />I have placed
            </p>
          </div>
        </div>
      )}

      {/* Conditionally show Reverse Auctions in Reverse or Marketplace Mode */}
      {(selectedMode === "reverse" || selectedMode === "marketplace") && (
        <div
          onClick={() => {
            onSelectSection("reverseAuctions");
            onSelectReverseTab("live");
          }}
          className={`cursor-pointer transition-all p-5 rounded-2xl border ${
            selectedSection === "reverseAuctions"
              ? "bg-[#131eba] text-white border border-[#131eba]"
              : "bg-white text-gray-900 border-blue-300 hover:border-blue-200 hover:shadow-md"
          }`}
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingDown
              className={`h-7 w-7 ${
                selectedSection === "reverseAuctions"
                  ? "text-white"
                  : "text-orange-400"
              }`}
            />
            <span className="text-sm font-bold uppercase tracking-wider">
              Reverse Auctions
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-5xl font-black">{reverseAuctionCount}</span>
            <p
              className={`text-[11px] leading-tight font-medium ${
                selectedSection === "reverseAuctions"
                  ? "text-blue-100"
                  : "text-gray-500"
              }`}
            >
              Auctions,
              <br />I have created
            </p>
          </div>
        </div>
      )}

      {/* Buy Now Products Card - Always visible */}
      <div
        onClick={() => onSelectSection("buyNow")}
        className={`cursor-pointer transition-all p-5 rounded-2xl border ${
          selectedSection === "buyNow"
            ? "bg-[#131eba] text-white border border-[#131eba]"
            : "bg-white text-gray-900 border-blue-300 hover:border-blue-200 hover:shadow-md"
        }`}
      >
        <div className="flex items-center gap-2 mb-5">
          <ShoppingBag
            className={`h-6 w-6 ${
              selectedSection === "buyNow" ? "text-white" : "text-orange-400"
            }`}
          />
          <span className="text-sm font-bold uppercase tracking-wider">
            Buy Now Products
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-5xl font-black">{buyNowCount}</span>
          <p
            className={`text-[11px] leading-tight font-medium ${
              selectedSection === "buyNow" ? "text-blue-100" : "text-gray-500"
            }`}
          >
            Products,
            <br />I have purchased
          </p>
        </div>
      </div>
    </div>
  );
};
