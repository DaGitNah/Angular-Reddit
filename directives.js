
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
			scope.isOpen = false;

			element.on('click', function(){	
				if(scope.isOpen)
					return;

				scope.showBtn = false;
				scope.showLoader = true;
				scope.isOpen = true;

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

.directive("hoverimage", function($location) {
	return {
		restrict: "E",
		scope: {
			post: '='
		},
		templateUrl: 'templates/hoverimage.html',
		link: function(scope,element,attrs) {	
			element.on('click', function() {
				window.location = scope.post.url
			});

            element.on('mouseover', function() {
				var url;
				var isValid = scope.post.url.match(/.+([^\/]$)/);
				isValid = !scope.post.url.match(/.+(\/a\/).+/);

				if(!isValid){
					url = scope.post.preview ? scope.post.preview.images[0].source.url : scope.post.thumbnail
				} else {
					var hasExtension = scope.post.url.match(/([^\/]*)(jpg|jpeg|png|gif|webm|gifv)$/) != null;
					var url = hasExtension ? scope.post.url : scope.post.url + '.jpg';
					var isGifv = url.match(/(gifv|webm|)$/)[1].length > 3;
				}



				isGifv ? 
				$('.overlay .inner').empty().append('<video autoplay poster="'+scope.post.preview.images[0].source.url+'"><source src="'+url.replace('gifv','webm')+'"></video>') :
				$('.overlay .inner').empty().append('<img src="'+url+'">');

            	$('.overlay').addClass('active');
				
            });

            element.on('mouseleave', function() {
            	$('.overlay').removeClass('active');
            	$('.overlay .inner').empty();
            });
        }
    };
})

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