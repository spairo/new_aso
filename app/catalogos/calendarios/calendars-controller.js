(function wrapper() {
	'use strict';

	angular
		.module('app')
		.controller('CalendarsController', CalendarsController);

	function CalendarsController(calendarsService, $location, $cookies, $route){

		//Functions

		function onGetCalendaries(response) {
			this.calendaries = response.data.encabezado;
		}

		function onGetInfo(response) {
			this.infoCal = response.data.encabezado[0];
			this.dataCal = response.data.datos;
		}

		// Usuario
		this.cdPermisoUsuario = $cookies.get('cdPermisoUsuario');
		this.nuPermisoUsuario = $cookies.get('nuPermisoUsuario');
		this.usuario = $cookies.get('cdUser');

		// Get Details Calendary
		this.getInfoCal = function getInfoCal(id, label){
			if(id){
				this.detailCal = {};
				this.detailCal.id = id;
				this.detailCal.etiqueta = label;

				calendarsService
					.getInfoCal(this.detailCal)
					.then(onGetInfo.bind(this));
			}
		};

		// Submit Cal Form
		this.submitCal = function submitCal() {

			this.calendario.categoria = "calendarioDiaInhabil";
			this.calendario.cdUsuario = this.usuario;

			if(this.detailCal){
				this.calendario.id = this.detailCal.id;
				this.calendario.cadena = this.detailCal.etiqueta;
			}

			if(this.calendario.id > 0){
				calendarsService
					.uploadRecord(this.calendario)
					.then(this.registerModal.success.bind(this.registerModal));
			}else{
				this.calendario.id = 0;
				calendarsService
					.uploadRecord(this.calendario)
					.then(this.registerModal.success.bind(this.registerModal));

				calendarsService
					.getCalendaries()
					.then(onGetCalendaries.bind(this));
			}

			this.registerModal.success.apply(this.registerModal);
			$route.reload();

		};

		// Add Row Cal
		this.addRowCal = function addRowCal() {

			if(!this.addrowcalendary.txComentario){
				this.addrowcalendary.txComentario = "";
			}

			this.addrowcalendary.nuCalendario = this.detailCal.id;
			this.addrowcalendary.usuario = this.usuario;

			calendarsService
				.addDateCal(this.addrowcalendary)
				.then(this.registerModal.success.bind(this.registerModal));
				this.registerModal.success.apply(this.registerModal);

			$route.reload();

		};

		//Services
		calendarsService
			.getCalendaries()
			.then(onGetCalendaries.bind(this));
	}

})();
