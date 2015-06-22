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

// Declare main routes, view routes are handled in the controller for the view
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/settings', {
		templateUrl: 'templates/settings.html'
	});

	$routeProvider.otherwise(
	{
		redirectTo: '/r/all'
	});
}])

// Main controller, binds to html, serves as a root level controller
.controller('appCtrl', function($scope, $rootScope, $location, $routeParams, redditApiService) {

	// initialize variables
	var self = this;
	self.showLoader = true; // Shows the loader
	self.menuOpen = false; // Side menu open
	self.searchQuery = ""; // Search query
	self.isMobile = Modernizr.touch || $(window).width() < 500; // Mobile device
	self.sidebarOpen = false; // Subreddit sidebar open
	self.hasSidebar = true; // Subreddit has sidebar

	// Set cookies for default settings to true
	if (Cookies.get('stickyHeader') == undefined)
		Cookies.set('stickyHeader', true, {expires: 10000});
	if (Cookies.get('scrollToPosition') == undefined)
		Cookies.set('scrollToPosition', true, {expires: 10000});

	// Read settings from cookies. Cookies returns a string instead of boolean, therefore the conversion
	self.disableCards = Cookies.get('disableCards') === "true"; // Disable cards design
	self.stickyHeader = Cookies.get('stickyHeader') === "true"; // Header sticks to top
	self.nightmode = Cookies.get('nightmode') === "true"; // Nightmode design
	self.fontSize =  Cookies.get('fontSize') || "62.5"; // Fontsize
	self.scrollToPosition = Cookies.get('scrollToPosition') === "true"; // Scroll back to position after using back button

	// Enable watchers to update cookies
	$scope.$watch(angular.bind(this, function (scrollToPosition) {
	  return this.scrollToPosition; // Return the variable
	}), function (value) {
		Cookies.set('scrollToPosition', value, {expires: 10000}); // Set the cookie, 10000 so it doesn't expire soon
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

	// Get URL segments info
	self.pathArray = location.href.split('/');
	self.protocol = self.pathArray[0]; // Protocol, ex: https
	self.host = self.pathArray[2]; // Host
	self.isSecure = self.protocol == "https" || self.host == "localhost"; // isSecure is true if we're on https

	self.getActiveReddit = function() {
		return $location.path().split('/')[2] || $location.path().split('/')[1]; // If /r/<subreddit> take <subreddit> else take the first argument
	}

	$scope.$on('$locationChangeSuccess', function() {
		self.activeReddit = self.getActiveReddit(); // Get the current subreddit
	});

	self.sort = $location.path().split('/')[3]; // Get the sort param
	self.sortTypes = [ // Available sort types
		'top',
		'hot',
		'controversial',
		'new'
	];

	redditApiService.getSubreddits().success(function (data, status, headers, config){
		self.subreddits = data.data.children; // Get initial subreddits (/r/all)
	})

	if(self.sortTypes.indexOf(self.sort) == -1){
		self.sort = "hot"; // Overwrite if a non-valid sort is chosen
	}

	$rootScope.$on("$routeChangeStart", function(event, next, current) {
		self.showLoader = true; // Show the loader 
		self.sidebarOpen = false; // Close the sidebar
		self.hasSidebar = false; // Hide the sidebar

		if(!current)
			return;

		if(current.loadedTemplateUrl != "subview/subview.html")
			return;

		// If the user switches away from the subreddit view set the cookie to store the scrollPos
		Cookies.set('lastPage', $(window).scrollTop());
	});

	$rootScope.$on("$routeChangeSuccess", function(event, current, previous) {
		// Fixes a bug where scrollTop would be the same as lastPage cookie while it isn't scrolled
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
    	// Tries scrolling to the last saved position
    	if($(window).scrollTop() != Cookies.get('lastPage')) {
    		$(window).scrollTop(Cookies.get('lastPage'));
    		setTimeout(self.setScrollTop, 1000)
    	} else {
    		// Removes the cookie
    		Cookies.remove('lastPage')
    	}
    }

	$scope.$on('showLoader', function(event, args){
		// Global listener to show loader
		self.showLoader = args[0];
	});

	$scope.$on('sidebar', function(event, args){
		// Global listener to show subreddit sidebar
		self.hasSidebar = args;
	});

	$scope.$on('sidebar-toggle', function(event, args){
		// Global listener to open subreddit sidebar
		self.sidebarOpen = args;
	});

	self.setLocation = function(event, location, overwrite, newtab) {
		// Custom location redirecter because angular can't handle it very well
		
		// Safety checks
		newtab = newtab || false; 
		event = event || window.event;
		var button = event.which || event.button;

		// Prevent left and middle mouse actions
		if(button == 1 || button == 2)
			event.preventDefault();
		
		// Close the sidebar
		self.menuOpen = false;
		
		// Is the overwrite parameter set (used for external routing)
		overwrite ? 
			// Is the new tab parameter set 
			newtab ? 
				// Open in new tab
				window.open(location, '_blank')
				// Open in same tab
				: window.location = location 
			// Internal routing
			: $location.path(location);
	}

	self.toggleMenu = function() {
		// Toggle menu
		self.menuOpen = !self.menuOpen;
	}

	self.setSort = function() {
		// Set sort parameter
		$location.path().split('/')[2] ? $location.path('r/'+ $location.path().split('/')[2] + '/' + self.sort) : false;
	}

	self.search = function() {
		if(query.length == 0)
			return;

		// Prepare query for reddit api
		var query = self.searchQuery.replace(' ', '+'); 

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
		// Call jQuery timeago
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
	// Trust html
	return function(text) {
		return $sce.trustAsHtml(text);
	};
}])

.filter('unescape', function(){
	// Unescapes an escapes HTML string, must be used on every _html data
	return function(text) {
		return $('<div/>').html(text).text(); 
	};
});