(function wrapper() {
	'use strict';

	angular
		.module('app.directives')
		.directive('dateInput', dateInputDirective);

	function dateInputDirective($filter) {
		var directiveDefinition = {
			restrict: "A",
			require: "ngModel",
			link: link
		};

		function link(scope, element, attrs, ngModel) {
			var dateTestRegex = /\d{1,2}\/\d{1,2}\/\d{4}/;

			ngModel.$parsers.push(parser);
			ngModel.$formatters.push(formatter);

			function parser(value) {
				if (dateTestRegex.test(value) && !isNaN(Date.parse(value))) {
					value = new Date(value);
				} else {
					if (value !== null) {
						var dateFormat = new Date(value);
						var dateLong = dateFormat.getTime();
						value = dateLong;
					}
				}
				return value;
			}

			function formatter(value) {
				if (value === null) {
					value = undefined;
				} else {
					value = new Date(value);
					return value;
				}
			}
		}

		return directiveDefinition;
	}
})();
