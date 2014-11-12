'use strict';
angular.module('ndrApp', ['ui.router', 'chieffancypants.loadingBar', 'restangular'])

    //
    // The routing system
    //
    .config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {


        var templateURL = "templates/";

        //
        // Default and fallback state
        //

        $urlRouterProvider.otherwise("/");


        $stateProvider

            .state('home', {
                url: "/",
                templateUrl: templateURL + "home/home.html"
            })

            .state('guidelines', {
                url: "/guidelines",
                templateUrl: templateURL + "guidelines/guidelines.html"
            })

            /* Statistics */

            .state('statistics', {
                url: "/statistik",
                templateUrl: templateURL + "statistics/statistics.html",
                //controller: "StatisticsController"
            })


            .state('statistics.compare', {
                url: "/jamfor/",
                templateUrl: templateURL + "statistics/statistics.compare.html"
            })

            .state('statistics.sweden', {
                url: "/riket/",
                templateUrl: templateURL + "statistics/statistics.sweden.html"
            })


            .state('statistics.county', {
                url: "/landsting/:countyID",
                templateUrl: templateURL + "statistics/statistics.county.html"
            })




            .state('research', {
                url: "/forskning",
                templateUrl: templateURL + "research/research.html",
                controller : "ResearchController"
            })



            /* Logged in states */

            .state('account', {
                url: "/inloggad",
                templateUrl: templateURL + "/account/account.html"
            })

            .state('account.home', {
                url: "/hem",
                templateUrl: templateURL + "account/home.html"
            })

            .state('account.patients', {
                url: "/patienter",
                templateUrl: templateURL + "account/patients.html",
                controller : "PatientsController"
            })

            .state('account.patient', {
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

