(function wrapper() {
	'use strict';

	angular
		.module('app')
		.factory('comparativePricesService', comparativePricesServiceFactory);

	function comparativePricesServiceFactory(apiBuilder) {
		var service = {
			getPrices: {
				method: 'get',
				url: '/precios/preciosActuales'
			},
			uploadPrices: {
				method: 'multipart',
				url: '/cargaArchivo'
			}
		};

		return apiBuilder(service);
	}
})();
