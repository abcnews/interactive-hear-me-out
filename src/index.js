// const firebase = require('firebase/app');
// require('firebase/database');
require('./global.scss');
const Choice = require('./components/Choice');
const SignUp = require('./components/SignUp');

// const FIREBASE_APP_CONFIG = {
//   apiKey: 'AIzaSyAusxft-89QJTGT-wG5TT2rZfvOYYYZy7s',
//   authDomain: 'experiments-17971.firebaseapp.com',
//   databaseURL: 'https://experiments-17971.firebaseio.com',
//   storageBucket: 'experiments-17971.appspot.com'
// };
// const EXPERIMENT_REF = 'interactive-hear-me-out/card-style';

// firebase.initializeApp(FIREBASE_APP_CONFIG);

// function initWithExperiment(api) {
//   const database = firebase.database();
//   const ref = database.ref(EXPERIMENT_REF);
//   let wasCalled;

//   ref.once('value', snapshot => {
//     if (wasCalled) {
//       return;
//     }

//     wasCalled = true;

//     const variations = snapshot.val();
//     const variation = Object.keys(variations).sort((x, y) => variations[x] - variations[y])[0];

//     database.ref(`${EXPERIMENT_REF}/${variation}`).transaction(
//       count => count + 1,
//       () => {
//         database.goOffline();
//       }
//     );

//     init(api, variation === 'b');
//   });

//   setTimeout(() => {
//     if (wasCalled) {
//       return;
//     }

//     wasCalled = true;
//     init(api, Math.random() > 0.5);
//     database.goOffline();
//   }, 2000);
// }

function init(api, isVariant) {
  api.utils.anchors.getSections('choice').forEach(section => {
    const before = [];
    const options = [];

    section.betweenNodes.filter(node => api.utils.dom.isElement(node)).forEach(el => {
      if (el.className.indexOf('VideoEmbed') === 0) {
        const caption = el.querySelector('.Caption');
        const [prefix, label] = caption.querySelector('a').textContent.split(': ');

        caption.parentElement.removeChild(caption);

        options.push({
          prefix: label && prefix,
          label: label || prefix,
          embed: el,
          after: []
        });
      } else if (options.length > 0) {
        options[options.length - 1].after.push(el);
      } else {
        before.push(el);
      }
    });

    if (options.length) {
      section.substituteWith(
        Choice({
          before,
          isVariant,
          nextEl: section.endNode.nextSibling,
          options
        }),
        []
      );
    }
  });

  api.utils.anchors.getMarkers('signup').forEach(marker => {
    const nextEl = marker.node.nextElementSibling || document.createElement('div');
    const className = nextEl.className.match(/u-richtext(?:-invert)?/);

    if (className) {
      marker.substituteWith(
        SignUp({
          formEl: nextEl,
          className
        })
      );
    }
  });
}

if (window.__ODYSSEY__) {
  // initWithExperiment(window.__ODYSSEY__);
  init(window.__ODYSSEY__);
} else {
  // window.addEventListener('odyssey:api', event => initWithExperiment(event.detail));
  window.addEventListener('odyssey:api', event => init(event.detail));
}
