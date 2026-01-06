import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { DateTime } from "luxon";
import { cookies } from "next/headers";
// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const isApproximatelyEqual = (a: number, b: number, epsilon = 0.01) =>
  Math.abs(a - b) < epsilon;
// Define interfaces
interface Auction {
  id: string;
  productname?: string;
  productdescription?: string;
  productimages?: string[]; // Array of URLs
  productdocuments?: string[]; // Array of URLs
  startprice?: number;
  sale_type?: number;
  bidder_count?: number;
  currentbid?: number;
  minimumincrement?: number;
  percent?: number;
  bidincrementtype?: "fixed" | "percentage";
  auctionduration?: { days?: number; hours?: number; minutes?: number };
  scheduledstart?: string;
  bidcount?: number;
  participants?: string[];
  issilentauction?: boolean;
  buy_now_price?: number;
  currentbidder?: string;
  createdby?: string;
  auctionsubtype?: string;
  requireddocuments?: string | null;
  auctiontype?: "forward" | "reverse"; // Added to handle auction type
  ended?: boolean; // Added to track if auction is ended
  editable?: boolean;
  questions?: { user: string; question: string; answer: string | null; question_time: string; answer_time: string | null }[];
  question_count?: number;
  approved?:boolean;
    evaluationcriteria?: string;
    awarded_bid_id?:string;
}

interface AuctionResponse extends Auction {
  profiles?: {
    fname: string;
    location: string;
    role:string;
  };
    categories?: {
    handle: string;
  };
  timeLeft?: string;
  sellerAuctionCount?: number;
}



interface Bid {
  id: string;
  auction_id: string;
  user_id: string;
  amount: number;
  created_at: string;
  productimages: { id: string; url: string }[]; // Array of { id, url } objects
  productdocuments: { id: string; url: string }[]; // Array of { id, url } objects
}


export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    const { data, error } = await supabase
      .from("auctions")
      .select(
        `
        id,
        productname,
         seller,
        categories:categoryid(handle),
         profiles:profiles!seller(fname, location),
        productdescription,
        productimages,
        productdocuments,
        startprice,
        currentbid,
        minimumincrement,
        percent,
        bidincrementtype,
        auctionduration,
        scheduledstart,
        sale_type,
        bidcount,
        ended,
        bidder_count,
        participants,
        issilentauction,
        currentbidder,
        createdby,
        attributes,
        sku,
        currency,
        brand,
        model,
        reserveprice,
        auctionsubtype,
        buy_now_price,
        requireddocuments,
        targetprice,
        subcategoryid,
        auctiontype,
        question_count,
        questions,
        approved,
        questions,
        evaluationcriteria,
        question_count,
        awarded_bid_id
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }
    // inside your GET handler
    
const { data: allAuctions, error: allError } = await supabase
  .from("auctions")
  .select("*, profiles:profiles!createdby(fname, location)");

if (allError) {
  console.error("Error fetching all auctions:", allError.message);
}


    const auction = data as Auction;
    let sellerAuctionCount = 0;
    if (auction.createdby) {
      const { count, error: countError } = await supabase
        .from("auctions")
        .select("*", { count: "exact", head: true })
        .eq("createdby", auction.createdby);

      if (countError) {
        console.warn(
          "Error fetching seller auction count:",
          countError.message
        );
      } else {
        sellerAuctionCount = count || 0;
      }
    }
    // console.log("Raw auction data before processing:", auction);

    const processedAuction: AuctionResponse = {
      ...auction,
      requireddocuments: auction.requireddocuments
        ? JSON.stringify(auction.requireddocuments)
        : null,
      timeLeft: "", // will be overwritten below
      sellerAuctionCount,
    };
return NextResponse.json(
  {
    success: true,
    data: processedAuction,
    allAuctions: allAuctions || [],
  },
  { status: 200 }
);
    // console.log("Processed auction data:", processedAuction);

    const nowIST = DateTime.now().setZone("Asia/Kolkata");
    const startIST = processedAuction.scheduledstart
      ? DateTime.fromISO(processedAuction.scheduledstart).setZone(
          "Asia/Kolkata"
        )
      : nowIST; // Use current IST if scheduledstart is null
    const duration = processedAuction.auctionduration
      ? ((d) =>
          (d.days || 0) * 86400 +
          (d.hours || 0) * 3600 +
          (d.minutes || 0) * 60)(
          typeof processedAuction.auctionduration === "string"
            ? JSON.parse(processedAuction.auctionduration)
            : processedAuction.auctionduration
        )
      : 0;
    const endIST = startIST.plus({ seconds: duration });

    // Debug logs to verify times
    console.log(
      "Debug - Now IST:",
      nowIST.toISO(),
      "Start IST:",
      startIST.toISO(),
      "End IST:",
      endIST.toISO()
    );

    processedAuction.timeLeft = calculateTimeLeft(endIST.toISO() ?? "");
    return NextResponse.json(
      { success: true, data: processedAuction },
      { status: 200 }
    );
  } catch (error) {
    console.error("Route Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  deduplicateAuctionParticipants();
  try {
    const params = await context.params; // Await params to handle promise
    const { id } = params;
    // console.log("Incoming Request Method:", request.method);
    // console.log(
    //   "Incoming Request Headers:",
    //   Object.fromEntries(request.headers.entries())
    // );
    // console.log("Request Content-Type:", request.headers.get("content-type"));

    let formData;
    try {
      formData = await request.formData();
    } catch (parseError) {
      console.error("FormData Parsing Error:", parseError);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format: Could not parse as FormData",
        },
        { status: 400 }
      );
    }
    console.log("Received FormData Entries:", [...formData.entries()]);
    const action = formData.get("action") as string;
    // Parse the request body (assuming FormData from frontend)
    // const formData = await request.formData();
    if (!action) {
      return NextResponse.json(
        { success: false, error: "Missing action parameter" },
        { status: 400 }
      );
    }

    if (action === "bid") {
      const user_id = formData.get("user_id") as string;
      const user_email = formData.get("user_email") as string;
      const amount = parseFloat(formData.get("amount") as string );
      const created_at = formData.get("created_at") as string;
      const is_buy_now = formData.get("is_buy_now") === "true";
      const buy_now_amount = formData.get("buy_now_amount") as string | null;
      const documents: { id: string; url: string }[] = [];
      const images: { id: string; url: string }[] = [];
      for (const [key, value] of formData.entries() as IterableIterator<
        [string, FormDataEntryValue]
      >) {
        if (key.startsWith("documents[")) {
          documents.push(JSON.parse(value as string));
        } else if (key.startsWith("images[")) {
          images.push(JSON.parse(value as string));
        }
      }

      if (!user_id || !user_email || isNaN(amount) || !created_at) {
        return NextResponse.json(
          { success: false, error: "Missing required fields for bid" },
          { status: 400 }
        );
      }

      const { data: auctionData, error: fetchError } = await supabase
        .from("auctions")
        .select(
          "startprice, currentbid, minimumincrement, percent, currency, ended, bidder_count, bidincrementtype, participants, bidcount, createdby, scheduledstart, auctionduration, auctionsubtype, targetprice, auctiontype, awarded_bid_id"
        )
        .eq("id", id)
        .single();

      if (fetchError || !auctionData) {
        return NextResponse.json(
          { success: false, error: fetchError?.message || "Auction not found" },
          { status: 404 }
        );
      }

      const nowIST = DateTime.now().setZone("Asia/Kolkata");
      const startIST = auctionData.scheduledstart
        ? DateTime.fromISO(auctionData.scheduledstart, { zone: "utc" }).setZone(
            "Asia/Kolkata"
          )
        : nowIST;
      const duration = auctionData.auctionduration
        ? ((d) =>
            (d.days || 0) * 86400 +
            (d.hours || 0) * 3600 +
            (d.minutes || 0) * 60)(auctionData.auctionduration)
        : 0;
      const endIST = startIST.plus({ seconds: duration });

      // console.log(
      //   "Debug - Bid Check: Now IST:",
      //   nowIST.toISO(),
      //   "Start IST:",
      //   startIST.toISO(),
      //   "End IST:",
      //   endIST.toISO()
      // );

      if (nowIST < startIST) {
        return NextResponse.json(
          { success: false, error: "Auction has not started yet" },
          { status: 400 }
        );
      }
      if (nowIST > endIST) {
        return NextResponse.json(
          { success: false, error: "Auction has ended" },
          { status: 400 }
        );
      }

      const currentBid = auctionData.currentbid || auctionData.startprice || 0;
      const targetPrice = auctionData.targetprice || 0;
      let minimumIncrement = 0;

      if (
        auctionData.bidincrementtype === "percentage" &&
        auctionData.percent
      ) {
        minimumIncrement = currentBid * (auctionData.percent / 100);
      } else if (
        auctionData.bidincrementtype === "fixed" &&
        auctionData.minimumincrement
      ) {
        minimumIncrement = auctionData.minimumincrement;
      }
      const base = auctionData.startprice || 0;
      const increment = auctionData.minimumincrement || 1;
      const diff = amount - base;
      if (auctionData.auctionsubtype != "sealed") {
        // added this logic to make bid multile of min incremement one time
        if (auctionData.auctiontype === "forward") {
          if (diff < 0 || diff % increment !== 0) {
            return NextResponse.json(
              {
                success: false,
                error: `Bid must be at least $${increment} above start price and in multiples of $${increment}`,
              },
              { status: 400 }
            );
          }
        } else if (auctionData.auctiontype === "reverse") {
          if (amount > auctionData.startprice) {
            return NextResponse.json(
              {
                success: false,
                error: `Bid must be at most 1 $${targetPrice.toLocaleString()}`,
              },
              { status: 400 }
            );
          }
        }
      } else {
        const roundToTwo = (val: number) =>
          Math.round((val + Number.EPSILON) * 100) / 100;
        const roundedAmount = roundToTwo(amount);
        const roundedCurrentBid = roundToTwo(currentBid);
        const roundedIncrement = roundToTwo(minimumIncrement);

        if (!auctionData.bidcount || auctionData.bidcount === 0 ) {
          if (auctionData.auctiontype === "forward") {
            if (amount < (auctionData.startprice || 0)) {
              return NextResponse.json(
                {
                  success: false,
                  error: `First bid must be at least $${(
                    auctionData.startprice || 0
                  ).toLocaleString()}`,
                },
                { status: 400 }
              );
            }
          } else if (auctionData.auctiontype === "reverse" && auctionData.auctionsubtype != "sealed") {
            if (amount > auctionData.startprice) {
              return NextResponse.json(
                {
                  success: false,
                  error: `First bid must be at most $${targetPrice.toLocaleString()}`,
                },
                { status: 400 }
              );
            }
          }
        } else {
          if (auctionData.auctiontype === "forward") {
            const diff = roundedAmount - roundedCurrentBid;

            if (diff < roundedIncrement || diff % roundedIncrement !== 0) {
              return NextResponse.json(
                {
                  success: false,
                  error: `Bid must be at least $${roundedIncrement.toLocaleString()} more than the current bid and in multiples of that increment.`,
                },
                { status: 400 }
              );
            }
          } else if(auctionData.auctiontype === "reverse"){
            if (increment === 0) {
            if (roundedAmount < targetPrice || roundedAmount > roundedCurrentBid) {
        return NextResponse.json(
          {
            success: false,
            error: `Bid must be between $${targetPrice.toLocaleString()} and $${roundedCurrentBid.toLocaleString()}`,
          },
          { status: 400 }
        );
      }
      }
          }
           else {
            const expectedBid = roundToTwo(roundedCurrentBid - roundedIncrement);
            if (roundedAmount !== expectedBid) {
              return NextResponse.json(
                {
                  success: false,
                  error: `Bid must be exactly from api$${expectedBid.toLocaleString()} (current bid - minimum increment)`,
                },
                { status: 400 }
              );
            }
          }
        }
      }

      // Check if user is the auction creator

      if (user_email === auctionData.createdby) {
        return NextResponse.json(
          { success: false, error: "You cannot bid on your own auction" },
          { status: 400 }
        );
      }

      const participants = auctionData.participants || [];
      const updatedParticipants = participants.includes(user_id)
        ? participants
        : [...participants, user_id];

      const updatedBidCount = (auctionData.bidcount || 0) + 1;

      const { error: bidError } = await supabase.from("bids").insert({
        auction_id: id,
        user_id,
        amount,
        is_buy_now ,
        buy_now_amount ,
        created_at,
        productimages: images,
        productdocuments: documents,
      });

      if (bidError) {
        return NextResponse.json(
          { success: false, error: bidError.message },
          { status: 400 }
        );
      }

      const updatedUniqueBidderCount = updatedParticipants.length;

      const { data, error: auctionUpdateError } = await supabase
        .from("auctions")
        .update({
          participants: updatedParticipants,
          bidcount: updatedBidCount,
          bidder_count: updatedUniqueBidderCount,
          currentbid: amount,
          currentbidder: user_email,
          editable: false,
        })
        .eq("id", id)
        .select();

      if (auctionUpdateError) {
        return NextResponse.json(
          { success: false, error: auctionUpdateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, data: data[0] },
        { status: 200 }
      );
    } else if (action === "postQuestion") {
      const user_id = formData.get("user_id") as string;
      const user_email = formData.get("user_email") as string;
      const question = formData.get("question") as string;

      if (!user_id || !user_email || !question) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing required fields for posting question",
          },
          { status: 400 }
        );
      }

      const { data: auctionData, error: fetchError } = await supabase
        .from("auctions")
        .select(
          "participants, questions, question_count, createdby, scheduledstart, auctionduration"
        )
        .eq("id", id)
        .single();

      if (fetchError || !auctionData) {
        return NextResponse.json(
          { success: false, error: fetchError?.message || "Auction not found" },
          { status: 404 }
        );
      }

      const nowIST = DateTime.now().setZone("Asia/Kolkata");
      const startIST = auctionData.scheduledstart
        ? DateTime.fromISO(auctionData.scheduledstart).setZone("Asia/Kolkata")
        : nowIST;
      const duration = auctionData.auctionduration
        ? ((d) =>
            (d.days || 0) * 86400 +
            (d.hours || 0) * 3600 +
            (d.minutes || 0) * 60)(auctionData.auctionduration)
        : 0;
      const endIST = startIST.plus({ seconds: duration });

      if (nowIST < startIST || nowIST > endIST) {
        return NextResponse.json(
          {
            success: false,
            error: "Questions can only be posted during the auction period",
          },
          { status: 400 }
        );
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("fname, lname, email")
        .eq("id", user_id)
        .single();

      if (profileError) {
        return NextResponse.json(
          { success: false, error: "Failed to fetch user profile" },
          { status: 500 }
        );
      }

      const userName = profileData
        ? `${profileData.fname || ""} ${profileData.lname || ""}`.trim() ||
          profileData.email ||
          user_id
        : user_id;

      const newQuestion = {
        user: userName,
        question,
        answer: null,
        question_time: nowIST.toISO(),
        answer_time: null,
      };

      const updatedQuestions = auctionData.questions
        ? [...auctionData.questions, newQuestion]
        : [newQuestion];
      const updatedQuestionCount = (auctionData.question_count || 0) + 1;

      const { error: updateError } = await supabase
        .from("auctions")
        .update({
          questions: updatedQuestions,
          question_count: updatedQuestionCount,
        })
        .eq("id", id);

      if (updateError) {
        return NextResponse.json(
          { success: false, error: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            questions: updatedQuestions,
            question_count: updatedQuestionCount,
          },
        },
        { status: 200 }
      );
    } else if (action === "answerQuestion") {
      const user_email = formData.get("user_email") as string;
      const questionIndex = parseInt(formData.get("questionIndex") as string);
      const answer = formData.get("answer") as string;

      if (!user_email || isNaN(questionIndex) || !answer) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing required fields for answering question",
          },
          { status: 400 }
        );
      }

      const { data: auctionData, error: fetchError } = await supabase
        .from("auctions")
        .select("createdby, questions, scheduledstart, auctionduration")
        .eq("id", id)
        .single();

      if (fetchError || !auctionData) {
        return NextResponse.json(
          { success: false, error: fetchError?.message || "Auction not found" },
          { status: 404 }
        );
      }

      const nowIST = DateTime.now().setZone("Asia/Kolkata");
      const startIST = auctionData.scheduledstart
        ? DateTime.fromISO(auctionData.scheduledstart).setZone("Asia/Kolkata")
        : nowIST;
      const duration = auctionData.auctionduration
        ? ((d) =>
            (d.days || 0) * 86400 +
            (d.hours || 0) * 3600 +
            (d.minutes || 0) * 60)(auctionData.auctionduration)
        : 0;
      const endIST = startIST.plus({ seconds: duration });

      if (nowIST > endIST) {
        return NextResponse.json(
          {
            success: false,
            error: "Cannot answer questions after auction ends",
          },
          { status: 400 }
        );
      }

      if (user_email !== auctionData.createdby) {
        return NextResponse.json(
          {
            success: false,
            error: "Only the auction creator can answer questions",
          },
          { status: 403 }
        );
      }

      if (
        !auctionData.questions ||
        questionIndex < 0 ||
        questionIndex >= auctionData.questions.length
      ) {
        return NextResponse.json(
          { success: false, error: "Invalid question index" },
          { status: 400 }
        );
      }

      const updatedQuestions = [...auctionData.questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        answer,
        answer_time: nowIST.toISO(),
      };

      const { error: updateError } = await supabase
        .from("auctions")
        .update({ questions: updatedQuestions })
        .eq("id", id);

      if (updateError) {
        return NextResponse.json(
          { success: false, error: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, data: { questions: updatedQuestions } },
        { status: 200 }
      );
    } else if (action === "markEnded") {
      // New action to mark auction as ended
      const { data: auctionData, error: fetchError } = await supabase
        .from("auctions")
        .select("ended")
        .eq("id", id)
        .single();

      if (fetchError || !auctionData) {
        return NextResponse.json(
          { success: false, error: fetchError?.message || "Auction not found" },
          { status: 404 }
        );
      }

      if (auctionData.ended) {
        return NextResponse.json(
          { success: false, error: "Auction is already marked as ended" },
          { status: 400 }
        );
      }

      const { error: updateError } = await supabase
        .from("auctions")
        .update({ ended: true, editable: false }) // Mark as ended and not editable
        .eq("id", id);

      if (updateError) {
        return NextResponse.json(
          { success: false, error: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, data: { ended: true } },
        { status: 200 }
      );
    }else if (action === "buy_now") {
  const user_id = formData.get("user_id") as string;
  const buy_now_amount = parseFloat(formData.get("buy_now_amount") as string);
  const created_at = formData.get("created_at") as string;

  if (!user_id || !buy_now_amount || !created_at) {
    return NextResponse.json(
      { success: false, error: "Missing required fields for Buy Now" },
      { status: 400 }
    );
  }

  // Check if already bought
  const { data: existing } = await supabase
    .from("bids")
    .select("id")
    .eq("auction_id", id)
    .eq("is_buy_now", true);

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { success: false, error: "This item has already been purchased" },
      { status: 400 }
    );
  }

  // Insert Buy Now bid (without user_email)
  const { error: insertError } = await supabase.from("bids").insert([
    {
      auction_id: id,
      user_id,
      amount: buy_now_amount, // store same value in amount
      is_buy_now: true,
      buy_now_amount,
      created_at,
    },
  ]);

  if (insertError) {
    return NextResponse.json(
      { success: false, error: insertError.message },
      { status: 500 }
    );
  }

  // Update auction: purchaser and ended
  const { error: updateAuctionError } = await supabase
    .from("auctions")
    .update({ purchaser: user_id, ended: true })
    .eq("id", id);

  if (updateAuctionError) {
    return NextResponse.json(
      { success: false, error: updateAuctionError.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: true, message: "Item bought successfully" },
    { status: 200 }
  );
}




    return NextResponse.json(
      { success: false, error: "Invalid action specified" },
      { status: 400 }
    );
  } catch (error) {
    console.error("PUT request error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Helper function to calculate time left in IST
const calculateTimeLeft = (endDateISO: string): string => {
  const nowIST = DateTime.now().setZone("Asia/Kolkata");
  const endIST = DateTime.fromISO(endDateISO).setZone("Asia/Kolkata");

  const diff = endIST.diff(nowIST, ["days", "hours", "minutes", "seconds"]).toObject();
  if ((diff.days ?? 0) <= 0 && (diff.hours ?? 0) <= 0 && (diff.minutes ?? 0) <= 0 && (diff.seconds ?? 0) <= 0) {
    return "Auction ended";
  }

  return `${diff.days ?? 0}d ${diff.hours ?? 0}h ${diff.minutes ?? 0}m`;
};

async function deduplicateAuctionParticipants() {
  const { data: auctions, error } = await supabase
    .from("auctions")
    .select("id, participants");

  if (error) {
    console.error("Failed to fetch auctions:", error.message);
    return;
  }

  for (const auction of auctions) {
    const original = auction.participants || [];
    const deduplicated = Array.from(new Set(original));

    if (deduplicated.length !== original.length) {
      const { error: updateError } = await supabase
        .from("auctions")
        .update({ participants: deduplicated })
        .eq("id", auction.id);

      if (updateError) {
        console.error(
          `Failed to update auction ${auction.id}:`,
          updateError.message
        );
      } else {
        console.log(`✅ Deduplicated participants for auction ${auction.id}`);
      }
    }
  }

  console.log("🎉 Deduplication complete.");
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id: auctionId } = params;
    console.log("Auction ID:", auctionId);

    const body = await request.json();
    const { awarded_bid_id } = body;
    console.log("Awarded Bid ID:", awarded_bid_id);

    if (!awarded_bid_id) {
      return NextResponse.json({ error: "Missing awarded_bid_id" }, { status: 400 });
    }
 
    const { data: auction, error: auctionError } = await supabase
      .from("auctions")
      .select("*")
      .eq("id", auctionId)
      .single();

    if (auctionError || !auction) {
      console.error("Auction not found:", auctionError);
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    // Verify the bid belongs to this auction
    const { data: bid, error: bidError } = await supabase
      .from("bids")
      .select("*")
      .eq("id", awarded_bid_id)
      .eq("auction_id", auctionId)
      .single();

    if (bidError || !bid) {
      console.error("Bid check failed:", bidError);
      return NextResponse.json({ error: "Invalid bid" }, { status: 400 });
    }
    console.log("Bid verified:", bid);

    // Update the auction (overwrite any previous winner)
    const { data: updatedAuction, error: updateError } = await supabase
      .from("auctions")
      .update({ awarded_bid_id })
      .eq("id", auctionId)
      .select()
      .single();

    if (updateError) {
    
      return NextResponse.json({ error: "Update failed", details: updateError.message }, { status: 500 });
    }

    console.log("Auction updated:", updatedAuction);
    return NextResponse.json({ success: true, data: updatedAuction }, { status: 200 });
  } catch (error: any) {
    console.error("Unexpected error in PATCH /auctions/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
