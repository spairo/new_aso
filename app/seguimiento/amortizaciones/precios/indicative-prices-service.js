(function wrapper() {
	'use strict';

	angular
		.module('app')
		.factory('preciosIndicativosService', preciosIndicativosFactory);

	function preciosIndicativosFactory(apiBuilder) {
		var service = {
			uploadIndicativos: {
				method: 'multipart',
				url: '/cargaArchivo'
			},
			getIndicativos: {
				method: 'get',
				url: '/amortizaciones/consultaCarga'
			},
			updateIndicativos: {
				method: 'post',
				url: '/amortizaciones/actualizaIndicativos'
			}
		};

		return apiBuilder(service);
	}
})();
