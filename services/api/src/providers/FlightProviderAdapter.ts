export type SearchRequest = {
  origin: string;
  destination: string;
  departDate: string;    // YYYY-MM-DD
  returnDate?: string;   // YYYY-MM-DD
  passengers: { adults: number }; // 1..6
  cabin?: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
};

export type ProviderItinerary = {
  providerItineraryId: string;
  totalPrice: { amount: number; currency: string; baseFareAmount: number; taxesFeesAmount: number };
  durationMinutes: number;
  stops: number;
  segments: Array<{
    carrier: string;
    flightNumber?: string;
    depart: { airport: string; timeLocalISO: string; timeZone: string };
    arrive: { airport: string; timeLocalISO: string; timeZone: string };
    durationMinutes: number;
  }>;
  bookingUrl: string; // raw provider deeplink (NEVER log)
};

export type ProviderSearchResult = {
  itineraries: ProviderItinerary[];
  providerTimestampISO: string;
  partial: boolean;
  warnings?: string[];
  rateLimit?: {
    remainingMinute?: number;
    resetMinuteUnix?: number;
  };
};

export interface FlightProviderAdapter {
  readonly name: string;
  search(req: SearchRequest, ctx: { partnerTransactionId: string; timeoutMs: number }): Promise<ProviderSearchResult>;
}
