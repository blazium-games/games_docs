// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Blazium Games Docs',
  tagline: 'Store pages, MCP, the Cursor plugin, deploys, and crash reporting for Blazium Games',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://blazium-games.github.io',
  baseUrl: '/games_docs/',

  organizationName: 'blazium-games',
  projectName: 'games_docs',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: undefined,
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: undefined,
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Blazium Games',
        logo: {
          alt: 'Blazium Games Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'sidebar',
            position: 'left',
            label: 'Docs',
          },
          {to: '/docs/mcp', label: 'MCP', position: 'left'},
          {to: '/docs/cursor-plugin', label: 'Cursor plugin', position: 'left'},
          {
            href: 'https://github.com/blazium-games/games_docs',
            label: 'GitHub',
            position: 'right',
          },
          {
            href: 'https://blazium.games',
            label: 'blazium.games',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {label: 'Introduction', to: '/docs/intro'},
              {label: 'Deploy builds', to: '/docs/deploy'},
              {label: 'Crash reporting', to: '/docs/crash-reporting'},
              {label: 'Graphical Assets Guidelines', to: '/docs/graphical_assets_guidelines'},
            ],
          },
          {
            title: 'MCP',
            items: [
              {label: 'Connect', to: '/docs/mcp'},
              {label: 'Access and keys', to: '/docs/mcp/access-and-keys'},
              {label: 'OAuth and discovery', to: '/docs/mcp/oauth'},
              {label: 'Reference', to: '/docs/mcp/reference'},
              {label: 'Cursor plugin', to: '/docs/cursor-plugin'},
            ],
          },
          {
            title: 'Legal',
            items: [
              {label: 'Terms of Service', href: 'https://blazium.games/terms-of-service'},
              {label: 'Privacy Policy', href: 'https://blazium.games/privacy-policy'},
            ],
          },
          {
            title: 'Community',
            items: [
              {label: 'Discord', href: 'https://blazium.app/chat'},
              {label: 'Twitter', href: 'https://x.com/BlaziumGames'},
              {label: 'GitHub', href: 'https://github.com/blazium-games/games_docs'},
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Blazium Games. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
