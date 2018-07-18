(function wrapper() {
	'use strict';

	angular
		.module('app.directives')
		.directive('inputFile', inputFileDirective);

	function inputFileDirective() {
		var directiveDefinition = {
			link: link,
			replace: true,
			restrict: 'E',
			scope: {
				model: '=',
				onload: '&'
			},
			templateUrl: 'js/directives/input-file/template.html',
		};

		function link(scope, element) {
			var fileButton = element.find('[type = file]'),
				filePicker = element.find('.file-picker');

			function openFileManager() {
				fileButton.trigger('click');
			}

			function retrieveFile(event) {
				scope.$apply(function setFile() {
					scope.model = event.originalEvent.target.files[0];
					fileButton.val('');
				});

				scope.onload();
			}

			fileButton.on('change', retrieveFile);
			filePicker.on('click', openFileManager);
		}

		return directiveDefinition;
	}
})();
