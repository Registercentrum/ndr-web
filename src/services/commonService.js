'use strict';

angular.module('ndrApp')
  .service('commonService', ['$filter',
  function ($filter) {


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
        var contact = this.getLatestContactWithValue(subject, metafields[i])
        var model =  contact ? this.getValueModel(contact, metafields[i]) : ({value: null, date: null, label: 'saknas'})
        ret[metafields[i].columnName] = model;
      }

      return ret;
    }

    this.getValueModel = function(contact, metafield) {
      var label  = this.getContactAttributeLabel(contact, metafield)
 
      return {value: contact[metafield.columnName], date: contact.contactDate, label: label}; //$filter0('number')(value)
    }

    this.getContactAttributeLabel = function(contact, metafield) {

      var ret = null;
      var key = metafield.columnName;

      if (!contact) return ' - ';
      if (typeof(contact[key]) === "undefined") return ' - '
      if (contact[key] === null) return ' - '

      // If it's a date, format it in a nice way
      if (metafield.domain.name === 'Date') {
        ret = $filter('date')(new Date(contact[key]), 'yyyy-MM-dd');
        // Get proper label for the id value
      } else if (metafield.domain.isEnumerated) {
        ret = _.find(metafield.domain.domainValues, {code: contact[key]}).text;
        // If it's a boolean, return proper translation (ja-nej)
      } else if (metafield.domain.name === 'Bool') {
        ret = contact[key] ? 'Ja' : 'Nej';
      } else {
        ret = contact[key].toString().replace('.', ',') + (metafield.measureUnit != null ? ' ' + metafield.measureUnit : '');
        //value = $filter('number')(contact[key]) + (metafield.measureUnit != null ? ' ' + metafield.measureUnit : '');
      }

      return ret;
    }

    this.getDomainValue = function(metafield, code) {
      return _.find(metafield.domain.domainValues, {code: code})
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
      var series = [],
        now = moment();

      _.each(subject.contacts, function (obj) {
        var then = moment(obj.contactDate);

        if (_.isNumber(obj[key]) && now.diff(then, 'years') <= yearsback) {
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
          f.values.push(contacts[j] ? this.getContactAttributeLabel(contacts[j], metafields[i]) : "-")
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
    this.currentAge = function(subject) {
      return moment().diff(subject.dateOfBirth, 'years');
    }


  }]);
