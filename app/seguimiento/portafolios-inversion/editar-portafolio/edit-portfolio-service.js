(function wrapper() {
	'use strict';

	angular
		.module('app')
		.factory('editPortfolioService', editPortfolioServiceFactory);

	function editPortfolioServiceFactory(apiBuilder) {
		var service = {
			deletePortfolio: {
				method: 'post',
				url: '/portafolio/eliminarPortafolio'
			},
			getBusiness: {
				method: 'get',
				url: '/catalog/negocio'
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
			getGeography: {
				method: 'get',
				url: '/catalog/geografia'
			},
			getIconsBPP: {
				method: 'get',
				url: '/catalog/iconos'
			},
			getLiquidationCurrency: {
				method: 'get',
				url: '/catalog/divisa/liquidacion'
			},
			getMoreFilters: {
				method: 'get',
				url: '/blotter/camposInterfaz'
			},
			getPayoffDocs: {
				method: 'get',
				url: '/catalog/payoffDocs'
			},
			getPayoffNew: {
				method: 'get',
				url: '/catalog/payoff'
			},
			getPortfolioToEdit: {
				method: 'get',
				url: '/portafolio/consultarEditar'
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
			getSearch: {
				method: 'post',
				url: '/portafolio/consulta/filtros'
			},
			getSave: {
				method: 'post',
				url: '/portafolio/editar'
			},
			getStatus: {
				method: 'get',
				url: '/catalog/estatus'
			},
			getSubyacentes: {
				method: 'get',
				url: '/catalog/SubyacentesUsuario'
			},
			getVehicles: {
				method: 'get',
				url: '/catalog/vehiculo'
			}
		};

		return apiBuilder(service);
	}
})();
