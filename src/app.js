'use strict';
angular.module('ndrApp', ['ui.router', 'angular-loading-bar', 'restangular', 'selectize', 'ngSanitize'])

    // The routing system
    .config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

        var templateURL = "templates/";

        // Default and fallback state
        $urlRouterProvider.otherwise("/");

        $stateProvider
            .state('main', {

                // Make this state abstract so it can never be loaded directly
                abstract: true,
                template : "<ui-view/>",

                // Centralize the resolution of common meta data (counties, units, indicators etc.)
                resolve: {
                    config: function(dataService){
                        return dataService.bootstrap();
                    }
                }
            })


            .state('main.home', {
                controller : "HomeController",
                url: "/",
                templateUrl: "src/pages/Home/home.html",

            })

            .state('main.guidelines', {
                url: "/guidelines",
                controller : "GuidelinesController",
                templateUrl: "src/pages/Guidelines/guidelines.html",

                resolve: {

                }
            })

            .state('patient', {
                url: "/for-dig-med-diabetes",
                //controller : "Controller",
                templateUrl: "src/pages/Patient/patient.html"
            })

            /* Statistics */

            .state('statistics', {
                url: "/statistik",
                templateUrl: "src/pages/Statistics/statistics.html"
                //controller: "StatisticsController"
            })

            .state('compare', {
                url: "/knappen",
                templateUrl: "src/pages/Statistics/statistics.compare.html"
            })


            .state('main.profiles', {
                url: "/profil",
                templateUrl: "src/pages/Profiles/profiles.html"
                //controller: "StatisticsController"
            })

            .state('main.profiles.county', {
                controller : "CountyController",
                url: "/landsting/:id",
                templateUrl: "src/pages/Profiles/profiles.county.html"
            })

            .state('main.profiles.unit', {
                controller : "CountyController",
                url: "/enhet/:id",
                templateUrl: "src/pages/Profiles/profiles.unit.html"
            })



            .state('research', {
                url: "/forskning",
                templateUrl: "src/pages/Research/research.html",
                controller : "ResearchController"
            })



            .state('news', {
                url: "/nyheter",
                templateUrl: "src/pages/News/news.html",
                controller : "NewsController"
            })

            .state('newsItem', {
                url: "/nyheter/:id",
                templateUrl: "src/components/Article/article.html",
                controller: "NewsItemController"
            })


            .state('improvement', {
                url: "/forskning",
                templateUrl: templateURL + "research/research.html",
                controller : "ResearchController"
            })

            .state('about', {
                url: "/om-ndr",
                templateUrl: "src/pages/About/about.html"
                //controller : "ResearchController"
            })

            /* Logged in states */

            .state('main.account', {
                url: "/inloggad",
                templateUrl: "src/pages/Account/account.html"
            })

            .state('main.account.home', {
                url: "/hem",
                templateUrl: "src/pages/Account/home.html"
            })

            .state('main.account.report', {
                url: "/rapportera",
                templateUrl: "src/pages/Account/patients.html",
                controller : "PatientsController"
            })


            .state('main.account.patients', {
                url: "/patienter",
                templateUrl: "src/pages/Account/patients.html",
                controller : "PatientsController"
            })

            .state('main.account.patient', {
                url: "/patient/:patientID",
                templateUrl: templateURL + "account/patient_profile.html",
                controller : "PatientController"
            })



            /* Generic pages */

            .state('page', {
                url: "/page/:id",
                templateUrl: function (stateParams){

                    var preferred = templateURL + "page/" + stateParams.id + ".html";

                    return preferred;

                   /* var fallback = templateURL + "page/page.html";

                    if(PageExists(preferred)){
                        return preferred;
                    }
                    else{
                        return fallback;
                    }*/
                }
            })
    })
