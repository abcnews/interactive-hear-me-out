const html = require('bel');
const styles = require('./SignUp.scss');

function SignUp() {
  return html`
    <div class="${styles.root}">
      <div class="${styles.graphic}"></div>
    </div>
  `;
}

module.exports = SignUp;
