# ResearchX

ResearchX is a React + Vite frontend for an autonomous research workspace.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages

The Vite base path is configured as `/ResearchX/`. The workflow at `.github/workflows/deploy.yml` builds the app and deploys `dist/` to GitHub Pages whenever a commit is pushed to `main`.

In the repository, open **Settings → Pages → Build and deployment** and select **GitHub Actions** as the source. Then check the **Actions** tab for the deployment run.
