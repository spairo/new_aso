(function wrapper() {
	'use strict';

	angular
		.module('app')
		.factory('detalleAmortizacionesService', detalleAmortizacionesFactory);

	function detalleAmortizacionesFactory(apiBuilder) {
		var service = {
			getBankerdetails: {
				method: 'get',
				url: '/amortizaciones/banquero/detalleAmortizaciones'
			},
			getViewDetail: {
				method: 'get',
				url: '/amortizaciones/banquero/verDetalle'
			}
		};

		return apiBuilder(service);
	}
})();
