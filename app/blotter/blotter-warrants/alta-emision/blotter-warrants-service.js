(function wrapper() {
	'use strict';

	angular
		.module('app')
		.factory('createBlotterWarrantsService', createBlotterWarrantsServiceFactory);

	function createBlotterWarrantsServiceFactory(apiBuilder) {
		var service = {
			getComercialization: {
				method: 'get',
				url: '/catalog/comercializacion'
			},
			getCurrencies: {
				method: 'get',
				url: '/catalog/currency'
			},
			getCustomers: {
				method: 'get',
				url: '/catalog/clientes'
			},
			getFields: {
				method: 'get',
				url: '/blotter/campos'
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
			getSubyacentes: {
				method: 'get',
				url: '/catalog/SubyacentesUsuario'
			},
			getVehicles: {
				method: 'get',
				url: '/catalog/vehiculo'
			},
			saveDeal: {
				method: 'post',
				url: '/blotter/warrant'
			}
		};

		return apiBuilder(service);
	}
})();
