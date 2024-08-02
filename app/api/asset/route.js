import { NextResponse } from "next/server";
import { ImageResponse } from "@vercel/og";
import sharp from "sharp";
import { z } from "zod";

import placements from "@/placements.js";
import symbols from "@/generation/symbols.json";

// TODO: Confirm edge works with sharp
// export const runtime = "edge";

// http://localhost:3000/api/asset?symbol=SCRI&placement=logo&imgUrl=https%3A%2F%2Fnftstorage.link%2Fipfs%2Fbafkreieizaoip6f5yvjatbwydzlyaztrata2baq4hroicm6bblkdsx2lom

export const GET = async (request) => {
  try {
    const { searchParams } = request.nextUrl;
    const imgUrl = decodeURIComponent(searchParams.get("imgUrl"));
    const symbol = searchParams.get("symbol");
    const placement = searchParams.get("placement");

    // Confirm all params set and symbol/placement are valid
    z.string().url().parse(imgUrl);
    z.string().min(1).max(25).parse(symbol);
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
    if (!symbols[symbol]) {
      return NextResponse.json(
        { message: "Invalid request", errors: [{ error: "Invalid symbol" }] },
        { status: 400 },
      );
    }
    if (!symbols[symbol].placements.includes(placement)) {
      return NextResponse.json(
        {
          message: "Invalid request",
          errors: [{ error: "Invalid placement for symbol" }],
        },
        { status: 400 },
      );
    }
    const newWidth = placements[placement].width;
    const newHeight = placements[placement].height;
    const expectedWidth = symbols[symbol].width;
    const expectedHeight = symbols[symbol].height;

    const res = await fetch(imgUrl, { method: "GET" });
    if (!res.ok) {
      return NextResponse.json(
        {
          message: "Internal Server Error",
          errors: [{ error: "Could not fetch image" }],
        },
        { status: 500 },
      );
    }

    const buffer = await res.arrayBuffer();
    const png = sharp(buffer).png();
    const pngMetaData = await png.metadata();
    // Confirm width/height is valid for symbol
    if (
      pngMetaData.width !== expectedWidth ||
      pngMetaData.height !== expectedHeight
    ) {
      return NextResponse.json(
        {
          message: "Invalid request",
          errors: [{ error: "Invalid image dimensions" }],
        },
        { status: 400 },
      );
    }

    const pngBuffer = await png.toBuffer();
    const pngArrayBuffer = pngBuffer.buffer.slice(
      pngBuffer.byteOffset,
      pngBuffer.byteOffset + pngBuffer.byteLength,
    );

    return new ImageResponse(
      (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt="asset"
          width={newWidth}
          height={newHeight}
          src={pngArrayBuffer}
        />
      ),
      {
        width: newWidth,
        height: newHeight,
        type: "image/png",
        // headers: {
        //   "Access-Control-Allow-Origin": "*",
        //   "Access-Control-Allow-Methods": "GET, OPTIONS",
        //   "Access-Control-Allow-Headers": "Content-Type",
        // },
      },
    );
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request", errors: e.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};
