import {setSelectionOffsets} from "../cursor.js";

export function attachCursorFixingEvent(container, history) {
  // Working around the following Firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1636248
  container.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
      return;
    }
    let delta = 0;
    switch (event.key) {
      case 'ArrowLeft':
        delta = -1;
        break;
      case 'ArrowRight':
        delta = 1;
        break;
    }

    const currentSelection = history.getSelection();
    if (delta !== 0 && currentSelection !== null
      && currentSelection.start.containerOffset === currentSelection.end.containerOffset) {
      const selection = currentSelection.start.containerOffset;
      const node = currentSelection.extraInfo.startContainer;
      setTimeout(() => {
        const currentSelection = history.getSelection();
        if (currentSelection !== null
          && currentSelection.start.containerOffset === selection
          && currentSelection.end.containerOffset === selection
          && currentSelection.extraInfo.startContainer === node) {
          const correctSelection = selection + delta;
          if (correctSelection >= 0 && correctSelection <= container.textContent.length) {
            setSelectionOffsets(container, {start: correctSelection, end: correctSelection});
          }
        }
      }, 0);
    }
  });
}