import {update, startPlannedMutation, endPlannedMutation} from "../input-handler.js";
import {stopCorrecting} from "../corrector.js";
import {setSelectionOffsets} from "../cursor.js";

export function attachHistoryEvents(container, history) {
  container.addEventListener('keydown', (event) => {
    let undo = false;
    let redo = false;
    if (event.ctrlKey || event.metaKey) {
      const key = event.key.toLowerCase();
      // Shift can either make event.key uppercase or not depending on what other keys are pressed
      if (key === 'z' && !event.shiftKey) {
        undo = true;
      } else if ((key === 'z' && event.shiftKey) || (key === 'y')) {
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
      }
    }
  });
}