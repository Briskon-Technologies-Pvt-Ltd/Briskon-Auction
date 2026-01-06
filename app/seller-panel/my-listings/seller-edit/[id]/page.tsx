"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CreateReverseAuction from "@/app/buyer-panel/create-reverse-listing/page";
import AuctionWizardReverseContent from "@/app/createReverse/page";

import type {
  AuctionFormData,
  AuctionTemplate,
  UploadedFile,
  Currency,
  Language,
} from "@/types/auction-types";
import AuctionBuilderForward from "@/app/createForward/page";
const defaultFormData: AuctionFormData = {
  auctionType: "reverse",
  auctionSubType: "standard",
  isMultiLot: false,
  productName: "",
  productDescription: "",
  productImages: [],
  productDocuments: [],
  lots: [],
  categoryId: "",
  subCategoryId: "",
  attributes: [],
  sku: "",
  brand: "",
  model: "",
  evaluationCriteria: {
    technicalWeightage: 0,
    commercialWeightage: 0,
    contractDuration: 0,
    paymentTerms: "",
    additionalNotes: "",
  },
  startPrice: 0,
  minimumIncrement: 0,
  percent: null,
  auctionDuration: { days: 0, hours: 0, minutes: 0 },
  currency: "USD",
  launchType: "immediate",
  scheduledStart: new Date(Date.now() + 3600000).toISOString(),
  bidExtension: false,
  bidExtensionTime: 5,
  allowAutoBidding: false,
  bidIncrementType: "fixed",
  bidIncrementRules: [],
  isSilentAuction: false,
  participationType: "public",
  participantEmails: [],
  // qualificationCriteria: [],
  termsAndConditions: [],
  enableDispute: false,
  language: "en",
  enableNotifications: true,
  notificationTypes: ["email"],
  enableAnalytics: true,
  targetPrice: 0,
  requireddocuments: "[]",
  productQuantity: 1,
};

// Define the Auction interface based on the reference
function mapAuctionToFormData(auction: Auction): AuctionFormData {
  return {
    ...defaultFormData,
    id: auction.id,
    auctionType: auction.auctiontype ?? "forward",
    auctionSubType: auction.auctionsubtype,
    productName: auction.productname ?? "",
    scheduledStart: auction.scheduledstart ?? new Date(Date.now() + 3600000).toISOString(),
    productDescription: auction.productdescription ?? "",
    categoryId: auction.categoryid?.toString() ?? "",
    subCategoryId: auction.subcategoryid?.toString() ?? "",
    startPrice: auction.startprice ?? 0,
    minimumIncrement: auction.minimumincrement ?? 0,
    auctionDuration: auction.auctionduration ?? {
      days: 0,
      hours: 0,
      minutes: 0,
    },
productImages: (auction.productimages ?? []).map((url) => {
  const ext = url.split(".").pop()?.toLowerCase();
  const type =
    ext === "jpg" || ext === "jpeg"
      ? "image/jpeg"
      : ext === "png"
      ? "image/png"
      : ext === "gif"
      ? "image/gif"
      : "unknown"; // fallback if unknown
  return {
    id: url,
    name: url.split("/").pop() || "image",
    url,
    type,
  };
}) as UploadedFile[],

    productDocuments: (auction.productdocuments ?? []).map((url) => {
      const ext = url.split(".").pop()?.toLowerCase();
      const type =
        ext === "pdf"
          ? "application/pdf"
          : ext === "doc" || ext === "docx"
          ? "application/msword"
          : undefined;
      return {
        id: url, // Use URL as the unique identifier
        name: url.split("/").pop() || "document",
        url,
        type,
      };
    }),
    sku: auction.sku ?? "",
    brand: auction.brand ?? "",
    model: auction.model ?? "",
    attributes:
      typeof auction.attributes === "string"
        ? JSON.parse(auction.attributes)
        : auction.attributes ?? [],

    targetprice: auction.targetprice ?? 0,
    // isMultiLot: auction.lots ? auction.lots.length > 0 : false,
    // evaluationCriteria: auction.evaluationCriteria ?? defaultFormData.evaluationCriteria,
    // language: auction.language ?? defaultFormData.language,
    // add any other missing fields from AuctionFormData
  };
}

interface AuctionDuration {
  days?: number;
  hours?: number;
  minutes?: number;
}

interface Attribute {
  id?: string;
  name?: string;
  type?: string;
  value?: string | number;
  required?: boolean;
}

interface Auction {
  id: string;
  productname?: string;
  title?: string;
  categoryid?: string;
  subcategoryid?: string;
  auctiontype: "forward" | "reverse";
  currentbid?: number;
  bidincrementtype?: "fixed" | "percentage";
    minimumincrement?: number;
  startprice?: number;
  scheduledstart?: string | null;
  auctionduration?: AuctionDuration;
  bidders?: number;
  watchers?: number;
  productimages?: string[]; // Can include images or video URLs
  productdocuments?: string[];
  productdescription?: string;
  specifications?: string; // JSON string or null
  buyNowPrice?: number;
  participants?: string[];
  bidcount?: number;
  createdby?: string;
  questions?: {
    user: string;
    question: string;
    answer: string | null;
    question_time: string | null;
    answer_time: string | null;
  }[];
  question_count?: number;
  issilentauction?: boolean;
  currentbidder?: string;
  percent?: number;
  attributes?: string; // JSON string or null
  sku?: string;
  brand?: string;
  model?: string;
  reserveprice?: number;
  auctionsubtype?: string;
  targetprice?: number; // Added for reverse auctions
}

// Function to determine if a URL is a video
const isVideo = (url: string) => {
  const ext = url.split(".").pop()?.toLowerCase();
  return ext === "mp4" || ext === "webm" || ext === "mov"; // Add more video formats as needed
};

// Function to render key-value blocks from JSON data
function renderKeyValueBlock(
  data: string | Record<string, any> | undefined,
  fallback: string
): React.ReactNode {
  try {
    const parsed: Attribute[] =
      typeof data === "string" ? JSON.parse(data) : data ?? [];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return (
        <span className="text-gray-600 dark:text-gray-300 ml-4">
          {fallback}
        </span>
      );
    }

    return (
      <>
        {parsed.map((attr, index) =>
          attr.value ? (
            <div
              key={index}
              className="text-gray-600 dark:text-gray-300 ml-4 flex items-center gap-2"
            >
              <span className="font-medium">{attr.name}:</span>
              {attr.type === "color" ? (
                <span
                  className="inline-block w-4 h-4 rounded-sm border ml-1"
                  style={{ backgroundColor: attr.value as string }}
                  title={attr.value as string}
                ></span>
              ) : (
                attr.value
              )}
            </div>
          ) : null
        )}
      </>
    );
  } catch {
    return (
      <span className="text-gray-600 dark:text-gray-300 ml-4">
        Invalid attributes data
      </span>
    );
  }
}

export default function EditAuctionPage() {
  const params = useParams<{ id: string }>();
  const auctionId = params.id;

  const [initialData, setInitialData] = useState<AuctionFormData | null>(null);

  useEffect(() => {
    if (!auctionId) return;

    const fetchAuctionDetails = async () => {
      try {
        const res = await fetch(`/api/listings/${auctionId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (data.success) {
          setInitialData(mapAuctionToFormData(data.data));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchAuctionDetails();
  }, [auctionId]);

  if (!initialData) return <div>Loading...</div>; // wait until data is fetched

  return (
    <div className="p-10 bg-gray-100">
      <div className="min-w-44 p-10">
        <div className="max-w-7xl mx-auto rounded-lg bg-white dark:bg-gray-900 shadow-sm border-0">
          <AuctionBuilderForward initialData={initialData} isEdit />
        </div>
      </div>
    </div>
  );
}
