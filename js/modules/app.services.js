(function wrapper() {
	'use strict';

	angular
		.module('app.services', ['ngCookies'])
		.config(http);

		function http($httpProvider) {
			$httpProvider.interceptors.push('httpInterceptor');
		}
})();
