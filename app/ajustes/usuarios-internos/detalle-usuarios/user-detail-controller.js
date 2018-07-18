(function wrapper() {
	'use strict';

	angular
	.module('app')
	.controller('detalleUsuariosController', detalleUsuariosController);

	function detalleUsuariosController(detalleUsuariosService, $cookies, $location, $window, $scope) {

		function onGetUsers(response){
			this.users = response.data;
		}

		function onGetUserDetail(response){
			this.userDetail = response.data;
		}

		function onGetArea(response){
			this.Area = response.data;
		}

		function onGetGroup(response){
			this.Group = response.data;
		}

		this.getDetail = function getDetail(ID){
			detalleUsuariosService
				.getUserDetail()
				.then(onGetUserDetail.bind(this));
		};

		// Flags
		this.filterSearchGroup = false;

		//Services
		detalleUsuariosService
			.getUsers()
			.then(onGetUsers.bind(this));

		detalleUsuariosService
			.getArea()
			.then(onGetArea.bind(this));

		detalleUsuariosService
			.getGroup()
			.then(onGetGroup.bind(this));
	}

})();
