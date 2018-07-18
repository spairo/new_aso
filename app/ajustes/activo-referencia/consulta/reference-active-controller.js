(function wrapper() {
	'use strict';

	angular
		.module('app')
		.controller('ReferenceActiveController', ReferenceActiveController);

	function ReferenceActiveController(referenceActiveService, $cookies, $location, $route, $routeParams) {

		function onGetAdjustmentFactor(response){
			this.adjustmentFactor = response.data;
		}

		function onGetEvent(response){
			this.event = response.data;
		}

		function onGetHistoricalEvents(response){
			this.historical = response.data;
		}

		function onGetReference(response){
			this.active = response.data;
		}

		this.cdPermisoUsuario = $cookies.get('cdPermisoUsuario');
		this.nuPermisoUsuario = $cookies.get('nuPermisoUsuario');
		this.usuario = $cookies.get('cdUser');

		this.id = $routeParams.id;
		this.activo = $routeParams.activo;
		this.evento =  $routeParams.evento;

		// Calcular factor de ajuste (modal)
		this.calculateFactor = function calculateFactor() {
			this.request.cdPermisoUsuario = this.cdPermisoUsuario;
			this.request.nuPermisoUsuario = this.nuPermisoUsuario;
			this.request.nuActivo = this.newRegister.active.nuCatalogo;
			this.request.nbActivo  = this.newRegister.active.txCatalogo;
			this.request.nbEvento = this.newRegister.event.txCatalogo;
			this.request.nuEvento = this.newRegister.event.nuCatalogo;
			this.request.user = this.usuario;
			this.request.status = 1;

			referenceActiveService
				.getAdjustmentFactor(this.request)
				.then(onGetAdjustmentFactor.bind(this));
		};

		// Registrar nuevo evento (modal)
		this.registerEvents = function registerEvents() {
			this.adjustmentFactor.cdPermisoUsuario = this.cdPermisoUsuario;
			this.adjustmentFactor.nuPermisoUsuario = this.nuPermisoUsuario;
			this.adjustmentFactor.cdUser = this.usuario;

			referenceActiveService
				.getReferencesave(this.adjustmentFactor)
				.then(onGetAdjustmentFactor.bind(this));

				$route.reload();
		};


		// Ir al detalle
		this.viewDetail = function viewDetail(id, activo, evento) {
			$location.path('/eventos-activo-referencia/detalle-evento/' + id + '/' + activo + '/' + evento);
		};

		referenceActiveService
			.getEvent()
			.then(onGetEvent.bind(this));
		referenceActiveService
			.getHistoricalEvents()
			.then(onGetHistoricalEvents.bind(this));
		referenceActiveService
			.getReference({ params: { user: this.usuario } })
			.then(onGetReference.bind(this));
	}

	ReferenceActiveController.prototype = {
		updateAll: function updateAll() { // Seleccionar todos
			this.adjustmentFactor.forEach(function updateChecks(ajuste) {
				ajuste.bandera = this.selectAll;
			}, this);
		}
	};
})();
