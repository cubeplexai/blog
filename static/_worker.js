// Cloudflare Pages advanced-mode Worker for the blog origin. The public
// cubeplex.ai/blog proxy strips the /blog prefix before reaching this origin.
// Pages redirects bare directories to trailing-slash paths, so fetch the
// directory asset internally and keep the public canonical URL slashless.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
      return Response.redirect(url.toString(), 301);
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status < 300 || response.status >= 400) return response;

    const location = response.headers.get('Location');
    if (!location) return response;

    const target = new URL(location, url);
    if (target.pathname === `${url.pathname}/`) {
      const directoryUrl = new URL(url);
      directoryUrl.pathname = `${url.pathname}/`;
      return env.ASSETS.fetch(new Request(directoryUrl, request));
    }

    return response;
  },
};
