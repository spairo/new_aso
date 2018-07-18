(function wrapper() {
	'use strict';

	angular
	.module('app')
	.controller('detalleAmortizacionesController', detalleAmortizacionesController);

	function detalleAmortizacionesController(detalleAmortizacionesService, $cookies, $location, $timeout, $route) {

		this.activeTab = "amortizaciones";
		this.date = new Date();
		this.strategyView = false;
		console.log(this.strategyView);
		this.viewBy = [
			{ txVista : "Estrategia" },
			{ txVista : "Banqueros" }
		];

		function onGetBankerDetails(response){
			this.bankerdetails = response.data;
		}

		function onViewDetail(response){
			this.viewDetail = response.data;
		}

		this.viewDetail = function viewDetail(id){

			detalleAmortizacionesService
				.getViewDetail()
				.then(onViewDetail.bind(this));

		};

		//Services
		detalleAmortizacionesService
			.getBankerdetails()
			.then(onGetBankerDetails.bind(this));

	}

})();
