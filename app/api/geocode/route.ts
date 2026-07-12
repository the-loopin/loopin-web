import { NextRequest, NextResponse } from "next/server";

const nominatimBaseUrl = "https://nominatim.openstreetmap.org";
const bakuViewbox = "49.78,40.47,50.02,40.3";

async function fetchNominatim(path: string, params: URLSearchParams) {
  const response = await fetch(`${nominatimBaseUrl}${path}?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "LoopinLocalDev/1.0",
    },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Map search failed" }, { status: response.status });
  }

  return NextResponse.json(await response.json());
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("mode");

  if (mode === "reverse") {
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    if (!lat || !lon) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 });
    }

    return fetchNominatim("/reverse", new URLSearchParams({
      format: "jsonv2",
      addressdetails: "1",
      zoom: "18",
      lat,
      lon,
    }));
  }

  const query = searchParams.get("q");
  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  return fetchNominatim("/search", new URLSearchParams({
    format: "jsonv2",
    addressdetails: "1",
    limit: "8",
    countrycodes: "az",
    bounded: "1",
    viewbox: bakuViewbox,
    q: query,
  }));
}
