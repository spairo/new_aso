(function wrapper() {
	'use strict';

	angular
		.module('app.directives')
		.directive('datePicker', datePickerDirective);

	function datePickerDirective() {
		var directiveDefinition = {
			link: link,
			require: 'ngModel',
			restrict: 'C'
		};

		function link(scope, element, attrs, ngModel) {
			var today = new Date();

			element.DatePicker({
				current: '',
				date: String(today.getDate()),
				format: 'd/m/Y',
				starts: 1,
				onChange: function(formated, dates) {
					function updateModel() {
						ngModel.$setViewValue(element.DatePickerGetDate().getTime());
					}

					element.val(formated);
					element.DatePickerHide();
					scope.$apply(updateModel);
				},
				onShow: function() {
				  element.DatePickerSetDate(element.val() || today, true);

					$('.close').on('click', function closeCalendar() {
						element.DatePickerHide();
					});

					$('.date-name').on('click', function todayDate() {
						ngModel.$setViewValue(today.getTime());
						element.DatePickerHide();
					});
				}
			});
		}

		return directiveDefinition;
	}
})();
