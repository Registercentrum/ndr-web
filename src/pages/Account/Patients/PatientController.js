angular.module("ndrApp")
    .controller('PatientController', function ($scope, $http, $stateParams, $state) {

        $scope.subject = undefined;
        $scope.subjectID = $stateParams.patientID;

        $scope.model = {
            data : {}
        }

        $scope.$watch("subject", function (){
            getHba1cTrend();
        }, true)

        function getHba1cTrend(){

            if(!$scope.subject) return false;

            var contacts = angular.copy($scope.subject.contacts).sort(function (a,b){
                return new Date(a.contactDate) - new Date(b.contactDate);
            })

            var series = [];
            var seriesBloodPressure = [];
            var seriesCholesterol = [];

            _.each(contacts, function(obj, key){

                var oBloodPressure = {
                    x : new Date(obj.contactDate),
                    y : obj.bpSystolic,
                }

                var o = {
                    x : new Date(obj.contactDate),
                    y : obj.hba1c,
                }

                var oCholesterol = {
                    x : new Date(obj.contactDate),
                    y : obj.cholesterol,
                }

                if(oCholesterol.y)
                    seriesCholesterol.push(oCholesterol)

                if(oBloodPressure.y)
                seriesBloodPressure.push(oBloodPressure)

                if(o.y)
                    series.push(o)

            })

           /* series.sort(function (a,b){
                return b.x - a.x;
            })*/

            $scope.model.data.lineChartHba1c = series;
            $scope.model.data.lineChartBloodPressure = seriesBloodPressure;
            $scope.model.data.lineChartCholesterol = seriesCholesterol;

        }


        $http({
            method: 'GET',
            url: "https://ndr.registercentrum.se/api/Subject/" + $scope.subjectID + "?APIKey=LkUtebH6B428KkPqAAsV&AccountID=" + 13
        })
        .success(function(data, status, headers, config) {
            console.log("Retrieved subject", data);
            $scope.subject = data;

        })
        .error(function(data, status, headers, config) {
            //$log.error('Could not retrieve data from ' + url);
        });


        $scope.calculateAge = function(birthDate) {

            return moment().diff(birthDate, 'years');
        };



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




        

    });