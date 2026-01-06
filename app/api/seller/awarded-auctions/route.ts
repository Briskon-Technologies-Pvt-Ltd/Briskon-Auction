import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userEmail = url.searchParams.get("email");

  if (!userEmail) {
    return NextResponse.json({ error: "User email is required" }, { status: 400 });
  }

  try {
    // Step 1: Get logged-in user's profile
    const { data: userProfile, error: userError } = await supabase
      .from("profiles")
      .select("id, fname, lname")
      .eq("email", userEmail)
      .single();

    if (userError || !userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userProfile.id;

    // Step 2: Fetch all reverse auctions that have ended (awarded or not)
    const { data: auctionsRaw, error: auctionsError } = await supabase
      .from("auctions")
      .select(`
        id,
        productname,
        categories:categoryid (handle),
        auctiontype,
        auctionsubtype,
        startprice,
        currentbid,
        targetprice,
        auctionduration,
        awarded_bid_id,
        ended,
        productimages
      `)
      .eq("sale_type", 1)
      .eq("auctiontype", "reverse")
      .eq("ended", true); // fetch all ended auctions

    if (auctionsError) throw auctionsError;
    if (!auctionsRaw || auctionsRaw.length === 0) return NextResponse.json([]);

    const response: any[] = [];

    // Step 3: Process each auction
    for (const auction of auctionsRaw) {
      // Case 1: Awarded bid exists → show if user is winner
      if (auction.awarded_bid_id) {
        const { data: awardedBid } = await supabase
          .from("bids")
          .select("id, user_id, amount, created_at")
          .eq("id", auction.awarded_bid_id)
          .single();

        if (awardedBid && awardedBid.user_id === userId) {
          response.push({
            auctionId: auction.id,
            productName: auction.productname,
            auctionType: auction.auctiontype,
            auctionSubtype: auction.auctionsubtype,
            startAmount: auction.startprice,
            targetPrice: auction.targetprice,
            category: auction.categories,
            bidAmount: awardedBid.amount,
            auctionduration: auction.auctionduration,
            productimage:
              Array.isArray(auction.productimages) && auction.productimages.length > 0
                ? auction.productimages[0]
                : "/placeholder.svg",
            status: "Winner (Awarded)",
                awardedAt: awardedBid.created_at, 
          });
        }
      }

      // Case 2: No awarded bid → check bids
      else {
        const { data: allBids } = await supabase
          .from("bids")
          .select("id, user_id, amount, created_at")
          .eq("auction_id", auction.id);

        if (!allBids || allBids.length === 0) continue;

        let winnerBid;

        // Single bidder → automatically winner
        if (allBids.length === 1) {
          winnerBid = allBids[0];
        } else {
          // Multiple bids → lowest amount wins, if tie → latest created_at
          const minAmount = Math.min(...allBids.map((b) => b.amount));
          const lowestBids = allBids.filter((b) => b.amount === minAmount);
          winnerBid = lowestBids.reduce((prev, curr) =>
            new Date(curr.created_at) > new Date(prev.created_at) ? curr : prev
          );
        }

        if (winnerBid.user_id === userId) {
          response.push({
            auctionId: auction.id,
            productName: auction.productname,
            auctionType: auction.auctiontype,
            auctionSubtype: auction.auctionsubtype,
            category: auction.categories,
            startAmount: auction.startprice,
            targetPrice: auction.targetprice,
            bidAmount: winnerBid.amount,
            auctionduration: auction.auctionduration,
            productimage:
              Array.isArray(auction.productimages) && auction.productimages.length > 0
                ? auction.productimages[0]
                : "/placeholder.svg",
            status: "Winner (Auto - Lowest Bid)",
                awardedAt: winnerBid.created_at,
          });
        }
      }
    }

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("Error generating reverse auction report:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}




export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const auctionId = url.searchParams.get("auctionId");
    const bidId = url.searchParams.get("bidId");

    if (!auctionId || !bidId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if auction already has an awarded bid
    const { data: auction, error: auctionCheckError } = await supabase
      .from("auctions")
      .select("id, awarded_bid_id")
      .eq("id", auctionId)
      .single();

    if (auctionCheckError) throw auctionCheckError;

    if (auction.awarded_bid_id) {
      return NextResponse.json(
        { error: "This auction already has an awarded bid" },
        { status: 400 }
      );
    }

    // Update auction with awarded bid
    const { data: updatedAuction, error: updateError } = await supabase
      .from("auctions")
      .update({ awarded_bid_id: bidId })
      .eq("id", auctionId)
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, auction: updatedAuction });
  } catch (err: any) {
    console.error("Error accepting bid:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
