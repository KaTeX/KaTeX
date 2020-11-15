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
        image: '/img/khan-academy.png',
        infoLink: 'https://www.khanacademy.org/',
    },
    {
        caption: 'CindyJS',
        image: 'https://cindyjs.org/assets/img/logo.png',
        infoLink: 'https://cindyjs.org/',
    },
    {
        caption: 'CoCalc',
        image: '/img/cocalc_logo.svg',
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
        image: 'https://www.gatsbyjs.com/Gatsby-Monogram.svg',
        infoLink: 'https://www.gatsbyjs.com/',
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
        image: 'https://idyll-lang.org/static/images/logo.svg',
        infoLink: 'https://idyll-lang.org/',
    },
    {
        caption: 'Interactive Mathematics',
        image: 'https://www.intmath.com/intmath-logo.svg',
        infoLink: 'https://www.intmath.com/',
    },
    {
        caption: 'Marker',
        image: 'https://raw.githubusercontent.com/fabiocolacio/Marker/master/data/com.github.fabiocolacio.marker.svg',
        infoLink: 'https://fabiocolacio.github.io/Marker/',
    },
    {
        caption: 'MathWills',
        image: '/img/mathwills_logo.svg',
        infoLink: 'https://www.mathwills.com/',
    },
    {
        caption: 'Messenger',
        image: 'https://en.facebookbrand.com/wp-content/uploads/2016/09/messenger_icon2.png',
        infoLink: 'https://www.messenger.com/',
    },
    {
        caption: 'MonsterWriter',
        image: 'https://www.monsterwriter.app/assets/logo.png',
        infoLink: 'https://www.monsterwriter.app/',
    },
    {
        caption: 'namu.wiki',
        image: '/img/namuwiki_logo.png',
        infoLink: 'https://namu.wiki/',
    },
    {
        caption: 'Notable',
        image: 'https://notable.app/static/images/logo_app.png',
        infoLink: 'https://notable.app',
    },
    {
        caption: 'Observable',
        image: 'https://avatars0.githubusercontent.com/u/30080011',
        infoLink: 'https://observablehq.com/',
    },
    {
        caption: 'Quill',
        image: 'https://quilljs.com/assets/images/logo.svg',
        infoLink: 'https://quilljs.com/',
    },
    {
        caption: 'Rocket.Chat',
        image: '/img/rocketchat_logo.svg',
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
        image: '/img/stackedit_logo.svg',
        infoLink: 'https://stackedit.io/',
    },
    {
        caption: 'Tutti Quanti Shelf',
        image: 'https://raw.githubusercontent.com/tonton-pixel/tutti-quanti-shelf/master/icons/icon.png',
        infoLink: 'https://github.com/tonton-pixel/tutti-quanti-shelf/',
    },
    {
        caption: 'Vade Mecum Shelf',
        image: '/img/vade_mecum_shelf_logo.png',
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
    organizationName: 'KaTeX',

    headerLinks: [
        {href: '/#demo', label: 'Try'},
        {doc: 'node', label: 'Docs'},
        {page: 'users', label: 'Users'},
        {href: 'https://github.com/KaTeX/KaTeX', label: 'GitHub'},
        {search: true},
    ],
    users,

    /* path to images for header/footer */
    headerIcon: 'img/katex-logo.svg',
    footerIcon: 'img/katex-logo.svg',
    favicon: '../favicon.ico',

    disableHeaderTitle: true,
    scrollToTop: true,

    /* colors for website */
    colors: {
        primaryColor: '#329894',
        secondaryColor: '#266e6c',
    },

    // This copyright info is used in /core/Footer.js and blog rss/atom feeds.
    copyright:
    'Copyright © ' +
    new Date().getFullYear() +
    ' Khan Academy and other contributors',

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

    repoUrl: 'https://github.com/KaTeX/KaTeX',
};

module.exports = siteConfig;
