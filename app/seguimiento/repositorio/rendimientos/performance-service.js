(function wrapper() {
	'use strict';

	angular
		.module('app')
		.factory('comparativePerformanceService', comparativePerformanceServiceFactory);

	function comparativePerformanceServiceFactory(apiBuilder) {
		var service = {
			getPerformance: {
				method: 'get',
				url: '/rendimiento/consultaCarga'
			},
			uploadPerform: {
				method: 'multipart',
				url: '/cargaArchivo'
			}
		};

		return apiBuilder(service);
	}
})();
