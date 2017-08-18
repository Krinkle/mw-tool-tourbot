function simpleDiff (removedLine, addedLine) {
  if (removedLine === addedLine) {
    return { textBefore: removedLine, removed: '', added: '', textAfter: '' };
  }
  var start = 0;
  while (start < removedLine.length && removedLine[start] === addedLine[start]) {
    start++;
  }
  var textBefore = removedLine.slice(0, start);
  var addedRest = addedLine.slice(start);
  var removedRest = removedLine.slice(start);
  var end = false;
  if (removedRest.length) {
    end = 0;
    while (removedRest.slice(end - 1, removedRest.length + end) === addedRest.slice(end - 1, addedRest.length + end)) {
      end--;
    }
  }

  return {
    textBefore: textBefore,
    removed: removedLine.slice(start, end || undefined),
    added: addedLine.slice(start, end || undefined),
    textAfter: end ? removedRest.slice(end) : ''
  };
}

module.exports = { simpleDiff };
