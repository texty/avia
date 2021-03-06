// ---------- Map ---------------------------------
d3.json('country_treaties.geojson', function (error, geojson) {
    if (error) {  throw error;  }

    var map = L.map('map', {
        center: [50, 30],
        zoom: 3,
        scrollWheelZoom: false,
        maxBounds: [[-89, -179], [89, 179]]
    });


    map.createPane('labels');
    map.getPane('labels').style.zIndex = 450;
    map.getPane('labels').style.pointerEvents = 'none';

    var CartoDB_PositronNoLabels = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        subdomains: 'abcd',
        maxZoom: 8
    });

    var CartoDB_PositronOnlyLabels = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_only_labels/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        subdomains: 'abcd',
        pane: 'labels',
        maxZoom: 8
    });

    function styleFunc(feature) {
        var ifproject = 0;
        if ( feature.properties.encountry !== 'UKR' && feature.properties.encountry !== 'RUS' && feature.properties.treaty_stage !== 'проект' ) {
            ifproject = feature.properties.is_open === '1' ? 0.25 : 0.07;
            }

        return {
            fillOpacity: ifproject,
            color: '#00a5ff',
            weight: 0.4
        };
    }


    function moveToCountry() {
        if (this.feature.properties.encountry !== 'RUS') {
            // click to expand country card
            // $('body').scrollTo($('nav#table-header'), {
            //     duration: 440
            // });
            $('div#' + this.feature.properties.encountry)
                .find('.uncollapse-card a i')
                .click();

            $('.typeahead').typeahead('val', '');
        }
    }

    function onEachFeature(feature, layer) {
        layer.on({  click: moveToCountry  });
    }

    var jsonForeignLayer = L.geoJSON(geojson, {
        filter: function (feature) {  return feature.properties.encountry != 'UKR';  },
        style: styleFunc,
        onEachFeature: onEachFeature
    });

    jsonForeignLayer.bindTooltip(
        function (e) {
            return e.feature.properties.treaty_date == ''
                ? '<p class="tooltip-country"><strong>' + e.feature.properties.uacountry + '</strong><br/>' +
                'Угода: ' + e.feature.properties.treaty_stage + '</p>'
                : '<p class="tooltip-country"><strong>' + e.feature.properties.uacountry + '</strong><br/>' +
                'Угода: ' + e.feature.properties.treaty_stage + '<br/>' +
                'від ' + e.feature.properties.treaty_date + '</p>'
        },
        {
            sticky: true,
            className: 'map-tooltip tooltip-inner'
        }
    );

    var jsonUaLayer = L.geoJSON(geojson, {
        filter: function (feature) {  return feature.properties.encountry == 'Ukraine';  },
        style: styleFunc
    });

    jsonForeignLayer.addTo(map);
    jsonUaLayer.addTo(map);
    CartoDB_PositronOnlyLabels.addTo(map);
    CartoDB_PositronNoLabels.addTo(map);

});
var updateInfoUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSUfAt4ZxkF1mYvEOEvQ-2tPoewRUjwkXiLNBuQDa-VgfhacBNnewj_1mBxgqyKb4oKPb6vB8E-RooI/pub?gid=1663421102&single=true&output=tsv';
d3.tsv(updateInfoUrl, function (error, info) {
    if (error) {  throw error;  }
    info = info[0];
    d3.select('#update-info')
        .html(
            '<p class="mb-1 ml-1">Дані оновлено ' + info.data_update + '<br/>' +
            'Маємо розклади ' + info.schedules_ac + '<br/>' + ' від ' + info.schedules_update + '</p>' +
            '<p class="ml-1 mb-0">Рейси за код-шерінгом, а також чартерні, не враховуються.</p>'
        );
});
