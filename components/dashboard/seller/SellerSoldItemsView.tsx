"use client";
import React from "react";
import { PackageCheck } from "lucide-react";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Sale } from "./types";

interface SellerSoldItemsViewProps {
  sales: Sale[];
  setSelectedSection: (section: string) => void;
}

export const SellerSoldItemsView: React.FC<SellerSoldItemsViewProps> = ({
  sales,
  setSelectedSection,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow">
      <div className="flex items-center justify-between mb-4 pt-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <PackageCheck className="h-5 w-5 text-blue-500 animate-bounce" />
          Sold Items (Winners)
        </h2>
      </div>
      {sales.length === 0 ? (
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
                <th className="px-4 py-2 text-left">Sold Price</th>
                <th className="px-4 py-2 text-left">Buyer Name</th>
                <th className="px-4 py-2 text-left">Sold Date</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="p-2">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-100">
                      <img
                        src={sale.productimages}
                        alt={sale.productname}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      {sale.productname}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-gray-600 capitalize">
                    {sale.type}
                  </td>
                  <td className="px-4 py-2 text-gray-600 capitalize">
                    {sale.category?.handle}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    ${sale.starting_bid}
                  </td>
                  <td className="px-4 py-2 font-bold text-green-600">
                    ${sale.salePrice}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {sale.buyer || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{sale.saleDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
