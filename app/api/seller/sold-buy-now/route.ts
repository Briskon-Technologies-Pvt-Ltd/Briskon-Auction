import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface AuctionOrProduct {
  id: string;
  productname: string;
  currentbid: number | null;
  productimages: string;
  startprice: number;
  auctiontype: string;
  auctionsubtype: string;
  category?: { handle: string }[];
  bidder_count: number;
  auctionduration: { days?: number; hours?: number; minutes?: number };
  scheduledstart: string;
}

export async function GET(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { searchParams } = new URL(req.url);
  const userEmail = searchParams.get("email");

  if (!userEmail) {
    return NextResponse.json({ error: "User email is required" }, { status: 400 });
  }

  // Step 1: Get the seller ID from email
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", userEmail)
    .single();

  if (profileError || !profileData) {
    return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
  }

  const now = new Date().toISOString();

  const { data: auctionsData, count, error: countError } = await supabase
    .from("auctions")
    .select(
      `id, productname, currentbid, productimages, startprice, auctiontype, auctionsubtype, categories:categoryid(handle), bidder_count, auctionduration, scheduledstart, buy_now_price`,
      { count: "exact" }
    )
    .eq("createdby", userEmail)
    // .eq("sale_type", 2) // flexible now
    .not("purchaser", "is", null);

  const items: AuctionOrProduct[] = (auctionsData || []).map((auction) => {
    const productimages =
      auction.productimages && auction.productimages.length > 0
        ? auction.productimages[0]
        : "/placeholder.svg";

    return {
      id: auction.id,
      productname: auction.productname || "Untitled",
      currentbid: auction.currentbid,
      productimages,
      startprice: auction.startprice,
      auctiontype: auction.auctiontype,
      auctionsubtype: auction.auctionsubtype,
      category: auction.categories,
      bidder_count: auction.bidder_count,
      buy_now_price: auction.buy_now_price,
      auctionduration: auction.auctionduration,
      scheduledstart: auction.scheduledstart,
    };
  });

  if (countError) {
    return NextResponse.json({ success: false, error: countError.message });
  }

  return NextResponse.json({ success: true, count, data: items });
}
