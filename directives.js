
app.directive('viewContent', ['redditApiService' ,function() {
	return {
		restrict: 'A',
		scope: {},
		replace: false,
		template: '<div ng-bind-html="content"></div>',
		link: function (scope, element, attrs) {
			element.on('click', function(){
				redditApiService.getPost().success()
				//scope.content = attrs.viewContent;
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