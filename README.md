# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## SRCova and Supabase

The initial database schema and row-level security policies are in `supabase/migrations/20261115000000_srcova_initial_schema.sql`.

1. Create a Supabase project.
2. Run the migration in the Supabase SQL Editor (or apply it with the Supabase CLI).
3. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the project API settings.
4. Provision staff through a trusted administrative process and create matching `profiles` rows. Do not enable public sign-up or put a service-role key in the browser app.

The current UI still uses its browser-local demo storage and authentication. Connecting the workflows to Supabase, provisioning users, and configuring private document storage require a live project and are not completed by the schema migration alone.

Staff password creation and reset currently operate only in that local demo mode. New and changed passwords are PBKDF2-hashed in the browser, and legacy demo accounts are rehashed after successful sign-in; temporary passwords must be changed at first sign-in. Browser storage and client-side role checks are not a production security boundary. Production staff access and administrator resets must be implemented through Supabase Auth and a server-side administrative function. Never put a Supabase service-role key in the browser app.
