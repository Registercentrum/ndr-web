'use strict';

angular.module('ndrApp')
    .directive('patientProfilePrintGrownup', ['$q', '$timeout', 'commonService',
        function($q, $timeout, commonService) {

            function link(scope, element, attrs) {

                scope.model = {
                    data: {
                        trend: {},
                        chart: {
                            gauge: {
                                physicalActivity: {}
                            }
                        },
                        table: null,
                        fullTable: null

                    },
                    //latest: null,
                    mode: 'visual',
                    trendKeys: ['hba1c', 'bpSystolic', 'bpDiastolic', 'cholesterol', 'triglyceride', 'ldl', 'hdl']
                };

                scope.init = function() {
                  scope.setTrendData();

                  $timeout(function () {
                    Highcharts.charts.map(function (c) {
                      if(c){
                        c.reflow();
                      }
                    })
                  }, 500);
                }

                scope.diabetesTypeText = function() {
                    if (!scope.contactAttributes) return;
                    return commonService.getLabelByKeyVal(scope.contactAttributes,'diabetesType',scope.subject.diabetesType);
                  }

                scope.setTrendData = function() {

                  scope.model.data.trend = commonService.getSeries(scope.subject, scope.model.trendKeys, 3)

                  scope.model.data.trend.combinedLDLHDL = [{
                      //dashStyle: "ShortDot",
                      color: 'black',
                      symbol: 'circle',
                      fillColor: {
                          linearGradient: {
                              x1: 0,
                              y1: 0,
                              x2: 0,
                              y2: 1
                          },
                          stops: [
                              [0, 'rgba(89,153,218,0.2)'],
                              [1, 'rgba(89,153,218,0.2)']
                          ]
                      },
                      name: 'LDL',
                      data: scope.model.data.trend.ldl
                  }, {
                      //dashStyle: "ShortDot",
                      color: 'black',
                      symbol: 'square',
                      fillColor: {
                          linearGradient: {
                              x1: 0,
                              y1: 0,
                              x2: 0,
                              y2: 1
                          },
                          stops: [
                              [0, 'rgba(26,188,156,0.2)'],
                              [1, 'rgba(26,188,156,0.2)']
                          ]
                      },
                      name: 'HDL',
                      data: scope.model.data.trend.hdl
                  }];
  
                  scope.model.data.trend.combinedCholesterol = [{
                      //dashStyle: "ShortDot",
                      color: 'black',
                      symbol: 'circle',
                      fillColor: {
                          linearGradient: {
                              x1: 0,
                              y1: 0,
                              x2: 0,
                              y2: 1
                          },
                          stops: [
                              [0, 'rgba(89,153,218,0.2)'],
                              [1, 'rgba(89,153,218,0.2)']
                          ]
                      },
  
                      name: 'Kolesterol',
                      data: scope.model.data.trend.cholesterol
                  }, {
                      //dashStyle: "ShortDot",
                      color: 'black',
                      symbol: 'square',
                      fillColor: {
                          linearGradient: {
                              x1: 0,
                              y1: 0,
                              x2: 0,
                              y2: 1
                          },
                          stops: [
                              [0, 'rgba(26,188,156,0.2)'],
                              [1, 'rgba(26,188,156,0.2)']
                          ]
                      },
                      name: 'Triglycerider',
                      data: scope.model.data.trend.triglyceride
                  }];
  
                  scope.model.data.trend.combinedBp = [{
                      //dashStyle: "ShortDot",
                      color: 'black',
                      symbol: 'circle',
                      fillColor: {
                          linearGradient: {
                              x1: 0,
                              y1: 0,
                              x2: 0,
                              y2: 1
                          },
                          stops: [
                              [0, 'rgba(89,153,218,0.2)'],
                              [1, 'rgba(89,153,218,0.2)']
                          ]
                      },
                      name: 'Systoliskt',
                      data: scope.model.data.trend.bpSystolic
                  }, {
                      //dashStyle: "ShortDot",
                      color: 'black',
                      symbol: 'square',
  
                      fillColor: {
                          linearGradient: {
                              x1: 0,
                              y1: 0,
                              x2: 0,
                              y2: 1
                          },
                          stops: [
                              [0, 'rgba(26,188,156,0.2)'],
                              [1, 'rgba(26,188,156,0.2)']
                          ]
                      },
                      name: 'Diastoliskt',
                      data: scope.model.data.trend.bpDiastolic
                  }];

                }

                scope.calculateAge = function(birthDate) {
                    return moment().diff(birthDate, 'years');
                };

                scope.checkFootDate = function() {
                    if (scope.latest.footExaminationDate.value) {
                        return commonService.dateWithinYears(scope.latest.footExaminationDate.label, 1);
                    }
                    return true;
                }
                
                scope.init();

            }
            return {
                restrict: 'A',
                templateUrl: 'src/components/PatientProfile/PatientProfilePrintGrownup.html',
                link: link,
                scope: {
                    subject: '=',
                    latest: '=',
                    contactAttributes: "="
                }
            };
        }
    ]);