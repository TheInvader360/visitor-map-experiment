const gwyneddCommunities = {
  'Atlantis': 'Atlantis',
  'Smallville': 'Smallville'
  //'Aberdaron': 'Aberdaron',
  //'Bala': 'Bala',
  //'Beddgelert': 'Beddgelert',
  //'Bethesda': 'Bethesda',
  //'BlaenauFfestiniog': 'Blaenau Ffestiniog',
  //'LlanFfestiniog': 'Llan Ffestiniog',
  //'Penygroes': 'Penygroes',
  //'Porthmadog': 'Porthmadog',
  //'Pwllheli': 'Pwllheli'
};

const powysCommunities = {
  //'Llanidloes': 'Llanidloes'
};

const ynysMonCommunities = {
  'Gotham': 'Gotham',
  'Themyscira': 'Themyscira'
  //'Llangefni': 'Llangefni'
};

window.addEventListener('load', function() {
  initMap();
})

function initMap() {
  var m = L.map('map').setView([54.8, -4.5], 5);

  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    minZoom: 5,
    maxZoom: 10,
    attribution: '<a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/light-v9',
    tileSize: 512,
    zoomOffset: -1
  }).addTo(m);

  L.geoJson(postcodeAreaData, { weight: 0 }).addTo(m);
}

function setCounty(county) {
  document.getElementById('json').textContent = '';

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
  document.getElementById('json').textContent = '';

  if (community) {
    axios.get('http://localhost:8081/v1/api/visitor-profiles', {
      params: {
        community: community,
        from: '01-06-2021',
        to: '01-12-2021'
      }
    })
    .then(function (response) {
      console.log(response);
      document.getElementById('json').textContent = JSON.stringify(response.data.data.postcodeAreaTotals, undefined, 2);
      updateMap()
    })
    .catch(function (error) {
      console.log(error);
    })
    .then(function () {
    });
  }
}

function updateMap() {
  console.log('TODO: UPDATE MAP');
}
