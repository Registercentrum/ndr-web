'use strict';

angular.module('ndrApp')
    .directive('statChar', ['$q','dataService', '$state', function($q, dataService,$state) {

        function link (scope) {

			var localModel = {
				allDTTypes: [
					{ id: 0, name: 'Alla'},
					{ id: 1, name: 'Typ 1 diabetes'},
					{ id: 2, name: 'Typ 2 diabetes'},
					{ id: 3, name: 'Sekundär'},
					{ id: 5, name: 'Oklar' },
					{ id: 9, name: 'Typ saknas'}
				],
				unitDTTypes: [],
				activeDTType: null,
				charStatistics: null,
				unitType: scope.model.activeAccount.unit.typeID
			}

			scope.model = jQuery.extend(scope.model, localModel);

			scope.setDisplayedDTType = function(id) {
				scope.model.activeDTType = _.find(scope.model.unitDTTypes, function(d) {
					return id === d.id;
				});
			};

			scope.countClicked = function(area, field, dType) {

        if (area)
          if (area.noClick) return;

				var dateOffset = (24*60*60*1000) * 365;
				var today = new Date();

				var valueFilter = {
					dateFrom: new Date(today-dateOffset),
					dateTo: today,
					d: { value: 1 }
				};

				if (scope.model.activeDTType || dType) {
					valueFilter.d = { value: scope.model.activeDTType.id || dType };
					if (dType)
						if (dType == 9)
							valueFilter.d.undef = true;
				}

        if (field) {
  				switch(field.name) {
  					case 'male':
  						valueFilter.s = { value: 1 }; break;
  					case 'female':
  						valueFilter.s = { value: 2 }; break;
  					case 'ageLT30':
  						valueFilter.age = { min: 18, max: 29 }; break;
  					case 'age30to64':
  						valueFilter.age = { min: 30, max: 64 }; break;
  					case 'age65to79':
  						valueFilter.age = { min: 65, max: 79 }; break;
  					case 'ageGT80':
  						valueFilter.age = { min: 80, max: 120 }; break;
  					case 'durLT10':
  						valueFilter.y = { min: 1920, max: today.getFullYear() }; break;
  					case 'dur10to20':
  						valueFilter.y = { min: 1920, max: today.getFullYear() }; break;
  					case 'dur20to29':
  						valueFilter.y = { min: 1920, max: today.getFullYear() }; break;
  					case 'dur30to39':
  						valueFilter.y = { min: 1920, max: today.getFullYear() }; break;
  					case 'dur40to49':
  						valueFilter.y = { min: 1920, max: today.getFullYear() }; break;
  					case 'durGT50':
  						valueFilter.y = { min: 1920, max: today.getFullYear() }; break;
  					case 'treat1':
  						valueFilter.treatment = { value: 1 }; break;
  					case 'treat2':
  						valueFilter.treatment = { value: 2 }; break;
  					case 'treat3':
  						valueFilter.treatment = { value: 3 }; break;
  					case 'treat4':
  						valueFilter.treatment = { value: 4 }; break;
  					case 'treatglp1':
  						valueFilter.treatment = {}; break;
  					case 'imInjection':
  						valueFilter.insulinMethod = { value: 1 }; break;
  					case 'imPump':
  						valueFilter.insulinMethod = { value: 2 }; break;
  					case 'cgmYes':
  						valueFilter.cgm = { value: 1 }; break;
  					case 'fgm':
  						valueFilter.cgmType = { value: 4 }; break;
  				}
        }

				dataService.setSearchFilters('values', valueFilter);

				$state.go('main.account.patients');
			}

			dataService.getPatientsStatistics(scope.model.activeAccount.accountID, function(d) {

				scope.model.charStatistics = d;

				//om primärvårdsenhet så skall endast Alla visas
				if (scope.model.unitType  == 1 ) {
					scope.model.unitDTTypes.push(scope.model.allDTTypes[0]);
					scope.model.activeDTType = scope.model.unitDTTypes[0];
				} //om medicinklinik så skall de typer som finns på enheten
				else {

					for (var p in d) {
						if (d[p][3] != null) {
							scope.model.unitDTTypes.push(_.find(scope.model.allDTTypes, function(d){
								return d.id == p;
							}))
						}
					}

					//av de typer som finns på enheten visa bara Alla, Typ1, Typ2
					scope.model.unitDTTypes = scope.model.unitDTTypes.filter(function(d) {
						return [0,1,2].indexOf(d.id) > -1;
					});

					//sätt typ 1 som default
					scope.model.activeDTType = scope.model.unitDTTypes[1];
				}

				scope.model.charConfig = [
					{
						header: 'Kön',
						hiddenIfDTTypes: [],
						fields: [
							{ name: 'male', header: 'män' },
							{ name: 'female', header: 'kvinnor'}
						],
						defaultDenom: 'total'
					},
					{
						header: 'Ålder',
						hiddenIfDTTypes: [],
						fields: [
							{ name: 'ageLT30', header: '18-29 år'},
							{ name: 'age30to64', header: '30-64 år'},
							{ name: 'age65to79', header: '65-79 år' },
							{ name: 'ageGT80', header: '80- år'}
						],
						defaultDenom: 'total'
					},
					{
						header: 'Duration',
						hiddenIfDTTypes: [],
						noClick: true,
						fields: [
							{ name: 'durLT10', header: '0-9 år' },
							{ name: 'dur10to20', header: '10-19 år' },
							{ name: 'dur20to29', header: '20-29 år' },
							{ name: 'dur30to39', header: '30-39 år' },
							{ name: 'dur40to49', header: '40-49 år' },
							{ name: 'durGT50', header: '50- år' }
						],
						defaultDenom: 'dur'
					},
					{
						header: 'Diabetesbehandling',
						hiddenIfDTTypes: [1],
						fields: [
							{ name: 'treat1', header: 'enbart kost' },
							{ name: 'treat2', header: 'tabletter'},
							{ name: 'treat3', header: 'insulin' },
							{ name: 'treat4', header: 'tablett + insulin'},
							{ name: 'treatglp1', header: 'GLP1'},
						],
						defaultDenom: 'treat'
					},
					{
						header: 'Metod att ge insulin',
						hiddenIfDTTypes: [0,2,3,4,5,9],
						fields: [
							{ name: 'imInjection', header: 'injektion' },
							{ name: 'imPump', header: 'pump'}
						],
						defaultDenom: 'total'
					},
					{
						header: 'Kontinuerlig klukosmätning',
						hiddenIfDTTypes: [0,2,3,4,5,9],
						fields: [
							{ name: 'cgmYes', header: 'använder CGM/FGM', denom: 'insulin', helpText: 'Nämnaren är summan av alla insulinbehandlade.'},
							{ name: 'fgm', header: 'varav FGM', denom: 'cgmYes', helpText: 'Nämnaren är summan av alla som använder CGM.' }
						],
						defaultDenom: 'cgmYes'
					}
				];
			});


        }
        return {
            restrict : 'A',
            templateUrl: 'src/components/StatChar/StatChar.html',
            link: link,
            scope: {
                model: '='
            }
        };
    }]);
