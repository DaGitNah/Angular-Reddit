'use strict';

angular.module('myApp.subview', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {

	// Routing for subview, additional parameters are optional
	$routeProvider.when('/r/:sub?/:sort?/:time?/:last?/:direction?', {
		templateUrl: 'subview/subview.html',
		controller: 'subviewCtrl as controller'
	});

}])

.controller('subviewCtrl', function($rootScope, $scope, $routeParams, redditApiService) {
	var self = this;

	// Safety checks
	self.subreddit = $routeParams.sub ? $routeParams.sub : 'all';
	self.sort = $routeParams.sort ? $routeParams.sort : 'hot';
	self.time = $routeParams.time ? $routeParams.time : 'day';
	self.last = $routeParams.last ? $routeParams.last : undefined;
	self.direction = $routeParams.direction ? $routeParams.direction : 'after';
	self.busy = false; // Prevents autoload form loading if it's not done yet

	self.loadMore = function() {
		// Prevents autoload form loading if it's not done yet
		if(self.busy)
			return;

		self.busy = true;

		// Get more posts
		redditApiService.getPosts(this.subreddit, this.sort, this.time, this.last, 'after').success(function (data, status, headers, config){
			// Add posts to existing data
			for(var i=0; i<data.data.children.length;i++) {
				self.posts.push(data.data.children[i]);
			}
			// Set last post (for reference)
			self.last = data.data.children[data.data.children.length - 1].data.name;
			self.first = data.data.children[0].data.name;

		}).error(function(data, status, headers, config) {
			self.errorMessage = 'An error occured, please check your request. Errorcode: '+status;
		}).finally(function() {
			self.busy = false;
		});
	}

	if(self.subreddit != "all") {
		// Get sidebar info (/all doesnt have a sidebar)
		redditApiService.getSubreddit(this.subreddit).success(function (data, status, headers, config){
			self.subInfo = data.data;
			$scope.$emit('sidebar', true);
		}).error(function(data, status, headers, config) {
			self.errorMessage = 'An error occured while loading the subreddit info, please check your request. Errorcode: '+status;
		});
	}
	
	self.toggleSidebar = function() {
		// Toggles the subreddit sidebar
		self.sidebarOpen = !self.sidebarOpen;
		$scope.$emit('sidebar-toggle', self.sidebarOpen);
	};

	$rootScope.$on("$routeChangeStart", function(event, next, current) {
		// Closes subreddit sidebar on navigation
		self.sidebarOpen = false;
	});

	redditApiService.getPosts(this.subreddit, this.sort, this.time, this.last, self.direction).success(function (data, status, headers, config){
		// Get posts
		self.posts = data.data.children;
		self.last = data.data.children[data.data.children.length - 1].data.name;
		self.first = data.data.children[0].data.name;

		// Hide loader
		$scope.$emit('pageReady', true);
	}).error(function(data, status, headers, config) {
		self.errorMessage = 'An error occured, please check your request. Errorcode: '+status;
	}).finally(function(){
		$scope.$emit('showLoader', false);
	});
});