# ks-checkin web

Front for the `ks-checkin` Soroban contract (Stellar testnet).

| Route | Use |
|---|---|
| `/` | Attendee page: connect a wallet (Stellar Wallets Kit), fund it with Friendbot, check in |
| `/#/screen` | Projector page: QR code to `/`, live counter and attendee list |

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm test
npm run lint
npm run build
```

## Deploy (GitHub Pages)

`.github/workflows/deploy.yml` lints, tests, builds and publishes `dist/` on every push to `main`.
One-time setup: repo **Settings → Pages → Source: GitHub Actions**. The repo must be public on a free plan.
`base: './'` in `vite.config.ts` makes the build work under `https://<user>.github.io/<repo>/`.

## Config

`CONTRACT_ID` in `src/config.ts` (a public contract address, no secret, so no `.env`). After redeploying the contract, update it:

```bash
stellar contract deploy --wasm target/wasm32v1-none/release/ks_checkin.wasm \
  --source-account <identity> --network testnet --alias ks-checkin
```

Reads (`attendees`) are simulations: no wallet, no fee. `check_in` is signed by the attendee's wallet, which also satisfies `attendee.require_auth()`.
