(function wrapper() {
	'use strict';

	angular
		.module('app')
		.controller('ComparativePerformanceController', ComparativePerformanceController);

	function ComparativePerformanceController(comparativePerformanceService, $cookies, $route){

		function onGetPerform(response) {
			this.rendimientos = response.data.rendimientos;
			this.today = response.data.fhCarga;
		}

		function onGetLast(response){
      comparativePerformanceService
			.getPerformance();
      $route.reload();
    }


		this.registerPerform = function registerPerform() {
			this.request.cdPermisoUsuario = $cookies.get('cdPermisoUsuario');
			this.request.cdUsuario = $cookies.get('cdUser');
			this.request.nuPermisoUsuario = $cookies.get('nuPermisoUsuario');
			this.request.id = 0;
			this.request.categoria = "rendimiento";

			comparativePerformanceService
				.uploadPerform(this.request)
				.then(onGetLast.bind(this));

			this.newPerfom.close();
			$route.reload();
		};

		comparativePerformanceService
			.getPerformance()
			.then(onGetPerform.bind(this));
	}
})();
