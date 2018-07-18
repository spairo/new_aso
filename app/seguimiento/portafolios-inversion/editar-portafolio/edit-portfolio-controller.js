(function wrapper() {
	'use strict';

	angular
		.module('app')
		.controller('EditPortfolioController', EditPortfolioController);

	function EditPortfolioController(editPortfolioService, $cookies, $location, $route, $routeParams) {

		this.edicionBol = true;

		function onDeletePortfolio(response) {
			this.delete = response.data;

			$location.path('/portafolios-inversion');
		}

		function onGetBusiness(response) {
			this[25] = response.data;
		}

		function onGetComercialization(response) {
			this[42] = response.data;
		}

		function onGetComplexity(response) {
			this[82] = response.data;
		}

		function onGetCurrencies(response){
			this[11] = response.data;
		}

		function onGetCustomers(response){
			this[17] = response.data;
		}

		function onGetGeography(response) {
			this[65] = response.data;
		}

		function onGetIconsBPP(response) {
			this[86] = response.data;
		}

		function onGetLiquidationCurrency(response){
			this[63] = response.data;
		}

		function onGetMoreFilters(response){
			this.more = response.data;
		}

		function onGetPayoffDocs(response){
			this[69] = response.data;
		}

		function onGetPayoffNew(response){
			this[44] = response.data;
		}

		function onGetPortfolioToEdit(response){
			this.portfolio = response.data;
		}

		function onGetReference(response){
			this[32] = response.data;
		}

		function onGetSalesArea(response){
			this[18] = response.data;
		}

		function onGetSalesGroup(response){
			this[40] = response.data;
		}

		function onGetSave(response){
			this.save = response.data;

			$location.path('/portafolios-inversion');
		}

		function onGetSearch(response) {
			this.search = response.data;
		}

		function onGetStatus(response) {
			this[39] = response.data;
		}

		function onGetSubyacentes(response){
			this[14] = response.data;
		}

		function onGetVehicles(response){
			this[19] = response.data;
		}

		this.deleteFilters = function deleteFilters() {
			this.request[14] = this[14][0]; // Subyacente
			this.request[17] = this[17][0]; // Cliente
			this.request[18] = this[18][0]; // Área
			this.request[32] = this[32][0]; // Activo de referencia
			this.request[40] = this[40][0]; // Grupo
			this.request[44] = this[44][0]; // Payoff

			this.request.datos = {};
			this.optionsFilter = [];

			this.request.datos[14] = {};
			this.request.datos[14].rangoInicial = this.request[14];
			this.request.datos[17] = {};
			this.request.datos[17].rangoInicial = this.request[17];
			this.request.datos[18] = {};
			this.request.datos[18].rangoInicial = this.request[18];
			this.request.datos[32] = {};
			this.request.datos[32].rangoInicial = this.request[32];
			this.request.datos[40] = {};
			this.request.datos[40].rangoInicial = this.request[40];
			this.request.datos[44] = {};
			this.request.datos[44].rangoInicial = this.request[44];
		};

		// Data evals
		this.evalEmission = function evalEmission(item) {
			item.bandera = false;
			item.estatusEdicion = true;
			this.portfolio.portafolios.push(item);
		};

		// Arreglo para opciones de más filtros
		this.optionsFilter = [];

		// Select Payoff New
		this.payoffSelected = function payoffSelected(id) {
			if (id >= 0) {
				editPortfolioService
					.getPayoffDocs({ params: { id: id } })
					.then(onGetPayoffDocs.bind(this));
			}
		};

		// Eliminar portafolio
		this.removePortfolio = function removePortfolio() {
			this.deleteP = {};
			this.deleteP.cdUsuario = this.usuario;
			this.deleteP.cdPortafolio = $routeParams.idPortfolio;

			editPortfolioService
				.deletePortfolio(this.deleteP)
				.then(onDeletePortfolio.bind(this));
		};

		// Configuración de slides (rangos)
		this.request = {
			"24": {
				"rangoInicial": 0,
				"rangoFinal": 100
			},
			"30": {
				"rangoInicial": 0,
				"rangoFinal": 100
			},
			"31": {
				"rangoInicial": 0,
				"rangoFinal": 100
			},
			"47": {
				"rangoInicial": 0,
				"rangoFinal": 100
			},
			"55": {
				"rangoInicial": 0,
				"rangoFinal": 100
			}
		};

		// Select Área Ventas
		this.salesAreaSelected = function salesAreaSelected(id) {
			if (id >= 0) {
				editPortfolioService
					.getSalesGroup({ params: { id: id } })
					.then(onGetSalesGroup.bind(this));
			}
		};

		// Select Área Grupos
		this.salesGroupSelected = function salesGroupSelected(id) {
			if (id >= 0) {
				editPortfolioService
					.getCustomers({ params: { id: id } })
					.then(onGetCustomers.bind(this));
			}
		};

		// Save Portafolio
		this.saveBriefcase = function saveBriefcase(){
			this.portfolio.cdUsuario = this.usuario;

			editPortfolioService
				.getSave(this.portfolio)
				.then(onGetSave.bind(this));
		};

		// Buscar emisiones (filtros)
		this.searchEmissions = function searchEmissions() {
			this.request.datos[0] = this.usuario;
			if(this.request.datos[39] && this.request.datos[39].rangoInicial && this.request.datos[39].rangoInicial.nuCatalogo){
				this.request.datos[39].rangoInicial.nuCatalogo = this.request.datos[39].rangoInicial.cdCatalogo;
			}
			editPortfolioService
				.getSearch(this.request.datos)
				.then(onGetSearch.bind(this));
		};

		this.slider = {
			options: {
					floor: 0,
					ceil: 100,
					step: 1
			}
		};

		// Select Subyacente
		this.subyacenteSelected = function subyacenteSelected(id) {
			if (id >= 0) {
				editPortfolioService
					.getReference({ params: { id: id } })
					.then(onGetReference.bind(this));

				editPortfolioService
					.getPayoffNew({ params: { id: id } })
					.then(onGetPayoffNew.bind(this));
			}
		};

		this.usuario = $cookies.get('cdUser');

		editPortfolioService
			.getBusiness()
			.then(onGetBusiness.bind(this));
		editPortfolioService
			.getComercialization()
			.then(onGetComercialization.bind(this));
		editPortfolioService
			.getComplexity()
			.then(onGetComplexity.bind(this));
		editPortfolioService
			.getCurrencies()
			.then(onGetCurrencies.bind(this));
		editPortfolioService
			.getGeography()
			.then(onGetGeography.bind(this));
		editPortfolioService
			.getIconsBPP()
			.then(onGetIconsBPP.bind(this));
		editPortfolioService
			.getLiquidationCurrency()
			.then(onGetLiquidationCurrency.bind(this));
		editPortfolioService
			.getMoreFilters({ params: { id: 11 } })
			.then(onGetMoreFilters.bind(this));
		editPortfolioService
			.getPortfolioToEdit({ params: { codigoPortafolio: $routeParams.idPortfolio, usuario: this.usuario, edicion: this.edicionBol } })
			.then(onGetPortfolioToEdit.bind(this));
		editPortfolioService
			.getSalesArea({ params: { usuario: this.usuario } })
			.then(onGetSalesArea.bind(this));
		editPortfolioService
			.getStatus()
			.then(onGetStatus.bind(this));
		editPortfolioService
			.getSubyacentes({ params: { usuario: this.usuario } })
			.then(onGetSubyacentes.bind(this));
		editPortfolioService
			.getVehicles()
			.then(onGetVehicles.bind(this));
	}

	EditPortfolioController.prototype = {
		getActivosConcat: function getActivosConcat(list) {
			if (list) {
				return list
					.map(function getName(item) {
						return item.nbActivo;
					})
					.join(', ');
			}
		},
		getPricesConcat: function getPricesConcat(list) {
			if (list) {
				return list
					.map(function getName(item) {
						return item.precioActivo;
					})
					.join(', ');
			}
		},
		hideEmissions: function hideEmissions() { // Cambiar a cero los eliminados en vista
			this.portfolio.portafolios.forEach(function hideChecks(item, index) {
				if (item.bandera) {
					item.estatusEdicion = false;
				}
			}, this);
		},
		updateAllFilter: function updateAllFilter() { // Seleccionar todos (filtros)
			this.search.forEach(function updateChecks(item) {
				item.bandera = false;
				item.banderaFiltro = this.followAll;
				item.estatusEdicion = true;
				this.portfolio.portafolios.push(item);
			}, this);

			this.copyAllFilters = true;
		}
	};
})();
