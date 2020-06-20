let overlayContainer = null;

const activeClassName = 'active';

export function registerOverlay(element) {
  overlayContainer = element;
}

export function setOverlayState(type) {
  if (type) {
    overlayContainer.dataset.type = type;
    overlayContainer.classList.add(activeClassName);
  } else {
    overlayContainer.classList.remove(activeClassName);
  }
}