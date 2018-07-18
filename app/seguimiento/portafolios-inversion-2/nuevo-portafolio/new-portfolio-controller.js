(function wrapper() {
	'use strict';

	angular
		.module('app')
		.controller('NewPortfolioController', NewPortfolioController);

	function NewPortfolioController(newPortfolioService, $cookies, $location, $route) {
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

		function onGetReference(response){
			this[32] = response.data;
		}

		function onGetSalesArea(response){
			this[18] = response.data;
		}

		function onGetSalesGroup(response){
			this[40] = response.data;
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
		this.evalEmission = function evalEmission(item, index) {

			if(this.savedEmission.length > 0){
				var result = this.savedEmission.filter(function(v) {
					return v.cdSerie === item.cdSerie; // Filter out the appropriate one
				});

				if(result.length > 0){

				}else{
					item.bandera = false;
					item.estatusEdicion = true;
					this.savedEmission.push(item);
				}
			}else{
				item.bandera = false;
				item.estatusEdicion = true;
				this.savedEmission.push(item);
			}
		};

		function esCereza(fruta) {
			return fruta.nombre === 'cerezas';
		}

		// Arreglo para opciones de más filtros
		this.optionsFilter = [];

		// Select Payoff New
		this.payoffSelected = function payoffSelected(id) {
			if (id >= 0) {
				newPortfolioService
					.getPayoffDocs({ params: { id: id } })
					.then(onGetPayoffDocs.bind(this));
			}
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
				newPortfolioService
					.getSalesGroup({ params: { id: id } })
					.then(onGetSalesGroup.bind(this));
			}
		};

		// Select Área Grupos
		this.salesGroupSelected = function salesGroupSelected(id) {
			if (id >= 0) {
				newPortfolioService
					.getCustomers({ params: { id: id } })
					.then(onGetCustomers.bind(this));
			}
		};

		// Save Portafolio
		this.saveBriefcase = function saveBriefcase(){
			this.saveBrief = {};
			this.saveBrief.cdUsuario = this.usuario;
			this.saveBrief.tabs = [{"nombrePortafolio": this.request.nombreCartera}];
			this.saveBrief.portafolios = this.savedEmission;

			newPortfolioService
				.getSave(this.saveBrief)
				.then($location.path('/portafolios-inversion'));
				$route.reload();
		};

		// Arreglo para guardar datos
		this.savedEmission = [];

		// Buscar emisiones (filtros)
		this.searchEmissions = function searchEmissions() {
			this.request.datos[0] = this.usuario;
			if(this.request.datos[39] && this.request.datos[39].rangoInicial && this.request.datos[39].rangoInicial.nuCatalogo){
				this.request.datos[39].rangoInicial.nuCatalogo = this.request.datos[39].rangoInicial.cdCatalogo;
			}
			newPortfolioService
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
				newPortfolioService
					.getReference({ params: { id: id } })
					.then(onGetReference.bind(this));

				newPortfolioService
					.getPayoffNew({ params: { id: id } })
					.then(onGetPayoffNew.bind(this));
			}
		};

		this.usuario = $cookies.get('cdUser');

		newPortfolioService
			.getBusiness()
			.then(onGetBusiness.bind(this));
		newPortfolioService
			.getComercialization()
			.then(onGetComercialization.bind(this));
		newPortfolioService
			.getComplexity()
			.then(onGetComplexity.bind(this));
		newPortfolioService
			.getCurrencies()
			.then(onGetCurrencies.bind(this));
		newPortfolioService
			.getGeography()
			.then(onGetGeography.bind(this));
		newPortfolioService
			.getIconsBPP()
			.then(onGetIconsBPP.bind(this));
		newPortfolioService
			.getLiquidationCurrency()
			.then(onGetLiquidationCurrency.bind(this));
		newPortfolioService
			.getMoreFilters({ params: { id: 11 } })
			.then(onGetMoreFilters.bind(this));
		newPortfolioService
			.getSalesArea({ params: { usuario: this.usuario } })
			.then(onGetSalesArea.bind(this));
		newPortfolioService
			.getStatus()
			.then(onGetStatus.bind(this));
		newPortfolioService
			.getSubyacentes({ params: { usuario: this.usuario } })
			.then(onGetSubyacentes.bind(this));
		newPortfolioService
			.getVehicles()
			.then(onGetVehicles.bind(this));
	}

	NewPortfolioController.prototype = {
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
			this.savedEmission.forEach(function hideChecks(item, index) {
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
				this.savedEmission.push(item);
			}, this);

			this.selectAll = false;
			this.copyAllFilters = true;
		},
		updateAllTable: function updateAllTable() { // Seleccionar todos (table)
			this.savedEmission.forEach(function updateChecks(item) {
				item.bandera = this.selectAll;
				item.banderaFiltro = false;

				this.savedEmission = [];
			}, this);

			this.followAll = false;
			this.copyAllFilters = false;
		}
	};
})();
