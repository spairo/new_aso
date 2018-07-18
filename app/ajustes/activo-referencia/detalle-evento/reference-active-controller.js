(function wrapper() {
	'use strict';

	angular
		.module('app')
		.controller('DetailReferenceActiveController', DetailReferenceActiveController);

	function DetailReferenceActiveController(detailReferenceActiveService, $routeParams) {
		function onGetDetail(response) {
			this.details = response.data;
		}

		// Id
		this.id = $routeParams.id;
		this.activo = $routeParams.activo;
		this.evento =  $routeParams.evento;

		detailReferenceActiveService
			.getDetail({ params : { nuActivoSt: this.id, nuActivo: this.activo, nuEvento: this.evento } })
			.then(onGetDetail.bind(this));
	}
})();
