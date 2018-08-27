var app = angular.module('Demo', ['ngSanitize','GoogleCalendar','TrelloTasks','DigitalClock','WeekWeather']);

app.controller('googleCtrl', function($scope, $interval, RestHandler){

	$scope.demo = {
		hideTitle: false,
		google_key: 'AIzaSyAGv0WYi_EuJf0dOJpuDvnVlWaajSBTdCg',
		calendar_id: 'dragan.gaic@gmail.com',
		htmlDesc: true,
		max: 10
	};
});

app.factory('RestHandler', ['$http', '$rootScope', 'CONSTANTS',  function ($http, $rootScope, CONSTANTS) {

	var getTasksURL = "https://api.trello.com/1/lists/" + CONSTANTS.SECURITY.LIST_ID + "/cards?key=" + CONSTANTS.SECURITY.KEY + "&token=" + CONSTANTS.SECURITY.TOKEN;
	var getWeatherURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + CONSTANTS.WEATHER.CITY + "&units=metric&appid=" + CONSTANTS.WEATHER.APPID;

	function restHandler(url, method, data, callback, functionName, dummy) {
		var request = $http({
			method: method,
			url: url,
			data: data
		}).success(function (resp) {
			callback(resp);
		}).error(function (resp) {
			console.log("Error: " + functionName);
			callback(dummy);
		});
	}

	return {
		getTasks : function(callback)  {
			restHandler(getTasksURL, CONSTANTS.REST.METHOD_GET, null, callback, 'getTasks', null);
		},
		getWeather : function(callback)  {
			restHandler(getWeatherURL, CONSTANTS.REST.METHOD_GET, null, callback, 'getWeather', null);
		}		
	};
}]);