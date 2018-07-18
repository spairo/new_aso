(function wrapper() {
	'use strict';

	angular
		.module('app.directives')
		.directive('clipboard', clipboardDirective);

	function clipboardDirective($filter) {
		var directiveDefinition = {
			link: link,
			restrict: 'A',
			scope: {
				onSuccess: '&'
			}
		};

		function link(scope, element, attrs) {
			var clipboard = new Clipboard(element.get(0));

			clipboard.on('success', function success() {
				scope.$apply(scope.success);
			});

			element.on('$destroy', clipboard.destroy.bind(clipboard));
		}

		return directiveDefinition;
	}
})();
