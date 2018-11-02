/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config.html for all the possible
// site configuration options.

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
        image: '/img/expii_logo.png',
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
        image: '/img/gradescope_logo.png',
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
        caption: 'Interactive Mathematics',
        image: 'https://www.intmath.com/intmath-logo.svg',
        infoLink: 'https://www.intmath.com/',
    },
    {
        caption: 'Messenger',
        image: 'https://en.facebookbrand.com/wp-content/uploads/2016/09/messenger_icon2.png',
        infoLink: 'https://www.messenger.com/',
    },
    {
        caption: 'namu.wiki',
        image: '/img/namuwiki_logo.png',
        infoLink: 'https://namu.wiki/',
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
        image: 'https://cdn.rawgit.com/RocketChat/Rocket.Chat.Artwork/1f7b68b78878fcef47f32aa0965930a1c12cd0b4/Logos/icon.svg',
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
    url: 'https://katex.org',
    baseUrl: '/',

    // Used for publishing and more
    projectName: 'KaTeX',
    organizationName: 'Khan',

    headerLinks: [
        {href: '/#demo', label: 'Try'},
        {doc: 'node', label: 'Docs'},
        {page: 'users', label: 'Users'},
        {href: 'https://github.com/Khan/KaTeX', label: 'GitHub'},
        {search: true},
    ],
    users,

    /* path to images for header/footer */
    headerIcon: 'img/katex-logo.svg',
    footerIcon: 'img/katex-logo.svg',
    favicon: '../favicon.ico',

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
        require('./lib/remarkable-katex'),
        require('./lib/empty-thead'),
    ],

    scripts: [
        'https://buttons.github.io/buttons.js',
        '/js/scrollspy.js',
    ],

    separateCss: ['static/static', 'static\\static'],

    algolia: {
        apiKey: '46ecd80046d78d4e5d9a5c06f559dfaa',
        indexName: 'katex',
        algoliaOptions: {
            facetFilters: ['language:LANGUAGE', 'version:VERSION'],
        },
    },

    /* On page navigation for the current documentation page */
    onPageNav: 'separate',

    /* Open Graph and Twitter card images */
    ogImage: 'img/og_logo.png',
    twitterImage: 'img/og_logo.png',

    repoUrl: 'https://github.com/Khan/KaTeX',
};

module.exports = siteConfig;
