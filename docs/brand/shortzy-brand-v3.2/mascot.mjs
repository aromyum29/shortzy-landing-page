import './mascot.js';
const api = globalThis.ShortzyMascot;
const assetBase = new URL('./assets/mascot/', import.meta.url).href;
export const {poses, assetFiles, stateToPose} = api;
export const createMascot = (pose, options = {}) => api.createMascot(pose, {assetBase, ...options});
export const createMascotForState = (state, options = {}) => api.createMascotForState(state, {assetBase, ...options});
