'use strict';

angular.module('myApp.subview', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {

	$routeProvider.when('/r/:sub?/:sort?', {
		templateUrl: 'subview/subview.html',
		controller: 'subviewCtrl as controller'
	});

}])

.controller('subviewCtrl', function($scope, $routeParams, redditApiService) {
	var self = this;

	self.subreddit = $routeParams.sub ? $routeParams.sub : 'all';
	self.sort = $routeParams.sort ? $routeParams.sort : 'top';

	redditApiService.getPosts(this.subreddit, this.sort).success(function (data, status, headers, config){
		self.posts = data.data.children;

	}).error(function(data, status, headers, config) {
		self.errorMessage = 'An error occured, please check your request. Errorcode: '+status;

	}).finally(function(){
		$scope.$emit('showLoader', false);
		
	});
});