angular.module("ndrApp")
    .controller('PatientsController', function ($scope, $http, $stateParams, $state, DTOptionsBuilder, DTColumnDefBuilder) {

        console.log("PatientsController: Init");
        $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.dt1.opened = true;
        };

        $scope.dt1 = new Date("2013-01-01");
        $scope.dt2 = new Date();

        $scope.dtOptions = {
            paginate: false,
            bFilter : false,
            language : {
                "sEmptyTable": "Tabellen innehåller ingen data",
                "sInfo": "Visar _START_ till _END_ av totalt _TOTAL_ rader",
                "sInfoEmpty": "Visar 0 till 0 av totalt 0 rader",
                "sInfoFiltered": "(filtrerade från totalt _MAX_ rader)",
                "sInfoPostFix": "",
                "sInfoThousands": " ",
                "sLengthMenu": "Visa _MENU_ rader",
                "sLoadingRecords": "Laddar...",
                "sProcessing": "Bearbetar...",
                "sSearch": "Sök:",
                "sZeroRecords": "Hittade inga matchande resultat",
                "oPaginate": {
                    "sFirst": "Första",
                    "sLast": "Sista",
                    "sNext": "Nästa",
                    "sPrevious": "Föregående"
                },
                "oAria": {
                    "sSortAscending": ": aktivera för att sortera kolumnen i stigande ordning",
                    "sSortDescending": ": aktivera för att sortera kolumnen i fallande ordning"
                }
            }

        };

        /*$scope.dtOptions = DTOptionsBuilder.newOptions()
            .withPaginationType('full_numbers')
            .withDisplayLength()
            .withDOM('pitrfl')*/

        $scope.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(4).notSortable(),
       /*     DTColumnDefBuilder.newColumnDef(1).notVisible(),
            DTColumnDefBuilder.newColumnDef(2)*/
        ];

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
            }
        }

        $scope.selectedFilters = {
            diabetesTypes: undefined,
            hbMin : 0,
            hbMax : 200,
        }

        $scope.model = {
            allContacts : undefined,
            subjectList : undefined
        }


        $scope.$watch("selectedFilters", function (){
            filter();
        }, true)

        $scope.$watch("model.allContacts", function (){
            filter();
        }, true)

        function filter(){

            console.log("Changed Filters");

            var selectedFilters = $scope.selectedFilters;
            var contacts = angular.copy($scope.model.allContacts);

            if("hbMin" in selectedFilters){
                contacts = _.filter(contacts, function (d){
                    return d.hba1c > selectedFilters.hbMin && d.hba1c < selectedFilters.hbMax;
                })
            }

            var subjects = _.toArray(_.groupBy(contacts, function(contact){
                return contact.subject.subjectID
            }));

            console.log("subjects", subjects);

            $scope.model.subjectList = subjects;
        }



        $http.get("https://ndr.registercentrum.se/api/Contact?APIKey=LkUtebH6B428KkPqAAsV&dateFrom=2012-03-26&AccountID=" + $scope.accountModel.activeAccount.accountID)
            .success(function(data) {
                console.log("Loaded Contacts", data);
                $scope.model.allContacts = data;

            })


    })