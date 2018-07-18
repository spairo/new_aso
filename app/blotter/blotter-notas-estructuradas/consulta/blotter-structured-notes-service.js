(function wrapper() {
	'use strict';

	angular
		.module('app')
		.factory('blotterStructuredNotesService', blotterStructuredNotesServiceFactory);

	function blotterStructuredNotesServiceFactory(apiBuilder) {
		var service = {
			actualizaMontos: {
				method: 'get',
				url: '/blotter/actualizaMontos'
			},
			actualizaGat: {
				method: 'get',
				url: '/blotter/actualizaGat'
			},
			consultTableBlotter: {
				method: 'get',
				url: '/blotter/notas'
			},
			getBoard: {
				method: 'get',
				url: '/catalog/mesa'
			},
			getTableAmortization: {
				method: 'post',
				url: '/amortizacion/nuestrategia'
			},
			saveCustomView: {
				method: 'post',
				url: '/encabezadoBlotter/guardar'
			},
			updateAmortization: {
				method: 'post',
				url: '/amortizacion/actualizar'
			},
			uploadRecord: {
				method: 'multipart',
				url: '/cargaArchivo'
			}
		};

		return apiBuilder(service);
	}
})();
