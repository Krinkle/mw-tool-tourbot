/**
 * @param {Object} [options]
 * @param {boolean} [options.enabled=true]
 */
function DecisionStore (options) {
  this.enabled = options.enabled !== false;
  this.map = new Map();
}
DecisionStore.prototype.set = function (key, val) {
  if (this.enabled) {
    this.map.set(key, val);
  }
};
DecisionStore.prototype.get = function (key) {
  if (!this.enabled) {
    return undefined;
  }
  return this.map.get(key);
};
module.exports = { DecisionStore };
