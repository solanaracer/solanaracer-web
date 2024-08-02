This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

This project is currently hosted at https://solanaracer-web.vercel.app/ 

## Specifying asset placements your game supports

Open `placements.js` and add a new entry, noting the placement and the expected asset resolution/ratio:

```
const placements = {
  // Renders a 75x75 logo within wallet screen and game leaderboard
  logo: {
    width: 75,
    height: 75,
  },
};
```

The api endpoint `/api/supported?placement=logo` will now return an empty array.

To add supported NFTs, use the addSymbolFromMint script. You will need an example mint from an NFT. 

`npm run addSymbolFromMint 3NVydEmKGPGBEaUdoHYjZZK6GGtzSSTNi7zpToyC8dWS logo` 

This script will pull the metadata for the mint, ensure the resolution of the image matches the placement, and update the `generation/symbols.json` which will enable that asset to be pulled within the game. To enable an asset for multiple placements, call the command again and the new placement will be added to the existing entry.

Here's an example entry. Note: Do *NOT* manually edit the symbols.json file unless you are aware of the inner workings.

```
"FRG": {
    "symbol": "FRG",
    "testMint": "3NVydEmKGPGBEaUdoHYjZZK6GGtzSSTNi7zpToyC8dWS",
    "updatedAt": "2024-08-02T22:56:03.744Z",
    "width": 3000,
    "height": 3000,
    "placements": [
      "logo"
    ]
  },
```

After this, the api endpoint `/api/asset?symbol=SCRI...` will be available for the symbol/placement combo. This ensures the assets are provided to the game in the correct file type and resolution, along with some caching benefits.

## Game Integration

See the game code `Assets/Scripts/Solana/*` for an example integration using these endpoints along side the Solana unity SDK to safely render NFTs in your game.

