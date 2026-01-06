import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface approvalPending {
  id: string;
  productname: string;
  productimages: string;
  category?: { handle: string }[];
  buy_now_price: number;
  type: string;
  format: string;
  starting_bid: number;
  current_bid: number | null;
  created_at:string;
    scheduledstart:string;
  auctionduration:{ days?: number; hours?: number; minutes?: number };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userEmail = searchParams.get("email");
 const saleType = searchParams.get("sale_type");
 
  if (!saleType) {
    return NextResponse.json({ error: "sale_type is required" }, { status: 400 });
  }
  if (!userEmail) {
    return NextResponse.json(
      { success: false, error: "User email is required" },
      { status: 400 }
    );
  }

  try {
    const { data: auctionsData, count: auctionsCount, error: auctionsError } =
      await supabase
        .from("auctions")
        .select(
          `
          id,
          productname,
          productimages,
          categories:categoryid (handle),
          auctiontype,
          auctionsubtype,
          startprice,
          createdat,
          currentbid,
          buy_now_price,
          approved,
          scheduledstart,
          auctionduration
          `,
          { count: "exact" }
        )
        .eq("createdby", userEmail)
        .eq("approved", false)
        .eq("sale_type", Number(saleType))
        .neq("approval_status", "rejected"); // Filter unapproved auctions only

    if (auctionsError) {
      return NextResponse.json(
        { success: false, error: auctionsError.message },
        { status: 500 }
      );
    }

    const formattedAuctions: approvalPending[] = (auctionsData || []).map(
      (auction: any): approvalPending => ({
        id: auction.id,
        productname: auction.productname || "Untitled",
        productimages:
          Array.isArray(auction.productimages) && auction.productimages.length > 0
            ? auction.productimages[0]
            : "/placeholder.svg",
        current_bid: auction.currentbid || 0,
        starting_bid: auction.startprice || 0,
         category: auction.categories || "unknown",
        type: auction.auctiontype || "",
        buy_now_price: auction.buy_now_price || 0,
        format: auction.auctionsubtype || "",
        created_at: auction.createdat || "",
        auctionduration:auction.auctionduration,
        scheduledstart:auction.scheduledstart
      })
    );

    return NextResponse.json({
      success: true,
      data: formattedAuctions,
      count: auctionsCount,
    });
  } catch (error) {
    console.error("Error fetching seller stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
