'use strict';

angular.module('ndrApp')
  .service('calcService', [function () {
      this.calcBMISDS = function(bmi, sex, age, precision) {

      	var smoothedMean = 0, smoothedMean3SD = 0;
      	var boxMean, boxMean3SD, SD, boxBMI, BMISD, sBMISD, beta;

        if (age < 18) {
      		if (sex == 2) { // girl
            beta = 0.10848 - 0.563978 * age + 0.052448 * Math.pow(age, 2) - 0.00143 * Math.pow(age, 3);
      			if (age < 2) {
      				smoothedMean = 11.95274 + 13.98723 * age - 10.5489 * Math.pow(age, 2) + 2.388215 * Math.pow(age, 3);
      				smoothedMean3SD = 9.09765 + 12.28197 * age - 9.213104 * Math.pow(age, 2) + 2.085268 * Math.pow(age, 3);
      			}
      			else {
      				smoothedMean = 19.18887 - 1.41035 * age + 0.151814 * Math.pow(age, 2) - 0.003685 * Math.pow(age, 3);
      				smoothedMean3SD = 14.9764 - 0.776103 * age + 0.062656 * Math.pow(age, 2) - 0.000812 * Math.pow(age, 3);
      			}
      		}
      		else {
      			if (sex == 1) { // boy
              beta = 0.031179 - 0.289503 * age + 0.008617 * Math.pow(age, 2) + 0.000221 * Math.pow(age, 3);
      				if (age < 2) {
      					smoothedMean = 12.28265 + 13.91043 * age - 10.20257 * Math.pow(age, 2) + 2.241169 * Math.pow(age, 3);
      					smoothedMean3SD = 8.44909 + 15.12849 * age - 11.67585 * Math.pow(age, 2) + 2.73805 * Math.pow(age, 3);
      				}
      				else {
      					smoothedMean = 19.17678 - 1.219168 * age + 0.119514 * Math.pow(age, 2) - 0.002422 * Math.pow(age, 3);
      					smoothedMean3SD = 15.21195 - 0.730887 * age + 0.060518 * Math.pow(age, 2) - 0.000873 * Math.pow(age, 3);
      				}
      			}
      		}
          boxMean = (Math.pow(smoothedMean, beta) - 1) / beta;
          boxMean3SD = (Math.pow(smoothedMean3SD, beta) - 1) / beta;
          boxBMI = (Math.pow(bmi, beta) - 1) / beta;

      		SD = Math.abs(boxMean - boxMean3SD) / 3;
      		BMISD = (boxBMI - boxMean) / SD;
      	}

      	//if ((isNaN(BMISD)) || (!isFinite(BMISD))) {
        if (isNaN(BMISD)) {
      		return null;
      	}

      	return parseFloat(BMISD.toFixed(precision));
      }
      this.calcBMI = function(weight, height, precision) {
        return parseFloat((weight / Math.pow(height/100,2)).toFixed(precision));
      }
      this.calcE24Kg = function(weight, doses, precision) {
        return parseFloat((doses/weight).toFixed(precision));
      },
      this.roundToStep = function(value, step) {
        var inv = 1.0 / step;
        return Math.round(value * inv) / inv;
      },
      this.calcAge = function(socialNumber, date, precision, step)  {

        if (!precision) precision = 0;
        if (!step) step = 1.0;

        if (!this.isDate(date)) {
          date = new Date(date.substring(0,4),date.substring(5,7)-1,date.substring(8,10));
        }
			  var birthDate = new Date(socialNumber.substring(0,4),socialNumber.substring(4,6)-1,socialNumber.substring(6,8));
        var timeDiff = date.valueOf() - birthDate.valueOf();
        var milliInDay = 24*60*60*1000;
        var noOfDays = timeDiff / milliInDay;
        var daysInYear = 365.242; //exact days in year

        var ageRaw = this.roundToStep(noOfDays/daysInYear, step)

        var age = parseFloat(ageRaw.toFixed(precision));

        return age;
      };
      this.isDate = function(date) {
        return date instanceof Date && !isNaN(date.valueOf())
      }
      this.calcDiastSDS = function(bpDiastolic, sex, age, height, precision) { //height in centimeters
        return this.getBPSDS(false, bpDiastolic, sex, age, height, precision);
      }
      this.calcSystSDS = function(bpSystolic, sex, age, height, precision) { //height in centimeters
        return this.getBPSDS(true, bpSystolic, sex, age, height, precision);
      }
      this.getBPSDS = function(isSystolic, val, sex, age, height, precision) {

        if (age < 1 && age >= 18) return null;

        var heightInMeters = (height/100);
        var compareValue = this.getBPSDSCompareValue(false,sex,age,heightInMeters)
        var nom = this.getBPSDSNominator(false, sex);
        var compareAge = age - 10;

        var score = (val - compareValue) / nom;

        return parseFloat(score.toFixed(precision))
      }
      this.getBPSDSCompareValue = function(isSystolic, sex, age, height) {
        var ret;
        if (sex == 1) {
          if (isSystolic) {
            ret = 102.19768 + 1.82416 * age + 0.12776 * Math.pow(age, 2) + 0.00249 * Math.pow(age, 3) - 0.00135 * Math.pow(age, 4) + 2.73157 * height - 0.19618 * Math.pow(height, 2) - 0.04659 * Math.pow(height, 3) + 0.00947 * Math.pow(height, 4);
          }
          else {
            ret = 61.01217 + 0.68314 * age - 0.09835 * Math.pow(age, 2) + 0.01711 * Math.pow(age, 3) + 0.00045 * Math.pow(age, 4) + 1.46993 * height - 0.07849 * Math.pow(height, 2) - 0.03144 * Math.pow(height, 3) + 0.00967 * Math.pow(height, 4);
          }
        }
        if (sex == 2) {
          if (isSystolic) {
            ret = 102.01027 + 1.94397 * age + 0.00598 * Math.pow(age, 2) - 0.00789 * Math.pow(age, 3) - 0.00059 * Math.pow(age, 4) + 2.03526 * height + 0.02534 * Math.pow(height, 2) - 0.01884 * Math.pow(height, 3) + 0.00121 * Math.pow(height, 4);
          }
          else {
            ret = 60.50510 + 1.01301 * age + 0.01157 * Math.pow(age, 2) + 0.00424 * Math.pow(age, 3) - 0.00137 * Math.pow(age, 4) + 1.16641 * height + 0.12795 * Math.pow(height, 2) - 0.03869 * Math.pow(height, 3) - 0.00079 * Math.pow(height, 4);
          }
        }
        return ret;
      }
      this.getBPSDSNominator = function(isSystolic, sex) {
        var ret;
        if (sex == 1) {
          if (isSystolic) {
            ret = 10.7128;
          }
          else {
            ret = 11.6032;
          }
        }
        if (sex == 2) {
          if (isSystolic) {
            ret = 10.4855;
          }
          else {
            ret = 10.9573;
          }
        }
        return ret;
      },
      this.getStringDate = function(date) {

        if (typeof date === 'string') return date;
        if (date === undefined) return;
        if (date === null) return;
        if (!(date instanceof Date && !isNaN(date.valueOf()))) return;

        var yyyy = date.getFullYear().toString();
        var mm = (date.getMonth()+1).toString(); // getMonth() is zero-based
        var dd  = date.getDate().toString();

        return (yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]));
      };
      this.calcGFR = function(age, creatinine, sex, precision) {

        //var contactDate = new Date(contactDate.substring(0,4),contactDate.substring(5,7)-1,contactDate.substring(8,10));
			  //var birthDate = new Date(scope.subject.socialNumber.substring(0,4),scope.subject.socialNumber.substring(4,6)-1,scope.subject.socialNumber.substring(6,8));
			  //var age = Math.floor(scope.calculateAge(birthDate, contactDate));

        var femaleFactor = 0.742;
			  var gfr = 175*Math.pow((creatinine/88.4),-1.154)*Math.pow(age,-0.203)*(sex == 2 ? femaleFactor : 1);

			  return parseFloat(gfr.toFixed(precision));

			};
      this.calcIsoBMI = function(sex, age, bmi) {

        //only calculated for ages from 2 years
        if (age < 2) return null;

        var limits = {
          //property 1 = boys, property 2 = girls
          //first item in array => age = 2 years, second = 2,5 years etc.
          1: [[18.41,20.09],[18.13,19.8],[17.89,19.57],[17.69,19.39],[17.55,19.29],[17.47,19.26],[17.42,19.3],[17.45,19.47],[17.55,19.78],[17.71,20.23],[17.92,20.63],[18.16,21.09],[18.44,21.6],[18.76,22.17],[19.1,22.77],[19.46,23.39],[19.84,24],[20.2,24.57],[20.55,25.1],[20.89,25.58],[21.22,26.02],[21.56,26.43],[21.91,26.84],[22.27,27.25],[22.62,27.63],[22.96,27.98],[23.29,28.3],[23.6,28.6],[23.9,28.88],[24.19,29.14],[24.46,29.41],[24.73,29.7],[25,30]],
          2: [[18.02,19.81],[17.76,19.55],[17.56,19.36],[17.4,19.23],[17.28,19.15],[17.19,19.12],[17.15,19.17],[17.2,19.34],[17.34,19.65],[17.53,20.08],[17.75,20.51],[18.03,21.01],[18.35,21.57],[18.69,22.18],[19.07,22.81],[19.45,23.46],[19.86,24.11],[20.29,24.77],[20.74,25.42],[21.2,26.05],[21.68,26.67],[22.14,27.24],[22.58,27.76],[22.98,28.2],[23.34,28.57],[23.66,28.87],[23.94,29.11],[24.17,29.29],[24.37,29.43],[24.54,29.56],[24.7,29.69],[24.85,29.84],[25,30]],
        };

        var compareArray = limits[sex.toString()][age*2-4];

        if (bmi >= compareArray[1]) return 3; //Fetma
        if (bmi >= compareArray[0]) return 2; //Övervikt

        return 1; //Normalt

      }
      this.calcLDL = function(hdl, cholesterol, triglyceride, precision) {

          //Friedewalds formula
          var ldl = cholesterol - hdl - (0.45 * triglyceride);

          if (ldl>=0.5 && ldl<=10) return parseFloat(ldl.toFixed(precision));

          return null;

      }
      this.calcHypertension = function(sex, age, bpSystolic, bpDiastolic) {

        //skriven av Henrik Milefors, 2018-03-01
        //beräknas för åldrar mellan 1 och 17
        //skall returnera
        //3=hypertoni
        //2=förhöjt
        //1=normalt, både sysoliskt och diastoliskt måste finnas
        //annars null

        var limits = {
          femaleSyst: [[100,104],[101,105],[103,107],[104,108],[106,110],[108,111],[109,113],[111,115],[113,117],[115,119],[117,121],[119,123],[121,124],[122,126],[123,127],[124,130],[125,129]],
          maleSyst: [[100,103],[101,106],[105,109],[107,108],[108,112],[110,114],[111,115],[112,116],[114,118],[115,119],[117,121],[120,123],[122,126],[125,126],[127,131],[130,132],[132,136]],
          femaleDiast: [[54,58],[59,63],[63,67],[66,70],[68,72],[70,74],[71,75],[72,76],[73,77],[74,78],[75,79],[76,80],[77,81],[78,83],[79,83],[80,84],[80,84]],
          maleDiast: [[54,58],[57,61],[61,65],[65,69],[68,72],[70,74],[72,76],[73,78],[75,79],[75,80],[76,80],[76,80],[77,81],[78,83],[79,83],[80,84],[82,87]]
        };

        var getCompareArray = function(limits, sex, age, isSystolic) {

          if (sex == 1) {
            if (isSystolic) return limits.maleSyst[age-1];
            else return limits.maleDiast[age-1];
          } else {
            if (isSystolic) return limits.femaleSyst[age-1];
            else return limits.femaleDiast[age-1];
          }

        }

        var getHypertensionOneVal = function(arr, val) {

          if (!val) return null;
          if (val >= arr[1]) return 3; //hypertoni
          if (val >= arr[0]) return 2; //förhöjt
          if (val) return 1;

          return null;
        }

        var bpSystCat = getHypertensionOneVal(getCompareArray(limits, sex, age, true), bpSystolic);
        var bpDiastCat = getHypertensionOneVal(getCompareArray(limits, sex, age, false), bpDiastolic);

        if (bpSystCat || bpDiastCat) return Math.max(bpSystCat, bpDiastCat);

        return null;
      }
  }]);
