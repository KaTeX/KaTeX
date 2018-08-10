/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config.html for all the possible
// site configuration options.

// If BASE_URL environment variable is set, use it as baseUrl.
// If on netlify, use '/'. Otherwise use '/KaTeX/'.
const baseUrl = process.env.BASE_URL || (process.env.CONTEXT ? '/' : '/KaTeX/');

// Plugin for Remarkable to inject variables
const {Plugin: Embed} = require('remarkable-embed');
const embed = new Embed();

// {@stylesheet: path}
embed.register('stylesheet',
    path => `<link rel="stylesheet" href="${baseUrl}${path}"/>`);

/* List of projects/orgs using your project for the users page */
const users = [
    {
        caption: 'GitLab',
        image: 'https://gitlab.com/gitlab-com/gitlab-artwork/raw/master/logo/logo-square.png',
        infoLink: 'https://gitlab.com/',
        pinned: true,
    },
];

const siteConfig = {
    title: 'KaTeX',
    tagline: 'The fastest math typesetting library for the web',
    url: 'https://khan.github.io',
    baseUrl,

    // Used for publishing and more
    projectName: 'KaTeX',
    organizationName: 'Khan',

    headerLinks: [
        {href: baseUrl + '#demo', label: 'Try'},
        {doc: 'node', label: 'Docs'},
        {page: 'users', label: 'Users'},
        {href: 'https://github.com/Khan/KaTeX', label: 'GitHub'},
        {search: true},
    ],
    users,

    /* path to images for header/footer */
    headerIcon: 'img/katex-logo.svg',
    footerIcon: 'img/katex-logo.svg',
    favicon: 'https://khan.github.io/favicon.ico',

    disableHeaderTitle: true,

    /* colors for website */
    colors: {
        primaryColor: '#329894',
        secondaryColor: '#266e6c',
    },

    // This copyright info is used in /core/Footer.js and blog rss/atom feeds.
    copyright:
    'Copyright © ' +
    new Date().getFullYear() +
    ' Khan Academy',

    highlight: {
        // Highlight.js theme to use for syntax highlighting in code blocks
        theme: 'default',
    },

    markdownPlugins: [
        embed.hook,
        require('./lib/remarkableKatex'),
        require('./lib/empty_thead'),
    ],

    scripts: [
        'https://buttons.github.io/buttons.js',
        baseUrl + 'js/scrollspy.js',
    ],

    separateCss: ['static/static', 'static\\static'],

    /* On page navigation for the current documentation page */
    onPageNav: 'separate',

    /* Open Graph and Twitter card images */
    ogImage: 'img/og_logo.png',
    twitterImage: 'img/og_logo.png',

    repoUrl: 'https://github.com/Khan/KaTeX',
};

module.exports = siteConfig;
