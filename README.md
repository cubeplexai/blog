# CubePlex Blog

The official CubePlex blog. It is a standalone Docusaurus site published to
Cloudflare Pages and served at `https://cubeplex.ai/blog` by the main-domain
blog proxy Worker.

## Local development

```bash
pnpm install
pnpm start
```

## Validation

```bash
pnpm check
```

## Publishing

The GitHub Actions workflow validates every pull request. Once `CF_API_TOKEN`
and `CF_ACCOUNT_ID` are configured as repository secrets, a push to `main`
publishes the verified static build to the `cubeplex-blog` Cloudflare Pages
project. The blog proxy Worker in `cubeplexai/website` exposes that Pages
project beneath `cubeplex.ai/blog`.

See [deployment secrets](.github/SECRETS.md) for the one-time CI setup.
