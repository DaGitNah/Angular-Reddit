
app.directive('clickviewtext', ['redditApiService', function(redditApiService) {
	return {
		restrict: 'E',
		scope: {
			link: '='
		},
		template: 
		'<div>'+
			'<span ng-if="showBtn" class="btn-quickshow">View content</span>'+
			'<span ng-if="showLoader" class="content-loader"> <img src="inc/image/loading.gif" height="50" alt="loading"> </span>'+
			'<div ng-if="html" ng-bind-html="html | markdown" class="quickshow"></div>'+
		'</div>',
		link: function (scope, element, attrs) {
			scope.showBtn = true;
			scope.showLoader = false;

			element.on('click', function(){	
				scope.showBtn = false;
				scope.showLoader = true;

				redditApiService.getPost(scope.link.subreddit, scope.link.id, 1).success(function (data, status, headers, config){
					scope.html = data[0].data.children[0].data.selftext;
					scope.html = (scope.html.length == 0) ? "No self text" : scope.html  
				}).error(function(data, status, headers, config) {
					scope.html = 'An error occured, please check your request. Errorcode: '+status;

				}).finally(function() {
					scope.showLoader = false;
				});
				
			})
		}
	};
}])

.directive("tree", function(RecursionHelper) {
	return {
		restrict: "E",
		scope: {
			comment: '='
		},
		templateUrl: 'templates/comments.html',
		compile: function(element) {
            // Use the compile function from the RecursionHelper,
            // And return the linking function(s) which it returns
            return RecursionHelper.compile(element);
        }
    };
});