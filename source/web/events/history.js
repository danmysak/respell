import {update, startPlannedMutation, endPlannedMutation} from "../input-handler.js";
import {stopCorrecting} from "../corrector.js";
import {setSelectionOffsets, scrollSelectionIntoView} from "../cursor.js";

const undoKey = 'KeyZ';
const redoKey = 'KeyY';

export function attachHistoryEvents(container, history) {
  document.addEventListener('keydown', (event) => {
    let undo = false;
    let redo = false;
    if (event.ctrlKey || event.metaKey) {
      if (event.code === undoKey && !event.shiftKey) {
        undo = true;
      } else if ((event.code === undoKey && event.shiftKey) || (event.code === redoKey)) {
        redo = true;
      }
    }
    if (undo || redo) {
      event.preventDefault();
      if (undo && history.canUndo() || redo && history.canRedo()) {
        stopCorrecting();
        window.getSelection().removeAllRanges();
        startPlannedMutation();
        const {elements, selection} = undo ? history.undo() : history.redo();
        if (elements.length === 0) {
          container.innerHTML = '';
        } else {
          container.prepend(elements[0]);
          for (let i = 1; i < elements.length; i++) {
            elements[i - 1].after(elements[i]);
          }
          const lastElement = elements[elements.length - 1];
          while (lastElement.nextSibling !== null) {
            lastElement.nextSibling.remove();
          }
        }
        const records = endPlannedMutation();
        update({records, updateHistory: false, withAnimations: false});
        setSelectionOffsets(container, selection);
        setTimeout(() => {
          const lineHeight = parseFloat(window.getComputedStyle(container).getPropertyValue('line-height'));
          scrollSelectionIntoView(container, lineHeight);
        }, 0); // Let's not force reflow during the update
      }
    }
  });
}