const html = require('bel');
const styles = require('./SignUp.scss');

function SignUp({ formEl, className }) {
  formEl.className = className;

  return html`
    <div class="${styles.root}">
      <div class="${styles.graphic}"></div>
      ${formEl}
    </div>
  `;
}

module.exports = SignUp;
