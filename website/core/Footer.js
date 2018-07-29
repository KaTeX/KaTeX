/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

class Footer extends React.Component {
    docUrl(doc, language) {
        const baseUrl = this.props.config.baseUrl;
        return baseUrl + 'docs/' + (language && language !== 'en'
            ? language + '/' : '') + doc;
    }

    pageUrl(doc, language) {
        const baseUrl = this.props.config.baseUrl;
        return baseUrl + (language && language !== 'en'
            ? language + '/' : '') + doc;
    }

    render() {
        return (
          <footer className="nav-footer" id="footer">
            <section className="sitemap">
              <a href={this.props.config.baseUrl} className="nav-home">
                {this.props.config.footerIcon && (
                  <img
                    src={this.props.config.baseUrl + this.props.config.footerIcon}
                    alt={this.props.config.title}
                    width="66"
                    height="58"
                  />
                )}
              </a>
              <div>
                <h5>Docs</h5>
                <a href={this.docUrl('node.html', this.props.language)}>
                  Installation
                </a>
                <a href={this.docUrl('api.html', this.props.language)}>
                  Usage
                </a>
                <a href={this.docUrl('options.html', this.props.language)}>
                  Configuration
                </a>
                <a href={this.docUrl('supported.html', this.props.language)}>
                  Misc
                </a>
              </div>
              <div>
                <h5>Community</h5>
                <a href={this.pageUrl('users.html', this.props.language)}>
                  Who is using KaTeX?
                </a>
                <a href="https://gitter.im/Khan/KaTeX">Gitter Chat</a>
                <a
                  href="http://stackoverflow.com/questions/tagged/katex"
                  target="_blank"
                  rel="noreferrer noopener">
                  Stack Overflow
                </a>
              </div>
              <div>
                <h5>More</h5>
                <a
                  className="github-button"
                  href={this.props.config.repoUrl}
                  data-icon="octicon-star"
                  data-count-href="/Khan/KaTeX/stargazers"
                  data-show-count={true}
                  data-count-aria-label="# stargazers on GitHub"
                  aria-label="Star this project on GitHub">
                  Star
                </a>
              </div>
            </section>

            <a
              href="https://www.khanacademy.org/"
              target="_blank" // eslint-disable-line react/jsx-no-target-blank
              className="fbOpenSource">
              <img
                src={this.props.config.baseUrl + 'img/khan-academy.png'}
                alt="Khan Academy"
                width="180"
                height="17"
              />
            </a>
            <section className="copyright">{this.props.config.copyright}</section>
          </footer>
        );
    }
}

module.exports = Footer;
