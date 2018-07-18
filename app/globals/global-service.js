(function wrapper() {
	'use strict';

	angular
		.module('app')
		.factory('globalService', globalServiceFactory);

	function globalServiceFactory(apiBuilder) {

		var service = {
			getASO:{
				method: 'get',
				url: ''
			},
			postASO: {
				method: 'post',
				url: ''
			}
		};

		return apiBuilder(service);
	}
})();
