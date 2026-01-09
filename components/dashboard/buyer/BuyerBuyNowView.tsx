"use client";
import React from "react";
import Link from "next/link";
import { ShoppingCart, Mail } from "lucide-react";

interface BuyerBuyNowViewProps {
  purchases: any[];
}

export const BuyerBuyNowView: React.FC<BuyerBuyNowViewProps> = ({
  purchases,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow border border-blue-300">
      <div className="flex items-center justify-between mb-4 pt-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-green-500 animate-bounce" />
          Buy Now Products I've Purchased
        </h2>
      </div>
      {purchases.length === 0 ? (
        <p className="text-sm text-gray-500">No buy now products purchased</p>
      ) : (
        <div className="overflow-x-auto rounded-md mt-6 pb-12">
          <table className="min-w-full text-sm border border-gray-100 dark:border-gray-800">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">Product Name</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Buy Now Price</th>
                <th className="px-4 py-2 text-left">Seller Name</th>
                <th className="px-4 py-2 text-left">Contact Seller</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((buynow, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="p-2">
                    <Link
                      href={`/buyNow/${buynow.id}`}
                      className="flex items-center gap-2 text-gray-700 dark:text-gray-100 hover:underline"
                    >
                      <img
                        src={buynow.productimages}
                        alt={buynow.productname}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      {buynow.productname}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-gray-600 capitalize">
                    {buynow.categories?.handle}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    $ {buynow.buy_now_price}
                  </td>
                  <td className="px-4 py-2 text-gray-600 capitalize">
                    {buynow.seller?.fname}
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/`}
                      className="text-blue-500 hover:text-blue-500 p-1 w-16 h-6 flex items-center justify-center"
                    >
                      <Mail className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
