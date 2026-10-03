# Shared pledge backend (optional)

This API runs independently of GitHub Pages in your Cloudflare account. Do not deploy the original Sites manifest or its private bindings. The original Sites database is not copied by these steps.

## Setup

From the repository root, using Node.js 24:

```bash
npx wrangler@4.92.0 login
npx wrangler@4.92.0 d1 create bringbackthedab-pledges
```

Copy `backend/wrangler.example.jsonc` to `backend/wrangler.jsonc`. Replace `REPLACE_WITH_YOUR_D1_DATABASE_ID` with the returned database ID. Check `ALLOWED_ORIGINS`: it must include the exact origins used by your frontend, without paths or trailing slashes. The examples cover your GitHub Pages origin, apex/www domains and local Vite development.

Apply the schema and publish:

```bash
npx wrangler@4.92.0 d1 migrations apply bringbackthedab-pledges --remote --config backend/wrangler.jsonc
npx wrangler@4.92.0 deploy --config backend/wrangler.jsonc
```

Copy the deployed `https://…workers.dev` origin into the repository variable `VITE_PLEDGE_API_URL`, then rerun the frontend workflow. For local development, set it in `.env.local` instead. The URL is public configuration, not a secret.

## Data and behavior

- GET `/api/pledge`: shared count and whether this browser identifier pledged.
- POST `/api/pledge`: idempotent insert, then returns current state.
- Requests include `X-Dab-Visitor`, a random UUID stored by the frontend.
- CORS allows only configured browser origins. SQL uses bound parameters.
- D1 stores the identifier and creation timestamp; no names or emails.
- This is an anonymous novelty counter, not identity verification. CORS is not authentication or bot protection. Clearing storage permits another pledge.
- Clearing `.env.local`/the build variable disables pledges honestly; it never deletes saved rows.

`npm test` exercises the API against an in-memory SQLite database with the production SQL schema. The tests do not write to Cloudflare.

## Existing Sites pledges

The migration includes code and the schema, not the original private database contents. The new backend initially reports zero. If you want to transfer existing records later, explicitly export and import them before switching the public counter; browser identifiers on different domains do not automatically transfer.

Documentation: https://developers.cloudflare.com/d1/get-started/ and https://developers.cloudflare.com/d1/reference/migrations/
