"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  Calendar,
  Hourglass,
  XCircle,
  PackageCheck,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import LiveTimer from "@/app/livetimer/page"; // Verify path
import { formatDateTime, getEndDate } from "./utils";
import {
  BuyNowProduct,
  upcomingBuyNowItem,
  approvalPendingBufNowItem,
  approvalRejectedItem,
  SoldBuyNowProduct,
} from "./types";

interface BuyNowProductsViewProps {
  buyNowTab: string;
  setBuyNowTab: (tab: any) => void;
  selectedMode: string;
  setSelectedSection: (section: string) => void;
  // Data
  liveProducts: BuyNowProduct[];
  upcomingProducts: upcomingBuyNowItem[];
  pendingProducts: approvalPendingBufNowItem[];
  rejectedProducts: approvalRejectedItem[];
  soldProducts: SoldBuyNowProduct[];
}

export const BuyNowProductsView: React.FC<BuyNowProductsViewProps> = ({
  buyNowTab,
  setBuyNowTab,
  selectedMode,
  setSelectedSection,
  liveProducts,
  upcomingProducts,
  pendingProducts,
  rejectedProducts,
  soldProducts,
}) => {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div>
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setBuyNowTab("live")}
            className={`px-2 py-2 rounded-full font-light text-sm shadow-sm 
            ${
              buyNowTab === "live"
                ? "bg-[#131eba] text-white shadow-md"
                : "bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
            }`}
          >
            Live ({liveProducts.length})
          </button>
          <button
            onClick={() => setBuyNowTab("approval")}
            className={`px-2 py-2 rounded-full font-light text-sm shadow-sm 
            ${
              buyNowTab === "approval"
                ? "bg-[#131eba] text-white shadow-md"
                : "bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
            }`}
          >
            Pending Approval ({pendingProducts.length})
          </button>
          <button
            onClick={() => setBuyNowTab("rejected")}
            className={`px-2 py-2 rounded-full font-light text-sm shadow-sm 
            ${
              buyNowTab === "rejected"
                ? "bg-[#131eba] text-white shadow-md"
                : "bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
            }`}
          >
            Admin Rejected ({rejectedProducts.length})
          </button>
          <button
            onClick={() => setBuyNowTab("upcoming")}
            className={`px-2 py-2 rounded-full font-light text-sm shadow-sm 
            ${
              buyNowTab === "upcoming"
                ? "bg-[#131eba] text-white shadow-md"
                : "bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
            }`}
          >
            Upcoming ({upcomingProducts.length})
          </button>
          <button
            onClick={() => setBuyNowTab("Sold")}
            className={`px-2 py-2 rounded-full font-light text-sm shadow-sm 
            ${
              buyNowTab === "Sold"
                ? "bg-[#131eba] text-white shadow-md"
                : "bg-white border border-blue-300 hover:bg-blue-50 hover:border-blue-400"
            }`}
          >
            Sold Out ({soldProducts.length})
          </button>
        </div>

        {buyNowTab === "live" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-500 animate-bounce" />
                Buy Now Products
              </h2>
              {selectedMode !== "reverse" && (
                <AnimatedButton
                  label="Create Buy Now"
                  onClick={() => setSelectedSection("createbuynow")}
                />
              )}
            </div>
            {liveProducts.length === 0 ? (
              <p className="text-sm text-gray-500">No Live items</p>
            ) : (
              <div className="overflow-x-auto rounded-md mt-6">
                <table className="min-w-full text-xs border border-gray-100 dark:border-gray-800">
                  <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left">Product Name</th>
                      <th className="px-4 py-2 text-left">Category</th>
                      <th className="px-4 py-2 text-left">Buy Now Price</th>
                      <th className="px-4 py-2 text-left">Start Date In</th>
                      <th className="px-4 py-2 text-left">End Date</th>
                      <th className="px-4 py-2 text-left">Ends In</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveProducts.map((liveAuction, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="p-2">
                          <Link
                            href={`/buyNow/${liveAuction.id}`}
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
                          {liveAuction.category?.handle}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          ${liveAuction.buy_now_price}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {formatDateTime(new Date(liveAuction.scheduledstart))}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {formatDateTime(
                            getEndDate(
                              new Date(liveAuction.scheduledstart),
                              liveAuction.auctionduration ?? {}
                            )
                          )}
                        </td>
                        <td className="px-4 py-2 ">
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

        {buyNowTab === "upcoming" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 animate-bounce" />
                Upcoming
              </h2>
              {selectedMode !== "reverse" && (
                <AnimatedButton
                  label="Create Buy Now"
                  onClick={() => setSelectedSection("createbuynow")}
                />
              )}
            </div>
            {upcomingProducts.length === 0 ? (
              <p className="text-sm text-gray-500">No Products</p>
            ) : (
              <div className="overflow-x-auto rounded-md mt-6">
                <table className="min-w-full text-xs border border-gray-100 dark:border-gray-800">
                  <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left">Product Name</th>
                      <th className="px-4 py-2 text-left">Category</th>
                      <th className="px-4 py-2 text-left">Buy Now Price</th>
                      <th className="px-4 py-2 text-left">Start Date</th>
                      <th className="px-4 py-2 text-left">End Date</th>
                      <th className="px-4 py-2 text-left">Starts In</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingProducts.map((upcoming, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="p-2">
                          <Link
                            href={`/buyNow/${upcoming.id}`}
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
                          {upcoming.category?.handle}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          ${upcoming.buy_now_price}
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
                        <td className="px-4 py-2 ">
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
                                `/seller-panel/create-listing/buy-now/${upcoming.id}`
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
                                "Are you sure you want to delete this product?"
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

        {buyNowTab === "approval" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Hourglass className="h-4 w-4 text-yellow-500 animate-bounce" />
                Pending Approval
              </h2>
              {selectedMode !== "reverse" && (
                <AnimatedButton
                  label="Create Buy Now"
                  onClick={() => setSelectedSection("createbuynow")}
                />
              )}
            </div>
            {pendingProducts.length === 0 ? (
              <p className="text-sm text-gray-500">No Pending Products</p>
            ) : (
              <div className="overflow-x-auto rounded-md mt-6">
                <table className="min-w-full text-xs border border-gray-100 dark:border-gray-800">
                  <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left">Product Name</th>
                      <th className="px-4 py-2 text-left">Category</th>
                      <th className="px-4 py-2 text-left">Buy Now Price</th>
                      <th className="px-4 py-2 text-left">Start Date</th>
                      <th className="px-4 py-2 text-left">End Date</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingProducts.map((approval, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="p-2">
                          <Link
                            href={`/buyNow/${approval.id}`}
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
                          {approval.category?.handle}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          ${approval.buy_now_price}
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
                                `/seller-panel/create-listing/buy-now/${approval.id}`
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
                                "Are you sure you want to delete this product?"
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

        {buyNowTab === "rejected" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500 animate-bounce" />
                Rejected Product
              </h2>
              {selectedMode !== "reverse" && (
                <AnimatedButton
                  label="Create Buy Now"
                  onClick={() => setSelectedSection("createbuynow")}
                />
              )}
            </div>
            {rejectedProducts.length === 0 ? (
              <p className="text-sm text-gray-500">No Rejected Products</p>
            ) : (
              <div className="overflow-x-auto rounded-md mt-6">
                <table className="min-w-full text-xs border border-gray-100 dark:border-gray-800">
                  <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left">Product Name</th>
                      <th className="px-4 py-2 text-left">Category</th>
                      <th className="px-4 py-2 text-left">Buy Now Price</th>
                      <th className="px-4 py-2 text-left">Start Date</th>
                      <th className="px-4 py-2 text-left">End Date</th>
                      <th className="px-4 py-2 text-left">Reason</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rejectedProducts.map((closed, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="p-2">
                          <Link
                            href={`/buyNow/${closed.id}`}
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
                          {closed.category?.handle}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          ${closed.buy_now_price}
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
                            href={`/seller-panel/create-listing/buy-now/${closed.id}`}
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

        {buyNowTab === "Sold" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <PackageCheck className="h-5 w-5 text-blue-500 animate-bounce" />
                Sold items
              </h2>
            </div>
            {soldProducts.length === 0 ? (
              <p className="text-sm text-gray-500">No sold items yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-md mt-6">
                <table className="min-w-full text-xs border border-gray-100 dark:border-gray-800">
                  <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left">Product Name</th>
                      <th className="px-4 py-2 text-left">Category</th>
                      <th className="px-4 py-2 text-left">Buy Now Price</th>
                      <th className="px-4 py-2 text-left">Buyer Name</th>
                      <th className="px-4 py-2 text-left">Sold Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {soldProducts.map((sale, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="p-2">
                          <Link
                            href={`/buyNow/${sale.id}`}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                          >
                            <img
                              src={sale.productimages}
                              alt={sale.productname}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            {sale.productname}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-gray-600 capitalize">
                          {sale.category?.handle}
                        </td>
                        <td className="px-4 py-2 text-gray-800 font-bold">
                          ${sale.buy_now_price}
                        </td>
                        <td className="px-4 py-2 text-gray-600 capitalize">
                          {sale.buyer?.username || "Unknown"}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {sale.sold_at
                            ? formatDateTime(new Date(sale.sold_at))
                            : "-"}
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
