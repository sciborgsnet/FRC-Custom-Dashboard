var app = angular.module("Dashboard", ['ngMaterial', 'nvd3']);

app.config(function($mdThemingProvider) {

	$mdThemingProvider.theme('default')
		.dark()
});

app.factory('updateService', function(){
	var updateService = {};

	updateService.data = {
		match: {
			time: 0,
			phase: 'not started'
		},
		connected: false
	};

	updateService.sendValue = function(key, value){
		NetworkTables.putValue(key, value);
	};

	updateService.getValue = function(key){
		NetworkTables.getValue(key);
	};

  updateService.getProperty = function(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('/');
    for (var i = 0, n = a.length - 1; i < n; ++i) {
      var k = a[i];
      if (k in o) {
        o = o[k];
      } else {
        return;
      }
    }
    return o;
  };

	updateService.onValueChanged = function(key, value, isNew){
		if (value == 'true') {
			value = true;
		} else if (value == 'false') {
			value = false;
		}

    var a = key.split('/');
    updateService.getProperty(updateService.data, key)[a[a.length - 1]] = value;
	};

	updateService.onConnection = function(connected){
		updateService.data.connected = connected;
	};

	NetworkTables.addRobotConnectionListener(updateService.onConnection, true);
	NetworkTables.addGlobalListener(updateService.onValueChanged, true);

	return updateService;
});

app.controller('uiCtrl', function($scope, updateService){
  $scope.data = updateService.data;
});

app.controller('clockCtrl', function($scope, updateService){
  var data = updateService.data;
  $scope.data = data;

  $scope.getTime = function(){
    var minutes = data.match.time / 60;
    var seconds = data.match.time % 60;

    return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  };
  $scope.getStatus = function(){
    if(data.connected)
      return 'Connected';
    else
      return 'Disconnected';
  };
});
