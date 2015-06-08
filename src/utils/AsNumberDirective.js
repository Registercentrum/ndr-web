'use strict';

angular.module('ndrApp')
    .directive('replaceComma', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.on('keydown', function (e) {
                    if(e.keyCode === 188) {
                        this.value += '.';
                        e.preventDefault();
                    }
                });
            }
        };
    })
    .directive('asNumber', ['$locale', function ($locale) {
        return {
            restrict: 'A',
            require: '?ngModel',
            compile: function (tElement) {
                if (tElement[0].nodeName !== 'INPUT') throw('Error. asNumber directive must be used inside an <input> element.');

                tElement.attr('pattern', '[0-9]*');

                return function (scope, element, attrs, ngModelCtrl) {
                    if (!ngModelCtrl) return;

                    var step, newValue;
                    var maxAttr  = (attrs.hasOwnProperty('max') && attrs.max !== '') ? parseInt(attrs.max, 10) : false,
                        minAttr  = (attrs.hasOwnProperty('min') && attrs.min !== '') ? parseInt(attrs.min, 10) : false,
                        stepAttr = (attrs.hasOwnProperty('step') && attrs.step !== '') ? parseInt(attrs.step, 10) : 1;

                    element.on('keydown', function (event) {
                        // Arrow key incrementation:
                        if (event.keyCode === 38 || event.keyCode === 40) {
                            event.preventDefault();
                            step = (event.shiftKey) ? (stepAttr * 10) : stepAttr;

                            // Arrow down
                            if (event.keyCode === 40) step *= -1;

                            newValue = (isNaN(ngModelCtrl.$modelValue)) ? step : ngModelCtrl.$modelValue + step;

                            if (maxAttr !== false && newValue > maxAttr) {
                                newValue = maxAttr;
                            } else if (minAttr !== false && newValue < minAttr) {
                                newValue = minAttr;
                            }

                            newValue = String(newValue);
                            newValue = ($locale.NUMBER_FORMATS.DECIMAL_SEP === ',') ? newValue.replace(/\.(\d*)$/, ',$1') : newValue.replace(/,(\d*)$/, '.$1');

                            ngModelCtrl.$setViewValue(newValue);
                            ngModelCtrl.$render();
                            element.select();
                        }
                    });

                    ngModelCtrl.$parsers.unshift(function (value) {
                        var out;

                        if (typeof value !== 'string' || value === '') return null;

                        value = value.replace(/,(\d*)$/, '.$1');
                        out = parseFloat(value);

                        if (isNaN(out)) return undefined;
                        return out;
                    });

                    ngModelCtrl.$formatters.unshift(function (value) {
                        if (typeof value !== 'string') return value;
                        if (isNaN(parseFloat(value))) return '';
                        if ($locale.NUMBER_FORMATS.DECIMAL_SEP === ',') return value.replace(/\.(\d*)$/, ',$1');

                        return value.replace(/,(\d*)$/, '.$1');
                    });

                    ngModelCtrl.$validators.number = function (modelValue) {
                        if (modelValue === undefined || modelValue === null || modelValue === '') return true;
                        if (isNaN(modelValue)) return false;
                        return true;
                    };

                    ngModelCtrl.$validators.range = function(modelValue) {
                        if ((maxAttr && modelValue > maxAttr) || (minAttr && modelValue < minAttr)) return false;
                        return true;
                    };
                };
            }
        };
    }
]);