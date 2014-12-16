angular.module("ndrApp")
    .controller('PatientsController', function ($scope, $http, $stateParams, $state) {

        console.log("PatientsController: Init");

        $scope.model = {
            contacts : undefined,
            subjects : undefined,
            subjectList : undefined
        }


        $http.get("https://ndr.registercentrum.se/api/Contact?APIKey=LkUtebH6B428KkPqAAsV&dateFrom=2014-03-26&AccountID=" + $scope.accountModel.activeAccount.accountID)
            .success(function(data) {

                $scope.model.contacts = data;

                var subjects = _.toArray(_.groupBy($scope.model.contacts, function(contact){ return contact.subject.subjectID }));

                $scope.model.subjects = subjects;
                $scope.model.subjectList = subjects;


                console.log("Contacts", data, subjects);
            })


    })