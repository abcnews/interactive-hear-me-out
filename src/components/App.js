const html = require('bel');
const scrollIntoView = require('scroll-into-view');
const styles = require('./App.scss');

const EMBED_IN_CONFIG = {
  delay: 250
};

const NEXT_IN_CONFIG = {
  align: {
    top: 0,
    topOffset: 64
  },
  delay: 500
};

let nextId = 0;
let isScrolling;

function App({before, options, nextEl}) {
  let activeIndex;


  function activate(nextIndex) {
    if (isScrolling) {
      return;
    }

    if (nextIndex === activeIndex) {
      views[activeIndex].tab.setAttribute('aria-selected', 'false');
      views[activeIndex].panel.setAttribute('aria-hidden', 'true');
      views[activeIndex].embed.querySelector('.VideoPlayer').api.pause();

      activeIndex = null;

      return;
    }

    views.forEach((view, index) => {
      view.tab.setAttribute('aria-selected', nextIndex === index ? 'true' : 'false');
      view.panel.setAttribute('aria-hidden', nextIndex === index ? 'false' : 'true');

      if (nextIndex === index) {
        activeIndex = nextIndex;

        view.embed.querySelector('.VideoPlayer').api.play();
        view.embed.querySelector('.VideoPlayer-playback').focus();
        isScrolling = true;
        scrollIn(view.embed, EMBED_IN_CONFIG, () => isScrolling = false);

        if (view.nextEl && !view.onEnd) {
          view.onEnd = () => scrollIn(view.nextEl, NEXT_IN_CONFIG);
          view.embed.querySelector('video').addEventListener('ended', view.onEnd);
        }
        
      }
    });

    app.classList.add(styles.isUsed);
  }

  before.forEach(el => el.classList.add(styles.before));

  const views = options.map((option, index) => {
    const id = nextId++;
    
    return {
      tab: html`
        <button
          class="${styles.tab}"
          id="${styles.tab}_${id}"
          role="tab"
          aria-controls="${styles.panel}_${id}"
          aria-selected="false"
          onclick=${activate.bind(null, index)}>
          ${option.prefix ? html`<small>${option.prefix}:</small>`  : null}
          <em>${option.label}</em>
        </button>
      `,
      panel: html`
        <p
          class="${styles.panel}"
          id="${styles.panel}_${id}"
          role="tabpanel"
          aria-hidden="true"
          aria-labelledby="${styles.tab}_${id}">
          ${option.embed}
          ${option.after}
        </p>
      `,
      embed: option.embed,
      nextEl: option.after.length ? option.after[0] : nextEl
    };
  });

  const app = html`
    <div class="${styles.root} u-full">
      <div class="u-layout u-richtext-invert">
        ${before}
        <ul class="u-pull" role="tablist">
          ${views.map(view => html`
          <li>${view.tab}</li>
          `)}
        </ul>
        ${views.map(view => view.panel)}
      </div>
    </div>
  `;

  return app;
}

function scrollIn(el, options = {}, callback) {
  setTimeout(scrollIntoView.bind(null, el, options, callback), options.delay);
}

module.exports = App;
