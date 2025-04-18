// app/api/sell-listings/route.ts
import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search") || "";

    // Build filter object
    const filter: any = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const listings = await prisma.sellListing.findMany({
      where: {
        AND: [
          filter,
          {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { carName: { contains: search, mode: "insensitive" } },
            ],
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error("Error fetching sell listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}