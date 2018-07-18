(function wrapper() {
	'use strict';

	angular
		.module('app')
		.controller('BlotterWarrantsController', BlotterWarrantsController);

	function BlotterWarrantsController(blotterWarrantsService, $cookies, $location, $route, $timeout){
		// Funciones
		function onGetActualizaMontos(response) {
			this.updatemontos = response.data;
		}

		function onGetBoard(response) {
			this.mesas = response.data;
		}

		function onGetTableAmortizations(response) {
			this.amortizations = response.data;
		}

		function onGetTableBlotter(response) {
			this.blotter = response.data;
		}

		function onGetTablePipeline(response) {
			this.pipeline = response.data;
		}

		// Tab
		this.activeTab = 'Blotter';
		this.user = $cookies.get('cdUser');

		// Actualiza Montos
		this.actualizaMontos = function actualizaMontos() {
			blotterWarrantsService
				.actualizaMontos()
				.then(onGetActualizaMontos.bind(this));
		};

		// Actualiza Montos
		this.actualizaGat = function actualizaGat() {
			blotterWarrantsService
				.actualizaGat();
				//.then(onGetActualizaMontos.bind(this));
		};

		// Desplegar Amortizaciones
		this.getAmortizations = function getAmortizations(blotter) {
			if (!blotter.amortizations) {
				this.serie = blotter[3];

				blotterWarrantsService
					.getTableAmortization({ nuEstrategia: blotter[1] })
					.then(onGetTableAmortizations.bind(blotter));
			}
		};

		// Modales Etiquetas Personalizadas
		this.modalMeta = {
			customizeBlotter: {
				tag: 'blotter'
			},
			customizePipeline: {
				tag: 'pipeline'
			},
			detailAmortizacion: {
				title: 'Detalle de recompra'
			},
			regAmortizacion: {
				title: 'Registro de recompra'
			}
		};

		// Registro de amortización
		this.recordAmortization = function recordAmortization(){
			if(this.file){
				this.file.categoria = 'amortizacion';
				this.file.cdPermisoUsuario = $cookies.get('cdPermisoUsuario');
				this.file.cdUsuario = $cookies.get('cdUser');
				this.file.id = 0;
				this.file.nuPermisoUsuario = $cookies.get('nuPermisoUsuario');

				blotterWarrantsService
					.uploadRecord(this.file)
					.then(this.regAmortization.success.bind(this.regAmortization));
			} else {
				this.regAmortization.success.apply(this.regAmortization);
			}
			this.regAmortization.close();
		};

		// Guardar Personalizar Vista
		this.saveCustomize = function saveCustomize() {
			this.customize = {};
			this.customize.encabezado = this.blotter.encabezados;
			this.customize.nuInterfaz = 2;
			this.customize.usuario = $cookies.get('cdUser');

			blotterWarrantsService
				.saveCustomView(this.customize);
				$timeout($route.reload, 800);
		};

		// Enviar edición de amortizaciones
		this.submitAmortization = function submitAmortization() {
			this.amortizacion.cdPermisoUsuario = $cookies.get('cdPermisoUsuario');
			this.amortizacion.cdUsuario = $cookies.get('cdUser');
			this.amortizacion.nuPermisoUsuario = $cookies.get('nuPermisoUsuario');
			blotterWarrantsService
				.updateAmortization(this.amortizacion)
				.then(this.editAmortizations.close());
			$route.reload();

		};

		// Ir al detalle
		this.viewDetail = function viewDetail(tipo, id) {
			$location.path('/blotter-warrants/detalle-emision/' + tipo + '/' + id);
		};

		// Servicios
		blotterWarrantsService
			.consultTableBlotter({ params: { tipo: 1, usuario: $cookies.get('cdUser') } })
			.then(onGetTableBlotter.bind(this));
		blotterWarrantsService
			.consultTableBlotter({ params: { tipo: 2, usuario: $cookies.get('cdUser') } })
			.then(onGetTablePipeline.bind(this));
		blotterWarrantsService
			.getBoard()
			.then(onGetBoard.bind(this));
	}

	BlotterWarrantsController.prototype = {
		updateAll: function updateAll(prop) { // Seleccionar todos (personalización vista)
			this[prop].encabezados.forEach(function updateHeaders(header) {
				header.visibleUsuario = this.selectAll;
			}, this);
		}
	};

})();
