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
  category?: { handle: string }[];
  targetprice: number;
  auctionsubtype: string | null;
  scheduledstart?: string;
  productimages: string[];
  auctionduration?: { days?: number; hours?: number; minutes?: number };
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
      .select("id, auction_id, amount, created_at")
      .eq("user_id", userId);

    if (bidsError) throw bidsError;

    const auctionIds = userBids.map((bid) => bid.auction_id);
    if (auctionIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Step 2: Fetch auctions the user has bid on (reverse, ended, no awarded bid)
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
        targetprice,
        auctionduration,
        scheduledstart,
        bidcount,
        profiles:seller (fname, lname),
        productimages
      `)
      .in("id", auctionIds)
      .eq("ended", true)
      .eq("auctiontype", "reverse")
      .is("awarded_bid_id", null);

    if (auctionsError) throw auctionsError;

    const auctions = auctionsRaw || [];

    const response: any[] = [];

    // Step 3: Process each auction to determine winner and see if user lost
    for (const auction of auctions) {
      // Fetch all bids for this auction
      const { data: allBids } = await supabase
        .from("bids")
        .select("id, user_id, amount, created_at")
        .eq("auction_id", auction.id);

      if (!allBids || allBids.length === 0) continue;

      // Determine winner bid (lowest amount, latest timestamp if tie)
      let winnerBid;
      if (allBids.length === 1) {
        winnerBid = allBids[0];
      } else {
        const minAmount = Math.min(...allBids.map((b) => b.amount));
        const lowestBids = allBids.filter((b) => b.amount === minAmount);
        winnerBid = lowestBids.reduce((prev, curr) =>
          new Date(curr.created_at) > new Date(prev.created_at) ? curr : prev
        );
      }

      // Check if logged-in user bid but lost
      const userBid = allBids.find(b => b.user_id === userId);
      if (userBid && winnerBid.user_id !== userId) {
        response.push({
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
          auctionduration: auction.auctionduration ?? null,
          bidAmount: userBid.amount,
          startprice: auction.startprice,
          targetprice: auction.targetprice,
          category: auction.categories,
          totalBids: auction.bidcount ?? 0,
          isWinningBid: false,
          currentbid: auction.currentbid ?? 0,
          status: "Lost",
        });
      }
    }

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("Error fetching lost reverse auctions:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
