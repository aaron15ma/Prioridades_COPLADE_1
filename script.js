// Crear el mapa
var map = L.map('map').setView([31.8908, -115.9240], 9);

// Definir los basemaps
var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var googleSatelliteLayer = L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}', {
    attribution: '&copy; <a href="https://www.google.com/intl/en_ALL/help/terms_maps.html">Google Maps</a>'
});

// Variable para almacenar la capa GeoJSON
var geojsonLayer = null;

// Cargar el GeoJSON y crear la capa
function cargarGeoJSON() {
    fetch('2PRIORIDADES MAPA 1.geojson')
        .then(response => response.json())
        .then(data => {
            geojsonLayer = L.geoJSON(data, {
                style: function (feature) {
                    var prioridad = feature.properties.Prioridad;
                    switch (prioridad) {
                        case 'Prioridad A':
                            return {
                                fillColor: '#7030a0',
                                fillOpacity: 0.6,
                                color: '#7030a0',
                                weight: 2,
                                opacity: 1
                            };
                        case 'Prioridad B':
                            return {
                                fillColor: '#e87296',
                                fillOpacity: 0.6,
                                color: '#e87296',
                                weight: 2,
                                opacity: 1
                            };
                        case 'Prioridad C':
                            return {
                                fillColor: '#800000',
                                fillOpacity: 0.6,
                                color: '#800000',
                                weight: 2,
                                opacity: 1
                            };
                        default:
                            return {};
                    }
                },
                onEachFeature: function (feature, layer) {
                    var localidad = feature.properties.LOCALIDAD || '';
                    var colonia = feature.properties.COLONIA || '';
                    var displayLocalidad = localidad.trim() !== '' ? localidad : colonia;

                    layer.bindPopup(
                        'Prioridad: ' + feature.properties.Prioridad +
                        '<br>Municipio: ' + feature.properties.MUNICIPIO +
                        '<br>Localidad/Colonia: ' + displayLocalidad
                    );
                }
            });

            geojsonLayer.addTo(map);

            document.querySelectorAll('.filter, .filter-municipio').forEach(function (checkbox) {
                checkbox.addEventListener('change', filterLayers);
            });

            ajustarZoom();

            var baseLayers = {
                "OpenStreetMap": osmLayer,
                "Google Satellite": googleSatelliteLayer
            };

            L.control.layers(baseLayers).addTo(map);

            // Añadir el control de búsqueda
            L.Control.geocoder().addTo(map);
        })
        .catch(err => console.error(err));
}

function filterLayers() {
    var selectedPrioridades = obtenerFiltrosSeleccionados('.filter');
    var selectedMunicipios = obtenerFiltrosSeleccionados('.filter-municipio');

    geojsonLayer.eachLayer(function (layer) {
        var prioridad = layer.feature.properties.Prioridad;
        var municipio = layer.feature.properties.MUNICIPIO;

        var mostrarLayer = (
            selectedPrioridades.includes(prioridad) || selectedPrioridades.length === 0
        ) && (
            selectedMunicipios.includes(municipio) || selectedMunicipios.length === 0
        );

        if (mostrarLayer) {
            if (!map.hasLayer(layer)) {
                map.addLayer(layer);
            }
            layer.setStyle({
                fillColor: getColor(prioridad),
                fillOpacity: 0.6,
                color: getColor(prioridad),
                weight: 2,
                opacity: 1
            });
        } else {
            if (map.hasLayer(layer)) {
                map.removeLayer(layer);
            }
        }
    });

    ajustarZoom();
}

function obtenerFiltrosSeleccionados(selector) {
    return Array.from(document.querySelectorAll(selector + ':checked')).map(el => el.value);
}

function ajustarZoom() {
    var bounds = L.latLngBounds();
    geojsonLayer.eachLayer(function (layer) {
        if (map.hasLayer(layer)) {
            bounds.extend(layer.getBounds());
        }
    });

    if (bounds.isValid()) {
        map.fitBounds(bounds);
    }
}

cargarGeoJSON();

function getColor(prioridad) {
    switch (prioridad) {
        case 'Prioridad A':
            return '#7030a0';
        case 'Prioridad B':
            return '#e87296';
        case 'Prioridad C':
            return '#800000';
        default:
            return '#ccc';
    }
}

document.getElementById('remove-filters').addEventListener('click', function() {
    document.querySelectorAll('.filter, .filter-municipio').forEach(function(checkbox) {
        checkbox.checked = false;
    });

    filterLayers();
});
