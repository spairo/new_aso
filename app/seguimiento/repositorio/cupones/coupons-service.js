(function wrapper() {
	'use strict';

	angular
		.module('app')
		.factory('comparativeCouponService', comparativeCouponServiceFactory);

	function comparativeCouponServiceFactory(apiBuilder) {
		var service = {
			getCoupons: {
				method: 'get',
				url: '/cupon/consultaCarga'
			},
			uploadCoupon: {
				method: 'multipart',
				url: '/cargaArchivo'
			}
		};

		return apiBuilder(service);
	}
})();
