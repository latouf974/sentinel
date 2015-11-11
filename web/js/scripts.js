$(function () {
    var iterate = {};
    var seriesOptions = [];

    // create the chart when all data is loaded
    createChart = function () {
        $.getScript( "js/dark-unica-sentinel.js").done(function() {
            Highcharts.setOptions({
                global: {
                    useUTC: false
                }
            });

            $('#container').highcharts('StockChart', {
                chart : {
                    type: 'spline',
                    events: {
                        load: function () {
                            var data = {};
                            var series = this.series;

                            setInterval(function () {
                                $.getJSON("data/data.json", function(data_load) {
                                    _.each(data_load.config, function(serie, website){
                                        _.each(_.slice(serie, iterate[website]), function(val, key){
                                            var x = moment(val.date, 'X').toDate().getTime();
                                            var y = val.total_time;
                                            _.find(series, {'name': website}).addPoint([x, y],true,true);
                                            iterate[website]++;
                                        });
                                    });

                                    // Add Alarm
                                    if(data_load.status == 'false' || data_load.average >= 5) {
                                        $('#alarm')
                                            .removeClass('good')
                                            .addClass('bad')
                                            .html('<audio autoplay><source src="sound/alarm.mp3"></audio>');
                                    } else {
                                        $('#alarm')
                                            .removeClass('bad')
                                            .addClass('good')
                                            .empty();
                                    }
                                });
                            }, 30000);
                        }
                    }
                },

                yAxis: {
                    labels: {
                        formatter: function () {
                            return this.value + 's';
                        }
                    },
                    plotLines: [{
                        value: 0,
                        width: 2,
                        color: 'silver'
                    }]
                },

                tooltip: {
                    pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y} sec</b><br/>',
                    valueDecimals: 2
                },

                rangeSelector: {
                    buttons: [{
                        count: 1,
                        type: 'hour',
                        text: '1H'
                    }, {
                        count: 3,
                        type: 'hour',
                        text: '3H'
                    }, {
                        count: 24,
                        type: 'hour',
                        text: '24H'
                    }, {
                        type: 'all',
                        text: 'All'
                    }],
                    inputEnabled: false,
                    selected: 0
                },

                legend: {
                    enabled: true
                },

                series: seriesOptions
            });
        });
    };

    // Init call
    $.getJSON("data/data.json", function(data_load) {
        _.each(data_load.config, function(serie, website){
            seriesOptions.push({
                name: website,
                data: (function() {
                    var data = [];
                    _.each(serie, function(val, key){
                        data.push({
                            x: moment(val.date, 'X').toDate().getTime(),
                            y: val.total_time,
                        });
                    });
                    iterate[website] = data.length;
                    return data;
                })(),
                turboThreshold: 0
            });
        });

        createChart();
    });
});
