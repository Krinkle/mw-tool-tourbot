/**
 * @param {string} Contents of input file
 * @return {Object[]} List of subject objects
 */
function parseResults (input) {
  input = input.trim();
  if (input[0] === '{') {
    // Looks like JSON, parse as result from <https://global-search.toolforge.org/>.
    return parseGlobalsearchOutput(JSON.parse(input));
  } else {
    return parseMwgrepOutput(input);
  }
}

/**
 * @param {string} mwgrepText
 * @return {Object[]} List of subject objects
 */
function parseMwgrepOutput (mwgrepText) {
  const lines = mwgrepText.split('\n');
  return lines.reduce((subjects, line) => {
    const text = line.trim();
    // Filter empty lines and comments
    if (text && text[0] !== '#') {
      const parts = line.split(/\s+/);
      subjects.push({
        wiki: parts[0],
        // Page names may contain spaces
        pageName: parts.slice(1).join(' ')
      });
    }
    return subjects;
  }, []);
}

/**
 * @param {Object} globalSearchRes
 * @return {Object[]} List of subject objects
 */
function parseGlobalsearchOutput (globalSearchRes) {
  return globalSearchRes.hits.map((hit) => {
    return {
      // Convert from WMF/CirussSearch 'wiki' field to URL origin:
      // - 'commons.wikimedia' => 'commons.wikimedia.org'
      // - 'en.wikipedia' => 'en.wikipedia.org'
      // - 'en.wiktionary' => 'en.wiktionary.org'
      wiki: hit.wiki + '.org',
      pageName: hit.title
    };
  });
}

module.exports = { parseResults };
