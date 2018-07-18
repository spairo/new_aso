(function wrapper() {
	'use strict';

	angular
		.module('app.directives')
		.directive('nav', navDirective);

	function navDirective($location, $timeout, $window) {
		var directiveDefinitionObject = {
			link: link,
			restrict: 'A',
			scope: false
		};

		function link(scope, element, attrs) {
			$timeout(function setHref() {
				element.attr('href', ['//', $window.location.host, $window.location.pathname, attrs.nav].join(''));
			}, 0);
		}

		return directiveDefinitionObject;
	}
})();
