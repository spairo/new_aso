(function wrapper() {
	'use strict';

	angular
	.module('app')
	.controller('RecordingProgramsController', RecordingProgramsController);

	function RecordingProgramsController(recordingProgramsService, $cookies) {
		// Funciones
		function onGetColors(response) {
			this.colors = response.data;
		}

		function onGetCurrencies(response) {
			this.currency = response.data;
		}

		function onGetProducts(response) {
			this.products = response.data;
		}

		function onGetPrograms(response) {
			this.program = response.data;

			for (var i = 0; i < this.program.length; i++){
				if (this.program[i].txCriterio == "null" || this.program[i].txCriterio == null) {
					this.program[i].txCriterio = " ";
				}
			}
		}

		function onSubmitProgram(response) {

			if (this.file) { // Acta de programa
				if (this.request.nuVehiculo) {
					this.file.id = this.request.nuVehiculo;
				} else {
					this.file.id = response.data.code;
				}

				this.file.categoria = 'programa';
				this.file.cdPermisoUsuario = $cookies.get('cdPermisoUsuario');
				this.file.cdUsuario = $cookies.get('cdUser');
				this.file.nuPermisoUsuario = $cookies.get('nuPermisoUsuario');

				recordingProgramsService
				.uploadRecord(this.file)
				.then(this.registerModal.success.bind(this.registerModal));
			} else {
				this.registerModal.success.apply(this.registerModal);
			}

		}

		// Crea propiedad para personalización de vista en modal (Editar y Crear)
		this.modalMeta = {
			create: {
				service: recordingProgramsService.createPrograms,
				submitLabel: 'Registrar',
				title: 'Registro de programa'
			},
			edit: {
				service: recordingProgramsService.editPrograms,
				submitLabel: 'Aplicar',
				title: 'Edici\u00f3n de programa'
			}
		};

		// Inicialización de variables al crear
		this.newProgram = {
			cdColor:'NEW_COLOR',
			nbColor: '#094FA4',
			nuColor: 11,
			nuVehiculo: 0,
			pcPrimeraAlerta: 0,
			pcSegundaAlerta: 0,
			stActivo: false,
			stEmsnAutorizada: false,
			stMontoAutorizado: false,
			stSeguimientoDashboard: true
		};

		// Configuración de slides (rangos)
		this.slideOptions = {
			ceil: 100,
			floor: 0
		};

		// Submit form
		this.submitProgram = function submitProgram() {
			this.request.cdPermisoUsuario = $cookies.get('cdPermisoUsuario');
			this.request.cdUsuario = $cookies.get('cdUser');
			this.request.nuPermisoUsuario = $cookies.get('nuPermisoUsuario');
			if (this.request.txCriterio === "") {
				this.request.txCriterio = "null";
			}

			this.registerModal.meta
			.service(this.request)
			.then(onSubmitProgram.bind(this));
		};

		// Servicios
		recordingProgramsService
		.getColors()
		.then(onGetColors.bind(this));
		recordingProgramsService
		.getCurrencies()
		.then(onGetCurrencies.bind(this));
		recordingProgramsService
		.getProducts()
		.then(onGetProducts.bind(this));
		recordingProgramsService
		.getPrograms()
		.then(onGetPrograms.bind(this));
	}

	RecordingProgramsController.prototype = {
		initMountDisable: function initMountDisable(monto, value) { // Checks disabled

			if(value){
				this.request[monto] = 0;
			}else{
				delete this.request[monto];
			}

		},
		selected: function selected(color, id, cat) { // Tooltip colores
			if (color) {
				this.request.cdColor = cat;
				this.request.nbColor = color;
				this.request.nuColor = id;
				this.validated = color;
			}
		}
	};

})();
