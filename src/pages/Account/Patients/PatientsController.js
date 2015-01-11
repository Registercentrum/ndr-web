angular.module("ndrApp")
    .controller('PatientsController', function ($scope, $http, $stateParams, $state, DTOptionsBuilder, DTColumnDefBuilder) {

        console.log("PatientsController: Init");

        /* Date picker options */
        $scope.datePickers = {
            from : {
                date : new Date("2013-01-01"),
                opened : false,
            },
            to : {
                date : new Date(),
                opened : false,
            }
        }

        $scope.today = function() {
            $scope.dt = new Date();
        };
        $scope.today();


        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };
        //$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        //$scope.format = $scope.formats[0];


        $scope.open = function($event, picker) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.datePickers[picker].opened = true;
        };

        /* Table options */

        $scope.dtOptions = {
            paginate: false,
            bFilter : false,
            bRetrieve : true,
            // bDestroy : false,
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

        $scope.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(4).notSortable(),
        ];

        /* Filters */

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

        /* Active filters */

        $scope.activeFilters = {
            diabetesTypes: [
                    {
                        id: 0,
                        text: "Alla typer"
                    },

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

        $scope.selectedFilters = {
            diabetesTypes: 0,
            hbMin : 0,
            hbMax : 200,
        }

        $scope.model = {
            allSubjects : undefined,
            filteredSubjects : undefined
        }


        $scope.$watch("datePickers.to.date", function (){
            loadSubjects();
        })

        $scope.$watch("datePickers.from.date", function (){
            loadSubjects();
        })


        $scope.$watch("selectedFilters", function (){
            filter();
        }, true)

        $scope.$watch("model.allSubjects", function (){
            filter();
        }, true)


        function filter(){

            console.log("Changed Filters");

            var selectedFilters = $scope.selectedFilters;
            var subjects = angular.copy($scope.model.allSubjects);

            if("hbMin" in selectedFilters){
                subjects = _.filter(subjects, function (d){
                    return d.aggregatedProfile.hba1c > selectedFilters.hbMin && d.aggregatedProfile.hba1c < selectedFilters.hbMax;
                })
            }

            if("diabetesTypes" in selectedFilters && selectedFilters.diabetesTypes != 0){

                subjects = _.filter(subjects, function (d){

                    console.log(d.aggregatedProfile.subject);
                    
                    if(d.aggregatedProfile.subject.diabetesType == null){ return false }

                    return d.aggregatedProfile.subject.diabetesType.id == selectedFilters.diabetesTypes;
                })
            }

            /*var subjects = _.toArray(_.groupBy(contacts, function(contact){
                return contact.subject.subjectID
            }));*/

            $scope.model.filteredSubjects = subjects;
            $scope.model.filteredSubjectsLength = subjects.length;

            console.log("Filtered subjects", subjects.length, subjects);

        }


        /* Load data when period changes */

        function loadSubjects (){

            var dateFrom = moment($scope.datePickers.from.date).format("YYYY-MM-DD")
            var dateTo = moment($scope.datePickers.to.date).format("YYYY-MM-DD")


             $http.get("https://ndr.registercentrum.se/api/Contact?APIKey=LkUtebH6B428KkPqAAsV&dateFrom=" + dateFrom +  "&dateTo=" + dateTo + "&AccountID=" + $scope.accountModel.activeAccount.accountID)
                .success(function(data) {
                console.log("Loaded Contacts", data);

                var subjects = [];

                var subjectsArray = _.toArray(_.groupBy(data, function(contact){
                    return contact.subject.socialNumber
                }));

                _.each(subjectsArray, function(contactsArray, key){
                    var o = {
                        contacts : contactsArray,
                        aggregatedProfile : _.last(contactsArray)

                    };

                    angular.extend(o, _.last(contactsArray).subject)

                    if( contactsArray.length > 1) {

                        for (var i = contactsArray.length-2; i >= 0; i--) {

                            _.each(o.aggregatedProfile, function (obj, key) {
                                if (obj == null) {

                                    obj = contactsArray[i][key];

                                }
                            })

                        }
                    }
                    subjects.push(o)
                })
                console.log("Loaded Subjects", subjects.length, subjects);

                $scope.model.allSubjects = subjects;
                $scope.model.allSubjectsLength = subjects.length;

            })

        }
    })