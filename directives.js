
app.directive('clickview', ['redditApiService', function(redditApiService) {
	return {
		restrict: 'E',
		scope: {
			link: '='
		},
		template: 
		'<div>'+
			'<span ng-if="!html" class="btn-quickshow">View content</span>'+
			'<div ng-if="html" ng-bind-html="html | markdown" class="quickshow"></div>'+
		'</div>',
		link: function (scope, element, attrs) {
			element.on('click', function(){	
				redditApiService.getPost(scope.link.subreddit, scope.link.id, 1).success(function (data, status, headers, config){
					scope.html = data[0].data.children[0].data.selftext;
					console.log(scope.html)
				}).error(function(data, status, headers, config) {
					scope.html = 'An error occured, please check your request. Errorcode: '+status;

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