import {paragraphTag} from "../common-tags.js";
import {insertAtCursor} from "../cursor.js";
import {update, endPlannedMutation, startPlannedMutation} from "../observer.js";
import {setOverlayState} from "../overlay.js";

const maxLengthWithoutOverlay = 1000;

export function attachPasteEvent(container) {
  container.addEventListener('paste', (event) => {
    const text = event.clipboardData.getData('text/plain');
    event.preventDefault();
    const doInsert = (withAnimations) => {
      const contents = [];
      text.split(/\n/).forEach((line, index, lines) => {
        if (index === 0) {
          const normalized = lines.length > 1 ? line.trim() : line;
          if (normalized !== '') {
            contents.push(document.createTextNode(normalized));
          }
        } else {
          const paragraph = document.createElement(paragraphTag);
          const trimmed = line.trim();
          if (trimmed !== '') {
            paragraph.textContent = trimmed;
            contents.push(paragraph);
          }
        }
      });
      const multiline = contents.length > 1;
      startPlannedMutation();
      insertAtCursor(container, contents, multiline);
      const records = endPlannedMutation();
      update({records, removeEmptyMutated: multiline, withAnimations});
    };
    if (text.length > maxLengthWithoutOverlay) {
      setOverlayState('processing');
      setTimeout(() => {
        doInsert(false);
        setOverlayState(false);
      }, 50); // 0 or even 1 is not enough for most browsers except Chrome; getComputedStyle doesn't help either
    } else {
      doInsert(true);
    }
  });
}