(function wrapper() {
	'use strict';

	angular
		.module('app')
		.factory('usuariosInternosService', usuariosInternosFactory);

	function usuariosInternosFactory(apiBuilder) {
		var service = {
			adduser: {
				method: 'post',
				url: '/usuarios/agregar'
			},
			getpermissions: {
				method: 'get',
				url: '/usuarios/permissions'
			},
			getAreas: {
				method: 'get',
				url: '/catalog/areaUsuarios'
			},
			getGroup: {
				method: 'get',
				url: '/catalog/group'
			}
		};

		return apiBuilder(service);
	}
})();
