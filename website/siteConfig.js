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
    path => `<link rel="stylesheet" href="${baseUrl}static/${path}"/>`);

/* List of projects/orgs using your project for the users page */
const users = [
    {
        caption: 'Khan Academy',
        image: 'https://avatars0.githubusercontent.com/u/15455',
        infoLink: 'https://www.khanacademy.org/',
    },
    {
        caption: 'CindyJS',
        image: 'https://cindyjs.org/assets/img/logo.png',
        infoLink: 'https://cindyjs.org/',
    },
    {
        caption: 'CoCalc',
        image: 'https://cdn.rawgit.com/sagemathinc/cocalc/baa4fc57/src/webapp-lib/cocalc-logo.svg',
        infoLink: 'https://cocalc.com/',
    },
    {
        caption: 'Dropbox Paper',
        image: 'https://aem.dropbox.com/cms/content/dam/dropbox/www/en-us/branding/app-paper-ios@2x.png',
        infoLink: 'https://paper.dropbox.com/',
    },
    {
        caption: 'Editor.md',
        image: 'https://pandao.github.io/editor.md/images/logos/editormd-logo-180x180.png',
        infoLink: 'https://pandao.github.io/editor.md/en.html',
    },
    {
        caption: 'Expii',
        image: baseUrl + 'img/expii_logo.png',
        infoLink: 'https://www.expii.com/',
    },
    {
        caption: 'GitLab',
        image: 'https://gitlab.com/gitlab-com/gitlab-artwork/raw/master/logo/logo-square.png',
        infoLink: 'https://gitlab.com/',
    },
    {
        caption: 'Gatsby',
        image: 'https://www.gatsbyjs.org/monogram.svg',
        infoLink: 'https://www.gatsbyjs.org/',
    },
    {
        caption: 'Gitter',
        image: 'https://assets.gitlab-static.net/uploads/-/system/project/avatar/3601513/gitter_logo.png',
        infoLink: 'https://gitter.im/',
    },
    {
        caption: 'Gradescope',
        image: baseUrl + 'img/gradescope_logo.png',
        infoLink: 'https://www.gradescope.com/',
    },
    {
        caption: 'hack.chat',
        image: 'https://hack.chat/apple-icon-180x180.png',
        infoLink: 'https://hack.chat/',
    },
    {
        caption: 'Idyll',
        image: 'https://cdn.rawgit.com/idyll-lang/idyll-lang.github.io/src/images/logo.svg',
        infoLink: 'https://idyll-lang.org/',
    },
    {
        caption: 'Messenger',
        image: 'https://en.facebookbrand.com/wp-content/uploads/2016/09/messenger_icon2.png',
        infoLink: 'https://www.messenger.com/',
    },
    {
        caption: 'Observable',
        image: 'https://pbs.twimg.com/profile_images/970805785503477760/HfTZJiZo_400x400.jpg',
        infoLink: 'https://beta.observablehq.com/',
    },
    {
        caption: 'Quill',
        image: 'https://quilljs.com/assets/images/logo.svg',
        infoLink: 'https://quilljs.com/',
    },
    {
        caption: 'Rocket.Chat',
        image: 'https://cdn.rawgit.com/RocketChat/Rocket.Chat.Artwork/master/Logos/icon.svg',
        infoLink: 'https://rocket.chat/',
    },
    {
        caption: 'Slides',
        image: 'https://s3.amazonaws.com/uploads.uservoice.com/logo/design_setting/116173/original/slides-symbol-150x150.png',
        infoLink: 'https://slides.com/',
    },
    {
        caption: 'Spinning Numbers',
        image: 'https://spinningnumbers.org/i/sn_logo2.svg',
        infoLink: 'https://spinningnumbers.org/',
    },
    {
        caption: 'StackEdit',
        image: 'https://cdn.rawgit.com/benweet/stackedit/0632445a/src/assets/iconStackedit.svg',
        infoLink: 'https://stackedit.io/',
    },
    {
        caption: 'Vade Mecum Shelf',
        image: 'https://cdn.rawgit.com/tonton-pixel/vade-mecum-shelf/43013aec/icons/icon.png',
        infoLink: 'https://github.com/tonton-pixel/vade-mecum-shelf/',
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
        require('./lib/remarkable-katex'),
        require('./lib/empty-thead'),
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
