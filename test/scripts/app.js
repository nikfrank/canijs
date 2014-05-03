'use strict';

angular.module('canijstest', ['firebase'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {templateUrl: 'views/test.html', controller: 'TestCtrl'})
      .when('/ggdrive', {templateUrl: 'views/ggdrive.html', controller: 'GgCtrl'})
      .when('/rtc', {templateUrl: 'views/rtc.html', controller: 'RtcCtrl'})
      .otherwise({redirectTo: '/'});
  }])
.directive('compile', function($compile) {
    // directive factory creates a link function
    return function(scope, element, attrs) {
      scope.$watch(
        function(scope) {
           // watch the 'compile' expression for changes
          return scope.$eval(attrs.compile);
        },
        function(value) {
          // when the 'compile' expression changes
          // assign it into the current DOM
          element.html(value);
 
          // compile the new DOM and link it to the current
          // scope.
          // NOTE: we only compile .childNodes so that
          // we don't get into infinite loop compiling ourselves
          $compile(element.contents())(scope);
        }
      );
    };
});
