angular.module('ndrApp')
    .controller('UnitController',['$scope', '$stateParams', 'dataService', '$q', '$state', function($scope, $stateParams, dataService, $q, $state) {

        var id = parseFloat($stateParams.id);
        var autocompleteSelected = 'unit_' + id;


        $scope.model = {
            unit: _.findWhere(dataService.data.units, {unitID: id}),
            geo : _.findWhere(dataService.data.units, {unitID: id}),
            id: id,
            data: {},
            autocompleteModel: {
                selected: autocompleteSelected,
                options: dataService.data.preparedGeoList
            }
        };

        dataService.getOne('unit', id).then(function (data){
            $scope.model.unit = data.plain();



            function initialize() {

                if($scope.model.unit.lat && $scope.model.unit.lng){

                var mapOptions = {
                    center: { lat: $scope.model.unit.lat, lng: $scope.model.unit.lng},
                    zoom: 13,
                };
                var map = new google.maps.Map(document.getElementById('Google-Map'),
                    mapOptions);

                var sameCountyUnits = _.filter(dataService.data.units, function (d){
                    return d.countyCode === $scope.model.unit.countyCode;
                })

                _.each(sameCountyUnits, function(obj){

                    var latLong = new google.maps.LatLng(obj.lat, obj.lng);
                    var contentString = '<h5>' + obj.name + '</h5>';

                    var infowindow = new google.maps.InfoWindow({
                        content: contentString
                    });

                    if($scope.model.unit.unitID === obj.unitID){
                        
                        var marker = new google.maps.Marker({
                            position: latLong,
                            title: obj.name,
                        });
                    }
                    else{
                        var marker = new google.maps.Marker({
                            position: latLong,
                            title: obj.name,
                            icon: {
                                path: google.maps.SymbolPath.CIRCLE,
                                fillOpacity: 0.8,
                                fillColor: '#fff',
                                strokeOpacity: 1.0,
                                strokeColor: '#E14274',
                                strokeWeight: 4.0,
                                scale: 5 //pixels
                            }
                        });
                    }

                    google.maps.event.addListener(marker, 'mouseover', function() {
                        infowindow.open(map, this);
                    });

                    google.maps.event.addListener(marker, 'mouseout', function() {
                        infowindow.close();
                    });

                    google.maps.event.addListener(marker, 'click', function() {
                        $state.go('main.profiles.unit', {id: obj.unitID });
                    });

                    marker.setMap(map);


                    });

                }
            }
            initialize();

        });




        // GET DATA FOR TREND CHART
        var query = dataService.queryFactory({unitID : id, level : 2, interval : 'y', fromYear: 2000, toYear : new Date().getFullYear(), indicatorID: 101});
        dataService.getStats(query).then(function (data){

            var series = [];

            _.each(data.statSet[0].intervalSet, function(obj, key){

                console.log(obj);

                var o = {
                   // name : obj.unit.name,
                   // color : obj.unit.levelID != id ? '#D4D4D4' : '#F1AD0F',
                    x : new Date(obj.interval),
                    y : obj.stat.r,
                    cRep : obj.stat.cRep,
                };

                series.push(o);
            });

            $scope.model.data.noPatients = _.last(series).cRep;
            $scope.model.data.trendhba1c = series;
        });

    }]);





