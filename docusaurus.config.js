const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'Proxily',
  tagline: 'Complete State Management for React Apps',
  url: 'https://selsamman.github.io',
  baseUrl: '/proxily/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'selsamman', // Usually your GitHub org/user name.
  projectName: 'proxily', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: '',
      logo: {
        alt: 'Proxily',
        src: 'img/proxily.svg',
      },
      items: [
        {
          type: 'doc',
          docId: 'Introduction/intro',
          position: 'left',
          label: 'Documentation',
        },
       ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Examples',
          items: [
            {
              label: 'Classic ToDo',
              to: 'https://github.com/selsamman/proxily_react_todo_classic',
            },
            {
              label: 'Enhanced ToDo',
              to: 'https://github.com/selsamman/proxily-react-todo',
            },
            {
              label: 'React Native',
              to: 'https://github.com/selsamman/proxily-expo-todo',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/selsamman/proxily',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Sam Elsamman`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/selsamman/proxily-doc/edit/master/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/selsamman/proxily-doc/edit/master/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ]
};
