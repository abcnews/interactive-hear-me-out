
import {whenOdysseyLoaded} from '@abcnews/env-utils';
import './global.scss';
import Choice from './components/Choice';
import SignUp from './components/SignUp';

whenOdysseyLoaded.then(() => {
  const { utils } = window.__ODYSSEY__;
  const { getMarkers, getSections } = utils.mounts;
  const { isElement } = utils.dom;

  getSections("choice").forEach(section => {
    const before = [];
    const options = [];
    const hasManualPlayback = section.configString.indexOf("manual") > -1;

    section.betweenNodes
      .filter(node => isElement(node))
      .forEach(el => {
        if (el.className.indexOf("VideoEmbed") === 0) {
          const caption = el.querySelector(".Caption");
          const [prefix, label] = caption
            .querySelector("a")
            .textContent.split(": ");

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
          hasManualPlayback,
          nextEl: section.endNode.nextSibling,
          options
        }),
        []
      );
    }
  });

  getMarkers("signup").forEach(marker => {
    const nextEl =
      marker.node.nextElementSibling || document.createElement("div");
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
});
