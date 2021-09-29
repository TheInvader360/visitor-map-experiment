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

const postcodeAreaVisitorCounts = new Map();
var postcodeAreasMaxVisitorCount = 0;

const map = L.map('map').setView([55, -2], 5);
const geojson = L.geoJson(postcodeAreaData, {style: getStyle, onEachFeature: onEachFeature});
const info = L.control({position: 'topright'});
const legend = L.control({position: 'bottomright'});

window.addEventListener('load', function() {
  initMap();
})

function initMap() {
  L.tileLayer('', {
    minZoom: 5,
    maxZoom: 10,
    zoomOffset: -1
  }).addTo(map);

  geojson.addTo(map);

  info.onAdd = function () {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  };
  info.update = function (props) {
    var message = 'Hover over a postcode area';
    if (props) {
      var count = postcodeAreaVisitorCounts.get(props.pc_area);
      switch (count) {
        case undefined:
          message = `<b>0</b> visitors from the <b>${props.pc_area}</b> area`;
          break;
        case 1:
          message = `<b>1</b> visitor from the <b>${props.pc_area}</b> area`;
          break;
        default:
          message = `<b>${count}</b> visitors from the <b>${props.pc_area}</b> area`;
      }
    }
    if (this._div) {
      this._div.innerHTML = '<h6>Visitor Home Locations</h6>' + message;
    }
  };

  legend.onAdd = function () {
    var div = L.DomUtil.create('div', 'info legend');
    var grades = [0, Math.floor(0.25 * postcodeAreasMaxVisitorCount), Math.floor(0.5 * postcodeAreasMaxVisitorCount), Math.floor(0.75 * postcodeAreasMaxVisitorCount), postcodeAreasMaxVisitorCount];
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += '<i style="background:' + getColorByVisitorCount(grades[i]) + '"></i>' + (grades[i] > 0 ? ' Up to ' : ' ') + grades[i] + '<br>';
    }
    return div;
  };
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
  map.eachLayer(function (layer) {
    if (layer.feature) {
      layer.setStyle(getStyle(layer.feature));
    }
  })

  map.removeControl(legend);
  map.removeControl(info);
  if (postcodeAreasMaxVisitorCount > 0) {
    legend.addTo(map);
    info.addTo(map);
  }
}

function onEachFeature(feature, layer) {
  layer.on({
      mouseover: handleMouseoverFeature,
      mouseout: handleMouseoutFeature
  });
}

function handleMouseoverFeature(e) {
  info.update(e.target.feature.properties);
}

function handleMouseoutFeature(e) {
  info.update();
}
