(function wrapper() {
	'use strict';

	angular
		.module('app.services')
		.decorator('$http', multipartDecorator);

	function multipartDecorator($delegate) {
		$delegate.multipart = function multipart(url, data, customConfig) {
			var config = customConfig || { },
				method = config.method || 'post',
				request = new FormData();

			config.headers = angular.extend(config.headers || { }, {
				'Content-Type': undefined
			});
			config.transformRequest = angular.identity;
			delete config.method;

			angular.forEach(data, function appendData(value, key) {
				request.append(key, value);
			});

			return $delegate[method](url, request, config);
		};

		return $delegate;
	}
})();
