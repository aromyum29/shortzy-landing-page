/* Plain-script helper. Load brand.css and this file for the offline guide. */
(function (root) {
  'use strict';
  const poses = Object.freeze(['welcome', 'thinking', 'clipping', 'celebration']);
  const assetFiles = Object.freeze({welcome:'welcome.png',thinking:'thinking.png',clipping:'clipping.png',celebration:'celebration.png'});
  const stateToPose = Object.freeze({"idle": "welcome", "validating": null, "uploading": null, "queued": null, "analyzing": "thinking", "results": "clipping", "empty": null, "editing": null, "unsaved": null, "exporting": "clipping", "partial": null, "complete": "celebration", "cancelled": null, "error": null, "offline": null, "credentials": null, "rateLimited": null, "storageFull": null, "welcome": "welcome", "found": "clipping", "done": "celebration"});
  const defaultAssetBase = new URL('./assets/mascot/', document.currentScript?.src || document.baseURI).href;
  function createMascot(pose = 'welcome', {width = 240, decorative = true, label = 'Shortzy mascot', assetBase = defaultAssetBase} = {}) {
    if (!poses.includes(pose)) throw new RangeError(`Unknown mascot pose: ${pose}`);
    if (!Number.isFinite(width) || width <= 0) throw new RangeError('Mascot width must be a positive number.');
    if (!decorative && (typeof label !== 'string' || !label.trim())) throw new TypeError('Informative mascots need a label.');
    const base = new URL(String(assetBase).replace(/\/?$/, '/'), document.baseURI);
    const el = document.createElement('img');
    el.className = 'sz-mascot'; el.dataset.pose = pose;
    el.src = new URL(assetFiles[pose], base).href;
    el.width = width; el.height = width; el.decoding = 'async';
    el.style.setProperty('--sz-mascot-width', `${width}px`);
    el.alt = decorative ? '' : label;
    if (decorative) el.setAttribute('aria-hidden', 'true');
    return el;
  }
  function createMascotForState(state, options) {
    if (!Object.prototype.hasOwnProperty.call(stateToPose, state)) throw new RangeError(`Unknown app state: ${state}`);
    const pose = stateToPose[state];
    return pose === null ? null : createMascot(pose, options);
  }
  root.ShortzyMascot = Object.freeze({poses, assetFiles, stateToPose, createMascot, createMascotForState});
})(globalThis);
