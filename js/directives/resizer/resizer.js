(function wrapper() {
	'use strict';

	angular
		.module('app.directives')
		.directive('resizer', resizerDirective);

	function resizerDirective($window) {
		var directiveDefinitionObject = {
			link: link,
			restrict: 'A'
		};

		function link(scope, element) {
			setTimeout(function() {
				element.colResizable({
					liveDrag: true,
					gripInnerHtml: "<div class='grip'></div>",
					onDrag: function() {
						//trigger a resize event, so paren-witdh directive will be updated
						$(window).trigger('resize');
					}
				});
			});
		}

		return directiveDefinitionObject;
	}
})();
