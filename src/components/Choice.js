import html from 'bel';
import scrollIntoView from 'scroll-into-view';
import styles from './Choice.scss';

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
  `${__webpack_public_path__}tape-a.png`,
  `${__webpack_public_path__}tape-b.png`,
  `${__webpack_public_path__}tape-c.png`
];
const CARD_BGS = [
  `${__webpack_public_path__}card-a.png`,
  `${__webpack_public_path__}card-b.png`,
  `${__webpack_public_path__}card-c.png`
];

const CLIENT_ID = Date.now();

const portraitOrientationMQL = window.matchMedia("(orientation: portrait)");
let nextId = 0;
let isScrolling;
let activationCount = 0;
let lastActivatedAPI = null;

function Choice({
  before,
  hasManualPlayback = false,
  isVariant = false,
  nextEl,
  options
}) {
  const isFirst = nextId === 0;
  let activeIndex;

  function activate(nextIndex, event) {
    if (isScrolling) {
      return;
    }

    if (lastActivatedAPI) {
      lastActivatedAPI.pause();
      lastActivatedAPI = null;
    }

    if (nextIndex === activeIndex) {
      views[activeIndex].tab.setAttribute("aria-selected", "false");
      views[activeIndex].panel.setAttribute("aria-hidden", "true");
      views[activeIndex].embed.querySelector(".VideoPlayer").api.pause();

      activeIndex = null;
      root.classList.remove(styles.hasActive);

      return;
    }

    views.forEach((view, index) => {
      const api = view.embed.querySelector(".VideoPlayer").api;

      view.tab.setAttribute(
        "aria-selected",
        nextIndex === index ? "true" : "false"
      );
      view.panel.setAttribute(
        "aria-hidden",
        nextIndex === index ? "false" : "true"
      );

      if (nextIndex === index) {
        activeIndex = nextIndex;
        lastActivatedAPI = api;

        if (!hasManualPlayback) {
          api.play();
        }

        if (!api.hasNativeUI) {
          isScrolling = true;
          scrollIn(view.embed, EMBED_IN_CONFIG, () => {
            isScrolling = false;
            view.embed.querySelector(".VideoPlayer-playback").focus();
          });

          if (view.nextEl && portraitOrientationMQL.matches && !view.onEnd) {
            view.onEnd = () => {
              isScrolling = true;
              scrollIn(view.nextEl, NEXT_IN_CONFIG, () => {
                isScrolling = false;
              });
            };
            view.embed
              .querySelector("video")
              .addEventListener("ended", view.onEnd);
          }
        }
      }
    });

    root.classList.add(styles.isUsed);
    root.classList.add(styles.hasActive);
  }

  before.forEach(el => el.classList.add(styles.before));

  const tapeBGs = [...TAPE_BGS];
  const cardBGs = [...CARD_BGS];
  const oddRotationDirection = Math.random() > 0.5 ? 1 : -1;

  const views = options.map((option, index) => {
    const id = nextId++;
    const angle =
      (0.5 + Math.random()) *
      (index % 2 ? oddRotationDirection : oddRotationDirection * -1);
    const tapeBG = tapeBGs.length
      ? tapeBGs.splice(Math.floor(Math.random() * tapeBGs.length), 1)
      : TAPE_BGS[0];
    const cardBG = cardBGs.length
      ? cardBGs.splice(Math.floor(Math.random() * cardBGs.length), 1)
      : CARD_BGS[0];

    return {
      tab: html`
        <button
          class="${styles.tab}"
          id="${styles.tab}_${id}"
          role="tab"
          aria-controls="${styles.panel}_${id}"
          aria-selected="false"
          onclick=${activate.bind(null, index)}
        >
          <div class="${styles.tape}" style="background-image: url(${tapeBG})">
            ${option.prefix ? `${option.prefix}:` : ""}
          </div>
          <div
            class="${styles.card}"
            style="transform: rotate(${angle}deg); background-image: url(${cardBG})"
          >
            <div
              class="${option.label.length < 38
                ? styles.handwriting
                : option.label.length < 54
                ? styles.smallerHandwriting
                : styles.smallestHandwriting}"
            >
              ${option.label}
            </div>
          </div>
        </button>
      `,
      panel: html`
        <p
          class="${styles.panel}"
          id="${styles.panel}_${id}"
          role="tabpanel"
          aria-hidden="true"
          aria-labelledby="${styles.tab}_${id}"
        >
          ${option.embed} ${option.after}
        </p>
      `,
      embed: option.embed,
      nextEl: option.after.length ? option.after[0] : nextEl
    };
  });

  const root = html`
    <div
      class="${styles.root}${isFirst ? ` ${styles.isFirst}` : ""}${isVariant
        ? ` ${styles.isVariant}`
        : ""} u-full"
    >
      <div class="u-layout u-richtext-invert">
        ${before}
        <ul class="u-pull" role="tablist">
          ${views.map(
            view => html`
              <li>${view.tab}</li>
            `
          )}
        </ul>
        ${views.map(view => view.panel)}
      </div>
    </div>
  `;

  return root;
}

function scrollIn(el, options = {}, callback) {
  setTimeout(scrollIntoView.bind(null, el, options, callback), options.delay);
}

export default Choice;
