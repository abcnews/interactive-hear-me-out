require('./global.scss');
const Choice = require('./components/Choice');
const SignUp = require('./components/SignUp');

function init(api) {
  const isSkeumorphicMetaEl = api.utils.dom.$('meta[name="is-skeumorphic]');
  const isSkeumorphic = isSkeumorphicMetaEl && isSkeumorphicMetaEl.getAttribute('content') === 'true';

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
          isSkeumorphic,
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
  init(window.__ODYSSEY__);
} else {
  window.addEventListener('odyssey:api', event => init(event.detail));
}
