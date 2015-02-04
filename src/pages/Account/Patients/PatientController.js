angular.module("ndrApp")
    .controller('PatientController', [
                 '$scope', '$http', '$stateParams', '$state', '$log', '$filter',
        function ($scope,   $http,   $stateParams,   $state,   $log,   $filter) {

        $scope.subject = undefined;
        $scope.subjectID = $stateParams.patientID;

        $scope.model = {
            data : {},
            latest: {}
        }

        $scope.$watch("subject", populateSeriesData, true);
        $scope.$watch("subject", populateTableData, true);
        $scope.$watch("subject", populateLatestData, true);

        function populateTableData () {
            var contacts, keys, table = {};

            if (!$scope.subject) return false;

            contacts = angular.copy($scope.subject.contacts).splice(0, 5);

            // Get tha keys for the table
            keys = _.keys(contacts[0]);

            // Construct the table data
            _.each(keys, function (key) {
                table[key] = [];
                _.each(contacts, function (contact) {
                    table[key].push(contact[key]);
                });
            });

            $scope.model.data.table = table;

        }

        function populateSeriesData () {
            if (!$scope.subject) return false;

            $scope.model.data.lineChartHba1c         = getSeries('hba1c');
            $scope.model.data.lineChartBloodPressure = getSeries('bpSystolic');
            $scope.model.data.lineChartCholesterol   = getSeries('cholesterol');
        }


        function populateLatestData () {
            if (!$scope.subject) return false;

            $scope.model.latest.bmi    = getLatestValue('bmi');
            $scope.model.latest.weight = getLatestValue('weight');
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

            return visit ?
                { value: visit[key], date: visit['contactDate'] } :
                { value: '-', date: '-' };
        }


        /**
         * Calculate the subject's age
         * @param  {Date} birthDate Subject's birth date
         * @return {Number} Subject's age in years
         */
        $scope.calculateAge = function (birthDate) {
            return moment().diff(birthDate, 'years');
        };


        $http({
            method: 'GET',
            url: "https://ndr.registercentrum.se/api/Subject/" + $scope.subjectID + "?APIKey=LkUtebH6B428KkPqAAsV&AccountID=" + 13
        })
        .success(function(data, status, headers, config) {
            $log.debug("Retrieved subject", data);

            // Sort the contacts by date in desc order
            data.contacts = _.sortBy(data.contacts, 'contactDate').reverse();
            $scope.subject = data;
        })
        .error(function(data, status, headers, config) {
            //$log.error('Could not retrieve data from ' + url);
        });



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