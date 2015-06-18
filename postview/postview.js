'use strict';

angular.module('myApp.postview', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/post/:sub/:id/:limit?', {
    templateUrl: 'postview/postview.html',
    controller: 'postviewCtrl as controller'
  });
}])

.controller('postviewCtrl', function($scope, $routeParams, redditApiService) {
	var self = this;

	self.subreddit = $routeParams.sub;
	self.id = $routeParams.id;
	self.limit = $routeParams.limit ? $routeParams.limit : 200;

	redditApiService.getPost(this.subreddit, this.id, self.limit).success(function (data, status, headers, config){
		self.post = data[0].data.children[0].data;
		self.comments = data[1].data.children;

	}).error(function(data, status, headers, config) {
		self.errorMessage = 'An error occured, please check your request. Errorcode: '+status;

	}).finally(function(){
		$scope.$emit('showLoader', false);
		
	});
});