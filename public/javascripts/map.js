var myOSM;
myOSM = L.tileLayer('http://ajax.pirates.42monkeys.co.uk/osm_tiles/{z}/{x}/{y}.png', 
{
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});
var planningScanGeology;
planningScanGeology = L.tileLayer.wms('http://localjost:8080/geoserver/wms', 
{
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
	layers: 'herefordshire_geology',
	format: 'image/png',
	transparent: false	
});
var baseMaps = {"myOSM": myOSM, "Herefordshire Planning - Geology": planningScanGeology};

//$('.map').css('height', ($(window).height() - $('html').height()) + 'px');

var map = L.map('map', 
{
    center: [52.056, -2.71],
    zoom: 10,
    layers: [myOSM],
});

var layerControl = L.control;
layerControl.layers(baseMaps).addTo(map);

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>Herefordshire Domestic <br />Electricty Consumption 2013</h4>' +  (props ? 
        '<b>LSOA ' + props.lsoa_code + '</b><br />' +
        'Total consumption (kWh): ' + props.total_domestic_electricity_cons + '<br />' +
        'Total number of meters: ' + props.total_number_of_domestic_electr + '<br />' +
        'Mean consumption (kWh per meter): ' + props.mean_domestic_electricity_consu + '<br />'+
        'Median consumption (kWh per meter): ' + props.median_domestic_electricity_con + '<br />' + 
        '<b>Difference from county mean of <em>4539</em> by: ' + (props.mean_domestic_electricity_consu - 4539) + 'kWh</b>'
        : 'Hover over a statisical geography (LSOA)');
};

info.addTo(map);

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [-1500, -1000, -500, 0, 500, 1000, 1500, 2000],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? ' to ' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);

function getColor(d) {
    return d > 1500  ? '#800026' :
           d > 1000  ? '#BD0026' :
           d > 500   ? '#E31A1C' :
           d > 0     ? '#FC4E2A' :
           d > -500  ? '#FD8D3C' :
           d > -1000 ? '#FEB24C' :
           d > -1500 ? '#FED976' :
                      '#FFEDA0';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.mean_domestic_electricity_consu - 4539 ),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

var geojson = L.geoJson(lsoaElectricity2013Geojson, {
    onEachFeature: onEachFeature,
    style: style
}).addTo(map);