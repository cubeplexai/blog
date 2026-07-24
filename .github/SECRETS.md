# Cloudflare deployment secrets

The blog is already deployed to the `cubeplex-blog` Cloudflare Pages project.
To enable automatic production deploys from GitHub Actions, configure these
repository secrets under `Settings → Secrets and variables → Actions`:

| Secret | Purpose |
| --- | --- |
| `CF_API_TOKEN` | A long-lived Cloudflare API token with Cloudflare Pages edit access. |
| `CF_ACCOUNT_ID` | The Cloudflare account ID that owns `cubeplex-blog`. |

The blog proxy Worker is deployed from the `cubeplexai/website` repository and
uses that repository's existing Cloudflare deployment secrets.
