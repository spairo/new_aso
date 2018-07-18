(function wrapper() {
	'use strict';

	angular
		.module('app')
		.controller('BlotterStructuredNotesController', BlotterStructuredNotesController);

	function BlotterStructuredNotesController(blotterStructuredNotesService, $cookies, $location, $route, $timeout) {
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
			blotterStructuredNotesService
				.actualizaMontos()
				.then(onGetActualizaMontos.bind(this));
		};

		// Actualiza Gat
		this.actualizaGat = function actualizaGat() {
			blotterStructuredNotesService
				.actualizaGat();
				//.then(onGetActualizaMontos.bind(this));
		};

		// Desplegar Amortizaciones
		this.getAmortizations = function getAmortizations(blotter) {
			if (!blotter.amortizations) {
				this.serie = blotter[3];

				blotterStructuredNotesService
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
				title: 'Detalle de amortizaci\u00f3n'
			},
			regAmortizacion: {
				title: 'Registro de amortizaciones'
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

				blotterStructuredNotesService
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
			this.customize.nuInterfaz = 1;
			this.customize.usuario = $cookies.get('cdUser');

			blotterStructuredNotesService
				.saveCustomView(this.customize);
				$timeout($route.reload, 1000);
		};

		// Enviar edición de amortizaciones
		this.submitAmortization = function submitAmortization() {
			this.amortizacion.cdPermisoUsuario = $cookies.get('cdPermisoUsuario');
			this.amortizacion.cdUsuario = $cookies.get('cdUser');
			this.amortizacion.nuPermisoUsuario = $cookies.get('nuPermisoUsuario');

			blotterStructuredNotesService
				.updateAmortization(this.amortizacion)
				.then(this.editAmortizations.close());
			$route.reload();
		};

		// Ir al detalle
		this.viewDetail = function viewDetail(tipo, id) {
			$location.path('/blotter-notas-estructuradas/detalle-emision/' + tipo + '/' + id);
		};

		// Servicios
		blotterStructuredNotesService
			.consultTableBlotter({ params: { tipo: 1, usuario: $cookies.get('cdUser') } })
			.then(onGetTableBlotter.bind(this));
		blotterStructuredNotesService
			.consultTableBlotter({ params: { tipo: 2, usuario: $cookies.get('cdUser') } })
			.then(onGetTablePipeline.bind(this));
		blotterStructuredNotesService
			.getBoard()
			.then(onGetBoard.bind(this));
	}

	BlotterStructuredNotesController.prototype = { // Seleccionar todos (personalización vista)
		updateAll: function updateAll(prop) {
			this[prop].encabezados.forEach(function updateHeaders(header) {
				header.visibleUsuario = this.selectAll;
			}, this);
		}
	};

})();
