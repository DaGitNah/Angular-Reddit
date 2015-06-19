'use strict';

angular.module('myApp.postview', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/post/:sub/:id/:limit?', {
    templateUrl: 'postview/postview.html',
    controller: 'postviewCtrl as controller'
  });
}])

.controller('postviewCtrl', function($rootScope, $scope, $routeParams, redditApiService) {
	var self = this;

	self.subreddit = $routeParams.sub;
	self.id = $routeParams.id;
	self.limit = $routeParams.limit ? $routeParams.limit : 200;
	self.sidebarOpen = false;

	redditApiService.getPost(this.subreddit, this.id, self.limit).success(function (data, status, headers, config){
		self.post = data[0].data.children[0].data;
		self.comments = data[1].data.children;

	}).error(function(data, status, headers, config) {
		self.errorMessage = 'An error occured, please check your request. Errorcode: '+status;

	}).finally(function(){
		$scope.$emit('showLoader', false);
		
	});

	redditApiService.getSubreddit(this.subreddit).success(function (data, status, headers, config){
		self.subInfo = data.data;
		$scope.$emit('sidebar', true);
	}).error(function(data, status, headers, config) {
		self.errorMessage = 'An error occured while loading the subreddit info, please check your request. Errorcode: '+status;

	});

	self.toggleSidebar = function() {
		self.sidebarOpen = !self.sidebarOpen;
		$scope.$emit('sidebar-toggle', self.sidebarOpen);
	};

	$rootScope.$on("$routeChangeStart", function(event, next, current) {
		self.sidebarOpen = false;
	});

});