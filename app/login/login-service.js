(function wrapper() {
	'use strict';

	angular
		.module('app')
		.factory('loginService', loginServiceFactory);

	function loginServiceFactory(apiBuilder) {
		var service = {
			login: {
				method: 'post',
				url: '/login'
			}
		};

		return apiBuilder(service);
	}
})();
