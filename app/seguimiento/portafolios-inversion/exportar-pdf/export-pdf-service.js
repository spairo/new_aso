(function wrapper() {
	'use strict';

	angular
		.module('app')
		.factory('exportPDFService', exportPDFServiceFactory);

	function exportPDFServiceFactory(apiBuilder) {
		var service = {
			getGraphic:{
				method: 'post',
				url: '/portafolio/consulta/reporte/contenido/impresion'
			},
			getTablePortfolio: {
				method: 'get',
				url: '/portafolio/consulta'
			}
		};

		return apiBuilder(service);
	}
})();
