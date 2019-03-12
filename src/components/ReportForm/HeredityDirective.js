'use strict';

angular.module('ndrApp')
    .directive('heredity', ['$q','dataService','calcService','$state', '$modal', '$filter', function($q, dataService, calcService, $state, $modal, $filter) {

        function link (scope, element, attrs) {

          scope.model = {
            relatives: [
              { key: 'mother', text: 'Mor' },
              { key: 'father', text: 'Far' },
              { key: 'grandma1', text: 'Mormor' },
              { key: 'grandpa1', text: 'Morfar' },
              { key: 'grandma2', text: 'Farmor' },
              { key: 'grandpa2', text: 'Farfar' },
              { key: 'sibling1', text: 'Syskon 1' },
              { key: 'sibling2', text: 'Syskon 2' },
              { key: 'sibling3', text: 'Syskon 3' },
              { key: 'sibling4', text: 'Syskon 4' },
              { key: 'sibling5', text: 'Syskon 5' },
              { key: 'sibling6', text: 'Syskon 6' },
              { key: 'sibling7', text: 'Syskon 7' },
              { key: 'sibling8', text: 'Syskon 8' },
              { key: 'sibling9', text: 'Syskon 9' },
              { key: 'sibling10', text: 'Syskon 10' },
              { key: 'sibling11', text: 'Syskon 11' },
              { key: 'sibling12', text: 'Syskon 12' }
            ],
            diseases: [
              { key:'type1', text:'Typ 1' },
              { key:'type2', text:'Typ 2' },
              { key:'otherType', text:'Annan diabetestyp' },
              { key:'unknownType', text:'Oklar diabetestyp' },
              { key:'myocardialInf55', text:'Hjärtinfarkt före 55 år' },
              { key:'stroke', text:'Stroke'},
              { key:'hypertension', text:'Hypertoni' },
              { key:'hyperlipidemi', text:'Hyperlipidemi', },
              { key:'obesity', text:'Fetma (BMI>30)' },
              { key:'thyreoidea', text:'Thyreoideasjd' },
              { key:'celiacDisease', text:'Celiaki' },
              { key:'otherAutoimmune', text:'Annan autoimmun sjd' },
              { key:'none', text:'Inget av dessa' },
              { key:'isMissing', text:'Uppgift Saknas' }],
            gridData: {},
            formData: {
              postalNo: null,
              bc: null,
              yearToSweden: null,
              everybodyBornSweden: null,
              bcMother: null,
              bcFather: null,
              bcGrandpa1: null,
              bcGrandpa2: null,
              bcGrandma1: null,
              bcGrandma2: null,
              weightMother: null,
              weightFather: null,
              heightMother: null,
              heightFather: null
            },
            siblingCount: 0,

          }

          scope.init = function() {

            var siblingIndex = 1
            for (var i = 0; i < scope.model.relatives.length; i++) { 
              scope.model.gridData[scope.model.relatives[i].key] = {};

              //add property siblingIndex
              if (scope.model.relatives[i].key.indexOf('sibling')>-1) {
                scope.model.relatives[i].siblingIndex = siblingIndex;
                siblingIndex = siblingIndex + 1;
              } else {
                scope.model.relatives[i].siblingIndex = null;
              }

              for (var j = 0; j < scope.model.diseases.length; j++) { 
                scope.model.gridData[scope.model.relatives[i].key][scope.model.diseases[j].key] = null
              }
            }

            console.log(scope.model.relatives);

            //scope.model.siblingsRowsToHide = scope.getSiblingsRow();

          }

          scope.setAllBCSame = function() {
            if (scope.model.formData.everybodyBornSweden) {
              scope.model.formData.bcMother = scope.model.formData.bc;
              scope.model.formData.bcFather = scope.model.formData.bc;
              scope.model.formData.bcGrandpa1 = scope.model.formData.bc;
              scope.model.formData.bcGrandpa2 = scope.model.formData.bc;
              scope.model.formData.bcGrandma1 = scope.model.formData.bc;
              scope.model.formData.bcGrandma2 = scope.model.formData.bc;
            }
          }

          /*scope.getSiblingsRow = function() {

            var ret = {};

            for (var i = 0; i < scope.model.relatives.length; i++) { 
              if (scope.model.relatives[i].dependentKey) {
                //set initial tohide
                ret[scope.model.relatives[i].key] = true;
                var key = scope.model.relatives[i].dependentKey;

                for(var p in scope.model.gridData[key]) {
                  if (scope.model.gridData[key][p]) {
                    ret[scope.model.relatives[i].key] = false;
                  }
                }
              }
            }

            console.log('siblingsrow',ret);

            return ret;
          }*/

          /*scope.initSiblingsRow = function() {

            for (var i = 0; i < scope.model.relatives.length; i++) { 
              if (scope.model.relatives[i].dependentKey) {
                scope.model.siblingsRows[scope.model.relatives[i].key] = false
              }
            }
          }

          scope.setSiblingsRowValues = function() {
            for (var i = 0; i < scope.model.relatives.length; i++) { 

              if (scope.model.relatives[i].dependentKey) {

                //set initial false
                scope.model.siblingsRows[scope.model.relatives[i].key] = false;
                var key = scope.model.relatives[i].dependentKey;

                for(var p in scope.model.gridData[key]) {
                  if (scope.model.gridData[key][p]) {
                    scope.model.siblingsRows[scope.model.relatives[i].key] = true;
                  }
                }

              }
            }
            console.log(scope.model.siblingsRows);
          }*/
          scope.addSibling = function() {
            scope.model.siblingCount = scope.model.siblingCount + 1;
          }
          scope.removeSibling = function(r) {
            scope.model.siblingCount = scope.model.siblingCount - 1;
            console.log('removes',r);
          }
          scope.toggleVal = function(r,d) {
            scope.model.gridData[r.key][d.key] = scope.model.gridData[r.key][d.key] ? null : 1;

            /*if (!scope.model.gridData[r.key][d.key]) {
              for (var i = 0; i < scope.model.relatives.length; i++) { 
                if (scope.model.relatives[i].dependentKey === r.key) {
                  for(var p in scope.model.gridData[scope.model.relatives[i].dependentKey]) {
                    scope.model.gridData[scope.model.relatives[i].key][p] = null;
                  }
                }
              }
            }*/

            //console.log('scope.model.gridData',scope.model.gridData[r.key]);
            //scope.model.siblingsRowsToHide = scope.getSiblingsRow();
          }

          scope.saveHeredity = function() {
            console.log('should save');
          }

          scope.$watch('subject', function(newValue) {
            scope.init();
          });
          scope.$watch('updateEntity', function(newValue) {
            scope.init();
          });
        }
        return {
          restrict : 'A',
          templateUrl: 'src/components/ReportForm/Heredity.html',
          link: link,
          scope: {
            accountModel 	: '=',
            subject 		: '=',
		        updateEntity	: '='
          }
        };
    }]);
