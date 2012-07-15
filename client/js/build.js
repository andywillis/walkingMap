$(document).ready(function() {

  var mapLayer = 'mapbox'
  , showLayers = true
  , showRoutes = true
  , zoom = 12
  , trail = []
  , miles = 0
  , recording = false


  var distance = function(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1/180
    var radlat2 = Math.PI * lat2/180
    var radlon1 = Math.PI * lon1/180
    var radlon2 = Math.PI * lon2/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }
    return dist
  }

  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }

  Number.prototype.toDeg = function() {
    return this * 180 / Math.PI;
  }

  var getInitialBearing = function(la1, lo1, la2, lo2) {
    var lat1 = la1.toRad(),
        lat2 = la2.toRad()

    var dLon = (lo2-lo1).toRad()
    var y = Math.sin(dLon) * Math.cos(lat2)
    var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon)
    var brng = Math.atan2(y, x)
    
    return (brng.toDeg()+360) % 360;
  }

var destinationPoint = function(la1, lo1, brng, dist) {
  dist = dist/3959;  // convert dist to angular distance in radians
  brng = brng.toRad()
  var lat1 = la1.toRad(), lon1 = lo1.toRad()

  var lat2 = Math.asin( Math.sin(lat1)*Math.cos(dist) + 
                        Math.cos(lat1)*Math.sin(dist)*Math.cos(brng) );
  var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(dist)*Math.cos(lat1), 
                               Math.cos(dist)-Math.sin(lat1)*Math.sin(lat2));
  lon2 = (lon2+3*Math.PI) % (2*Math.PI) - Math.PI;  // normalise to -180..+180º

  return [lat2.toDeg(), lon2.toDeg()]
}

  var getDistance = function(array, callback) {
    var td = 0
      , shrunk = 0
      , al = array.length
      , ob = {}
      , ms = 1

    ob.milestones = []

    for (var i = 0, l = array.length-1; i<l; i++) {
      var d = distance(array[i][1], array[i][0], array[i+1][1], array[i+1][0], 'M')
      td += d
      if (parseInt(td) === ms) {
        var b = getInitialBearing(array[i][1], array[i][0], array[i+1][1], array[i+1][0])
        var remainder = d - (ms - td)
//        var nd = d + remainder
//        var p1 = new LatLon(array[i][1], array[i][0])
        ob.milestones[ms] = destinationPoint(array[i][1], array[i][0], b, remainder)
        ms++
      }
//      ob.ex.push([d,td,b])

    }
    ob.distance = Math.floor(td * 100) / 100
    callback(ob)
  }

  for (o in route.features) {
    getDistance(route.features[o].geometry.coordinates, function(ob){
      route.features[o].properties.distance = ob.distance
      console.log(ob.distance);
      route.features[o].properties.milestones = ob.milestones
    })
  }

  var routeLine = {
    stroke: true
  , color: 'rgb(0,100,230)'
  , weight: 3
  , opacity: 0.6
  , fill: false
  , fillColor: 'rgb(255,0,0)'
  , fillOpacity: 0.2
  , clickable: true
  }

  var routeLineHover = {
    stroke: true
  , color: 'rgb(0,100,230)'
  , weight: 3
  , opacity: 1
  , fill: false
  , fillColor: 'rgb(255,0,0)'
  , fillOpacity: 0.2
  , clickable: true
  }

  routeLayer.on("featureparse", function (e) {
    e.layer.milestones = e.properties.milestones
    if (e.properties && e.properties.style && e.layer.setStyle){
      e.layer.setStyle(routeLine);
    }
    if (e.properties && e.properties.name) {

      var totalDistance = 0
        , routeId = e.properties.id
        , walksArray = jsonPath(walks, "$..walk[?(@.route===" + routeId + ")]")

      for (w in walksArray) {
        ;(walksArray[w].type === 'return') ? distance = e.properties.distance*2 : distance = e.properties.distance
        totalDistance += distance
      }

      fbString = '$.fancybox({padding:0,autoScale:false,transitionIn:"none",transitionOut:"none",content:$("#directions").html()})'
      e.layer.bindPopup('<b>Route:</b> ' + e.properties.id + '<br/><b>Name:</b> ' + e.properties.name + '<br/><b>Date:</b> ' + e.properties.date + '<br/><b>Distance: </b>' + e.properties.distance + ' miles.<br/><br/><b>Walks taken: </b>' + walksArray.length + '<br/><b>Total distance: </b>' + totalDistance + '<br/><br><span class="alignRight">[<a class="info" onClick='+ fbString +'>More information</a>]</span>')
    }
  }).addGeoJSON(route)

  startingPointLayer.on('featureparse', function (e) {
    if (e.properties && e.properties.name){
        e.layer.bindPopup(e.properties.name);
    }
  }).addGeoJSON(startingPoints)

  pubLayer.on('featureparse', function (e) {
    if (e.properties && e.properties.name){
        e.layer.bindPopup(e.properties.name);
    }
  }).addGeoJSON(pubs)

  monumentLayer.on('featureparse', function (e) {
    if (e.properties && e.properties.name){
        e.layer.bindPopup(e.properties.name);
    }
  }).addGeoJSON(monuments)

  castleLayer.on('featureparse', function (e) {
    if (e.properties && e.properties.name){
        e.layer.bindPopup(e.properties.name);
    }
  }).addGeoJSON(castles)

  churchLayer.on('featureparse', function (e) {
    if (e.properties && e.properties.name){
        e.layer.bindPopup(e.properties.name);
    }
  }).addGeoJSON(churches)

  var url = 'http://a.tiles.mapbox.com/v3/uws.map-c0sgb7sw.jsonp'

  var editLine = {
    stroke: true
  , color: 'rgb(0,0,255)'
  , weight: 3
  , opacity: 0.6
  , fill: false
  , fillColor: 'rgb(255,0,0)'
  , fillOpacity: 0.2
  , clickable: false
  }

  var wantsumStyle = {
    stroke: true
  , color: 'rgb(181,208,208)'
  , weight: 3
  , opacity: 1
  , fill: true
  , fillColor: 'rgb(181,208,208)'
  , fillOpacity: 0.6
  , clickable: false
  }

  var rbStyle = {
    stroke: true
  , color: 'rgb(181,208,208)'
  , weight: 3
  , opacity: 1
  , fill: true
  , fillColor: 'rgb(241,238,232)'
  , fillOpacity: 1
  , clickable: false
  }

var a = [[1.2728691101074219,51.38656635658549],[1.2744140625,51.38110252883247],[1.2754440307617188,51.377566763266664],[1.2773323059082031,51.37510228029203],[1.2805938720703125,51.374673661013496],[1.2831687927246094,51.374352193921084],[1.285400390625,51.37445934986937],[1.2878036499023438,51.374995125848635],[1.2900352478027344,51.374995125848635],[1.2926101684570312,51.37488797115441],[1.2944984436035156,51.37328062064337],[1.2957000732421875,51.37188753788527],[1.2957000732421875,51.36974425087163],[1.2948417663574219,51.3682438902663],[1.2920951843261719,51.36642195772421],[1.286773681640625,51.36556455262151],[1.2814521789550781,51.36417123509102],[1.2780189514160156,51.363635332445654],[1.2738990783691406,51.36342096963166],[1.2704658508300781,51.36320660581431],[1.2642860412597656,51.36342096963166],[1.2642860412597656,51.36352815116407],[1.2603378295898438,51.363635332445654],[1.2545013427734375,51.36417123509102],[1.2476348876953125,51.36406405506364],[1.2423133850097656,51.36331378784839],[1.237335205078125,51.3617060309992],[1.2340736389160156,51.35977664828087],[1.2316703796386719,51.35656082980951],[1.2323570251464844,51.3535591955468],[1.2344169616699219,51.349806876150026],[1.2349319458007812,51.3474481180961],[1.2375068664550781,51.34487478901302],[1.241455078125,51.34390975335249],[1.240081787109375,51.3420868527726],[1.2375068664550781,51.34058558608988],[1.2351036071777344,51.33844083410072],[1.2340736389160156,51.33779738893502],[1.2366485595703125,51.33651047150787],[1.2397384643554688,51.33586699924631],[1.2431716918945312,51.3352235179527],[1.2490081787109375,51.33511627019233],[1.2536430358886719,51.334365528844664],[1.2572479248046875,51.33425827907714],[1.2608528137207031,51.334043778789415],[1.2646293640136719,51.33425827907714],[1.2696075439453125,51.33393652826922],[1.2740707397460938,51.33393652826922],[1.2795639038085938,51.33361477520324],[1.286773681640625,51.33222048582427],[1.2932968139648438,51.331147926679584],[1.3006782531738281,51.331147926679584],[1.3063430786132812,51.331147926679584],[1.3157844543457031,51.329860822587236],[1.3195610046386719,51.32921725699238],[1.3248825073242188,51.32889547080779],[1.33209228515625,51.327608303487914],[1.3348388671875,51.32599929352952],[1.338958740234375,51.32353203527898],[1.3423919677734375,51.32074280090234],[1.3446235656738281,51.31784610874728],[1.3473701477050781,51.31452005143142],[1.3480567932128906,51.31398356799031],[1.3494300842285156,51.316987794460836],[1.3516616821289062,51.31988454081537],[1.3545799255371094,51.32278110424814],[1.3586997985839844,51.325033860456315],[1.3619613647460938,51.32642836837173],[1.3672828674316406,51.32782283388363],[1.3736343383789062,51.32835915548201],[1.3787841796875,51.32835915548201],[1.3844490051269531,51.32803736327569],[1.3914871215820312,51.32664290428741],[1.399383544921875,51.32524840289562],[1.404876708984375,51.323317484810445],[1.4136314392089844,51.31913355006591],[1.4187812805175781,51.310657230633744],[1.4220428466796875,51.297778812458404],[1.4237594604492188,51.28994267350323],[1.4261627197265625,51.243757449780546],[1.4215278625488281,51.23644948929002],[1.4170646667480469,51.23096775701038],[1.4110565185546875,51.22688290443737],[1.4060783386230469,51.226130392046606],[1.3997268676757812,51.22709790571764],[1.3942337036132812,51.22806539904941],[1.3830757141113281,51.23150521061917],[1.3780975341796875,51.23386993192318],[1.3712310791015625,51.239243846566026],[1.3653945922851562,51.243542526337045],[1.3640213012695312,51.24601408530393],[1.3605880737304688,51.24923765827256],[1.3542366027832031,51.25267588705488],[1.3480567932128906,51.255576692626114],[1.3405036926269531,51.25643615542638],[1.3324356079101562,51.256973311517555],[1.3274574279785156,51.25740303187168],[1.3243675231933594,51.258047604871585],[1.3286590576171875,51.260410961883814],[1.3324356079101562,51.26170001449684],[1.3377571105957031,51.26288161430283],[1.3432502746582031,51.26417059763044],[1.3478851318359375,51.26545954480965],[1.3532066345214844,51.26771511539234],[1.3561248779296875,51.26868175461094],[1.3585281372070312,51.27029277479139],[1.35955810546875,51.275984593765145],[1.35955810546875,51.277380592622485],[1.3561248779296875,51.27845440903181],[1.3508033752441406,51.279957709836474],[1.3439369201660156,51.2809240915181],[1.3391304016113281,51.28135358796176],[1.3338088989257812,51.28178308038948],[1.3298606872558594,51.282534682474655],[1.3250541687011719,51.28747347593227],[1.3247108459472656,51.289083837233164],[1.3247108459472656,51.29058679016463],[1.3243675231933594,51.29327051233329],[1.3228225708007812,51.29659810997767],[1.3200759887695312,51.29831548536559],[1.3166427612304688,51.299496143676606],[1.3106346130371094,51.30185736919989],[1.3042831420898438,51.30443311306082],[1.3001632690429688,51.305077026440294],[1.29638671875,51.30668677036433],[1.2775039672851562,51.30818914708443],[1.2709808349609375,51.308403768315024],[1.2637710571289062,51.30947685941145],[1.2569046020507812,51.31344707827587],[1.2508964538574219,51.317953396903896],[1.2476348876953125,51.319455404749775],[1.2435150146484375,51.31988454081537],[1.2402534484863281,51.317738820339706],[1.2371635437011719,51.316129464115065],[1.2327003479003906,51.31355437672062],[1.22772216796875,51.3080818360927],[1.2253189086914062,51.30421847326005],[1.22222900390625,51.29971080556154],[1.2211990356445312,51.29670544782168],[1.2201690673828125,51.29402192643134],[1.2184524536132812,51.285111510539934],[1.2182807922363281,51.28221256880128],[1.2203407287597656,51.280172463078266],[1.2237739562988281,51.27823964775797],[1.2282371520996094,51.27662890620119],[1.2349319458007812,51.27555504712096],[1.2416267395019531,51.27555504712096],[1.2466049194335938,51.2748033308298],[1.2514114379882812,51.2748033308298],[1.2553596496582031,51.2748033308298],[1.2611961364746094,51.2748033308298],[1.26617431640625,51.27491071962443],[1.2697792053222656,51.2748033308298],[1.2726974487304688,51.2748033308298],[1.2713241577148438,51.27362203752229],[1.2694358825683594,51.273085075978415],[1.2660026550292969,51.272655502225085],[1.2629127502441406,51.271796342669724],[1.2599945068359375,51.271796342669724],[1.2555313110351562,51.271688946595745],[1.2515830993652344,51.27104456488048],[1.2460899353027344,51.271474153694726],[1.2411117553710938,51.271903738492696],[1.2371635437011719,51.271796342669724],[1.23321533203125,51.27222592445553],[1.229095458984375,51.272011134064655],[1.2230873107910156,51.27211852938559],[1.2179374694824219,51.272440713842315],[1.209869384765625,51.26900396316538],[1.2076377868652344,51.267070677950585],[1.2040328979492188,51.26288161430283],[1.2009429931640625,51.25879959528236],[1.1987113952636719,51.25665101861597],[1.196136474609375,51.254072594064375],[1.190643310546875,51.24870041180249],[1.187896728515625,51.24601408530393],[1.1842918395996094,51.24343506423872],[1.1801719665527344,51.24031855417011],[1.1703872680664062,51.23558965290394],[1.1643791198730469,51.23182767977129],[1.1710739135742188,51.23741678601641],[1.1743354797363281,51.24064096155532],[1.17828369140625,51.24343506423872],[1.1842918395996094,51.24966745092953],[1.1913299560546875,51.2568658808014],[1.196136474609375,51.26234452724744],[1.20025634765625,51.26578177595631],[1.2059211730957031,51.273299861348995],[1.20849609375,51.28135358796176],[1.20574951171875,51.28876176949068],[1.204376220703125,51.292948473955256],[1.2023162841796875,51.30132073770123],[1.2066078186035156,51.30797452485006],[1.2108993530273438,51.31419816211956],[1.2129592895507812,51.32288838086245],[1.2095260620117188,51.326106562616445],[1.2035179138183594,51.32471204491551],[1.1976814270019531,51.32160104493043],[1.1928749084472656,51.3202063902299],[1.1834335327148438,51.31688050404585],[1.1721038818359375,51.31419816211956],[1.1583709716796875,51.31033531422078],[1.1537361145019531,51.30861838854187],[1.1461830139160156,51.30754527736994],[1.1427497863769531,51.30475507087982],[1.1341667175292969,51.30121341064864],[1.1285018920898438,51.29971080556154],[1.1166572570800781,51.29541737712993],[1.1006927490234375,51.287580835109225],[1.0926246643066406,51.28532623968625],[1.0824966430664062,51.281460961445205],[1.0687637329101562,51.276414136393214],[1.061553955078125,51.27469594178418],[1.0596656799316406,51.273085075978415],[1.0510826110839844,51.26921876761326],[1.0428428649902344,51.26502989976638],[1.0356330871582031,51.2620222720018],[1.0256767272949219,51.256973311517555],[1.0165786743164062,51.25493208498196],[1.0186386108398438,51.2571881721967],[1.028594970703125,51.26266678023375],[1.0349464416503906,51.26674845584085],[1.0442161560058594,51.27158155027075],[1.0515975952148438,51.27534027229282],[1.0577774047851562,51.276843675005175],[1.0658454895019531,51.28081671677971],[1.0721969604492188,51.28350100994113],[1.0888481140136719,51.29187499638172],[1.0953712463378906,51.29541737712993],[1.1209487915039062,51.30625751083878],[1.1350250244140625,51.31162296632194],[1.1489295959472656,51.31623675628653],[1.1539077758789062,51.31838254702121],[1.1671257019042969,51.32342476017019],[1.175537109375,51.32653563645502],[1.1815452575683594,51.32803736327569],[1.1928749084472656,51.332113231038846],[1.19476318359375,51.33500902218106],[1.1963081359863281,51.339191508712105],[1.1957931518554688,51.34337361364937],[1.1923599243164062,51.346483136623625],[1.1897850036621094,51.355488840149505],[1.1913299560546875,51.36567172913724],[1.1952781677246094,51.37081590691952],[1.197509765625,51.375423742117405],[1.1999130249023438,51.37960254043422],[1.2018013000488281,51.383566688771346],[1.2040328979492188,51.38849461063877],[1.21124267578125,51.392565102360834],[1.2726974487304688,51.3869948645083]]
var b = [[1.3272857666015625,51.295954077643444],[1.3283157348632812,51.297456805702524],[1.3310623168945312,51.29788614754176],[1.3344955444335938,51.2981008169556],[1.3363838195800781,51.296061416993226],[1.3379287719726562,51.2948806703422],[1.3379287719726562,51.29348520333045],[1.3356971740722656,51.29176764724403],[1.3324356079101562,51.29187499638172],[1.3286590576171875,51.29198234526849],[1.3262557983398438,51.293699893323726],[1.3238525390625,51.29412927029858],[1.3250541687011719,51.29466598587029],[1.3262557983398438,51.29531003627432],[1.3269424438476562,51.296061416993226]]
var ll = []
var lb = []

for (c in a) {
  ll.push(new L.LatLng(a[c][1], a[c][0]))
}

for (c in b) {
  lb.push(new L.LatLng(b[c][1], b[c][0]))
}

var wantsumLayer = new L.Polygon(ll, wantsumStyle)
var rbLayer = new L.Polyline(lb, rbStyle)
var editLayer = new L.Polyline([], editLine)

  wax.tilejson(url, function(tilejson) {

    var home = {coords: new L.LatLng(51.33088838086245,1.2277658081054688)} // {coords: new L.LatLng(51.24703490785793, 1.3078773021697998)}
      , toner = new L.StamenTileLayer("toner")
      , mapbox = new wax.leaf.connector(tilejson)
      , mapnik = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {opacity: 1})
      , map = new L.Map('walkingMap', {center: home.coords, zoom: zoom, layers: [mapnik,routeLayer,startingPointLayer,pubLayer,wantsumLayer,rbLayer,monumentLayer,churchLayer,castleLayer,editLayer]})
      , baseMaps = {Mapnik: mapnik, Mapbox: mapbox, Toner: toner} //, Google: new L.Google()}
      , overlayMaps = {'Starting points': startingPointLayer, Churches: churchLayer, Castles: castleLayer, Pubs: pubLayer, Wantsum: wantsumLayer, RBLayer: rbLayer, Monuments: monumentLayer, Routes: routeLayer, Edit: editLayer}
      , layersControl = new L.Control.Layers(baseMaps, overlayMaps)

//    map.addControl(new L.Control.Scale({width: 100, position: 'bottomleft'}))

  routeLayer.on("mouseover", function (e) {
    e.layer.setStyle(routeLineHover)
    var ms = e.layer.milestones
/*    for (var m = 1, l = ms.length; m < l; m++) {
      var marker = new L.Marker(new L.LatLng(ms[m][0], ms[m][1]))
      map.addLayer(marker)
    } */
  })

  routeLayer.on("mouseout", function (e){e.layer.setStyle(routeLine)})

    
    var onMapClick = function(e) {
      var coords = [e.latlng.lng, e.latlng.lat]
      if (recording === true) {
        trail.push(coords)
        editLayer.addLatLng(new L.LatLng(coords[1],coords[0]))
//        console.log(editLayer);
        if (trail.length > 1) {
          console.log(trail);
          d = distance(e.latlng.lat, e.latlng.lng, trail[trail.length-2][1], trail[trail.length-2][0], 'M')
          miles += d
        }
      }
      else {
        cDesc = '<span class="coords">Lat: ' + coords[1] + '</span><br/><span>Lon: ' + coords[0] + '</span>'
        $('#coords').html(JSON.stringify(coords))
      }
    }

    map.addControl(layersControl);
    map.on('click', onMapClick)
    
    key('m', function() {
      switch(mapLayer) {
        case 'toner':
          map.removeLayer(toner)
          map.addLayer(new wax.leaf.connector(tilejson))
          mapLayer = 'mapbox'
        break;
        case 'mapbox':
          map.removeLayer(mapbox)
          map.addLayer(toner)
          mapLayer = 'toner'
        break;
      }
    })

    key('h', function() {
      map.panTo(home.coords)
      map.setZoom(12)
    })

    key('r', function() {
      switch(recording){
        case true:
          recording = false
          if (showRoutes === true) map.addLayer(routeLayer)
          $('#recording').css('visibility','hidden')
        break;
        case false:
          recording = true
          if (showRoutes === true) map.removeLayer(routeLayer)
          $('#recording').css('visibility','visible')
        break;
      }
    })

    key(']', function() {
      var z = map.getZoom()
      if (z < 18) {
        map.zoomIn()
        z += 1
      }
    })

    key('[', function() {
      var z = map.getZoom()
      if (z > 1) {
        map.zoomOut()
        z -= 1
      }
    })

    key('t', function() {
        $.fancybox({
        padding   : 0,
        autoScale   : false,
        transitionIn  : 'none',
        transitionOut : 'none',
        content: new Date() + '<br/><br/>' + JSON.stringify(trail)
      })
    })

  })

})