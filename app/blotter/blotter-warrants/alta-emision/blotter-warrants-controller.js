(function wrapper() {
	'use strict';

	angular
	.module('app')
	.controller('CreateBlotterWarrantsController', CreateBlotterWarrantsController);

	function CreateBlotterWarrantsController(createBlotterWarrantsService, $location, $cookies) {
		//Functions
		function onGetComercialization(response){
			this[42] = response.data;
		}

		function onGetCurrencies(response){
			this[11] = response.data;
		}

		function onGetCustomers(response){
			this[17] = response.data;
		}

		function onGetFields(response){
			this.fields = response.data;
		}

		function onGetLiquidationCurrency(response){
			this[63] = response.data;
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

		function onGetSections(response) {
			this.sections = response.data;
		}

		function onGetSubyacentes(response){
			this[14] = response.data;
		}

		function onGetVehicles(response){
			this.vehicles = response.data;
		}

		function onSubmitEmission() { // Regresar a consulta
			$location.path('blotter-warrants/consulta');
		}

		// Datos por default
		this.today = new Date().getTime();

		this.request = {
			datos: {
				"6": this.today,
				"22": 100,
				"29": 100,
				"30": 100,
			},
			activos: []
		};

		// Select Payoff New
		this.payoffSelected = function payoffSelected(id) {
			if (id >= 0) {
				createBlotterWarrantsService
				.getPayoffDocs({ params: { id: id } })
				.then(onGetPayoffDocs.bind(this));
			}
		};

		// Mostrar campos al seleccionar un vehículo
		this.productSelected = function productSelected(id) {
			if (id >= 0) {
				createBlotterWarrantsService
				.getFields({ params: { id: id, usuario: this.usuario } })
				.then(onGetFields.bind(this));
			}
		};

		// Select Área Ventas
		this.salesAreaSelected = function salesAreaSelected(id) {
			if (id >= 0) {
				createBlotterWarrantsService
				.getSalesGroup({ params: { id: id, filtro: true } })
				.then(onGetSalesGroup.bind(this));
			}
		};

		// Select Área Grupos
		this.salesGroupSelected = function salesGroupSelected(id) {
			if (id >= 0) {
				createBlotterWarrantsService
				.getCustomers({ params: { id: id } })
				.then(onGetCustomers.bind(this));
			}
		};

		// Enviar form
		this.submitEmission = function submitEmission() {
			this.request.cdPermisoUsuario = this.cdPermisoUsuario;
			this.request.nuPermisoUsuario = this.nuPermisoUsuario;
			this.request.usuario = this.usuario;

			createBlotterWarrantsService
			.saveDeal(this.request)
			.then(onSubmitEmission);
		};

		// Select Subyacente
		this.subyacenteSelected = function subyacenteSelected(id) {
			if (id >= 0) {
				createBlotterWarrantsService
				.getReference({ params: { id: id } })
				.then(onGetReference.bind(this));

				createBlotterWarrantsService
				.getPayoffNew({ params: { id: id } })
				.then(onGetPayoffNew.bind(this));
			}

			this.request.datos[32] = [];
		};

		//Monto Emitido to Monto MXN
		this.amountIssued = function amountIssued(){
			if(this.request.datos && this.request.datos[11].nuCatalogo === 5){
				if(this.request.datos[10]){
					this.request.datos[13] = this.request.datos[10];
					this.request.datos[79] = this.request.datos[10];
				}
			}
			else{
				if(this.request.datos[10]){
					this.request.datos[79] = this.request.datos[10];
				}
			}
		};

		//Cambio de Divisa
		this.currencyChange = function currencyChange(){
			if (this.request.datos && this.request.datos[11].nuCatalogo !== 5) {
				this.request.datos[13] = "";
			}
			else{
				this.request.datos[13] = this.request.datos[10];
			}
		};

		this.cdPermisoUsuario = $cookies.get('cdPermisoUsuario');
		this.nuPermisoUsuario = $cookies.get('nuPermisoUsuario');
		this.usuario = $cookies.get('cdUser');

		// Services
		createBlotterWarrantsService
		.getComercialization()
		.then(onGetComercialization.bind(this));
		createBlotterWarrantsService
		.getCurrencies()
		.then(onGetCurrencies.bind(this));
		createBlotterWarrantsService
		.getLiquidationCurrency()
		.then(onGetLiquidationCurrency.bind(this));
		createBlotterWarrantsService
		.getSalesArea({ params: { usuario: this.usuario, filtro: true } })
		.then(onGetSalesArea.bind(this));
		createBlotterWarrantsService
		.getSections()
		.then(onGetSections.bind(this));
		createBlotterWarrantsService
		.getSubyacentes({ params: { usuario: this.usuario, filtro: true } })
		.then(onGetSubyacentes.bind(this));
		createBlotterWarrantsService
		.getVehicles({ params: { estatus: 1 } })
		.then(onGetVehicles.bind(this));
	}

})();
