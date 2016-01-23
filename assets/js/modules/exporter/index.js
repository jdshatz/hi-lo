/**
 * Helper to export objects in the game.
 */
var exporter = {
	/**
	 * Shallow copy a class object and ignore keys. Used
	 * for exporting objects without specific keys.
	 *
	 * @param {object} sourceObj
	 * @param  {array=} ignoreKeys
	 * 
	 * @return {object} exportObj
	 */
	exportObj: function(sourceObj, ignoreKeys) {
		let exportObj = {};
		let ignore = ignoreKeys || [];
		var key;
		for (key in sourceObj) {
			if (ignore.indexOf(key) === -1) {
				exportObj[key] = sourceObj[key];
			}
		}
		return exportObj;
	}
};
module.exports = exporter;