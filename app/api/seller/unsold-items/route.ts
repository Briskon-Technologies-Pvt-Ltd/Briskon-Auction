import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface UnsoldSale {
  id: string;
  productname: string;
  salePrice: number;
  buyer: string;
  starting_bid: number;
  auction_type: string | null;
  auction_subtype: string | null;
  category?: { handle: string }[];
  productimages: string;
  saleDate: string | null;
  auctionduration?: { days?: number; hours?: number; minutes?: number };
  scheduledstart: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userEmail = searchParams.get("email");

  if (!userEmail) {
    return NextResponse.json(
      { error: "User email is required" },
      { status: 400 }
    );
  }

  try {
    // get seller profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", userEmail)
      .single();

    if (profileError || !profileData) {
      console.log("Profile error or not found:", profileError);
      return NextResponse.json(
        { error: "Seller profile not found" },
        { status: 404 }
      );
    }

    // fetch auctions with no bids
    const { data: unsoldData, error: unsoldError } = await supabase
      .from("auctions")
      .select(`
        id,
        productname,
        startprice,
        productimages,
        currentbid,
        auctiontype,
        categories:categoryid (handle),
        auctionsubtype,
        auctionduration,
        scheduledstart
      `)
      .eq("createdby", userEmail)
      .eq("ended", true)
      .eq("sale_type", "1")
      .eq("bidder_count", 0);

    if (unsoldError) {
      console.error("Error fetching unsold auctions:", unsoldError);
      return NextResponse.json(
        { error: "Failed to fetch auctions" },
        { status: 500 }
      );
    }

    if (!unsoldData || unsoldData.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // build response
    const sales: UnsoldSale[] = unsoldData.map((auction) => {
      const productimages =
        Array.isArray(auction.productimages) &&
        auction.productimages.length > 0
          ? auction.productimages[0]
          : "/placeholder.svg";

      return {
        id: auction.id,
        productname: auction.productname || "Untitled",
        salePrice: auction.currentbid || 0,
        starting_bid: auction.startprice || 0,
        auction_type: auction.auctiontype || null,
        auction_subtype: auction.auctionsubtype || null,
        category: auction.categories || "unknown",
        auctionduration: auction.auctionduration,
        scheduledstart: auction.scheduledstart,
        productimages,
        buyer: "—", // no bids, so no buyer
        saleDate: null, // no bids, so always null
      };
    });

    return NextResponse.json({ success: true, data: sales });
  } catch (error) {
    console.error("Error fetching sales history:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
