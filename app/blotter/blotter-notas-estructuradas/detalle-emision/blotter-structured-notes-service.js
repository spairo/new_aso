(function wrapper() {
	'use strict';

	angular
		.module('app')
		.factory('detailBlotterNotesService', detailBlotterNotesServiceFactory);

	function detailBlotterNotesServiceFactory(apiBuilder) {
		var service = {
			saveDeal: {
				method: 'post',
				url: '/blotter/warrant'
			},
			deleteDetail: {
				method: 'get',
				url: '/blotter/eliminar/notas'
			},
			editDeal: {
				method: 'post',
				url: '/blotter/notas'
			},
			getAvailableDocs: {
				method: 'get',
				url: '/consultaDocumentosST'
			},
			getBusiness: {
				method: 'get',
				url: '/catalog/negocio'
			},
			getCalendars: {
				method: 'get',
				url: '/blotter/calendariosEventos'
			},
			getComercialization: {
				method: 'get',
				url: '/catalog/comercializacion'
			},
			getComplexity: {
				method: 'get',
				url: '/catalog/payoff/complejidad'
			},
			getCurrencies: {
				method: 'get',
				url: '/catalog/currency'
			},
			getCustomers: {
				method: 'get',
				url: '/catalog/clientes'
			},
			getDetail: {
				method: 'get',
				url: '/blotter/consulta/notas'
			},
			getDocumentTs: {
				method: 'get',
				url: '/consultaIdDocumentosST'
			},
			getHistoricalStatus: {
				method: 'get',
				url: '/historico/consulta'
			},
			getIconsBPP: {
				method: 'get',
				url: '/catalog/iconos'
			},
			getLiquidationCurrency: {
				method: 'get',
				url: '/catalog/divisa/liquidacion'
			},
			getPayoffDocs: {
				method: 'get',
				url: '/catalog/payoffDocs'
			},
			getPayoffNew: {
				method: 'get',
				url: '/catalog/payoff'
			},
			getReference: {
				method: 'get',
				url: '/catalog/activos'
			},
			getReview: {
				method: 'post',
				url: '/resumen/notas'
			},
			getSalesArea: {
				method: 'get',
				url: '/catalog/AreaVentasUsuario'
			},
			getSalesGroup: {
				method: 'get',
				url: '/catalog/grupos'
			},
			getSections: {
				method: 'get',
				url: '/catalog/group'
			},
			getStatus: {
				method: 'post',
				url: '/catalog/estado'
			},
			getSubyacentes: {
				method: 'get',
				url: '/catalog/SubyacentesUsuario'
			},
			getVehicles: {
				method: 'get',
				url: '/catalog/vehiculo'
			},
			saveHistoricalStatus: {
				method: 'post',
				url: '/historico/guardar'
			},
			uploadRecord: {
				method: 'multipart',
				url: '/cargaArchivo'
			}
		};

		return apiBuilder(service);
	}
})();
