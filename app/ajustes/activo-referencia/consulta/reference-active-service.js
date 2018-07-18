(function wrapper() {
	'use strict';

	angular
		.module('app')
		.factory('referenceActiveService', referenceActiveServiceFactory);

	function referenceActiveServiceFactory(apiBuilder) {
		var service = {
			getAdjustmentFactor: {
				method: 'post',
				url: '/eventoActivoReferencia/obtenerEstrategia'
			},
			getEvent: {
				method: 'get',
				url: '/catalog/eventoActivoReferencia'
			},
			getHistoricalEvents: {
				method: 'get',
				url: '/eventoActivoReferencia/historicoEventos'
			},
			getReference: {
				method: 'get',
				url: '/catalog/activoUsuario'
			},
			getReferencesave: {
				method: 'post',
				url: '/eventoActivoReferencia/insertarEventos'
			}
		};

		return apiBuilder(service);
	}
})();
