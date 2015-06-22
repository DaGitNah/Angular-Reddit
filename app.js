'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', [
	'ngRoute',
	'myApp.subview',
	'myApp.postview',
	'myApp.search',
	'myApp.version',
	'ngSanitize',
	'markdown',
	'angular-inview',
	'angulartics',
	'angulartics.google.analytics'
	])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/settings', {
		templateUrl: 'templates/settings.html'
	});

	$routeProvider.otherwise(
	{
		redirectTo: '/r/all'
	});
}])

.controller('appCtrl', function($scope, $rootScope, $location, $routeParams, redditApiService) {

	var self = this;
	self.showLoader = true;
	self.menuOpen = false;
	self.searchQuery = "";
	self.isMobile = Modernizr.touch || $(window).width() < 500;

	// Default settings to true
	if (Cookies.get('stickyHeader') == undefined)
		Cookies.set('stickyHeader', true, {expires: 10000});
	if (Cookies.get('scrollToPosition') == undefined)
		Cookies.set('scrollToPosition', true, {expires: 10000});


	self.disableCards = Cookies.get('disableCards') === "true";
	self.stickyHeader = Cookies.get('stickyHeader') === "true";
	self.nightmode = Cookies.get('nightmode') === "true";
	self.fontSize =  Cookies.get('fontSize') || "62.5";
	self.scrollToPosition = Cookies.get('scrollToPosition') === "true";

	$scope.$watch(angular.bind(this, function (scrollToPosition) {
	  return this.scrollToPosition;
	}), function (value) {
		Cookies.set('scrollToPosition', value, {expires: 10000});
	});

	$scope.$watch(angular.bind(this, function (disableCards) {
	  return this.disableCards;
	}), function (value) {
		Cookies.set('disableCards', value, {expires: 10000});
	});

	$scope.$watch(angular.bind(this, function (stickyHeader) {
	  return this.stickyHeader;
	}), function (value) {
		Cookies.set('stickyHeader', value, {expires: 10000});
	});

	$scope.$watch(angular.bind(this, function (nightmode) {
	  return this.nightmode;
	}), function (value) {
		Cookies.set('nightmode', value, {expires: 10000});
	});

	$scope.$watch(angular.bind(this, function (fontSize) {
	  return this.fontSize;
	}), function (value) {
		Cookies.set('fontSize', value, {expires: 10000});
	});
	
	self.pathArray = location.href.split('/');
	self.protocol = self.pathArray[0];
	self.host = self.pathArray[2];
	self.isSecure = self.protocol == "https" || self.host == "localhost";

	self.sidebarOpen = false;
	self.hasSidebar = true;

	self.getActiveReddit = function() {
		return $location.path().split('/')[2] || $location.path().split('/')[1];
	}

	$scope.$on('$locationChangeSuccess', function() {
		self.activeReddit = self.getActiveReddit();
	});

	self.activeReddit = self.getActiveReddit();

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
		self.hasSidebar = false;
		self.sidebarOpen = false;

		if(!current)
			return;

		if(current.loadedTemplateUrl != "subview/subview.html")
			return;

		Cookies.set('lastPage', $(window).scrollTop());
	});

	$rootScope.$on("$routeChangeSuccess", function(event, current, previous) {
		$(window).scrollTop(0);

		if(current.loadedTemplateUrl != "subview/subview.html")
			return;

		if(!Cookies.get('lastPage'))
			return;

		if(Cookies.get('scrollToPosition') === "false")
			return;

    	// TODO: Find a better way to do this
    	self.setScrollTop()
	})

    self.setScrollTop = function() {
    	if($(window).scrollTop() != Cookies.get('lastPage')) {
    		$(window).scrollTop(Cookies.get('lastPage'));
    		setTimeout(self.setScrollTop, 1000)
    	} else {
    		Cookies.remove('lastPage')
    	}
    }

	$scope.$on('showLoader', function(event, args){
		self.showLoader = args[0];
	});

	$scope.$on('sidebar', function(event, args){
		self.hasSidebar = args;
	});

	$scope.$on('sidebar-toggle', function(event, args){
		self.sidebarOpen = args;
	});

	self.setLocation = function(event, location, overwrite, newtab) {
		newtab = newtab || false;
		event = event || window.event;
		var button = event.which || event.button;

		if(button == 1)
			event.preventDefault();
		
		self.menuOpen = false;

		if(button == 2)
			return;
		
		overwrite ? 
			newtab ? 
				window.open(location, '_blank')
				: window.location = location 
			: $location.path(location);
	}

	self.toggleMenu = function() {
		self.menuOpen = !self.menuOpen;
	}

	self.setSort = function() {
		$location.path().split('/')[2] ? $location.path('r/'+ $location.path().split('/')[2] + '/' + self.sort) : false;
	}

	self.search = function() {
		var query = self.searchQuery.replace(' ', '+'); 
		if(query.length == 0)
			return;

		self.setLocation(null, 'search/'+query, false)
	}
})

.factory('redditApiService', function($http){
	var redditApi = {};

	var pathArray = location.href.split( '/' );
	var protocol = pathArray[0];
	var host = pathArray[2];

	redditApi.getPosts = function(sub, sort, time, last, direction) {
		var url = last ? 'http://www.reddit.com/r/' + sub + '/'+ sort +'.json?jsonp=JSON_CALLBACK&t='+time+'&'+direction+'='+last+'&count=25' : 'http://www.reddit.com/r/' + sub + '/'+ sort +'.json?jsonp=JSON_CALLBACK&t='+time

		url = host != "localhost" ? url.replace('http://', '//') : url;

		return $http({
			method: 'JSONP',
			url: url
		})
	}

	redditApi.getPost = function(sub, id, limit) {
		var url = 'http://www.reddit.com/r/'+sub+'/comments/'+id+'/.json?jsonp=JSON_CALLBACK&limit='+limit

		url = host != "localhost" ? url.replace('http://', '//') : url;

		return $http({
			method: 'JSONP',
			url: url
		})
	}

	redditApi.getSearchResults = function(query, sort) {
		var url = 'http://www.reddit.com/search.json?q='+query+'&t='+sort+'&jsonp=JSON_CALLBACK';
		url = host != "localhost" ? url.replace('http://', '//') : url;

		return $http({
			method: 'JSONP',
			url: url
		})
	}

	redditApi.getSubreddits = function() {
		var url = 'http://www.reddit.com/subreddits/default.json?jsonp=JSON_CALLBACK&limit=50';
		url = host != "localhost" ? url.replace('http://', '//') : url;

		return $http({
			method: 'JSONP',
			url: url
		})
	}

	redditApi.getSubreddit = function(sub) {
		var url ='http://www.reddit.com/r/'+sub+'/about.json?jsonp=JSON_CALLBACK';
		url = host != "localhost" ? url.replace('http://', '//') : url;

		return $http({
			method: 'JSONP',
			url: url
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
})
.factory('RecursionHelper', ['$compile', function($compile){
	return {
        /**
         * Manually compiles the element, fixing the recursion loop.
         * @param element
         * @param [link] A post-link function, or an object with function(s) registered via pre and post properties.
         * @returns An object containing the linking functions.
         */
         compile: function(element, link){
            // Normalize the link parameter
            if(angular.isFunction(link)){
            	link = { post: link };
            }

            // Break the recursion loop by removing the contents
            var contents = element.contents().remove();
            var compiledContents;
            return {
            	pre: (link && link.pre) ? link.pre : null,
                /**
                 * Compiles and re-adds the contents
                 */
                 post: function(scope, element){
                    // Compile the contents
                    if(!compiledContents){
                    	compiledContents = $compile(contents);
                    }
                    // Re-add the compiled contents to the element
                    compiledContents(scope, function(clone){
                    	element.append(clone);
                    });

                    // Call the post-linking function, if any
                    if(link && link.post){
                    	link.post.apply(null, arguments);
                    }
                }
            };
        }
    };
}])

.filter('trusted', ['$sce', function($sce){
	return function(text) {
		return $sce.trustAsHtml(text);
	};
}]);