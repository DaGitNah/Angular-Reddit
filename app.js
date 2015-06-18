'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
	'ngRoute',
	'myApp.subview',
	'myApp.postview',
	'myApp.search',
	'myApp.version',
	'ngSanitize',
	'markdown'
	])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.otherwise(
	{
		redirectTo: '/r/all/top'
	});
}])

.controller('appCtrl', function($scope, $rootScope, $location, $routeParams, redditApiService) {

	var self = this;
	self.showLoader = true;
	self.menuOpen = false;
	self.searchQuery = "";

	self.sort = $location.path().split('/')[3];
	self.sortTypes = [
	'top',
	'hot',
	'controversial',
	'new'
	];

	redditApiService.getSubreddits().success(function (data, status, headers, config){
		self.subreddits = data.data.children;
	})

	if(self.sortTypes.indexOf(self.sort) == -1){
		self.sort = "hot";
	}

	$rootScope.$on("$routeChangeStart", function(event, next, current) {
		self.showLoader = true;
	});

	$scope.$on('showLoader', function(event, args){
		self.showLoader = args[0];
	});

	self.setLocation = function(location, overwrite) {
		overwrite ? window.location = location : $location.path(location);
	}

	self.toggleMenu = function() {
		self.menuOpen = !self.menuOpen;
	}

	self.setSort = function() {
		$location.path('r/'+ $location.path().split('/')[2]+ '/' + self.sort);
	}

	self.search = function() {
		var query = self.searchQuery.replace(' ', '+'); 
		if(query.length == 0)
			return;

		self.setLocation('search/'+query, false)
	}
})

.factory('redditApiService', function($http){
	var redditApi = {};

	redditApi.getPosts = function(sub, sort, time) {
		return $http({
			method: 'JSONP',
			url: 'http://www.reddit.com/r/' + sub + '/'+ sort +'.json?jsonp=JSON_CALLBACK&t='+time
		})
	}

	redditApi.getPost = function(sub, id, more) {
		var url = more ? 'http://www.reddit.com/r/'+sub+'/comments/'+id+'/.json?jsonp=JSON_CALLBACK' : 'http://www.reddit.com/r/'+sub+'/comments/'+id+'/.json?jsonp=JSON_CALLBACK&limit=500';
		return $http({
			method: 'JSONP',
			url: url
		})
	}

	redditApi.getSearchResults = function(query, sort) {
		return $http({
			method: 'JSONP',
			url: 'http://www.reddit.com/search.json?q='+query+'&t='+sort+'&jsonp=JSON_CALLBACK'
		})
	}

	redditApi.getSubreddits = function() {
		return $http({
			method: 'JSONP',
			url: 'https://www.reddit.com/subreddits/default.json?jsonp=JSON_CALLBACK'
		})
	}

	redditApi.getSubreddit = function(sub) {
		return $http({
			method: 'JSONP',
			url: 'https://www.reddit.com/subreddits/search.json?jsonp=JSON_CALLBACK&q='+sub
		});
	}

	return redditApi;
})

.filter('utcdatetolocal', function() {
	return function(input) {
		var d = new Date(0);
		d.setUTCSeconds(input);
		return d;
	}
})
.filter('timeago', function() {
	return function(input) {
		return $.timeago(input);
	}
});	