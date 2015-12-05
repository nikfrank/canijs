'use strict';

angular.module('canijstest')
  .controller('RtcCtrl', function ($scope) {

      Cani.core.confirm('rtc').then(function(rtc){
	  $scope.offer = rtc.offer;
      });
  });
