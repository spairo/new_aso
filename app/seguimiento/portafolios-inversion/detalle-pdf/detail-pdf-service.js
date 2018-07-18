(function wrapper() {
	'use strict';

	angular
		.module('app')
		.factory('detailPdfService', detailPdfServiceFactory);

	function detailPdfServiceFactory(apiBuilder) {
		var service = {
			getDetalleGraficas: {
				method: 'post',
				url: '/portafolio/consultaEmision/grafica'
			},
			getModal: {
				method: 'get',
				url: '/portafolio/consulta/detalle/consultaHistorico'
			},
			getStrategyDetail: {
				method: 'get',
				url: '/portafolio/consulta/detalle/mosaico'
			}
		};

		return apiBuilder(service);
	}
})();
