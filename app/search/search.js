'use strict';

angular.module('myApp.search', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {

	$routeProvider.when('/search/:query/:sort?', {
		templateUrl: 'search/search.html',
		controller: 'searchCtrl as controller'
	});

}])

.controller('searchCtrl', function($scope, $routeParams, redditApiService) {
	var self = this;

	self.query = $routeParams.query
	self.sort = $routeParams.sort || "all"

	redditApiService.getSearchResults(self.query, self.sort).success(function (data, status, headers, config){
		self.results = data.data.children;

	}).error(function(data, status, headers, config) {
		self.errorMessage = 'An error occured, please check your request. Errorcode: '+status;

	}).finally(function(){
		$scope.$emit('showLoader', false);
		
	});
});