(function wrapper() {
	'use strict';

	angular
		.module('app')
		.controller('InflationController', InflationController);

	function InflationController(inflationService, $cookies, $route, $timeout){

		function onGetInflation(response) {
			this.inflacion = response.data;
		}

		// Upload Inflation file
		this.registerInflation = function registerInflation(){
			this.request.cdPermisoUsuario = $cookies.get('cdPermisoUsuario');
			this.request.cdUsuario = $cookies.get('cdUser');
			this.request.nuPermisoUsuario = $cookies.get('nuPermisoUsuario');
			this.request.id = 0;
			this.request.categoria = "inflacion";

			inflationService
				.uploadPerform(this.request);

			this.newInflation.close();

			inflationService
				.getInflation()
				.then(onGetInflation.bind(this));

			$timeout($route.reload, 1200);
		};

		// Actualiza Gat
		this.actualizaGat = function actualizaGat(){
			inflationService
				.actualizaGat();
		};

		inflationService
			.getInflation()
			.then(onGetInflation.bind(this));

	}
})();
