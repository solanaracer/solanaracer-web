import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import placements from "@/placements.js";
import symbols from "@/generation/symbols.json";

const umi = createUmi("https://api.mainnet-beta.solana.com");

// npm run addSymbolFromMint 3NVydEmKGPGBEaUdoHYjZZK6GGtzSSTNi7zpToyC8dWS logo
const main = async (testMint, placement) => {
  if (!placements[placement]) {
    console.error(`Invalid placement: ${placement}`);
    process.exit(1);
  }
  console.log(
    `Adding symbol for testMint: ${testMint} for placement: ${placement}`,
  );

  const asset = await fetchDigitalAsset(umi, testMint);
  if (!asset) {
    console.error(`Could not fetch asset for testMint: ${testMint}`);
    process.exit(1);
  }

  const offChainRes = await fetch(asset.metadata.uri);
  let offChainData = null;
  if (!offChainRes.ok) {
    console.warn(
      `Could not fetch off-chain data for testMint. ${asset.metadata.uri}`,
    );
  }

  try {
    offChainData = await offChainRes.json();
  } catch (e) {
    console.warn(`Could not parse off-chain data as JSON for testMint`);
  }

  const imageUrl = offChainData ? offChainData.image : asset.metadata.uri;
  const res = await fetch(imageUrl, { method: "GET" });
  if (!res.ok) {
    console.error(`Could not fetch image: ${imageUrl}`);
    process.exit(1);
  }

  const buffer = await res.arrayBuffer();
  const png = sharp(buffer).png();
  const pngMetaData = await png.metadata();
  const { width: imgWidth, height: imgHeight } = pngMetaData;

  // ensure the ratio of imageWidth & imageHeight match the ratio of width & height of the placement
  const ratio = imgWidth / imgHeight;
  const placementRatio =
    placements[placement].width / placements[placement].height;
  if (ratio !== placementRatio) {
    console.error(
      `Image ratio does not match placement ratio. Image ratio: ${ratio}, Placement ratio: ${placementRatio}`,
    );
    process.exit(1);
  }

  const newSymbolData = {
    symbol: asset.metadata.symbol || offChainData.symbol,
    testMint,
    updatedAt: new Date().toISOString(),
    width: imgWidth,
    height: imgHeight,
    placements: [placement],
  };
  const existingSymbolData = symbols?.[newSymbolData.symbol];

  if (existingSymbolData) {
    if (existingSymbolData.placements.includes(placement)) {
      console.warn(`Symbol already has placement: ${placement}`);
    } else {
      existingSymbolData.placements.push(placement);
      existingSymbolData.updatedAt = newSymbolData.updatedAt;
      symbols[newSymbolData.symbol] = existingSymbolData;
      console.log(
        `Updated symbol: ${newSymbolData.symbol} placements: ${existingSymbolData.placements}`,
      );
    }
  } else {
    console.log(`Added symbol: ${newSymbolData.symbol}`);
    symbols[newSymbolData.symbol] = newSymbolData;
  }

  fs.writeFileSync(
    path.join(__dirname, "../generation/symbols.json"),
    JSON.stringify(symbols, null, 2),
  );
};

const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error(
    "Usage: tsx scripts/addSymbolFromMint.js <testMint> <placement>",
  );
  process.exit(1);
}

try {
  main(args[0], args[1]);
} catch (e) {
  console.error(e?.message || e);
}
