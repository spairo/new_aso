(function wrapper() {
	'use strict';

	angular
		.module('app')
		.factory('detalleUsuariosService', detalleUsuariosFactory);

	function detalleUsuariosFactory(apiBuilder) {
		var service = {
			getUsers: {
				method: 'get',
				url: '/usuarios/users'
			},
			getUserDetail: {
				method: 'get',
				url: '/usuarios/userDetail'
			},
			getArea: {
				method: 'get',
				url: '/catalog/areaUsuarios'
			},
			getGroup: {
				method: 'get',
				url: '/catalog/grupos'
			}
		};

		return apiBuilder(service);
	}
})();
