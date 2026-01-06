import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Auction {
  id: number;
  productname: string;
  currentbid: number;
  currentbidder: string;
  auctiontype: string | null;
  bidcount: number;
  startprice: number;
  bidAmount:number;
  category?: { handle: string }[];
  auctionsubtype: string | null;
  scheduledstart?: string;
  productimages: string[];
  auctionduration:{ days: number; hours: number; minutes: number }
  profiles: { fname: string; lname: string }[] | { fname: string; lname: string };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("id");
  const userEmail = url.searchParams.get("email");

  if (!userId || !userEmail) {
    return NextResponse.json(
      { success: false, error: "User ID and email are required" },
      { status: 400 }
    );
  }

  try {
    // Step 1: Fetch user's bids
    const { data: userBids, error: bidsError } = await supabase
      .from("bids")
      .select("auction_id, amount, created_at")
      .eq("user_id", userId);

    if (bidsError) throw bidsError;

    const auctionIds = userBids.map((bid) => bid.auction_id);
    if (auctionIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Step 2: Fetch auctions the user has bid on
    const { data: auctionsRaw, error: auctionsError } = await supabase
      .from("auctions")
      .select(`
        id,
        productname,
        currentbidder,
        currentbid,
        auctiontype,
        startprice,
        auctionsubtype,
        categories:categoryid (handle),
        auctionduration,
        scheduledstart,
        bidcount,
        profiles:seller (fname, lname),
        productimages
      `)
      .in("id", auctionIds)
      .eq("ended", false)
      .returns<Auction[]>();

    if (auctionsError) throw auctionsError;

    const auctions = auctionsRaw || [];

    // Step 3: Map latest bid per auction
  const latestBidsMap = new Map<number, { amount: number; created_at: string }>();

userBids.forEach((bid) => {
  const existing = latestBidsMap.get(bid.auction_id);
  if (!existing || new Date(bid.created_at) > new Date(existing.created_at)) {
    latestBidsMap.set(bid.auction_id, {
      amount: bid.amount,
      created_at: bid.created_at,
    });
  }
});

    // Step 4: Build response
    const activeBids = auctions.map((auction) => {
     const userBid = latestBidsMap.get(auction.id)?.amount ?? 0;
   

      return {
        auctionId: auction.id,
        productName: auction.productname,
        sellerName: Array.isArray(auction.profiles)
          ? auction.profiles[0]?.fname ?? "Unknown"
          : auction.profiles?.fname ?? "Unknown",
        auctionType: auction.auctiontype ?? "standard",
        auctionSubtype: auction.auctionsubtype,
        productimages:
          Array.isArray(auction.productimages) && auction.productimages.length > 0
            ? auction.productimages[0]
            : "/placeholder.svg",
        scheduledstart: auction.scheduledstart ?? null,
        auctionduration:auction.auctionduration,
        bidAmount: userBid,
        startprice: auction.startprice,
    // In your API mapping:
      category: auction.categories,
        totalBids: auction.bidcount ?? 0,
        isWinningBid: auction.currentbidder === userEmail,
        currentbid: auction.currentbid ?? 0,
      };
    });

    return NextResponse.json({ success: true, data: activeBids });
  } catch (error) {
    console.error("Error fetching active bids:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 } 
    );
  }
}
