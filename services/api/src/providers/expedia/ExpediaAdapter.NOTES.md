# ExpediaAdapter — Notes

## Required headers to Expedia Flight Listings
- Accept: application/vnd.exp-flight.v3+json
- Key: EXPEDIA_API_KEY
- Authorization: EXPEDIA_BASIC_AUTH
- Partner-Transaction-Id: generated per request (UUID)

## Deeplink extraction
- Use Offers[].Links.WebDetails.Href as bookingUrl (method GET).

## Rate limiting
- Read:
  - EG-Rate-Limit-Remaining-Minute
  - EG-Rate-Limit-Reset-Minute
- If Expedia returns 429:
  - do not retry automatically
  - return retryAfterMs to client based on reset header

## Caching
- Cache successful search results for TTL seconds (default 30; max 60).
- Cache key: normalized request (origin,destination,departDate,returnDate,adults,cabin)
- Refresh bypasses cache unless rate-limited.
