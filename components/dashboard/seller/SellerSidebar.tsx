"use client";
import React from "react";
import {
  TrendingUp,
  ShoppingBag,
  Settings,
  User,
  TrendingDown,
  PackageCheck,
} from "lucide-react";

interface SellerSidebarProps {
  selectedMode: string | undefined;
  selectedSection: string;
  onSelectSection: (section: any) => void;
  onSelectManageAuctionTab: (tab: any) => void;
  onSelectBuyNowTab: (tab: any) => void;
  forwardAuctionCount: number;
  buyNowCount: number;
  reverseAuctionCount: number;
  soldItemsCount: number;
}

export const SellerSidebar: React.FC<SellerSidebarProps> = ({
  selectedMode,
  selectedSection,
  onSelectSection,
  onSelectManageAuctionTab,
  onSelectBuyNowTab,
  forwardAuctionCount,
  buyNowCount,
  reverseAuctionCount,
  soldItemsCount,
}) => {
  if (
    selectedMode !== "forward" &&
    selectedMode !== "reverse" &&
    selectedMode !== "marketplace"
  )
    return null;

  return (
    <div className="lg:w-80 w-full flex flex-col gap-4 flex-shrink-0">
      {/* Reverse Auctions Card (Only in Reverse or Marketplace Mode) */}
      {(selectedMode === "reverse" || selectedMode === "marketplace") && (
        <div
          onClick={() => {
            onSelectSection("reverseAuction");
          }}
          className={`cursor-pointer transition-all p-5 rounded-2xl border ${
            selectedSection === "reverseAuction"
              ? "bg-[#131eba] text-white border border-[#131eba] "
              : "bg-white text-gray-900 border-blue-300 hover:border-blue-200 hover:shadow-md"
          }`}
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingDown
              className={`h-7 w-7 ${
                selectedSection === "reverseAuction"
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
                selectedSection === "reverseAuction"
                  ? "text-blue-100"
                  : "text-gray-500"
              }`}
            >
              Bids,
              <br />I have placed
            </p>
          </div>
        </div>
      )}

      {/* Forward Auctions Card (Only in Forward or Marketplace Mode) */}
      {(selectedMode === "forward" || selectedMode === "marketplace") && (
        <div
          onClick={() => {
            onSelectSection("manageAuction");
            onSelectManageAuctionTab("live");
          }}
          className={`cursor-pointer transition-all p-5 rounded-2xl border ${
            selectedSection === "manageAuction"
              ? "bg-[#131eba] text-white border border-[#131eba] "
              : "bg-white text-gray-900 border-blue-300 hover:border-blue-200 hover:shadow-md"
          }`}
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp
              className={`h-7 w-7 ${
                selectedSection === "manageAuction"
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
                selectedSection === "manageAuction"
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

      {/* Buy Now Products Card */}
      <div
        onClick={() => {
          onSelectSection("buynow");
          onSelectBuyNowTab("live");
        }}
        className={`cursor-pointer transition-all p-5 rounded-2xl border  ${
          selectedSection === "buynow"
            ? "bg-[#131eba] text-white border border-[#131eba]"
            : "bg-white text-gray-900 border-blue-300 hover:border-blue-200 hover:shadow-md"
        }`}
      >
        <div className="flex items-center gap-2 mb-5">
          <ShoppingBag
            className={`h-6 w-6 ${
              selectedSection === "buynow" ? "text-white" : "text-orange-400"
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
              selectedSection === "buynow" ? "text-blue-100" : "text-gray-500"
            }`}
          >
            Products,
            <br />I have listed
          </p>
        </div>
      </div>

      {/* Sold Items Card */}
      <div
        onClick={() => {
          onSelectSection("soldItems");
        }}
        className={`cursor-pointer transition-all p-5 rounded-2xl border ${
          selectedSection === "soldItems"
            ? "bg-[#131eba] text-white border border-[#131eba]"
            : "bg-white text-gray-900 border-blue-300 hover:border-blue-200 hover:shadow-md"
        }`}
      >
        <div className="flex items-center gap-2 mb-5">
          <PackageCheck
            className={`h-6 w-6 ${
              selectedSection === "soldItems" ? "text-white" : "text-orange-400"
            }`}
          />
          <span className="text-sm font-bold uppercase tracking-wider">
            Sold Items
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-5xl font-black">{soldItemsCount}</span>
          <p
            className={`text-[11px] leading-tight font-medium ${
              selectedSection === "soldItems"
                ? "text-blue-100"
                : "text-gray-500"
            }`}
          >
            Items,
            <br />I have sold
          </p>
        </div>
      </div>
    </div>
  );
};
