import { NextResponse } from "next/server";
import { z } from "zod";

import placements from "@/placements.js";
import symbols from "@/generation/symbols.json";

// export const runtime = "edge";

// http://localhost:3000/api/supported?placement=logo
export const GET = async (request) => {
  try {
    const { searchParams } = request.nextUrl;
    const placement = searchParams.get("placement");

    z.string().min(1).max(25).parse(placement);

    if (!placements[placement]) {
      return NextResponse.json(
        {
          message: "Invalid request",
          errors: [{ error: "Invalid placement" }],
        },
        { status: 400 },
      );
    }
    const supportedSymbols = Object.keys(symbols).filter((symbol) =>
      symbols?.[symbol]?.placements.includes(placement),
    );

    return NextResponse.json({ symbols: supportedSymbols }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
