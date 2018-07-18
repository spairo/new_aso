(function wrapper() {
	'use strict';

	angular
		.module('app')
		.factory('homeService', homeServiceFactory);

	function homeServiceFactory(apiBuilder) {
		var service = {
			getCharts: {
				method: 'get',
				url: '/controlEmisionesGrafica'
			}
		};

		return apiBuilder(service);
	}
})();
