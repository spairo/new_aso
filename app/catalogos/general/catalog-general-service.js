(function wrapper() {
	'use strict';

	angular
		.module('app')
		.factory('catalogGeneralService', catalogGeneralServiceFactory);

	function catalogGeneralServiceFactory(apiBuilder) {
		var service = {
			addCatalog: {
				method: 'post',
				url: '/catalog/menuCatalogos'
			},
			deleteCalendars: {
				method: 'delete',
				url: '/catalog/calendarios'
			},
			deleteCatalog: {
				method: 'delete',
				url: '/catalog/menuCatalogos'
			},
			deleteCharacteristics: {
				method: 'delete',
				url: '/catalog/caracteristicas'
			},
			deleteCustomers: {
				method: 'delete',
				url: '/catalog/clientes'
			},
			deleteEvents: {
				method: 'delete',
				url: '/catalog/eventoActivoReferencia'
			},
			deleteGeography: {
				method: 'delete',
				url: '/catalog/geografia'
			},
			deletePayoffNew: {
				method: 'delete',
				url: '/catalog/payoff'
			},
			deletePayoffType: {
				method: 'delete',
				url: '/catalog/tipoPayOff'
			},
			deleteProtection: {
				method: 'delete',
				url: '/catalog/payoff/proteccion'
			},
			deleteReference: {
				method: 'delete',
				url: '/catalog/activos'
			},
			deleteSalesArea: {
				method: 'delete',
				url: '/catalog/AreaVentasUsuario'
			},
			deleteSalesGroup: {
				method: 'delete',
				url: '/catalog/grupos'
			},
			deleteSubyacente: {
				method: 'delete',
				url: '/catalog/SubyacentesUsuario'
			},
			deleteTables: {
				method: 'delete',
				url: '/catalog/mesa'
			},
			deleteTypeOptionsPo: {
				method: 'delete',
				url: '/catalog/payoff/tipo'
			},
			getBusiness: {
				method: 'get',
				url: '/catalog/negocio'
			},
			getCalendars: {
				method: 'get',
				url: '/catalog/calendarios'
			},
			getCatalogs: {
				method: 'get',
				url: '/catalog/menuCatalogos'
			},
			getCharacteristics: {
				method: 'get',
				url: '/catalog/caracteristicas'
			},
			getComercialization: {
				method: 'get',
				url: '/catalog/comercializacion'
			},
			getComplexity: {
				method: 'get',
				url: '/catalog/payoff/complejidad'
			},
			getCurrency: {
				method: 'get',
				url: '/catalog/currency'
			},
			getCustomers: {
				method: 'get',
				url: '/catalog/clientes'
			},
			getEvents: {
				method: 'get',
				url: '/catalog/eventoActivoReferencia'
			},
			getGeography: {
				method: 'get',
				url: '/catalog/geografia'
			},
			getLiquidationCurrency: {
				method: 'get',
				url: '/catalog/divisa/liquidacion'
			},
			getPayoffDetail: {
				method: 'get',
				url: '/catalog/payoff/detalle'
			},
			getPayoffDocs: {
				method: 'get',
				url: '/catalog/payoffDocs'
			},
			getPayoffNew: {
				method: 'get',
				url: '/catalog/payoff'
			},
			getPayoffType: {
				method: 'get',
				url: '/catalog/tipoPayOff'
			},
			getProtection: {
				method: 'get',
				url: '/catalog/payoff/proteccion'
			},
			getReference: {
				method: 'get',
				url: '/catalog/activos'
			},
			getReferenceDetail: {
				method: 'get',
				url: '/catalog/activo/detalle'
			},
			getSalesArea: {
				method: 'get',
				url: '/catalog/AreaVentasUsuario'
			},
			getSalesGroup: {
				method: 'get',
				url: '/catalog/grupos'
			},
			getSubyacente: {
				method: 'get',
				url: '/catalog/SubyacentesUsuario'
			},
			getTables: {
				method: 'get',
				url: '/catalog/mesa'
			},
			getTypeOptionsPo: {
				method: 'get',
				url: '/catalog/payoff/tipo'
			},
			postCalendars: {
				method: 'post',
				url: '/catalog/calendarios'
			},
			postCatalog: {
				method: 'post',
				url: '/catalog/menuCatalogos'
			},
			postCharacteristics: {
				method: 'post',
				url: '/catalog/caracteristicas'
			},
			postCustomers: {
				method: 'post',
				url: '/catalog/clientes'
			},
			postEvents: {
				method: 'post',
				url: '/catalog/eventoActivoReferencia'
			},
			postGeography: {
				method: 'post',
				url: '/catalog/geografia'
			},
			postPayoffDetail: {
				method: 'post',
				url: '/catalog/payoff/detalle'
			},
			postPayoffNew: {
				method: 'post',
				url: '/catalog/payoff'
			},
			postPayoffType: {
				method: 'post',
				url: '/catalog/tipoPayOff'
			},
			postProtection: {
				method: 'post',
				url: '/catalog/payoff/proteccion'
			},
			postReference: {
				method: 'post',
				url: '/catalog/activos'
			},
			postReferenceDetail: {
				method: 'post',
				url: '/catalog/activo/detalle'
			},
			postSalesArea: {
				method: 'post',
				url: '/catalog/AreaVentasUsuario'
			},
			postSalesGroup: {
				method: 'post',
				url: '/catalog/grupos'
			},
			postSubyacente: {
				method: 'post',
				url: '/catalog/SubyacentesUsuario'
			},
			postTables: {
				method: 'post',
				url: '/catalog/mesa'
			},
			postTypeOptionsPo: {
				method: 'post',
				url: '/catalog/payoff/tipo'
			},
			reviewRecord: {
				method: 'get',
				url: '/payoffArchivo'
			},
			uploadRecord: {
				method: 'multipart',
				url: '/cargaArchivo'
			}
		};

		return apiBuilder(service);
	}
})();
