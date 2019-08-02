'use strict';

angular.module('ndrApp', [
    'ui.router',
    'angular-loading-bar',
    'restangular',
    'selectize',
    'ngSanitize',
    'ui.bootstrap',
    //'datatables',
    'vr.directives.slider',
    'truncate',
    'angulartics',
    'angulartics.google.analytics'
])


    // Override config options
    .config(['datepickerPopupConfig', function (datepickerPopupConfig) {
        datepickerPopupConfig.currentText     = 'Idag';
        datepickerPopupConfig.clearText       = 'Rensa';
        datepickerPopupConfig.closeText       = 'Stäng';
        datepickerPopupConfig.toggleWeeksText = 'Veckoformat';
    }])

    .run(function ($state, $rootScope, accountService, cookieFactory) {

        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            console.log('NAVIGATING TO', toState);
            $rootScope.$state = toState.name;
        });

        /*$rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
            // prevent access to subject views if not logged in as a subject
            if (toState.name.indexOf('main.subject') === 0) {
                // further check for access to the survey from view
                // for people with one time access code
                if (toState.name === 'main.subject.surveys') {
                    if (!accountService.accountModel.subject &&
                        !accountService.accountModel.PROMSubject) {
                        event.preventDefault();
                        $state.go('main.login', {}, {reload: true});
                        return;
                    }
                } else if (!accountService.accountModel.subject) {
                    event.preventDefault();
                    $state.go('main.login', {}, {reload: true});
                    return;
                }
            }

            // prevent access to user views if not logged in as a user
            if (toState.name.indexOf('main.account') === 0) {
                // if not logged in at all, redirect to login
                if (!accountService.accountModel.user) {
                    event.preventDefault();
                    $state.go('main.login', {}, {reload: true});

                // if logged in but no activeAccount is selected, redirect to home page
                } else if (!accountService.accountModel.activeAccount) {
                    event.preventDefault();
                    $state.go('main.home', {}, {reload: true});

                // further check if isUsingPROM: true for the survey administration page
                } else if (toState.name.indexOf('main.account.survey') === 0 &&
                    !accountService.accountModel.activeAccount.unit.isUsingPROM) {
                    event.preventDefault();
                    $state.go('main.home', {}, {reload: true});
                }
            }
        });*/

        // $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
        //     var user = accountService.accountModel.user
        //
        //     if(!user) return false;
        //
        //     //if there is no activeAccount set, redirect to home page to choose unit
        //     if (toState.name.indexOf('main.account') === 0 && !accountService.accountModel.activeAccount) {
        //         if (cookieFactory.read("ACTIVEACCOUNT")) {
        //           accountService.accountModel.activeAccount = user.accounts.find(function (a) {
        //             return a.accountID === +cookieFactory.read("ACTIVEACCOUNT");
        //           });
        //         } else {
        //             event.preventDefault();
        //             $state.go('main.home', {}, {reload: true});
        //         }
        //     }
        // });

        $rootScope.is = function(name){
            return $state.is(name);
        };

        $rootScope.$on('$viewContentLoaded', function () {

             var interval = setInterval(function(){
                 if (document.readyState == 'complete') {

                     window.scrollTo(0, 0);
                     clearInterval(interval);

                     $('input').placeholder();

                     jQuery('.u-equalHeight').matchHeight(true);
                     jQuery('.Intro--equalHeights').matchHeight(false);

                     if ( jQuery(window).width() >= 700 ) {
                         jQuery('.InfoGrid-equalHeightsGroup1').matchHeight(false);
                         jQuery('.InfoGrid-equalHeightsGroup2').matchHeight(false);
                         jQuery('.InfoGrid-equalHeightsGroup3').matchHeight(false);
                         jQuery('.InfoGrid-equalHeightsGroup4').matchHeight(false);
                     }

                 }
             },100);

        });
    })

    // The routing system
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {


            var templateURL = 'templates/';

            // Default and fallback state
            $urlRouterProvider.otherwise('/');
			$locationProvider.hashPrefix(''); // by default '!'

            $stateProvider
                .state('main', {

                    // Make this state abstract so it can never be loaded directly
                    abstract: true,
                    template : '<div ui-view></div>',

                    // Centralize the resolution of common meta data (counties, units, indicators etc.)
                    resolve: {
                        config: function(dataService){
                            return dataService.bootstrap();
                        }
                    }
                })

                /*.state('main.admin', {
                    controller : 'AdminController',
                    url: '/',
                    templateUrl: 'src/pages/Admin/admin.html'
                })*/

                .state('main.home', {
                    controller : 'HomeController',
                    url: '/',
                    templateUrl: 'src/pages/Home/home.html?v=3'
                })


                .state('main.guidelines', {
                    url: '/guidelines',
                    controller : 'GuidelinesController',
                    templateUrl: 'src/pages/Guidelines/guidelines.html?v=3',

                    resolve: {

                    }
                })

                .state('main.accountAbout', {
                    url: '/konto',
                    //controller : 'GuidelinesController',
                    templateUrl: 'src/pages/About/aboutAccount.html?v=3',
                    resolve: {
                    }
                })

                .state('main.login', {
                    url: '/login?direct',
                    controller : 'LoginController',
                    templateUrl: 'src/pages/Login/login.html?v=3',
                    resolve: {
                    }
                })

                .state('main.currentUser', {
                    url: '/Konto',
                    controller : 'CurrentUserController',
                    templateUrl: 'src/pages/CurrentUser/currentUser.html?v=3',
                    resolve: {

                    }
                })

                .state('main.english', {
                    url: '/english',
                    //controller : 'GuidelinesController',
                    templateUrl: 'src/pages/Language/english.html?v=3',
                    resolve: {

                    }
                })

                .state('main.patient', {
                    url: '/for-dig-med-diabetes',
                    controller: 'FilterUnitsController',
                    templateUrl: 'src/pages/Patient/patient.html?v=3'
                })

                .state('main.contribute', {
                    url: '/du-bidrar',
                    //controller: 'FilterUnitsController',
                    templateUrl: 'src/pages/Patient/contribute.html?v=3'
                })

                /* Statistics */

                .state('main.statistics', {
                    url: '/statistik',
                    templateUrl: 'src/pages/Statistics/statistics.html?v=3',
                    controller: 'StatisticsController'
                })

                .state('main.statisticsAbout', {
                    url: '/om-statistiken',
                    templateUrl: 'src/pages/Statistics/statisticsAbout.html?v=3',
                    controller: 'StatisticsAboutController'
                })

                .state('main.annualReport', {
                    url: '/arsrapport',
                    templateUrl: 'src/pages/Statistics/annualReport.html?v=3'
                })

                .state('main.variables', {
                    url: '/variabler',
                    templateUrl: 'src/pages/Variables/variables.html',
                    controller: 'VariablesController'
                })

                .state('main.compare1', {
                    url: '/knappen1',
                    templateUrl: 'src/pages/Compare/compare.html?v=3'
                })

                .state('main.compare', {
                    url: '/knappen',
                    templateUrl: 'src/pages/Knappen2/knappen2.html?v=3',
                    controller: 'Knappen2Controller'
                })

                .state('main.compareSearch', {
                    url: '/knappen/:s',
                    templateUrl: 'src/pages/Knappen2/knappen2.html?v=3',
                    controller: 'Knappen2Controller'
                })

                .state('main.risk', {
                    url: '/risk',
                    templateUrl: 'src/pages/Risk/risk.html?v=3'
                })

                .state('main.profiles', {
                    url: '/profil',
                    templateUrl: 'src/pages/Profiles/profiles.html?v=3'
                    //controller: 'StatisticsController'
                })

                .state('main.profiles.county', {
                    controller : 'CountyController',
                    url: '/landsting/:id',
                    templateUrl: 'src/pages/Profiles/profiles.county.html?v=3'
                })

                .state('main.profiles.unit', {
                    controller : 'UnitController',
                    url: '/enhet/:id',
                    templateUrl: 'src/pages/Profiles/profiles.unit.html?v=3'
                })

                .state('main.research', {
                    url: '/forskning',
                    templateUrl: 'src/pages/Research/research.html?v=3',
                    controller : 'ResearchController'
                })

                .state('main.researchEnglish', {
                    url: '/Research',
                    templateUrl: 'src/pages/Research/researchEnglish.html',
                    controller : 'ResearchEnglishController'
                })

                .state('main.researchItemEnglish', {
                    url: '/forskning/:id/:english',
                    templateUrl: 'src/components/Publication/Publication.html?v=3',
                    controller : 'PublicationController'
                })

                .state('main.researchItem', {
                    url: '/forskning/:id',
                    templateUrl: 'src/components/Publication/Publication.html?v=3',
                    controller : 'PublicationController'
                })

                .state('news', {
                    url: '/nyheter',
                    templateUrl: 'src/pages/News/news.html?v=3',
                    controller : 'NewsController'
                })

                .state('newsItem', {
                    url: '/nyheter/:id',
                    templateUrl: 'src/components/Article/article.html',
                    controller: 'NewsItemController'
                })

                .state('main.improvement', {
                    url: '/forbattringsprojekt',
                    templateUrl: 'src/pages/Improvement/improvement.html?v=3'
                   // controller : 'ResearchController'
                })

                .state('main.about', {
                    url: '/om-ndr',
                    templateUrl: 'src/pages/About/about.html?v=3',
                    controller : 'AboutController'
                })

                .state('main.aboutSwediabkids', {
                    url: '/om-swediabkids',
                    templateUrl: 'src/pages/About/aboutSwediabkids.html?v=3',
                    controller : 'AboutController'
                })

                .state('main.forms', {
                    url: '/blanketter',
                    templateUrl: 'src/pages/Forms/forms.html?v=3'
                    //controller : 'ResearchController'
                })

                .state('main.press', {
                    url: '/press',
                    templateUrl: 'src/pages/Press/press.html?v=3'
                    //controller : 'ResearchController'
                })

                .state('main.prom', {
                    url: '/prom',
                    templateUrl: 'src/pages/Prom/prom.html?v=3'
                    //controller : 'ResearchController'
                })

                /* Logged in states as a subject */

                .state('main.subject', {
                    url: '/subjekt',
                    templateUrl: 'src/pages/Subject/subject.html?v=3',
                    controller : 'SubjectController',
                    resolve: {
                        config: function (accountService) {
                             return accountService.bootstrap('subject');
                        }
                    }
                })

                .state('main.subject.home', {
                    url: '/hem',
                    templateUrl: 'src/pages/Subject/home.html?v=3',
                    controller : 'SubjectHomeController'
                })

                .state('main.subject.surveys', {
                    url: '/enkater',
                    templateUrl: 'src/pages/Subject/Surveys/surveys.html?v=3',
                    controller : 'SubjectSurveysController'
                })

                .state('main.subject.surveys.info', {
                    url: '/info',
                    templateUrl: 'src/pages/Subject/Surveys/info.html?v=3'
                })

                .state('main.subject.surveys.survey', {
                    url: '/besvara/?inviteID',
                    templateUrl: 'src/pages/Subject/Surveys/survey.html?v=3',
                    controller : 'SubjectSurveyController'
                })

                .state('main.subject.profile', {
                    url: '/profil',
                    params: { tab: null },
                    templateUrl: 'src/pages/Subject/Profile/profile.html?v=5',
                    controller : 'SubjectProfileController'
                })

                /* Logged in states */

                .state('main.account', {
                    url: '/inloggad',
                    templateUrl: 'src/pages/Account/account.html?v=3',
                    controller : 'AccountController',
                    resolve: {
                        config: function (accountService) {
                             return accountService.bootstrap();
                        }
                    }
                })

                .state('main.account.home', {
                    url: '/hem',
                    templateUrl: 'src/pages/Account/home.html?v=3',
                    controller : 'AccountHomeController'
                })

                .state('main.account.survey', {
                    url: '/diabetesenkaten',
                    params: {
                      restoreFilters: ''
                    },
                    templateUrl: 'src/pages/Account/Survey/survey.html?v=3',
                    controller : 'SurveyController'
                })

                .state('surveyPrint', {
                    url: '/skriv-inbjudan?unitName?socialNumber?key',
                    templateUrl: 'src/pages/Account/SurveyPrint/surveyPrint.html?v=3',
                    controller : 'SurveyPrintController'
                })

                .state('main.account.report', {
                    url: '/rapportera',
                    templateUrl: 'src/pages/Account/Report/report.html?v=3',
                    controller : 'ReportController'
                })

                .state('main.account.reportone', {
                    url: '/rapportera/:patientID',
                    templateUrl: 'src/pages/Account/Report/report.html?v=3',
                    controller : 'ReportController'
                })

                .state('main.account.reportoneview', {
                    url: '/rapportera/:patientID/:view',
                    templateUrl: 'src/pages/Account/Report/report.html?v=3',
                    controller : 'ReportController'
                })

                .state('main.reportPROM', {
                    url: '/rapporteraPROM/:patientID',
                    templateUrl: 'src/pages/Account/Report/reportPROM.html?v=3',
                    controller : 'ReportPROMController'
                })

                .state('main.account.patients', {
                    url: '/patienter',
                    templateUrl: 'src/pages/Account/Patients/patients.html?v=3',
                    controller : 'PatientsController',
                    params: {
                        restoreFilters: ''
                    }
                })

                .state('main.account.patients2', {
                    url: '/patienter2',
                    templateUrl: 'src/pages/Account/Patients/patients2.html?v=3',
                    controller : 'Patients2Controller'
                })

                .state('main.account.patient', {
                    url: '/patient/?patientID',
                    templateUrl: 'src/pages/Account/Patients/patient_profile.html?v=3',
                    controller : 'PatientController',
                    params: {
                        backToSearchVisible: '',
                        backToSurveysVisible: '',
                    }
                })

                .state('main.account.patientPrint', {
                    url: '/patient/print/:patientID',
                    templateUrl: 'src/pages/Account/Patients/patient_print.html?v=4',
                    controller : 'PatientPrintController'
                })

                /* Generic pages */

                .state('page', {
                    url: '/page/:id',
                    templateUrl: function (stateParams){

                        var preferred = templateURL + 'page/' + stateParams.id + '.html';

                        return preferred;

                       /* var fallback = templateURL + 'page/page.html';

                        if(PageExists(preferred)){
                            return preferred;
                        }
                        else{
                            return fallback;
                        }*/
                    }
                });
         }]);
