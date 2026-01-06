import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient"; // adjust path

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Read formData from request
    const formData = await request.formData();

    // Example: extract fields
    const user_id = formData.get("user_id") as string;
    const amount = formData.get("amount") as string;
    const is_buy_now = formData.get("is_buy_now") === "true";
    const buy_now_amount = formData.get("buy_now_amount") as string;

    // Convert numeric values
    const amountNumber = amount ? Number(amount) : null;
    const buyNowNumber = buy_now_amount ? Number(buy_now_amount) : null;

    // Now you can insert into bids table
    const { data, error } = await supabase.from("bids").insert([
      {
        auction_id: id,
        user_id,
        amount: is_buy_now ? null : amountNumber, // only for normal bids
        is_buy_now,
        buy_now_amount: is_buy_now ? buyNowNumber : null,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (err: any) {
    console.error("PUT error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
