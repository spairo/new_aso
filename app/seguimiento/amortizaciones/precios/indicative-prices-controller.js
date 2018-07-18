(function wrapper() {
	'use strict';

	angular
	.module('app')
	.controller('preciosIndicativosController', preciosIndicativosController);

	function preciosIndicativosController(preciosIndicativosService, $cookies, $location, $timeout, $route) {

		this.activeTab = "indicativos";
		this.activeBtns = true;
		this.date = new Date();
		this.hours = '08:35 AM';
		this.elements = "";
		this.blockHours = true;
		this.thread = false;


		//get Inficativos
		function onGetIndicativos(response){
			this.indicativos = response.data.indicativos;
		}

		//Update Indicativos
		function onReloadIndicativos(){
			preciosIndicativosService
			.getIndicativos()
			.then(onGetIndicativos.bind(this));
		}

		// Actualizar precios indicativos
		this.recordIndicativos = function recordIndicativos(){

			this.requestIndicativos.cdPermisoUsuario = $cookies.get('cdPermisoUsuario');
			this.requestIndicativos.cdUsuario = $cookies.get('cdUser');
			this.requestIndicativos.nuPermisoUsuario = $cookies.get('nuPermisoUsuario');
			this.requestIndicativos.id = 0;
			this.requestIndicativos.categoria = "preciosindicativos";

			preciosIndicativosService
				.uploadIndicativos(this.requestIndicativos);

			this.updIndicativos.close();

			onReloadIndicativos();
			$timeout($route.reload, 800);

		};

		// send request updated precios activos

		this.editRecordIndicativos = function editRecordIndicativos(){
			this.request;
			this.thread = false;
			preciosIndicativosService
				.updateIndicativos(this.request);

			onReloadIndicativos();
			$timeout($route.reload, 800);

		};

		this.banderaChecks = function banderaChecks(flag){
			this.activeBtns = flag;
		};

		this.restDay = function restDay(flag){
			if (flag === true) {
				this.horas = 23;
				this.minutos = 59;
			}
		};

		//Services
		preciosIndicativosService
			.getIndicativos()
			.then(onGetIndicativos.bind(this));
	}

	preciosIndicativosController.prototype = {
		updateAll: function updateAll() { // Seleccionar todos
			this.elements.forEach(function updateChecks(elem) {
				elem.bandera = this.selectAll;
				this.activeBtns = false;
			}, this);
		}
	};

})();
