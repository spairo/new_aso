(function wrapper() {
	'use strict';

	angular
		.module('app.routes')
		.provider('RouteHelper', RouteHelperProvider);

	function RouteHelperProvider($routeProvider) {
		var provider = {
			$get: angular.noop,
			createRoutes: function createRoutes(routes) {
				angular.forEach(routes, function createResolve(options, url) {
					if (options.deps) {
						options.resolve = { deps: provider.retrieveDeps(options.deps) };
					}

					$routeProvider.when(url, options);

					if (options.otherwise) {
						$routeProvider.otherwise({ redirectTo: url });
					}
				});
			},
			retrieveDeps: function retrieveDeps(deps) {
				var factory = ['$q', '$rootScope', function retrieve($q, $rootScope) {
					var deferred = $q.defer();

					$script(deps, function resolveDeps() {
						$rootScope.$apply(deferred.resolve);
					});

					return deferred.promise;
				}];

				return factory;
			}
		};

		return provider;
	}
})();
