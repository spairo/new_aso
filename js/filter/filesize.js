(function wrapper() {
	'use strict';

	angular
		.module('app.filters')
		.filter('filesize', filesizeFilter);

	function filesizeFilter() {
		var units = [
			'bytes',
			'Kb',
			'Mb',
			'Gb',
			'Tb',
			'Pb'
		];

		function convertUnits (bytes, precision) {
			if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
				return '?';
			}

			var unit = 0;

			while (bytes >= 1024) {
				bytes /= 1024;
				unit ++;
			}

			return bytes.toFixed(+ precision) + ' ' + units[unit];
		}

		return convertUnits;
	}
})();
