import html from 'bel';
import styles from './SignUp.scss';

function SignUp({ formEl, className }) {
  formEl.className = className;

  return html`
    <div class="${styles.root}">
      <div class="${styles.graphic}"></div>
      ${formEl}
    </div>
  `;
}

export default SignUp;
