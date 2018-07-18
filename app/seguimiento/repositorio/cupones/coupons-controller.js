(function wrapper() {
	'use strict';

	angular
		.module('app')
		.controller('ComparativeCouponController', ComparativeCouponController);

	function ComparativeCouponController(comparativeCouponService, $cookies, $route, $window, $timeout){

		function onGetCoupon(response){
			this.cupones = response.data.cupones;
			this.today = response.data.fhCarga;
		}

		this.registerCoupon = function registerCoupon() {
			this.requestCoupon.cdPermisoUsuario = $cookies.get('cdPermisoUsuario');
			this.requestCoupon.cdUsuario = $cookies.get('cdUser');
			this.requestCoupon.nuPermisoUsuario = $cookies.get('nuPermisoUsuario');
			this.requestCoupon.id = 0;
			this.requestCoupon.categoria = "cupon";

			comparativeCouponService
				.uploadCoupon(this.requestCoupon);

			this.newCoupon.close();
			comparativeCouponService
				.getCoupons()
				.then(onGetCoupon.bind(this));
			$timeout($route.reload, 800);
		};

		comparativeCouponService
			.getCoupons()
			.then(onGetCoupon.bind(this));
	}
})();
