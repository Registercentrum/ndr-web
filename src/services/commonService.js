'use strict';

angular.module('ndrApp')
  .service('commonService', ['$filter','dataService',
  function ($filter,dataService) {


    this.getMetaFieldByKey = function(metafields, key) {

      for (var i = 0; i < metafields.length; i++) {
        if (metafields[i].columnName === key) {
          return metafields[i];
        }
      }

      return null;

    }

    this.getLatestModel = function(subject, metafields) {

      var ret = {};

      for (var i = 0; i < metafields.length; i++) {
        var contact = this.getLatestContactWithValue(subject, metafields[i]);
        if (!contact) {
          ret[metafields[i].columnName] = {value: null, date: null, label: ' - '}
        } else {
          var model =  this.getValueModel(contact, metafields[i]);
          ret[metafields[i].columnName] = model;
        }
      }

      return ret;
    }

    this.getValueModel = function(contact, metafield) {

      var label  = this.getMetafieldLabel(contact[metafield.columnName], metafield);
      return {value: contact[metafield.columnName], date: contact.contactDate, label: label}; //$filter0('number')(value)
    }

    this.getMetafieldLabel = function(value, metafield) {

      var ret = null;
      var key = metafield.columnName;

      if (typeof(value) === "undefined") return ' - '
      if (value === null) return ' - '

      // If it's a date, format it in a nice way
      if (metafield.domain.name === 'Date') {
        ret = $filter('date')(new Date(value), 'yyyy-MM-dd');
        // Get proper label for the id value
      } else if (metafield.domain.isEnumerated) {
        ret = _.find(metafield.domain.domainValues, {code: value}).text;
        // If it's a boolean, return proper translation (ja-nej)
      } else if (metafield.domain.name === 'Bool') {
        ret = value ? 'Ja' : 'Nej';
      } else {
        ret = value.toString().replace('.', ',') + (metafield.measureUnit != null ? ' ' + metafield.measureUnit : '');
      }

      return ret;
    }

    this.getLabelByKeyVal = function(metafields,key,val) {
      var m = this.getMetafieldByQuestionKey(metafields, key);
      var l = this.getMetafieldLabel(val, m);
      return l;
    }
    this.getDomainValue = function(metafield, code) {
      return _.find(metafield.domain.domainValues, {code: code})
    }

    this.getMetafieldByQuestionKey = function(metafields, key) {
      for (var i = 0; i < metafields.length; i++) {
        if (metafields[i].columnName == key){
          return metafields[i];
        }
      }
    }

    this.getMetafieldByQuestionText = function(metafields, text) {
      for (var i = 0; i < metafields.length; i++) {
        if (metafields[i].question.toLowerCase().indexOf(text) != -1){
          return metafields[i];
        }
      }
    }

    this.getLatestContactWithValue = function(subject, metafield) {
      return _.find(subject.contacts, function (c) {
        return !_.isNull(c[metafield.columnName]);
      });
    }

    this.getSeries = function(subject, keys, yearsBack) {
      var ret = {};
      for (var i = 0; i < keys.length; i++) {
        ret[keys[i]] = this.getOneSeries(subject,keys[i], yearsBack);
      }
      return ret;

    }

    this.getOneSeries = function(subject,key, yearsback) {

      var series = [];
      var contact = getLatestContactWithValue(subject,key);
      var from = contact ? moment(contact.contactDate) : null;

      _.each(subject.contacts, function (obj) {
        var then = moment(obj.contactDate);

        if (_.isNumber(obj[key]) && from.diff(then, 'years') <= yearsback) {
          series.push({
            x: new Date(obj.contactDate),
            y: obj[key]
          });
        }
      });

      return series.reverse();
    }

    this.excludeMetafields = function(metafields, excluded) {
      return metafields.filter(function(m) {
        return excluded.indexOf(m.columnName)  === -1;
      });
    }
    this.includeMetafields = function(metafields, included) {
      return metafields.filter(function(m) {
        return included.indexOf(m.columnName)  > -1;
      });
    }

    this.populateTableData = function(contacts, metafields, headerkey) {
      var table = {
        header: null,
        body: []
      };

      for (var i = 0; i < metafields.length; i++) {

        var f = {
          label: metafields[i].question,
          sequence: metafields[i].sequence,
          values: []
        };

        for (var j = 0; j < contacts.length; j++) {
          f.values.push(contacts[j] ? this.getMetafieldLabel(contacts[j][metafields[i].columnName], metafields[i]) : "-")
        }

        if(metafields[i].columnName == headerkey) {
          table.header = f;
        } else {
          table.body.push(f);
        }

      }

      return table;

    }
    this.dateWithinYears = function(d, years) {
        if (!d) return false;
        var diff = moment().diff(moment(d), 'years');
        return diff >= years ? true : false;
    };
    this.dateWithinMonths = function(d, months) {
      if (!d) return false;
      var diff = moment().diff(moment(d), 'months');
      return diff >= months ? true : false;
    };
    this.currentAge = function(subject) {
      return moment().diff(subject.dateOfBirth, 'years');
    }
    this.getPersonInfoLocal = function(subject) {
      return dataService.getSubjectInfo(subject.snr);
    }
    this.getName = function(personInfo) {
      return (personInfo.firstName ? personInfo.firstName : '')  + ' ' + (personInfo.lastName ? personInfo.lastName : '');
    }

  }]);
