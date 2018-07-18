(function wrapper() {

	'use strict';

	angular
		.module('app.filters')
		.filter('daysBetween', daysBetweenFilter);

	function daysBetweenFilter(DatesHelper) {
		function buildString(date, string) {
			var placeholder = /\[days]/g;

			return string.replace(placeholder, Math.abs(date));
		}

		function filter(date, formatStrings) {
			var results = null;

			date = DatesHelper.daysBetween(date);
			formatStrings = formatStrings || { };
			results = {
				backwards: date < 0,
				forwards: date > 0,
				today: date === 0
			};

			for (var type in formatStrings) {
				if (results[type]) {
					return buildString(date, formatStrings[type]);
				}
			}

			return DatesHelper.daysBetween(date);
		}

		return filter;
	}

})();
