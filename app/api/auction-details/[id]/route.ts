import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Auction = {
  id: string;
  productname: string;
  awarded_bid_id: string | null;
  seller: string;
};

type Bidder = {
  id: string;
  user_id: string;
  auction_id: string;
  amount: number;
  productDocuments: any[];
  profile: { fname: string };
  isWinner: boolean;
  rank: number;
  name: string;
};
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const auctionId = params.id;

    if (!auctionId) {
      return NextResponse.json(
        { success: false, error: "Auction ID is required" },
        { status: 400 }
      );
    }

    // 1️⃣ Fetch auction
    const { data: auctionData, error: auctionError } = await supabase
      .from("auctions")
      .select("id, productname, awarded_bid_id, seller")
      .eq("id", auctionId)
      .single();

    if (auctionError || !auctionData) {
      return NextResponse.json(
        { success: false, error: auctionError?.message || "Auction not found" },
        { status: 404 }
      );
    }

    const auction: Auction = {
      id: auctionData.id,
      productname: auctionData.productname,
      awarded_bid_id: auctionData.awarded_bid_id,
      seller: auctionData.seller,
    };

    // 2️⃣ Fetch all bids for this auction
    const { data: bidsData, error: bidsError } = await supabase
      .from("bids")
      .select("id, user_id, auction_id, amount, productdocuments")
      .eq("auction_id", auctionId);

    if (bidsError) {
      return NextResponse.json(
        { success: false, error: bidsError.message },
        { status: 500 }
      );
    }

    const bids = bidsData || [];

    if (bids.length === 0) {
      // No bids yet
      return NextResponse.json({
        success: true,
        auction,
        bids: [],
      });
    }

    // 3️⃣ Deduplicate highest bid per user
    const bidMap = new Map<string, any>();
    bids.forEach((b) => {
      const existing = bidMap.get(b.user_id);
      if (!existing || b.amount > existing.amount) {
        bidMap.set(b.user_id, b);
      }
    });

    const uniqueBids = Array.from(bidMap.values());
    uniqueBids.sort((a, b) => b.amount - a.amount);

    // 4️⃣ Fetch profiles for all bidders
    const userIds = uniqueBids.map((b) => b.user_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, fname")
      .in("id", userIds);

    if (profilesError) {
      console.error("Profiles fetch error:", profilesError.message);
    }

    const profilesMap = new Map(
      (profilesData || []).map((p) => [p.id, p.fname])
    );

    // 5️⃣ Map final bids
    const finalBids: Bidder[] = uniqueBids.map((b, idx) => {
      // Parse productdocuments if it's a string, otherwise use as-is
      let parsedDocuments = [];
      try {
        parsedDocuments = typeof b.productdocuments === 'string' 
          ? JSON.parse(b.productdocuments) 
          : (b.productdocuments || []);
      } catch (e) {
        console.error('Error parsing productdocuments:', e);
        parsedDocuments = [];
      }

      return {
        id: b.id,
        user_id: b.user_id,
        auction_id: b.auction_id,
        amount: b.amount,
        productDocuments: parsedDocuments, // Use camelCase to match frontend
        profile: { fname: profilesMap.get(b.user_id) || "Unknown" },
        name: profilesMap.get(b.user_id) || "Unknown",
        isWinner: auction.awarded_bid_id
          ? b.id === auction.awarded_bid_id
          : idx === 0,
        rank: idx + 1,
      };
    });

    return NextResponse.json({
      success: true,
      auction,
      bids: finalBids,
    });
  } catch (error: any) {
    console.error("Unexpected error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
