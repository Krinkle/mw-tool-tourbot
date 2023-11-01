const colors = require('colors/safe');

function simpleDiff (removedLine, addedLine) {
  if (removedLine === addedLine) {
    return { textBefore: removedLine, removed: '', added: '', textAfter: '' };
  }
  if (addedLine === null) {
    return { textBefore: '', removed: removedLine, added: null, textAfter: '' };
  }
  let start = 0;
  while (start < removedLine.length && removedLine[start] === addedLine[start]) {
    start++;
  }
  const textBefore = removedLine.slice(0, start);
  const addedRest = addedLine.slice(start);
  const removedRest = removedLine.slice(start);
  let end = false;
  if (removedRest.length) {
    end = 0;
    while (removedRest.slice(end - 1, removedRest.length + end) === addedRest.slice(end - 1, addedRest.length + end)) {
      end--;
    }
  }

  return {
    textBefore,
    removed: removedLine.slice(start, end || undefined),
    added: addedLine.slice(start, end || undefined),
    textAfter: end ? removedRest.slice(end) : ''
  };
}

function formatDiff (diff, contextStart, linesBefore, linesAfter) {
  return colors.cyan('@@ line ' + contextStart + ' @@') + '\n' +
    // Prefix lines before with two spaces in order to align with "+ "
    (linesBefore ? colors.grey(linesBefore.replace(/^/gm, '  ')) + '\n' : '') +
    colors.red('- ' + diff.textBefore) + colors.bold.bgRed(diff.removed) + colors.red(diff.textAfter) + '\n' +
    (diff.added !== null
      ? (
          colors.green('+ ' + diff.textBefore) +
        // In case of a multi-line replacement, make sure indentation doens't look weird.
        // On the second and subsequent line we need to also prepend "+ ".
        diff.added.split('\n').map((chunk) => colors.bold.bgGreen(chunk)).join('\n' + colors.green('+ ')) +
        colors.green(diff.textAfter) + '\n'
        )
      : ''
    ) +
    colors.grey(linesAfter.replace(/^/gm, '  '));
}

module.exports = { simpleDiff, formatDiff };
