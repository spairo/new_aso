(function wrapper() {
	'use strict';

	angular
		.module('app.extensions', [])
		.config(extensions);

	function extensions() {
		Number.prototype.countDecimals = function countDecimals() {
			var decimals = this.toString().split('.')[1];

			decimals = decimals || '';

			return decimals.length;
		};
	}
})();
