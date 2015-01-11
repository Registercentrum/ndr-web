angular.module("ndrApp")
    .controller('PatientController', function ($scope, $http, $stateParams, $state) {

        $scope.subject = {};
        $scope.subjectID = $stateParams.patientID;

        $scope.model = {
            data : {}
        }

        $scope.$watch("subject", function (){
            getHba1cTrend();
        }, true)

        function getHba1cTrend(){

            var series = [];

            _.each($scope.subject.contacts, function(obj, key){

                console.log(obj);

                var o = {
                    // name : obj.unit.name,
                    // color : obj.unit.levelID != id ? "#D4D4D4" : "#F1AD0F",
                    x : new Date(obj.contactDate),
                    y : obj.hba1c,
                }

                series.push(o)
            })

            $scope.model.data.lineChartHba1c = series;

        }


        $http({
            method: 'POST',
            url: "https://ndr.registercentrum.se/api/Subject?APIKey=LkUtebH6B428KkPqAAsV&AccountID=" + 13,
            data : { socialNumber: $scope.subjectID }
        })
        .success(function(data, status, headers, config) {
            console.log("Retrieved subject", data);
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




        

    });