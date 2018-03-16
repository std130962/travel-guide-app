// Dom7
var $$ = Dom7;

var app = new Framework7({
    // App root element
    root: '#app',
    // App Name
    name: 'Trave Guide App',
    // App id
    id: 'com.myapp.test',
    version: '0.0.1',
    // Enable swipe panel
    panel: {
        swipe: 'left',
    },
    // Add default routes
    routes: [
        {
            path: '/about/',
            url: 'pages/about.html'
        },
        {
            path: '/places/',
            url: 'pages/places.html'
        },
        {
            name: 'beaches',
            path: '/beaches/',
            url: 'pages/beaches.html'
        },
        {
            path: '/sights/',
            url: 'pages/sights.html'
        },
        {
            path: '/details/',
            url: 'pages/details.html'
        }
    ],

    // ... other parameters
});


var settings = {
    baseUrl: 'http://travel-guide-api.lrn.gr/public/index.php/',
    // Debug mode for logging - debug, info, error
    mode: 'debug',

};

log.setLevel(settings.mode);

var appData = {};

var deviceData = {
    cordova: "web",
    model: "web",
    platform: "web",
    uuid: "web",
    version: "web",
    manufacturer: "web",
    isVirtual: "web",
    serial: "web"
};

if (app.device.cordova) {
    log.debug('It is inside cordova');
    document.addEventListener("deviceready", onDeviceReady, false);
} else {
    //if app run on Cordova the checkApp will happen onDeviceReady
    checkApp();
}

function onDeviceReady() {
    log.debug('Inside onDeviceReady');
    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);
    // Add similar listeners for other events

    setDeviceData();
    //navigator.geolocation.getCurrentPosition(onGeolocationSuccess, onGeolocationError);
    checkApp();
}

function onPause() {
    // Handle the pause event
}

function onResume() {
    // Handle the resume event
}


var mainView = app.views.create('.view-main');

// Compile the templates
var beachesTemplate = $$('script#beaches-template').html();
var compiledBeachesTemplate = Template7.compile(beachesTemplate);

var listTemplate = $$('script#list-template').html();
var compiledListTemplate = Template7.compile(listTemplate);

//initilize the app
function checkApp() {
    log.debug('Inside checkApp');
    if (localStorage.appData) {
        appData = JSON.parse(localStorage.getItem('appData'));
        if (appData.version !== app.version) {
            initApp(false); // re-init app because different version found
        }
    } else {
        // Init the app for first time
        initApp(true);
    }

    //TODO delete this
    registerDevice();
    if (localStorage.deviceData) {
        deviceData = JSON.parse(localStorage.getItem('deviceData'));
    } else {
        localStorage.setItem('deviceData', JSON.stringify(deviceData));
    }
}

function initApp(firstTime) {
    log.debug('Inside initApp');
    appData.name = app.name;
    appData.id = app.id;
    appData.version = app.version;

    if (firstTime) {
        appData.guid = createGuid();
        appData.authHeader = "Basic " + btoa(appData.guid);
        registerDevice();
    }

    localStorage.setItem('appData', JSON.stringify(appData));
}


$$(document).on('page:init', '.page[data-name="places"]', function (e) {

    url = settings.baseUrl + 'places';
    axios.get(url, {
        params: {
            ID: 12345
        }
    })
        .then(function (response) {
            var context = {
                data: response.data
            };

            var html = compiledListTemplate(context);

            $$('#places-list').html(html);

        })
        .catch(function (error) {
            console.log(error);
        });

});

$$(document).on('page:init', '.page[data-name="beaches"]', function (e) {
    log.debug("beaches...");

    url = settings.baseUrl + 'beaches';
    axios.get(url, {
        params: {
            ID: 12345
        }
    })
        .then(function (response) {
            var context = {
                data: response.data
            };

            var html = compiledBeachesTemplate(context);
            console.log(html);

            $$('#beaches-list').html(html);

        })
        .catch(function (error) {
            console.log(error);
        });

});

$$(document).on('page:init', '.page[data-name="sights"]', function (e) {
    log.debug("sights...");

    url = settings.baseUrl + 'sights';
    axios.get(url, {
        params: {
            ID: 12345
        }
    })
        .then(function (response) {
            var context = {
                data: response.data
            };

            var html = compiledListTemplate(context);
            console.log(html);

            $$('#sights-list').html(html);

        })
        .catch(function (error) {
            console.log(error);
        });

});

$$(document).on('page:init', '.page[data-name="about"]', function (e) {
    log.debug("about...");

    navigator.geolocation.getCurrentPosition(onGeolocationSuccess, onGeolocationError);

    putDeviceData();


});

var onGeolocationSuccess = function (position) {
    console.log('Inside onGeolocationSuccess');

    $$('#geolocation-latitude').text(position.coords.latitude);
    $$('#geolocation-longitude').text(position.coords.longitude);
    $$('#geolocation-altitude').text(position.coords.altitude);
    $$('#geolocation-accuracy').text(position.coords.accuracy);

    $$('#geolocation-timestamp').text(position.timestamp);

    appData = 'Latitude: ' + position.coords.latitude + '\n' +
        'Longitude: ' + position.coords.longitude + '\n' +
        'Altitude: ' + position.coords.altitude + '\n' +
        'Accuracy: ' + position.coords.accuracy + '\n' +
        'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
        'Heading: ' + position.coords.heading + '\n' +
        'Speed: ' + position.coords.speed + '\n' +
        'Timestamp: ' + position.timestamp + '\n';
    log.debug(appData);
};

// onError Callback receives a PositionError object
//
function onGeolocationError(error) {
    log.debug('Inside onGeolocationError');
    log.error(error.code + " " + error.message);
}

function setDeviceData() {
    log.debug('Set Device Data');
    deviceData.cordova = device.cordova;
    deviceData.model = device.model;
    deviceData.platform = device.platform;
    deviceData.uuid = device.uuid;
    deviceData.version = device.version;
    deviceData.manufacturer = device.manufacturer;
    deviceData.isVirtual = device.isVirtual;
    deviceData.serial = device.serial;
    log.debug(deviceData);

}


function putDeviceData() {

    $$('#device-cordova').text(deviceData.cordova);
    $$('#device-model').text(deviceData.model);
    $$('#device-platform').text(deviceData.platform);
    $$('#device-uuid').text(deviceData.uuid);
    $$('#device-version').text(deviceData.version);
    $$('#device-manufacturer').text(deviceData.manufacturer);
    $$('#device-isvirtual').text(deviceData.isVirtual);
    $$('#device-serial').text(deviceData.serial);

}

function createGuid() {

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();

}

function checkConnection() {
    return navigator.connection.type;

}


function registerDevice() {
    //var url = settings.baseUrl + 'register';
    var url = settings.baseUrl + 'register';
   // var authHeader = 'Basic ' + btoa(app.guid);
    var data = {
        guid: appData.guid,
        cordova: deviceData.cordova,
        model: deviceData.model,
        platform: deviceData.platform,
        manufacturer: deviceData.manufacturer,
        isvirtual: deviceData.isVirtual
    };
    axios({
        method: 'post',
        url: url,
        data: data,
        headers: {
            'Authorization': appData.authHeader
        }
    })
        .then(function (response) {
            log.debug(response);
        })
        .catch(function (error) {
            log.error(error);
        });
}


