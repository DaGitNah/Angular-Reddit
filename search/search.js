'use strict';

angular.module('myApp.search', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {

	// Search routing, query is manditory sort is optional
	$routeProvider.when('/search/:query/:sort?', {
		templateUrl: 'search/search.html',
		controller: 'searchCtrl as controller'
	});

}])

.controller('searchCtrl', function($scope, $routeParams, redditApiService) {
	var self = this;

	// Safety checks
	self.query = $routeParams.query
	self.sort = $routeParams.sort || "all"

	redditApiService.getSearchResults(self.query, self.sort).success(function (data, status, headers, config){
		self.results = data.data.children;
	}).error(function(data, status, headers, config) {
		self.errorMessage = 'An error occured, please check your request. Errorcode: '+status;
	}).finally(function(){
		// Hide loader
		$scope.$emit('showLoader', false);
	});
});