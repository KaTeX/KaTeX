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

/* List of projects/orgs using your project for the users page */
const users = [
    {
        caption: 'Bokeh',
        image: 'https://bokeh.pydata.org/en/latest/_static/images/logo.png',
        infoLink: 'https://bokeh.pydata.org/',
        pinned: true,
    },
    {
        caption: 'CindyJS',
        image: 'https://cindyjs.org/assets/img/logo.png',
        infoLink: 'https://cindyjs.org/',
        pinned: true,
    },
    {
        caption: 'Dropbox Paper',
        image: 'https://aem.dropbox.com/cms/content/dam/dropbox/www/en-us/branding/app-paper-ios@2x.png',
        infoLink: 'https://paper.dropbox.com/',
        pinned: true,
    },
    {
        caption: 'Expii',
        image: 'https://78.media.tumblr.com/avatar_ccde3e53e98f_128.pnj',
        infoLink: 'https://www.expii.com/',
        pinned: true,
    },
    {
        caption: 'Facebook Messenger',
        image: 'https://en.facebookbrand.com/wp-content/uploads/2016/09/messenger_icon2.png',
        infoLink: 'https://www.messenger.com/',
        pinned: true,
    },
    {
        caption: 'GitLab',
        image: 'https://gitlab.com/gitlab-com/gitlab-artwork/raw/master/logo/logo-square.png',
        infoLink: 'https://gitlab.com/',
        pinned: true,
    },
    {
        caption: 'Gitter',
        image: 'https://assets.gitlab-static.net/uploads/-/system/project/avatar/3601513/gitter_logo.png',
        infoLink: 'https://gitter.im/',
        pinned: true,
    },
    {
        caption: 'Gradescope',
        image: 'https://pbs.twimg.com/profile_images/920085750095298560/AqGnlpiJ_400x400.jpg',
        infoLink: 'https://www.gradescope.com/',
        pinned: true,
    },
    {
        caption: 'hack.chat',
        image: 'https://hack.chat/apple-icon-180x180.png',
        infoLink: 'https://hack.chat/',
        pinned: true,
    },
    {
        caption: 'Khan Academy',
        image: 'https://pbs.twimg.com/profile_images/1021871312195612673/MlailSlw_400x400.jpg',
        infoLink: 'https://www.khanacademy.org/',
        pinned: true,
    },
    {
        caption: 'Observable',
        image: 'https://pbs.twimg.com/profile_images/970805785503477760/HfTZJiZo_400x400.jpg',
        infoLink: 'https://beta.observablehq.com/',
        pinned: true,
    },
    {
        caption: 'Slides',
        image: 'https://s3.amazonaws.com/uploads.uservoice.com/logo/design_setting/116173/original/slides-symbol-150x150.png?1375394320',
        infoLink: 'https://slides.com/',
        pinned: true,
    },
    {
        caption: 'Spinning Numbers',
        image: 'https://spinningnumbers.org/i/sn_logo2.svg',
        infoLink: 'https://spinningnumbers.org/',
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

    markdownPlugins: [require('./remarkableKatex'), require('./empty_thead')],

    scripts: [
        'https://buttons.github.io/buttons.js',
        baseUrl + 'js/scrollspy.js',
    ],
    stylesheets: ['https://cdn.jsdelivr.net/npm/katex@0.10.0-beta/dist/katex.min.css'],

    separateCss: ['static/static', 'static\\static'],

    /* On page navigation for the current documentation page */
    onPageNav: 'separate',

    /* Open Graph and Twitter card images */
    ogImage: 'img/og_logo.png',
    twitterImage: 'img/og_logo.png',

    repoUrl: 'https://github.com/Khan/KaTeX',
};

module.exports = siteConfig;
