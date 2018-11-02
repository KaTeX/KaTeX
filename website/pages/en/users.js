/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const {Container} = require('../../core/CompLibrary.js');

const siteConfig = require(process.cwd() + '/siteConfig.js');

class Users extends React.Component {
    render() {
        if ((siteConfig.users || []).length === 0) {
            return null;
        }
        const editUrl = siteConfig.repoUrl + '/edit/master/website/siteConfig.js';
        const showcase = siteConfig.users.map((user, i) => {
            return (
              <a href={user.infoLink} key={i}>
                <div className="imgbox">
                  <img src={user.image} alt={user.caption} title={user.caption} />
                </div>
                <p>{user.caption}</p>
              </a>
            );
        });

        return (
          <div className="mainContainer">
            <Container padding={['bottom', 'top']}>
              <div className="showcaseSection">
                <div className="prose">
                  <h1>Who is Using KaTeX?</h1>
                  <p>KaTeX is used by many projects:</p>
                </div>
                <div className="logos">{showcase}</div>
                <p>Are you using KaTeX?</p>
                <a href={editUrl} className="button">
                  Add your project
                </a>
              </div>
            </Container>
          </div>
        );
    }
}

module.exports = Users;
