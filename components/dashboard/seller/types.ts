export interface Winner {
  id: string;
  productname: string;
  productimages: string;
  soldprice: number;
  buyername: string;
  buyeremail: string;
  closedat: string;
}

export interface lostBid {
  sellerName: string;
  auctionId: string;
  productName: string;
  auctionType: string | null;
  startprice: number;
  category?: { handle: string };
  currentbid: number;
  auctionSubtype: string | null;
  bidAmount: number;
  totalBids: number;
  isWinningBid: boolean;
  position: number;
  targetprice: number;
  productimages: string;
  scheduledstart: string;
  auctionduration?: {
    days?: number;
    hours?: number;
    minutes?: number;
  };
}

export interface Sale {
  id: string;
  productname: string;
  productimages: string;
  salePrice: number;
  buyer: string;
  category?: { handle: string };
  type: string;
  format: string;
  starting_bid: number;
  saleDate: string | null;
  bidder_count: number;
}

export interface UnsoldSale {
  id: string;
  productname: string;
  auction_type: string;
  auction_subtype: string;
  productimages: string;
  salePrice: number;
  buyer: string;
  category?: { handle: string };
  saleDate: string | null;
  starting_bid: number;
  auctionduration?: { days?: number; hours?: number; minutes?: number };
  scheduledstart: string;
}

export interface Stats {
  activeListings: number;
  totalSales: number;
  totalBids: number;
  topAuctions: {
    id: string;
    productname: string;
    productimages: string;
    category: string;
    type: string;
    format: string;
    starting_bid: number;
    current_bid: number;
    gain: number;
    bidders: number;
    auctionduration?: { days?: number; hours?: number; minutes?: number };
    scheduledstart: string;
  }[];
}

export interface LiveAuction {
  id: string;
  productname: string;
  currentbid: number | null;
  productimages: string;
  startprice: number;
  auctiontype: string;
  buy_now_price: number;
  auctionsubtype: string;
  category?: { handle: string };
  bidder_count: number;
  auctionduration?: { days?: number; hours?: number; minutes?: number };
  scheduledstart: string;
}

export interface upcomingAuctionItem {
  id: string;
  productname: string;
  currentbid: number | null;
  productimages: string;
  startprice: number;
  buy_now_price: number;
  auctiontype: string;
  auctionsubtype: string;
  category?: { handle: string };
  scheduledstart: string;
  auctionduration?: { days?: number; hours?: number; minutes?: number };
}

export interface closedAuctionItem {
  id: string;
  productname: string;
  currentbid: number | null;
  productimages: string;
  startprice: number;
  auctiontype: string;
  bidder_count: number;
  auctionsubtype: string;
  category?: { handle: string };
  scheduledstart: string;
  auctionduration?: { days?: number; hours?: number; minutes?: number };
}

export interface AuctionItem {
  id: string;
  productname: string;
  productimages: string;
  salePrice: number;
  starting_bid: number;
  category: string;
  type: string | number;
  format: string | number;
  created_at: string;
}

export interface approvalPendingItem {
  id: string;
  productname: string;
  productimages: string;
  salePrice: number;
  starting_bid: number;
  category?: { handle: string };
  buy_now_price: number;
  type: string | number;
  format: string | number;
  created_at: string;
  scheduledstart: string;
  auctionduration?: { days?: number; hours?: number; minutes?: number };
}

export interface ActiveBid {
  sellerName: string;
  auctionId: string;
  productName: string;
  auctionType: string | null;
  category?: { handle: string };
  auctionSubtype: string | null;
  bidAmount: number;
  currentbid: number;
  startprice: number;
  totalBids: number;
  isWinningBid: boolean;
  position: number;
  scheduledstart?: string;
  productimages: string;
  auctionduration?: {
    days?: number;
    hours?: number;
    minutes?: number;
  };
}

export interface approvalRejectedItem {
  id: string;
  productname: string;
  productimages: string;
  salePrice: number;
  starting_bid: number;
  category?: { handle: string };
  type: string | number;
  format: string | number;
  created_at: string;
  scheduledstart: string;
  auctionduration?: { days?: number; hours?: number; minutes?: number };
  buy_now_price?: number; // Added for BuyNow support
}

export interface bidRecevied {
  sellerName: string;
  auctionId: string;
  productName: string;
  bidId: string;
  auctionType: string | null;
  startAmount: number;
  awardedAt: string;
  buyerName: string;
  winningBidAmount: number;
  targetPrice?: number;
  productimage: string;
  category?: { handle: string };
  scheduledstart: string;
  auctionduration?: { days?: number; hours?: number; minutes?: number };
  auctionSubtype: string;
  currentbid: number;
  bidAmount: number;
}

// Aliases and Additional Types for Components
export type BuyNowProduct = LiveAuction;
export type upcomingBuyNowItem = upcomingAuctionItem; 
export type approvalPendingBufNowItem = approvalPendingItem;
export type AwardedAuction = bidRecevied;
export type LostBid = lostBid;

export interface SoldBuyNowProduct {
  id: string;
  productname: string;
  productimages: string;
  buy_now_price: number;
  sold_at: string;
  category?: { handle: string };
  buyer?: {
    username: string; 
  }; 
  scheduledstart: string;
  auctionduration?: { days?: number; hours?: number; minutes?: number };
}
