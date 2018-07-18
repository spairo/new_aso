(function wrapper() {
	'use strict';

	angular
		.module('app.services')
		.factory('patterns', patternsFactory);

	function patternsFactory() {
		var factory = {
			// Expresiones regulares
			// ejemplo: email: /laRegExp/
			cvalidate0: /[1-4]/g
		};

		return factory;
	}
})();
