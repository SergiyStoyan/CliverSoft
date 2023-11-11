

/**
 * Elance logger API
 *
 * Installation
 *
 * 1. Add this script to your page.
 * 2. Add <script>t0 = +new Date;</script> in the head of the page. (don't need this for latest browsers).
 * 3. elogger('appName', 'hostname', 'loggerServer', [options]) to initialize logger script
 *
 *
 */

;(function(window, document, eloggerNamespace) {
    //console.log('elogger.js');
    var extend = function (target, source) {
            target = target || {};
            var temp;
            for (var prop in source) {
                temp = source[prop];
                if (temp && Object.prototype.toString.call(temp) == '[object Array]') {
                    target[prop] = temp.slice(0);
                }
                else if (temp && typeof temp === 'object') {
                    target[prop] = extend(target[prop], temp);
                } else {
                    target[prop] = temp;
                }
            }
            return target;
        },
        setObjectValue = function(obj, name, options1, options2) {
            if (options1 && options1[name]) {
                obj[name] = options1[name];
            }
            else if (options2 && options2[name]) {
                obj[name] = options2[name];
            }
        },
        addListener = function() {
            if(window.addEventListener) {
                return function(obj, eventName, listener) {
                    obj.addEventListener(eventName, listener, false);
                };
            }
            else {
                return function(obj, eventName, listener) {
                    obj.attachEvent("on" + eventName, listener);
                };
            }
        }(),

        logData = function(options, postObject, callback) {
            var postData;

            try {
                postData = JSON.stringify(postObject);
            }
            catch(e) {
                //console.log('[elogger] JSON.stringify is missing');
            }

            if (!postData) {
                options.callback('false');
                return;
            }

            var image = new Image();
            image.onerror = function() {
                if (callback) callback();
                options.callback('true', postObject);
            };

            image.src = options.loggerServer + encodeURIComponent(postData);

            window.setTimeout(function(){ image = null}, 1E4);
        },
        emptyFunction = function(){
            //console.log('[elogger]: Set to dummy function. [below sample rate|disabled]');
        },
        jQueryAjaxTimingInitilized = false,
        onloadTimingInitilized = false;


    var logJQueryAjaxTiming = function($el) {
        if (!window.Zepto && !window.jQuery) {
            return;
        }

        var $d = $(document);

        var onComplete = function(options) {
            var originalComplete = options.complete,
                url = options.url,
                startTime = +new Date;

            return function(xhr, status) {
                //console.log('Took %s ms to %s for url %s ' , +new Date - startTime, status, url);
                originalComplete.apply(originalComplete, arguments);
                ////console.log('onComplete', xhr, status);
                var parser = document.createElement('a');
                parser.href = url;
                $el('send', 'time', parser.pathname, location.pathname, +new Date - startTime, {
                    metricTags: {
                        status: status,
                        objectType: 'ajax'
                    }
                });
            }
        };

        $d.on('ajaxBeforeSend', function(e, xhr, options){
            // This gets fired for every Ajax request performed on the page.
            // The xhr object and $.ajax() options are available for editing.
            // Return false to cancel this request.
            options.complete = onComplete(options);
            ////console.log('ajaxBeforeSend', e, xhr, options);
        });

        $d.on('ajaxError', function (xhr, options, error) {
            ////console.log('ajaxError', xhr, options, error);
        });
    };

    var logOnloadTiming = function($el) {
        var DOMContentLoadedTime,
            navigationTiming = window.performance && window.performance.timing,
            logUsingNavigationTiming = function() {
                var timing = window.performance.timing,
                    dnsTime = timing.domainLookupEnd - timing.domainLookupStart,
                    connectionTime = timing.connectEnd - timing.connectStart,
                    serverTime = timing.responseEnd - timing.requestStart,
                    fetchTime = timing.responseEnd - timing.fetchStart,
                    domContentLoadedTime = timing.domComplete - timing.domLoading,
                    onLoadTime = timing.loadEventEnd - timing.responseStart,
                    networkTime= timing.connectEnd - timing.navigationStart,
                    pageLoadTime= timing.loadEventEnd - timing.navigationStart;


                $el('send', 'time', null, location.pathname, pageLoadTime, {
                    subTimeMetrics: [
                        $el('set', 'time', 'onLoad', null, onLoadTime),
                        $el('set', 'time', 'DOMContentLoaded',null, domContentLoadedTime)
                    ],
                    metricTags: {
                        objectType: 'page'
                    }
                });
            };

        addListener(window, "load", function(event) {
            var location = window.location;
            if (!navigationTiming) {
                t0 && $el('send', 'time', null, location.pathname, '-1', {
                    subTimeMetrics: [
                        $el('set', 'time', 'onLoad', null, +new Date - t0),
                        $el('set', 'time', 'DOMContentLoaded', null, DOMContentLoadedTime)
                    ],
                    metricTags: {
                        objectType: 'page'
                    }
                });
            }
            else {
                window.setTimeout(logUsingNavigationTiming, 1);
            }
        });

        if (navigationTiming && navigationTiming.loadEventEnd > 0) {
            logUsingNavigationTiming();
        }

        addListener(document, "DOMContentLoaded", function(event) {
            t0 && (DOMContentLoadedTime = +new Date - t0);
        });

    };

    /*
     {
     "type": "userAction",
     "metricName": "user.action",
     "timestampMillis": 1374877028490,
     "metricValue": 1,
     "metricTags": {
     "CustomTagN": "CustomTagVN"
     },
     "objectName": "jobs.recommended",
     "userId": "1380381",
     "experimentIds": [
     "ASD-12344",
     "ASP-23342"
     ],
     "actionType": "CLICK",
     "impressionId": "I345",
     "bucketId": null
     }
     */

    /**
     * enable default true. Enable/disable logging data to metrics server
     * appVersion default 1. (NOT USED). Version of the app/website.
     * sampleRate default 100%. Specifies what percentage of users should be tracked.
     * namespace default is $el. Global method that you will call with data. If this variable is already used in your page, you can overwrite to a different global variable.
     *
     *
     * time - Timing related options
     *     onloadTiming default true. Log on load timing for the page.
     *     jQueryAjaxTiming default false. If you are using jQuery/Zepto, it will log request timing for all ajax request. (response end time - request start time).
     *
     *
     * userAction - user action related global values.
     *     impressionId String
     *     bucketId String
     *     experimentIds Array
     *          impressionId,  bucketId and experimentIds will be logged with all userAction request if provided here
     *
     *
     * callback function. This will be called after request is made to the metrics server with two parameters
     *     success: boolean If request was a success or failure (DO NOT USE THIS!)
     *     postData: object that was posted to metrics server
     */

    var defaultOptions = {
        'sampleRate': 100,
        'namespace': '$el',
        'appVersion': 1,
        'enable': true,
        'callback': function(success, postData) {
            //console.log('[elogger] Logged data successfully? ------- %s', success, postData);
        },
        'time': {
            'onloadTiming': true,
            'jQueryAjaxTiming': false
        }
    };


    var elogger = function(options) {

        var time = function(action, type, timingObjectName, timingPageName, timingValue, timingOptions) {

            //timingType = timingType.toUpperCase();

            var argumentsLength = arguments.length,
                timingObject = {
                    type: "browserTime",
                    elapsedTimeMillis : timingValue,
                    host: options.hostname
                };
            if(timingObjectName) {
                timingObject.objectName = timingObjectName;
            }
            if(timingPageName) {
                timingObject.pageName = timingPageName;
            }

            setObjectValue(timingObject, 'subTimeMetrics', timingOptions);
            setObjectValue(timingObject, 'metricTags', timingOptions);

            return timingObject;
        };

        var useraction = function(action, type, actionType, objectName, userActionOptions) {

            actionType = actionType.toUpperCase();
            userActionOptions = userActionOptions || {};

            var userActionObject = {
                    "type": "userAction",
                    "objectName": objectName,
                    "actionType": actionType,
                    "userId": userActionOptions.userId || options.userId || '1111111'
                },
                defaultUserActionOptions = options.userAction;

            setObjectValue(userActionObject, 'pageName', userActionOptions, defaultUserActionOptions);
            setObjectValue(userActionObject, 'metricName', userActionOptions, defaultUserActionOptions);
            setObjectValue(userActionObject, 'metricValue', userActionOptions, defaultUserActionOptions);
            setObjectValue(userActionObject, 'metricTags', userActionOptions, defaultUserActionOptions);
            setObjectValue(userActionObject, 'experimentIds', userActionOptions, defaultUserActionOptions);
            setObjectValue(userActionObject, 'impressionId', userActionOptions, defaultUserActionOptions);
            setObjectValue(userActionObject, 'bucketId', userActionOptions, defaultUserActionOptions);
            setObjectValue(userActionObject, 'logEntries', userActionOptions, defaultUserActionOptions);
            setObjectValue(userActionObject, 'channelId', userActionOptions, options);

            return userActionObject;
        };

        var _cookieManager = function($el) {
            this.$el = $el;
            var oldMetricBag = JSON.parse(getCookie('metric_bag'));
            var metricBag = {};

            var uniqueId = function() {
                return '_' + Math.random().toString(36).substr(2, 9);
            };
            var updateCookie = function() {
                setCookie('metric_bag', JSON.stringify(metricBag), 1, '/', '.elance.com');
            };

            // sending the remaining metrics
            for (var i in oldMetricBag) {
                var elements = [];
                for (var j in oldMetricBag[i]) {
                    elements.push(oldMetricBag[i][j]);
                }
                this.$el.apply(this.$el, elements);
            }

            updateCookie();

            // cookie metric encoding: { uniqueId: ['send', 'useraction', 'click' , 'jobInfoPanelTags', { userId: ..., metricTags .... }], uniqueId2 : [ ... ] }
            // accepts arguments that would have been passed to $el
            this.add = function(arr) {
                var id = uniqueId();
                metricBag[id] = arr;
                updateCookie();
                return id;
            }

            this.remove = function(id) {
                delete metricBag[id];
                updateCookie();
            }
        };

        var all = function(action, type){
            var obj, callback;

            type = type.toLowerCase();
            if (type=='time') {
                obj = time.apply(this, arguments);
            }
            else if (type == 'useraction') {
                if (cookieManager) {
                    var id = cookieManager.add(arguments);
                    callback = function(){
                        cookieManager.remove(id);
                    }
                }
                obj = useraction.apply(this, arguments);
            }
            else if (typeof type === 'object') {
                obj = type;
            }


            if (action == "set") {
                return obj;
            }
            else if (action == "send") {
                if (options.enable) {
                    logData(options, obj, callback);
                }
            }
        };

        var cookieManager = new _cookieManager(all);

        return all;
    };

    var initLogger = function(options) {
        var $el = elogger(options);
        window[options.namespace] = $el;

        if (!onloadTimingInitilized && options.time.onloadTiming) {
            logOnloadTiming($el);
            onloadTimingInitilized = true;
        }
        if (!jQueryAjaxTimingInitilized && options.time.jQueryAjaxTiming) {
            logJQueryAjaxTiming($el);
            jQueryAjaxTimingInitilized = true;
        }
    };

    var prepareLogger = function(appName, hostname, loggerServer, userOptions) {
        if (!loggerServer) {
            //console.warn('[elogger]: Please provide loggerServer url');
            return;
        }

        var options = extend({appName: appName, loggerServer: loggerServer, hostname: hostname}, defaultOptions);
        options = extend(options, userOptions || {});

        if (options.enable === false || Math.random() * 100 > options.sampleRate) {
            //console.log('[elogger]: Below sampleRate %s or disabled by config', options.sampleRate);
            window[options.namespace] = emptyFunction;
            return;
        }

        initLogger(options);
    };

    window[eloggerNamespace] = prepareLogger;

    if (window.__elogger__) {
        prepareLogger.apply(prepareLogger, window.__elogger__);
        try{
            delete window.__elogger__;
        }catch(e){}
    }

}(window, document, window.eloggerNamespace || 'elogger'));
