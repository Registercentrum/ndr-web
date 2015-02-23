angular.module("ndrApp")
    .controller('PatientController', [
                 '$scope', '$q', '$stateParams', '$state', '$log', '$filter', 'dataService', '$timeout', '$http',
        function ($scope,   $q,   $stateParams,   $state,   $log,   $filter,   dataService, $timeout, $http) {

            var Account = $scope.accountModel;

        $scope.subject = undefined;
        $scope.subjectID = false || $stateParams.patientID;

        $scope.model = {
            data : {
                trend : {},
                chart :  {
                    gauge : {
                        physicalActivity : {}
                    }
                }
            },
            latest: {},
            mode : 'visual'
        }


            $timeout(function (){
                jQuery('.u-equalHeight').matchHeight(true);

            },1000)

        $scope.$watch("subject", populateSeriesData, true);
        $scope.$watch("subject", populateTableData, true);
        $scope.$watch("subject", populateLatestData, true);

        function populateTableData () {
            var table = {},
                exluded = ['contactID', 'insertedAt', 'lastUpdatedAt', 'unitID'],
                contacts, keys;

            if (!$scope.subject) return false;

            contacts = angular.copy($scope.subject.contacts).splice(0, 5);

            // Get tha keys for the table
            keys = _.keys(contacts[0]);

            // Filter exluded
            keys = _.filter(keys, function (key) { return _.indexOf(exluded, key) === -1; });

            // Construct the table data
            _.each(keys, function (key) {
                var attribute = _.find($scope.contactAttributes, {columnName: key}),
                    label = attribute ? attribute.question : key;

                table[label] = [];
                _.each(contacts, function (contact) {
                    var value = contact[key];

                    if (_.isNull(value)) {
                        value = '-';

                    // If it's a date, format it in a nice way
                    } else if (attribute && attribute.domain && attribute.domain.name === 'Date') {
                        value = $filter('date')(new Date(value), 'yyyy-MM-dd');

                    // Get proper label for the id value
                    } else if (attribute && attribute.domain && attribute.domain.isEnumerated) {
                        value = _.find(attribute.domain.domainValues, {code: value}).text;

                    // If it's a boolean, return proper translation (ja-nej)
                    } else if (attribute && attribute.domain && attribute.domain.name === 'Bool') {
                        value = value ? 'Ja' : 'Nej';
                    }

                    table[label].push(value);
                });
            });

            $scope.model.data.table = table;

        }

        function populateSeriesData () {
            if (!$scope.subject) return false;

            $scope.model.data.trend.hba1c = getSeries('hba1c');
            $scope.model.data.trend.bpSystolic = getSeries('bpSystolic');
            $scope.model.data.trend.bpDiastolic = getSeries('bpDiastolic');
            $scope.model.data.trend.cholesterol = getSeries('cholesterol');
            $scope.model.data.trend.triglyceride = getSeries('triglyceride');
            $scope.model.data.trend.ldl = getSeries('ldl');
            $scope.model.data.trend.hdl = getSeries('hdl');

            $scope.model.data.chart.physicalActivity = getLatestValue('physicalActivity');
            $scope.model.data.chart.smoking = getLatestValue('smoking');


            $scope.model.data.trend.combinedBp = [
                {
                    //dashStyle: "ShortDot",
                    color: 'rgba(89,153,218,1)',

                    fillColor : {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, 'rgba(89,153,218,0.2)'],
                            [1, 'rgba(89,153,218,0.2)']
                        ]
                    },

                    name: 'Värde',
                    data: $scope.model.data.trend.bpSystolic
                },
                {
                    //dashStyle: "ShortDot",
                    color: "rgba(26,188,156,1)",

                    fillColor : {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, 'rgba(26,188,156,0.2)'],
                            [1, 'rgba(26,188,156,0.2)'],
                        ]
                    },

                    name: 'Värde',
                    data: $scope.model.data.trend.bpDiastolic
                },
            ]
        }

        function populateLatestData () {
            if (!$scope.subject) return false;

            $scope.model.latest.bmi    = getLatestValue('bmi');
            $scope.model.latest.weight = getLatestValue('weight');
            $scope.model.latest.treatment = getLatestValue('treatment');

            $scope.model.latest.footRiscCategory = getLatestValue('footRiscCategory');
            $scope.model.latest.footExaminationDate = getLatestValue('footExaminationDate');

            _.each($scope.contactAttributes, function(obj, key){
                $scope.model.latest[obj.columnName] = getLatestValue(obj.columnName);
            })
        }


        /**
         * Generate time series data for the charts for a specific key
         * @param  {String} key What values are we looking for?
         * @return {Array} Array of key:value objects
         */
        function getSeries (key) {
            var series = [];

            _.each($scope.subject.contacts, function (obj) {
                if (_.isNumber(obj[key])) {
                    series.push({
                        x : new Date(obj.contactDate),
                        y : obj[key]
                    })
                }
            });

            // Return them in ascending order, by date
            return series.reverse();
        }


        /**
         * Get the most recent value for the key
         * @param  {String} key What are we looking for?
         * @return {Object} A pair of value and the data
         */
        function getLatestValue (key) {
            var visit = _.find($scope.subject.contacts, function (v) { return !_.isNull(v[key]); });

            var attribute = _.find($scope.contactAttributes, {columnName: key}),
                label = attribute ? attribute.question : key;


            if(key == "diabetesType") return { value: 'inget värde', date: 'inget värde', label : 'inget värde' };
            if(typeof visit == "undefined") return { value: 'inget värde', date: 'inget värde', label : 'inget värde' };

            var value;

            if (_.isNull(visit[key])) {
                value = 'inget värde';

                // If it's a date, format it in a nice way
            } else if (attribute && attribute.domain && attribute.domain.name === 'Date') {
                value = $filter('date')(new Date(visit[key]), 'yyyy-MM-dd');

                // Get proper label for the id value
            } else if (attribute && attribute.domain && attribute.domain.isEnumerated) {
                value = _.find(attribute.domain.domainValues, {code: visit[key]}).text;

                // If it's a boolean, return proper translation (ja-nej)
            } else if (attribute && attribute.domain && attribute.domain.name === 'Bool') {
                value = visit[key] ? 'Ja' : 'Nej';
            }

            return visit ?
                { value: visit[key], date: visit['contactDate'], label : value } :
                { value: 'inget värde', date: 'inget värde', label : value };
        }


        /**
         * Calculate the subject's age
         * @param  {Date} birthDate Subject's birth date
         * @return {Number} Subject's age in years
         */
        $scope.calculateAge = function (birthDate) {
            return moment().diff(birthDate, 'years');
        };

        $scope.getDiabetesType = function (id) {
            if(!$scope.contactAttributes) return false;
            var attribute = _.find($scope.contactAttributes, {columnName: 'diabetesType'});
            return _.find(attribute.domain.domainValues, {code: id}).text;
        };

            $scope.socialnumber = undefined;


        $scope.getSubject = function() {
            console.log("Social", $scope.socialnumber);
            newSocialnumber = $scope.socialnumber;
            
            $http({
                url: 'https://ndr.registercentrum.se/api/Subject?AccountID=' + Account.activeAccount.accountID + '&APIKey=LkUtebH6B428KkPqAAsV',
                method: "POST",
                data: { socialNumber: newSocialnumber }
            })
                .success(function(data) {
                   // self.subject = data;

                    getPatient(data.subjectID)

                })
                .error(function(data, status, headers, config) {
                    console.log("ERROR");
                });
        }

        // Make requests for the subject data and contactAttributes needed to display the labels in the table

        function getPatient(id) {

            $q.all([
                dataService.getSubject(id).then(function (response) {
                    return response;
                }),
                dataService.getContactAttributes().then(function (response) {
                    return response;
                })
            ])
                .then(function (values) {
                    var subject = values[0];

                    $log.debug("Retrieved subject", subject);

                    // Sort the contacts by date in desc order
                    subject.contacts = _.sortBy(subject.contacts, 'contactDate').reverse();

                    $scope.subject = subject;

                    $scope.contactAttributes = values[1];
                });

        }

            if($scope.subjectID){
                getPatient($scope.subjectID)
            }





        /*      $scope.printDiv = function(divName) {
         var printContents = document.getElementById(divName).innerHTML;
         var originalContents = document.body.innerHTML;

         document.body.innerHTML = printContents;

         window.print();

         document.body.innerHTML = originalContents;
         }
         */

        /*

         SUBJECT

         DateOfBirth: "1985-12-08T00:00:00"
         DateOfDeath: null
         DiabetesType: null
         Sex: null
         SubjectID: 39
         SubjectKey: "19851208-9882"
         YearOfOnset: null


         CONTACT

        * Age: 101.4
         AntihypertensiveCode: null
         Aspirin: null
         BMI: 24.6
         BPDiastolic: 80
         BPSystolic: 140
         CerebrovascularDisease: null
         Cholesterol: null
         ContactDate: "2014-03-26T00:00:00"
         DiabeticRetinopathy: null
         DiagnosisWorseSeeingEye: null
         FootExaminationDate: null
         FootRiscCategory: null
         FundusExaminationDate: null
         GFR: null
         HDL: null
         HbA1c: 52
         HypoglycemiaSevere: null
         InsertedAt: "2014-03-26T13:24:00"
         InsulinMethod: null
         IschemicHeartDisease: null
         LDL: null
         LaserTreatment: null
         LastUpdatedAt: "2014-03-26T13:24:00"
         Length: 178
         LipidLoweringDrugs: null
         MacroAlb: null
         MicroAlb: null
         PhysicalActivity: null
         SerumCreatinine: null
         Smoker: null
         SmokingEndMonth: null
         SmokingEndYear: null
         SmokingHabit: null
         Treatment: null
         Triglyceride: null
         UnitID: 217
         VisualLoss: null
         Waist: null
         Waran: null
         Weight: 78
         YearOfOnset: null
        *
        * */




        

    }]);

angular.module("ndrApp")
.controller('CarouselDemoCtrl', function ($scope) {
    $scope.myInterval = 5000;

});