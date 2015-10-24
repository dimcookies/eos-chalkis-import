var scotchTodo = angular.module('scotchTodo', ['ui.bootstrap']);
scotchTodo.directive('ngReallyClick', [function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', function() {
                var message = attrs.ngReallyMessage;
                if (message && confirm(message)) {
                    scope.$apply(attrs.ngReallyClick);
                }
            });
        }
    }
}]);
function eventController($scope, $http, $modal) {
	$scope.formData = {};
	$scope.isUpdateCollapsed = true;
	$scope.isModifyCollapsed = true;
	$scope.isStatsCollapsed = true;


	$scope.statuses = ['PENDING', 'DONE', 'DELETED']

	$scope.today = function() {
	    $scope.formData.dt = new Date();
	  };
	  $scope.today();

	$http.get('/api/events')
		.success(function(data) {
			$scope.events = data;
		})
		.error(function(data) {
			console.log('Error: ' + data);
		  	$modal.open({templateUrl: 'myModalContent',backdrop:"static"});
		});

	$http.get('/api/events/DONE')
		.success(function(data) {
			$scope.events_ready = data;
		})
		.error(function(data) {
			console.log('Error: ' + data);
		  	$modal.open({templateUrl: 'myModalContent',backdrop:"static"});			
		});	

	$http.get('/api/events/IMPORTED')
		.success(function(data) {
			$scope.events_imported = data;
		})
		.error(function(data) {
			console.log('Error: ' + data);
		  	$modal.open({templateUrl: 'myModalContent',backdrop:"static"});			
		});		

	$http.get('/api/members/')
		.success(function(data) {
			$scope.members = data;
			//console.log($scope.members);
		})
		.error(function(data) {
			console.log('Error: ' + data);
		  	$modal.open({templateUrl: 'myModalContent',backdrop:"static"});			
		});

		
	$scope.showStats = function() {
		$scope.isStatsCollapsed = false;
		if(! $scope.stats) {
			$http.get('/api/stats')
			.success(function(data) {
				$scope.stats = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			  	$modal.open({templateUrl: 'myModalContent',backdrop:"static"});			
			});
		}	
	};

	$scope.hideStats = function() {
		$scope.isStatsCollapsed = true;
	}

	$scope.updateEvent = function() {
		var d = $scope.formData.dt;
		var curr_date = d.getDate();
    	var curr_month = d.getMonth() + 1; //Months are zero based
    	var curr_year = d.getFullYear();
    	$scope.formData.date = curr_date + "/" +curr_month + "/" + curr_year;
		$http.post('/api/events', $scope.formData)
			.success(function(data) {
				$scope.isUpdateCollapsed = true;
				$scope.formData = {};
		 		$scope.today();
				$scope.events = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
		  		$modal.open({templateUrl: 'myModalContent',backdrop:"static"});				
			});
	};

	$scope.deleteEvent = function(id) {
		$http.delete('/api/events/' + id)
			.success(function(data) {
				$scope.events = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			  	$modal.open({templateUrl: 'myModalContent',backdrop:"static"});
			});	
	};

	$scope.readyEvent = function(id) {
		$http.delete('/api/events/ready/' + id)
			.success(function(data) {
				$scope.events = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			  	$modal.open({templateUrl: 'myModalContent',backdrop:"static"});
			});	
	};

	$scope.pendingEvent = function(id) {
		$http.delete('/api/events/pending/' + id)
			.success(function(data) {
				$scope.events_ready = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			  	$modal.open({templateUrl: 'myModalContent',backdrop:"static"});
			});	
	};

	$scope.editEvent = function(id) {
		$http.get('/api/event/'+id)
		.success(function(data) {
			$scope.formData = data[0];
			var parts = $scope.formData.date.split('/');
  			$scope.formData.dt = new Date(parts[2], parts[1]-1, parts[0]); 
  			$scope.formData.days = parseInt($scope.formData.days);			
		})
		.error(function(data) {
			console.log('Error: ' + data);
		  	$modal.open({templateUrl: 'myModalContent',backdrop:"static"});			
		});

		$scope.isUpdateCollapsed = false;

	};

	$scope.modifyEvent = function(id) {
		$http.get('/api/event/'+id)
		.success(function(data) {
			$scope.formData = data[0];
		})
		.error(function(data) {
			console.log('Error: ' + data);
		  	$modal.open({templateUrl: 'myModalContent',backdrop:"static"});			
		});

		$scope.isModifyCollapsed = false;
	};

	$scope.cancelModify = function(id) {
		$scope.isModifyCollapsed = true;
		$scope.formData = {};
		$scope.today();	
	};

	$scope.addAttendant = function() {
	 	if($scope.attendant.id) {
			for (index = 0; index < $scope.formData.attendants.length; ++index) {
	    		attendant = $scope.formData.attendants[index];
	    		if(attendant.member_id == $scope.attendant.id ) {
	    			$scope.attendant = '';
	    			return;
	     		}
			}
		} else {
			var ar = $scope.attendant.split(" ");
			$scope.attendant = {'surname' : ar[0], 'firstname' : ar[1], 'code' : 'NEW RECORD', 'id' : ''}
		}
		$scope.formData.attendants.unshift({name:$scope.attendant.surname + ' ' + $scope.attendant.firstname + ' ' + $scope.attendant.code, member_id:$scope.attendant.id});
		$scope.attendant = '';
		$http.post('/api/attendants', $scope.formData)
			.error(function(data, status, headers, config) {
            		console.error('Error', data);
            		$scope.formData.attendants = [];
  	 		 	  	$modal.open({templateUrl: 'myModalContent',backdrop:"static"});
   				});
	};

	$scope.deleteAttendant = function(idx) {
	 	$scope.formData.attendants.splice(idx, 1)
		$http.post('/api/attendants', $scope.formData).error(function(data, status, headers, config) {
            		console.error('Error', data);
  	 		 	  	$modal.open({templateUrl: 'myModalContent',backdrop:"static"});
   				});
	};


	$scope.createEvent = function(id) {
		$scope.isUpdateCollapsed = ! $scope.isUpdateCollapsed;
		$scope.formData = {'status' : 'PENDING', 'days':1};

		$scope.today();
		
	};

	$scope.cancelEvent = function(id) {
		$scope.isUpdateCollapsed = true;
		$scope.formData = {};
		$scope.today();	
	};
}

