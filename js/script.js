const gwyneddCommunities = {
  'Aberdaron': 'Aberdaron',
  'Bala': 'Bala',
  'Beddgelert': 'Beddgelert',
  'Bethesda': 'Bethesda',
  'BlaenauFfestiniog': 'Blaenau Ffestiniog',
  'LlanFfestiniog': 'Llan Ffestiniog',
  'Penygroes': 'Penygroes',
  'Porthmadog': 'Porthmadog',
  'Pwllheli': 'Pwllheli'
};

const powysCommunities = {
  'Llanidloes': 'Llanidloes'
};

const ynysMonCommunities = {
  'Llangefni': 'Llangefni'
};

const leafletMap = L.map('map').setView([55, -2], 5);
const legend = L.control({position: 'bottomright'});
const postcodeAreaVisitorCounts = new Map();
var postcodeAreasMaxVisitorCount = 0;

window.addEventListener('load', function() {
  initMap();
})

function initMap() {
  L.tileLayer('', {
    minZoom: 5,
    maxZoom: 10,
    zoomOffset: -1
  }).addTo(leafletMap);

  L.geoJson(postcodeAreaData, {style: getStyle}).addTo(leafletMap);
}

function getColorByPostcodeAreaCode(postcodeAreaCode) {
  return getColorByVisitorCount(postcodeAreaVisitorCounts.get(postcodeAreaCode));
}

function getColorByVisitorCount(visitorCount) {
  var quotient = visitorCount / postcodeAreasMaxVisitorCount;
  return quotient > 0.75 ? '#006d2c':
         quotient > 0.5  ? '#31a354':
         quotient > 0.25 ? '#74c476':
         quotient > 0    ? '#bae4b3':
                           '#edf8e9';
}

function getStyle(feature) {
  return {
      fillColor: getColorByPostcodeAreaCode(feature.properties.pc_area),
      weight: 0.5,
      opacity: 1,
      color: 'white',
      fillOpacity: 1
  };
}

function setCounty(county) {
  reset();
  var communitySelect = document.getElementById('community');
  communitySelect.value = 0;
  communitySelect.options.length = 1;
  var communities;
  switch (county) {
    case 'Gwynedd':
      communities = gwyneddCommunities;
      break;
    case 'Powys':
      communities = powysCommunities;
      break;
    case 'YnysMon':
      communities = ynysMonCommunities;
  }
  for(index in communities) {
    communitySelect.options[communitySelect.options.length] = new Option(communities[index], index);
  }
}

function setCommunity(community) {
  reset();
  if (community) {
    axios.get('https://porth.patrwm.io/v1/api/visitor-profiles', {
      params: {
        community: community,
        from: '01-06-2021',
        to: '01-12-2021'
      }
    })
    .then(function (response) {
      console.log(response);
      document.getElementById('json').textContent = JSON.stringify(response.data.data.postcodeAreaTotals, undefined, 2);
      updateVisitorCounts(response.data.data.postcodeAreaTotals);
      updateMap();
    })
    .catch(function (error) {
      console.log(error);
    })
  }
}

function reset() {
  document.getElementById('json').textContent = '';
  postcodeAreaVisitorCounts.clear();
  postcodeAreasMaxVisitorCount = 0;
  updateMap();
}

function updateVisitorCounts(postcodeAreaTotals) {
  for (var code in postcodeAreaTotals) {
    var count = postcodeAreaTotals[code];
    postcodeAreaVisitorCounts.set(code, postcodeAreaTotals[code]);
    if (count > postcodeAreasMaxVisitorCount) {
      postcodeAreasMaxVisitorCount = count;
    }
  }
}

function updateMap() {
  leafletMap.eachLayer(function (layer) {
    if (layer.feature) {
      layer.setStyle(getStyle(layer.feature));
    }
  })

  leafletMap.removeControl(legend);
  if (postcodeAreasMaxVisitorCount > 0) {
    legend.onAdd = function () {
      var div = L.DomUtil.create('div', 'info legend');
      var grades = [0, Math.floor(0.25 * postcodeAreasMaxVisitorCount), Math.floor(0.5 * postcodeAreasMaxVisitorCount), Math.floor(0.75 * postcodeAreasMaxVisitorCount), postcodeAreasMaxVisitorCount];
      for (var i = 0; i < grades.length; i++) {
        div.innerHTML += '<i style="background:' + getColorByVisitorCount(grades[i]) + '"></i>' + (grades[i] > 0 ? ' Up to ' : ' ') + grades[i] + '<br>';
      }
      return div;
    };  
    legend.addTo(leafletMap);
  }
}
