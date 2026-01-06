import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("id");

  if (!userId) {
    return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
  }

  try {
    // Step 1: get auctions bought by logged-in buyer
    const { data: auctions, error } = await supabase
      .from("auctions")
      .select("id, productname, productimages, seller, purchaser, currentbid, startprice, categories:categoryid(handle), createdat, buy_now_price")
      .eq("purchaser", userId);

    if (error) throw error;

    if (!auctions || auctions.length === 0) {
      return NextResponse.json({ success: true, data: [], count: 0 });
    }

    // Step 2: get seller details
    const sellerIds = auctions.map(a => a.seller).filter(Boolean);

    const { data: sellers, error: sellerError } = await supabase
      .from("profiles")
      .select("id, fname, lname, location")
      .in("id", sellerIds);

    if (sellerError) throw sellerError;

    // Step 3: merge seller info into auctions
    const enriched = auctions.map(a => ({
      ...a,
      seller: sellers.find(s => s.id === a.seller) || null,
    }));

    return NextResponse.json({ success: true, data: enriched, count: enriched.length });
  } catch (err: any) {
    console.error("Error fetching purchased auctions:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
