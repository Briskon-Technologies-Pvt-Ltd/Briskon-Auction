import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scheduler } from "node:timers/promises";

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const { data, error } = await supabase
      .from("auctions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ success: false, error: "Auction not found" }, { status: 404 });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching auction details:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch auction details" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    if (!id) return NextResponse.json({ success: false, error: "Auction ID is required" }, { status: 400 });
    const { productname, productdescription, startprice, minimumincrement, auctionduration, productdocuments, productimages, targetprice, editable, scheduledstart } = await req.json();
    // Check if the auction is editable
    const { data: auctionData, error: fetchError } = await supabase
      .from("auctions")
      .select("editable")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    if (!auctionData) return NextResponse.json({ success: false, error: "Auction not found" }, { status: 404 });
    if (!auctionData.editable) return NextResponse.json({ success: false, error: "Auction is not editable" }, { status: 403 });

    const { data, error } = await supabase
      .from("auctions")
      .update({
        productname,
        productdescription,
        startprice,
        minimumincrement,
        auctionduration,
        scheduledstart,
        productimages,
        targetprice,
        productdocuments,
        editable,
        ended: false,
        approved: false ,
        approval_status: "pending"
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error updating auction:", error);
    return NextResponse.json({ success: false, error: "Failed to update auction" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    if (!id) return NextResponse.json({ success: false, error: "Auction ID is required" }, { status: 400 });

    // Delete associated bids first
    const { error: deleteBidsError } = await supabase
      .from("bids")
      .delete()
      .eq("auction_id", id);

    if (deleteBidsError) throw deleteBidsError;

    // Delete the auction
    const { error: deleteAuctionError } = await supabase
      .from("auctions")
      .delete()
      .eq("id", id);

    if (deleteAuctionError) throw deleteAuctionError;

    return NextResponse.json({ success: true, message: "Auction and associated bids deleted successfully" });
  } catch (error) {
    console.error("Error deleting auction:", error);
    return NextResponse.json({ success: false, error: "Failed to delete auction" }, { status: 500 });
  }
}
