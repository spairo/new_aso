(function wrapper() {
	'use strict';

	angular
	.module('app')
	.controller('usuariosInternosController', usuariosInternosController);

	function usuariosInternosController(usuariosInternosService, $cookies, $location, $scope) {

		function onGetAreas(response){
			this.Area = response.data;
		}
		function onGetGroup(response){
			this.groups = response.data;
		}
		function onGetPermissions(response) {
			this.permissions = response.data;
		}

		//Detail
		this.detail = function detail(area){
			$location.path('/usuarios-internos/detalle-usuarios/' + area);
		};

		//adduser
		this.submituser = function submituser(){
			console.log(this.newUserRegister);
			usuariosInternosService
				.adduser(this.newUserRegister);
		};

		//editArea
		this.editAreas = function editAreas(id){
			usuariosInternosService
				.getpermissions()
				.then(onGetPermissions.bind(this));
		};

		//Area wizard
		this.activeStep = 0;


		//Services
		usuariosInternosService
			.getAreas()
			.then(onGetAreas.bind(this));
		usuariosInternosService
			.getGroup()
			.then(onGetGroup.bind(this));
		usuariosInternosService
			.getpermissions()
			.then(onGetPermissions.bind(this));
	}

})();
