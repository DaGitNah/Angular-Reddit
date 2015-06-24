
app.directive('clickviewtext', ['redditApiService', function(redditApiService) {
	return {
		restrict: 'E',
		scope: {
			link: '='
		},
		template: 
		'<div>'+
			'<span ng-if="showBtn" class="btn-quickshow" ng-click="showContent()">View content</span>'+
			'<span ng-if="showLoader" class="content-loader"> <img src="inc/image/loading.gif" height="50" alt="loading"> </span>'+
			'<div ng-if="html && !hideContent" ng-bind-html="html | unescape | markdown" class="quickshow md"></div>'+
			'<a ng-click="close()" ng-if="showClose">close</a>'+
		'</div>',
		link: function (scope, element, attrs) {
			scope.showBtn = true;
			scope.showLoader = false;
			scope.isOpen = false;
			scope.hideContent = false;
			scope.showClose = false;

			scope.close = function() {
				scope.hideContent = true;
				scope.showBtn = true;
				scope.showClose = false;
				scope.isOpen = false;
			}

			scope.showContent = function() {
				if(scope.hideContent){
					scope.hideContent = false;
					scope.isOpen = true;
					scope.showBtn = false;
					scope.showClose = true;
					return;
				}

				if(scope.isOpen)
					return;

				scope.showBtn = false;
				scope.showLoader = true;
				scope.isOpen = true;

				redditApiService.getPost(scope.link.subreddit, scope.link.id, 1).success(function (data, status, headers, config){
					scope.html = data[0].data.children[0].data.selftext_html;
					scope.html = (scope.html.length == 0) ? "No self text" : scope.html  
				}).error(function(data, status, headers, config) {
					scope.html = 'An error occured, please check your request. Errorcode: '+status;

				}).finally(function() {
					scope.showLoader = false;
					scope.showClose = true;
				});
				
			}
		}
	};
}])

.directive("hoverimage", function($location, $http) {
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
				var image = new Image();
				var isValid = scope.post.url.match(/.+([^\/]$)/);
				isValid = !scope.post.url.match(/.+(\/a\/).+/);

				if(!isValid){
					url = scope.post.preview ? scope.post.preview.images[0].source.url : scope.post.thumbnail
				} else {
					if(scope.post.domain == "gfycat.com") {
						//Gfycat link
						var segments = scope.post.url.split('/');
						var id = segments[segments.length-1];
						var getUrl = "https://gfycat.com/cajax/get/"+id;
						var request = $http({
							url: getUrl
						});
						request.success(function(data, status, headers, config){
							var url = data.gfyItem.webmUrl ? data.gfyItem.webmUrl : data.gfyItem.gifUrl;
							var isWebm = data.gfyItem.webmUrl ? true : false;

							if(isWebm){
								$('.overlay .inner').empty().append('<video autoplay poster="'+data.gfyItem.gifUrl+'"><source src="'+url+'"></video>');
							} else {
								$('.overlay .inner').empty().append('<div class="overlay-image" style="background-image: url(\''+url+'\');"></div>');
							}
							
							$('.overlay').addClass('active');
							return;
						});

					} else {
						var hasExtension = scope.post.url.match(/([^\/]*)(jpg|jpeg|png|gif|webm|gifv)$/) != null;
						var url = hasExtension ? scope.post.url : scope.post.url + '.jpg';
						var isGifv = url.match(/(gifv|webm|)$/)[1].length > 3;
					}
				}



				isGifv ? 
				$('.overlay .inner').empty().append('<video autoplay poster="'+scope.post.preview.images[0].source.url+'"><source src="'+url.replace('gifv','webm')+'"></video>') :
				image.src = url;

				image.onload = function() {
					$('.overlay .inner').empty().append('<div class="overlay-image" style="background-image: url(\''+url+'\');"></div>');
				}

				image.onerror = function() {
					var src = scope.post.preview ? scope.post.preview.images[0].source.url : scope.post.thumbnail;
					$('.overlay .inner').empty().append('<div class="overlay-image" style="background-image: url(\''+src+'\');"></div>');
				}

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
			comment: '=',
			app: '=',
			controller: '='
		},
		templateUrl: 'templates/comments.html',
		compile: function(element) {
            // Use the compile function from the RecursionHelper,
            // And return the linking function(s) which it returns
            return RecursionHelper.compile(element, function(scope, iElement, iAttrs, controller, transcludeFn){
               	scope.isCollapsed = false;
               	scope.collapseText = "collapse"

               	scope.collapse = function() {
               		scope.isCollapsed = !scope.isCollapsed;
               		scope.collapseText = scope.isCollapsed ? "open" : "collapse";
               	}
            });
        }
    };
});