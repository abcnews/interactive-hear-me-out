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

const TAPE_BGS = [
  require('./tape-purple.png'),
  require('./tape-red.png'),
  require('./tape-teal.png')
];

const CARD_BGS = [
  '#FFFFFF',
  '#F5F5F5',
  '#FFFCF2'
];

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
      app.classList.remove(styles.hasActive);

      return;
    }

    views.forEach((view, index) => {
      view.tab.setAttribute('aria-selected', nextIndex === index ? 'true' : 'false');
      view.panel.setAttribute('aria-hidden', nextIndex === index ? 'false' : 'true');

      if (nextIndex === index) {
        activeIndex = nextIndex;

        view.embed.querySelector('.VideoPlayer').api.play();
        isScrolling = true;
        scrollIn(view.embed, EMBED_IN_CONFIG, () => {
          isScrolling = false;
          view.embed.querySelector('.VideoPlayer-playback').focus();
        });

        if (view.nextEl && !view.onEnd) {
          view.onEnd = () => scrollIn(view.nextEl, NEXT_IN_CONFIG);
          view.embed.querySelector('video').addEventListener('ended', view.onEnd);
        }
        
      }
    });

    app.classList.add(styles.isUsed);
    app.classList.add(styles.hasActive);
  }

  before.forEach(el => el.classList.add(styles.before));

  const tapeBGs = [...TAPE_BGS];
  const cardBGs = [...CARD_BGS];

  const views = options.map((option, index) => {
    const id = nextId++;
    const angle = (.5 + Math.random()) * (Math.random() > .5 ? 1 : -1);
    const tapeBG = tapeBGs.length ? tapeBGs.splice(Math.floor(Math.random() * tapeBGs.length), 1) : TAPE_BGS[0];
    const cardBG = cardBGs.length ? cardBGs.splice(Math.floor(Math.random() * cardBGs.length), 1) : CARD_BGS[0];

    return {
      tab: html`
        <button
          class="${styles.tab}"
          id="${styles.tab}_${id}"
          role="tab"
          aria-controls="${styles.panel}_${id}"
          aria-selected="false"
          onclick=${activate.bind(null, index)}>
          <div class="${styles.tape}" style="background-image: url(${tapeBG})">${option.prefix ? `${option.prefix}:` : ''}</div>
          <div class="${styles.card}" style="transform: rotate(${angle}deg); background-color: ${cardBG}">
            <div class="${option.label.length < 50 ? styles.handwriting : styles.smallerHandwriting}">${option.label}</div>
          </div>
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
