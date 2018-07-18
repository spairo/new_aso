(function wrapper() {
	'use strict';

	angular
		.module('app.directives')
		.directive('currencyInput', currencyInputDirective);

	function currencyInputDirective($filter) {
		var directiveDefinition = {
			link: link,
			replace: true,
			require: '?ngModel',
			restrict: 'A',
			scope: {
				field: '='
			},
			template: '<input type = "text" ng-model = "field" placeholder = "$"></input>',
		};

		function link(scope, element, attrs, ngModel) {

			ngModel.$formatters.unshift(function formated() {
				if (ngModel.$modelValue) {
					var value = ngModel.$modelValue;
					if (!ngModel.$modelValue.toString().split(".")[1]) {
						return $filter('number')(ngModel.$modelValue);
					} else {
						var ValueBefore = ngModel.$modelValue.toString().split(".")[0];
						var ValueAfter = ngModel.$modelValue.toString().split(".")[1];
						var num = ValueBefore.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
						var Restfinal = num + '.' + ValueAfter;
						return Restfinal;
					}
				}else{
					return $filter('number')(ngModel.$modelValue);
				}
			});

			ngModel.$parsers.unshift(function viewValue(viewValue) {

				if (viewValue.indexOf('.') >= 1) {

					var parserBefore = viewValue.toString().split(".")[0];
					var parserAfter = viewValue.toString().split(".")[1];
					var parseNum, clean, Parsefinal;

					if (viewValue.match(/[a-zA-Z]/g)) {

						parseNum = parserBefore.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
						clean = parserAfter.replace(/[^0-9]+/g, '');
						Parsefinal = parseNum + '.' + clean;
						element.val(Parsefinal);
						var formated = Number(Parsefinal.replace(/[^0-9\.]+/g, ""));
						return formated;

					} else {
						parseNum = parserBefore.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
						Parsefinal = parseNum + '.' + parserAfter;
						element.val(Parsefinal);
						var format = Number(Parsefinal.replace(/[^0-9\.]+/g, ""));
						return format;
					}

				}

				if (!viewValue.toString().split(".")[1]) {
					var plainNumber = viewValue.replace(/[^\d|\-+|\.+]/g, '');
					element.val($filter('number')(plainNumber));
					return Number(plainNumber);
				} else {
					var parBefore = viewValue.toString().split(".")[0];
					var parAfter = viewValue.toString().split(".")[1];
					var parNum = parBefore.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
					var Parfinal = parNum + '.' + parAfter;
					element.val(Parfinal);
					return Number(Parfinal);
				}
			});
		}

		return directiveDefinition;
	}
})();
