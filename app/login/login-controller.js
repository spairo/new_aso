(function wrapper() {
	'use strict';

	angular
	.module('app')
	.controller('LoginController', LoginController);

	function LoginController(loginService, $cookies, $location, $window, $scope) {

		function validateLogin(response) {
			this.loginData = response.data;

			if (this.loginData.esUsuario && this.loginData.banquero) {

				this.loginData.error = false;
				$cookies.put('cdPermisoUsuario', this.loginData.cdPermisoUsuario);
				//$cookies.put('cdUser', this.loginData.cdUsuario);
				$cookies.put('nuPermisoUsuario', this.loginData.nuPermisoUsuario);
				$cookies.put('txNombre', this.loginData.txNombre);
				$cookies.put('banquero', true);
				$cookies.put('entorno', this.loginData.entorno);
				//$cookies.put('discModal', true);
				window.localStorage.setItem("sysDisclaimer", this.loginData.disclaimer);
				window.localStorage.setItem("stDiscModal", true);
				$window.location.hash = "#!/portafolios-inversion";
				$window.location.reload();

			} else {
				$location.path('/login');
				this.loginData.error = true;
				return;
			}
		}

		this.submitLogin = function submitLogin(){
			if (this.login.cdPass && this.login.cdPass) {
				loginService
				.login(this.login)
				.then(validateLogin.bind(this));
			}
		};
	}

})();
