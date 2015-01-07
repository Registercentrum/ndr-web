angular.module("ndrApp")
    .controller('ReportController', function ($scope, $http, $stateParams, $state, List) {

        console.log("ReportController: Init",  $scope.accountModel);
        
        $scope.getSubject = function(newSocialnumber) {

            newSocialnumber = newSocialnumber || false;
            var self = $scope;
            $scope.lists = List.getLists();
            $scope.serverSubjectError = null;
            $scope.serverSaveErrors = [];
            //$scope.contactToUpdate = null;

            var server = Server.getServer();

            $http({
                url: server.baseURL + '/api/Subject?AccountID=' + Account.activeAccount.accountID + '&APIKey=' + server.APIKey,
                method: "POST",
                data: { socialNumber: $scope.socialnumber }
            })
                .success(function(data) {
                    self.subject = data;
                    //vÃ¤lj det senast uppdaterade/skapade besÃ¶ket
                    if (!newSocialnumber) {
                        self.contactToUpdate = self.getContactFromContactDate(self.subject.contacts, self.contactModel.contactDate)
                        self.setContact(self.contactToUpdate);
                    }
                    else
                        self.contactModel = self.getNewContactModel();

                })
                .error(function(data, status, headers, config) {
                    self.subject = null;

                    switch (status) {
                        case 400:
                            $scope.serverSubjectError = data;
                            break;
                        default:
                            $scope.serverSubjectError = 'Ett okänt fel inträffade';
                    }
                });

        };


    })

/*
ndrApp.service('List', function($http) {

    this.lists = null;

    this.init = function() {

        var server = Server.getServer();
        var self = this;

        $http.get(server.baseURL + '/api/List?APIKey=' + server.APIKey).success(function(data) {
            self.lists = data
        });
    }

    this.getLists = function() {
        return this.lists;
    }
    this.getList = function(listName) {
        return this.lists[listName];
    }

});*/
