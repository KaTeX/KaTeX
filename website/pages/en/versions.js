/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const fs = require('fs');
const React = require('react');

const {Container} = require('../../core/CompLibrary');

const CWD = process.cwd();

const {title, baseUrl, repoUrl} = require(`${CWD}/siteConfig.js`);
const {version: latestVersion} = require(`${CWD}/../package.json`);
const prevVersions = fs.existsSync(`${CWD}/prev-versions.json`)
    ? require(`${CWD}/prev-versions.json`) : [];

function Versions(props) {
    const language = props.language && props.language !== 'en' ?
        props.language + '/' : '';
    return (
        <div className="docMainWrapper wrapper">
        <Container className="mainContainer versionsContainer">
          <div className="post">
            <header className="postHeader">
              <h1>{title} Versions</h1>
            </header>
            <h3 id="latest">Current version (Stable)</h3>
            <p>Latest version of KaTeX.</p>
            <table className="versions">
              <tbody>
                <tr>
                  <th>{latestVersion}</th>
                  <td>
                    <a
                      href={`${baseUrl}docs/${language}node.html`}>
                      Documentation
                    </a>
                  </td>
                  <td>
                    <a href={`${repoUrl}/releases/tag/v${latestVersion}`}>
                      Release Notes
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
            <h3 id="archive">Past Versions</h3>
            <p>
              Here you can find documentation for previous versions of KaTeX.
            </p>
            <table className="versions">
              <tbody>
                {prevVersions.map(
                  version =>
                    version.name !== latestVersion && (
                      <tr key={version.name}>
                        <th>{version.name}</th>
                        <td>
                          <a href={`https://${
                              version.id
                            }--katex.netlify.app/docs/${language}`}>
                            Documentation
                          </a>
                        </td>
                        <td>
                          <a href={`${repoUrl}/releases/tag/v${version.name}`}>
                            Release Notes
                          </a>
                        </td>
                      </tr>
                    )
                )}
              </tbody>
            </table>
            <p>
              You can find past versions of KaTeX on{' '}
              <a href={`${repoUrl}/releases`}>GitHub</a>.
            </p>
          </div>
        </Container>
      </div>
    );
}

Versions.title = 'Versions';

module.exports = Versions;
