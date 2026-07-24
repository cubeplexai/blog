import type { Config } from '@docusaurus/types';
import type { Options as ClassicOptions } from '@docusaurus/preset-classic';
import { themes as prismThemes } from 'prism-react-renderer';

const classicOptions: ClassicOptions = {
  docs: false,
  blog: {
    routeBasePath: '/',
    showReadingTime: true,
    blogSidebarCount: 3,
    blogSidebarTitle: 'Recent posts',
    editUrl: 'https://github.com/cubeplexai/blog/edit/main/',
    feedOptions: {
      type: ['rss', 'atom', 'json'],
      title: 'CubePlex Blog',
      description: 'Product, engineering, and governance notes from CubePlex.',
      copyright: `Copyright © ${new Date().getFullYear()} CubePlex.`,
      language: 'en',
    },
  },
  theme: {
    customCss: './src/css/custom.css',
  },
  sitemap: {
    changefreq: 'weekly',
    priority: 0.5,
  },
};

const config: Config = {
  title: 'CubePlex Blog',
  tagline: 'Notes on governed agent work.',
  favicon: 'img/cubeplex-favicon.svg',
  url: 'https://cubeplex.ai',
  baseUrl: '/blog/',
  trailingSlash: false,
  organizationName: 'cubeplexai',
  projectName: 'blog',
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },
  presets: [['classic', classicOptions]],
  themeConfig: {
    image: 'https://cubeplex.ai/og.png',
    metadata: [
      {
        name: 'keywords',
        content: 'CubePlex, AI agents, AI workspace, self-hosted AI, agent governance, automation',
      },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      logo: {
        alt: 'CubePlex',
        src: 'img/cubeplex-lockup-on-light.svg',
        srcDark: 'img/cubeplex-lockup-on-dark.svg',
        href: 'https://cubeplex.ai',
        target: '_self',
        width: 140,
        height: 32,
      },
      items: [
        {
          href: 'https://cubeplex.ai/#product',
          label: 'Products',
          position: 'left',
          target: '_self',
        },
        {
          href: 'https://cubeplex.ai/docs',
          label: 'Docs',
          position: 'left',
          target: '_self',
        },
        {
          href: 'https://cubeplex.ai/blog',
          label: 'Blog',
          position: 'left',
          target: '_self',
        },
        {
          href: 'https://github.com/cubeplexai/cubeplex',
          position: 'right',
          target: '_self',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Explore',
          items: [
            { label: 'Product', href: 'https://cubeplex.ai' },
            { label: 'Documentation', href: 'https://cubeplex.ai/docs' },
            { label: 'GitHub', href: 'https://github.com/cubeplexai/cubeplex' },
          ],
        },
        {
          title: 'Blog',
          items: [
            { label: 'All posts', to: '/' },
            { label: 'RSS feed', href: 'https://cubeplex.ai/blog/rss.xml' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} CubePlex. Built for governed agent work.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
};

export default config;
