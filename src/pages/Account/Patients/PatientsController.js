angular.module("ndrApp")
    .controller('PatientsController', function ($scope, $http, $stateParams, $state) {

        console.log("PatientsController: Init");

        $scope.allFilters = {
            diabetesTypes: [
                {
                    id: 1,
                    text: "Typ 1 diabetes (inkl LADA)"
                },
                {
                    id: 2,
                    text: "Typ 2 diabetes (inkl MODY)"
                },
                {
                    id: 3,
                    text: "Sekundär diabetes (t ex pancreatit)"
                },
                {
                    id: 4,
                    text: "Oklart"
                },
                {
                    id: 5,
                    text: "Prediabetes"
                }
            ]
        }

        $scope.activeFilters = {
            diabetesTypes: {
                options :  [
                    {
                        id: 1,
                        text: "Typ 1 diabetes (inkl LADA)"
                    },
                    {
                        id: 2,
                        text: "Typ 2 diabetes (inkl MODY)"
                    },
                    {
                        id: 3,
                        text: "Sekundär diabetes (t ex pancreatit)"
                    },
                    {
                        id: 4,
                        text: "Oklart"
                    },
                    {
                        id: 5,
                        text: "Prediabetes"
                    }
                ],

                selected : 4

            }

        }

        $scope.$watch("activeFilters", function (){

            console.log("a");

            
            var subjects = _.toArray(_.groupBy($scope.model.contacts, function(contact){
                return contact.subject.subjectID
            }));

            $scope.model.subjectList = _.shuffle(subjects);

        }, true)



        $scope.model = {
            contacts : undefined,
            subjectList : undefined
        }


        $http.get("https://ndr.registercentrum.se/api/Contact?APIKey=LkUtebH6B428KkPqAAsV&dateFrom=2012-03-26&AccountID=" + $scope.accountModel.activeAccount.accountID)
            .success(function(data) {

                $scope.model.contacts = data;

                var subjects = _.toArray(_.groupBy($scope.model.contacts, function(contact){ return contact.subject.subjectID }));
                $scope.model.subjectList = subjects;

            })


    })