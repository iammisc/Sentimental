// JS specifically for the query page.

sentimentalApp.controller('MapUIController', function MapUIController($scope, $location) {
	// Controller that manages linking the map and URL arguments to the
	// current query. It has no querying logic itself. That is left up to
	// QueryController which is also
	// instantiated in query.html.

	// (disabled) On first load, read in URL arguments and load those into the query.
	// angular.extend($scope.watched, $location.search());

	$scope.map = init_gmap(document.getElementById("map-canvas"));
	// Setup map marker bindings.
	$scope.queryMarker = null;
	$scope.resultMarkers = [];
	// Setup click behavior.
	google.maps.event.addListener($scope.map, 'click', function(event) {
		// Since this callback isn't fired from within angularjs, we have to
		// make changes in $apply so it knows to propigate changes.
		$scope.$apply(function() {
			$scope.watched.lnglat = event.latLng.lng() + "," + event.latLng.lat();
		});
	});

	$scope.replaceMarker = function(latlng) {
		// Replace the current marker representing the query location. Doesn't
		// actually update the query, just the map.
		//
		// Args:
		// latlng - google.maps.LatLng with the new query location; null to
		//     remove the marker

		if ($scope.queryMarker) {
			$scope.queryMarker.setMap(null);
		}
		if (latlng) {
			$scope.queryMarker = place_marker_on_map($scope.map, latlng);
		} else {
			$scope.queryMarker = null;
		}
	};

	$scope.replaceResultMarkers = function(latlngs) {
		// Replace the current result marker representing a business location.
		//
		// Args:
		// latlngs - Array of google.maps.LatLng with the new query location;
		//     something falsy to remove the markers

		// Remove any existing markers.
		angular.forEach($scope.resultMarkers, function(marker) {
			marker.setMap(null);
		});
		$scope.resultMarkers = [];
		if (latlngs) {
			angular.forEach(latlngs, function(latlng) {
				$scope.resultMarkers.push(place_marker_on_map($scope.map, latlng));
			});
		}
	};
});
