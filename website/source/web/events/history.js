import {update, startPlannedMutation, endPlannedMutation} from "../input-handler.js";
import {stopCorrecting} from "../corrector.js";
import {setSelectionOffsets, scrollSelectionIntoView} from "../cursor.js";

const undoKey = 'KeyZ';
const redoKey = 'KeyY';

function mergeChildNodes(container, elements, history) {
  const childNodes = [...container.childNodes];
  const [top, bottom] = history.computeCommonLengths(childNodes, elements);
  for (let i = childNodes.length - bottom - 1; i >= top; i--) {
    childNodes[i].remove();
  }
  for (let i = top; i < elements.length - bottom; i++) {
    const element = elements[i];
    if (i === 0) {
      container.prepend(element);
    } else {
      elements[i - 1].after(element);
    }
  }
}

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
        mergeChildNodes(container, elements, history);
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