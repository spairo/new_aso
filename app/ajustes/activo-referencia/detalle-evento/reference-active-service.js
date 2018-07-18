(function wrapper() {
	'use strict';

	angular
		.module('app')
		.factory('detailReferenceActiveService', detailReferenceActiveServiceFactory);

	function detailReferenceActiveServiceFactory(apiBuilder) {
		var service = {
			getDetail: {
				method: 'get',
				url: '/eventoActivoReferencia/detalleHistoricoEvento'
			},
		};

		return apiBuilder(service);
	}
})();
