import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { DateTime } from "luxon";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Sale {
  id: string;
  productname: string;
  salePrice: number;
  buyer: string;
  starting_bid: number;
  category?: { handle: string }[];
  type: string;
  format: string;
  productimages: string;
  saleDate: string | null;
  bidder_count: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userEmail = searchParams.get("email");

  if (!userEmail) {
    return NextResponse.json({ error: "User email is required" }, { status: 400 });
  }

  try {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", userEmail)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
    }

    const sellerId = profileData.id;

    const { data: auctionData, error: auctionError } = await supabase
      .from("auctions")
      .select(`
        id,
        productname,
        currentbid,
        productimages,
        startprice,
        auctiontype,
        auctionsubtype,
        categories:categoryid (handle),
        bidder_count,
        createdat,
        awarded_bid_id
      `)
      .eq("createdby", userEmail)
      .eq("ended", true)
      .gt("bidder_count", 0)
      .eq("sale_type", "1")
      .not("currentbid", "is", null)
      .order("createdat", { ascending: false });

    if (auctionError) {
      return NextResponse.json({ error: "Failed to fetch auctions" }, { status: 500 });
    }

    if (!auctionData || auctionData.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Process all auctions
    const sales: Sale[] = await Promise.all(
      auctionData.map(async (auction) => {
        let buyer = "Unknown Buyer";
        let saleDate: string | null = null;

        // Determine the winning bid
        let winningBid;
        if (auction.awarded_bid_id) {
          const { data: awardedBid } = await supabase
            .from("bids")
            .select("created_at, user_id, amount")
            .eq("id", auction.awarded_bid_id)
            .single();
          winningBid = awardedBid;
        } else {
          const { data: bidData } = await supabase
            .from("bids")
            .select("created_at, user_id, amount")
            .eq("auction_id", auction.id)
            .eq("amount", auction.currentbid)
            .order("created_at", { ascending: false })
            .limit(1);
          winningBid = bidData?.[0];
        }

        if (winningBid) {
          saleDate = winningBid.created_at
            ? DateTime.fromISO(winningBid.created_at, { zone: "utc" })
                .setZone("Asia/Kolkata")
                .toISO()
            : null;

          if (winningBid.user_id) {
            const { data: buyerProfile } = await supabase
              .from("profiles")
              .select("fname, lname")
              .eq("id", winningBid.user_id)
              .single();

            buyer = buyerProfile
              ? `${buyerProfile.fname || ""} ${buyerProfile.lname || ""}`.trim() || winningBid.user_id
              : winningBid.user_id;
          }
        }

        const productimages = Array.isArray(auction.productimages) && auction.productimages.length > 0
          ? auction.productimages[0]
          : "/placeholder.svg";

        return {
          id: auction.id,
          productname: auction.productname || "Untitled",
          salePrice: auction.currentbid || 0,
          starting_bid: auction.startprice || 0,
          category: auction.categories || "unknown",
          type: auction.auctiontype || "",
          format: auction.auctionsubtype || "",
          productimages,
          buyer,
          saleDate,
          bidder_count: auction.bidder_count || 0,
        };
      })
    );

    return NextResponse.json({ success: true, data: sales });
  } catch (error) {
    console.error("Error fetching sales history:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
