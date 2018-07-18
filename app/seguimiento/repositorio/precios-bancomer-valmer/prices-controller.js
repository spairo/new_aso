(function wrapper() {
	'use strict';

	angular
		.module('app')
		.controller('ComparativePricesController', ComparativePricesController);

	function ComparativePricesController(comparativePricesService, $cookies, $window, $route) {
		function onGetPrices(response) {
			this.prices = response.data.precios;
			this.today = response.data.fhCarga;
		}

		function onUploadPrices(response) {
			this.adjustmentFactor = response.data;
			$route.reload();
		}

		this.riesgo = 2;

		this.registerPrices = function registerPrices() {
			this.request.cdPermisoUsuario = $cookies.get('cdPermisoUsuario');
			this.request.cdUsuario = $cookies.get('cdUser');
			this.request.nuPermisoUsuario = $cookies.get('nuPermisoUsuario');
			this.request.id = 0;
			this.request.categoria = "precio";

			comparativePricesService
				.uploadPrices(this.request)
				.then(onUploadPrices.bind(this));

			this.newPrice.close();
		};

		comparativePricesService
			.getPrices()
			.then(onGetPrices.bind(this));
	}

})();
