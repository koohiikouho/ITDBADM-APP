// src/types/offer.ts
export interface Offer {
  id: string;
  bandName: string;
  bookingDate: string;
  description: string;
  price: number;
  status: "pending" | "accepted" | "rejected" | "retracted";
  filedDate: string;
}

export type OfferStatus = Offer["status"];
