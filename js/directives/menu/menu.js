(function wrapper() {
	'use strict';

	angular
		.module('app.directives')
		.directive('menu', menuDirective);

	function menuDirective($location, $rootScope, $timeout) {
		var directiveDefinition = {
			compile: compile,
			restrict: 'A'
		};

		function compile(element) {
			function updateActive() {
				var $links = element.find('a');

				$links
					.parents('li')
					.removeClass('active');

				$links.each(function mark(index, current) {
					var $current = $(current),
							url = $location.absUrl();

					url = url
						.replace($location.protocol(), '')
						.replace(':', '');

					if (url.match(/\?/)) {
						url = url.replace(url.slice(url.indexOf('?')), '');
					}

					if ($current.attr('href') === url) {
						$current
							.parents('li')
							.addClass('active');
					}
				});
			}

			$rootScope.$on('$routeChangeSuccess', updateActive);

		}

		return directiveDefinition;
	}
})();
