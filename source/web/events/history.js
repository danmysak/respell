import {update, startPlannedMutation, endPlannedMutation} from "../observer.js";
import {stopCorrecting} from "../corrector.js";
import {setSelectionOffsets} from "../cursor.js";

export function attachHistoryEvents(container, history) {
  container.addEventListener('keydown', (event) => {
    let undo = false, redo = false;
    if (event.ctrlKey || event.metaKey) {
      if (event.key === 'z') {
        undo = true;
      } else if (event.key === 'Z' || event.key === 'y') {
        redo = true;
      }
    }
    if (undo || redo) {
      event.preventDefault();
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
      update({records, updateHistory: false});
      setSelectionOffsets(container, selection);
    }
  });
}