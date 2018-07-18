(function wrapper() {
	'use strict';

	angular
		.module('app.directives')
		.directive('restrictInput', restrictInput);

	function restrictInput() {
		var directiveDefinitionObject = {
			link: link,
			restrict: 'A',
			scope: {
				restrict: '@restrictInput'
			}
		};

		function link(scope, element) {
			function catchKey(event) {
				var chars = {
						// Letras A-Z a-z
						letters: [
							8, 9,
							[65, 90],
							[97, 122],
							32, 193, 201, 205, 209, 211, 218, 220, 225, 233, 237, 241, 243, 250, 252
						],
						// Numeros del 1 al 9
						numbers: [
							8, 9,
							[49, 57]
						],
					},
					key = event.charCode || event.keyCode,
					passed = false;

				function evalKey(code) {
					if ((code instanceof Array && key >= code[0] && key <= code[1]) || key === code) {
						passed = true;
					}
				}

				function parseType(type) {
					chars[type].forEach(evalKey);
				}

				scope.restrict.split(' ').forEach(parseType);

				if (!passed) {
					event.preventDefault();
				}
			}

			element.on('keypress', catchKey);
		}

		return directiveDefinitionObject;
	}
})();
