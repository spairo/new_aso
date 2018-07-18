(function wrapper() {
	'use strict';

	angular
		.module('app')
		.factory('detailPortfolioService', detailPortfolioServiceFactory);

	function detailPortfolioServiceFactory(apiBuilder) {
		var service = {
			getASO:{
				method: 'get',
				url: ''
			},
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
