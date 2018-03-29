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
    routes: routes

    // ... other parameters
});


var settings = {
    baseUrl: 'http://travel-guide.lrn.gr/api/public/index.php/',
    imagesUrl: 'http://travel-guide.lrn.gr/api/public/images/',
    // Debug mode for logging - debug, info, error
    mode: 'debug',

};

log.setLevel(settings.mode);

var appData = {};
var appCoords = {
    lat: 37.441811,
    lng: 24.940424
};
var appFavorites = {
    favorites: [],
    ids: []
};


// Initialize deviceData with fake data in case the app run from browser (Debugging mode)
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

var infoTemplate = $$('script#info-template').html();
var compiledInfoTemplate = Template7.compile(infoTemplate);

var listTemplate = $$('script#list-template').html();
var compiledListTemplate = Template7.compile(listTemplate);

var galleryTemplate = $$('script#gallery-template').html();
var compiledGalleryTemplate = Template7.compile(galleryTemplate);

var detailsTemplate = $$('script#details-template').html();
var compiledDetailsTemplate = Template7.compile(detailsTemplate);

//initilize the app - check if app run for first time
function checkApp() {
    log.debug('Inside checkApp');

    if (localStorage.appData) {
        log.debug('localstorage have appData');
        appData = JSON.parse(localStorage.getItem('appData'));
        if (appData.version !== app.version) {
            log.debug('The api version is different');
            initApp(false); // re-init app because different version found
        }
    } else {
        // Init the app for first time
        initApp(true);
    }
    // Check favorites on localstorage
    if (localStorage.appFavorites) {
        log.debug('localstorage have appFavorites');
        appFavorites = JSON.parse(localStorage.getItem('appFavorites'));
        //appFavorites.ids = appFavorites.favorites.map(function(a) {return a.id;});
    } else {
        log.debug('set appFavorites');
        localStorage.setItem('appFavorites', JSON.stringify(appFavorites));
    }
}

function addToFavorites(context) {

    //var idArray = appFavorites.map(function(a) {return a.id;});
    //log.debug(idArray);
    var index = appFavorites.ids.indexOf(context.id);
    var added = true; // return this to know if added or removed
    if (index > -1){
        // The item exists so we ll remove it
        added = false;
        appFavorites.favorites.splice(index, 1);
        appFavorites.ids.splice(index, 1);
        localStorage.setItem('appFavorites', JSON.stringify(appFavorites));
        changeFavoriteNum(context.id, 'decrease');
    } else {
        // the item does not exists on favorites so we can add it
        appFavorites.favorites.unshift(context);
        appFavorites.ids = appFavorites.favorites.map(function(a) {return a.id;});
        localStorage.setItem('appFavorites', JSON.stringify(appFavorites));
        log.debug(appFavorites);
        changeFavoriteNum(context.id, 'increase');
    }
    return added;
}

function changeFavoriteNum(id, action) {
    var url;
    if (action === 'increase') {
        url = settings.baseUrl + 'favorites/increase/' + id;
    } else if (action === 'decrease') {
        url = settings.baseUrl + 'favorites/decrease/' + id;
    }

    // Do the request
    axios.put(url)
        .then(function (response) {
            log.debug(response.status);
        })
        .catch(function (error) {
            console.log(error);
        });

}

function isInFavorites(id, el) {
    var index = appFavorites.ids.indexOf(id);
    if (index > -1){
        el.text('favorite');
    } else {
        el.text('favorite_border');
    }
}

function initApp(firstTime) {
    log.debug('Inside initApp');
    appData.name = app.name;
    appData.id = app.id;
    appData.version = app.version;

    // if app run for first time create a guid and register device
    if (firstTime) {
        log.debug('Init app for first time');
        appData.guid = createGuid();
        appData.authHeader = "Basic " + btoa(appData.guid);
        registerDevice();
    }

    localStorage.setItem('appData', JSON.stringify(appData));
}


$$(document).on('page:init', '.page[data-name="places"]', function (e) {

    url = settings.baseUrl + 'places';
    axios.get(url, {
        params: {}
    })
        .then(function (response) {
            var context = {
                data: fixData(response.data)
            };

            var html = compiledListTemplate(context);

            $$('#places-list').html(html);

        })
        .catch(function (error) {
            console.log(error);
        });

});

$$(document).on('page:init', '.page[data-name="info"]', function (e) {
    log.debug("info...");

    url = settings.baseUrl + 'info';
    axios.get(url, {})
        .then(function (response) {
            var context = {
                data: fixData(response.data)
            };

            //var html = compiledBeachesTemplate(context);
            var html = compiledInfoTemplate(context);

            $$('#info-list').html(html);

        })
        .catch(function (error) {
            console.log(error);
        });

});

$$(document).on('page:init', '.page[data-name="beaches"]', function (e) {
    log.debug("beaches...");

    url = settings.baseUrl + 'beaches';
    axios.get(url, {})
        .then(function (response) {
            var context = {
                data: fixData(response.data)
            };

            //var html = compiledBeachesTemplate(context);
            var html = compiledListTemplate(context);

            $$('#beaches-list').html(html);

        })
        .catch(function (error) {
            console.log(error);
        });

});

$$(document).on('page:init', '.page[data-name="sights"]', function (e) {
    log.debug("sights...");

    url = settings.baseUrl + 'sights';
    axios.get(url)
        .then(function (response) {
            var data = response.data;
            var context = {
                data: fixData(response.data)
            };

            var html = compiledListTemplate(context);

            $$('#sights-list').html(html);

        })
        .catch(function (error) {
            console.log(error);
        });
});

$$(document).on('page:init', '.page[data-name="favorites"]', function (e) {
    log.debug("favorites...");

    var context = {
        data: fixData(appFavorites.favorites)
    }

    var html = compiledListTemplate(context);

    $$('#favorites-list').html(html);
});

$$(document).on('page:init', '.page[data-name="details"]', function (e) {
    log.debug('Inside details...');
    url = settings.baseUrl + 'items/2';
    axios.get(url, {
        params: {
            ID: 12345
        }
    })
        .then(function (response) {
            log.debug(response);

        })
        .catch(function (error) {
            log.error(error);
        });
});

$$(document).on('page:init', '.page[data-name="details-template"]', function (e) {
    log.debug('Inside details template...');
    var page = e.detail;
    var url = settings.baseUrl + 'items/' + page.route.params.id;

    // Request data for one item
    axios.get(url, {})
        .then(function (response) {
            log.debug(response.data);

            var context = response.data;

            // set the title
            $$('#details-title').text(context.title);

            // fix the likes number
            if (context.likes === null) {
                context.likes = 0;
            }

            // set the distance
            context.distance = distance(context.lat, context.lng, appCoords.lat, appCoords.lng);

            var html = compiledDetailsTemplate(context);
            $$('#details-div').html(html);

            var galleryContext = {
                data: setGalleryData(context)
            };

            log.debug(galleryContext);

            var galleryhtml = compiledGalleryTemplate(galleryContext);
            console.log(galleryhtml);
            $$('#gallery-list').html(galleryhtml);

            var mySwiper = app.swiper.get('#details-swiper');
            mySwiper.update();

            var el = $$('.fav-icon');
            isInFavorites(context.id, el);
            $$('#add-to-fav').on('click', function (e) {
                log.debug('click...');
                var infoText;

                var added = addToFavorites(context);
                if (added) {
                    $$('.fav-icon').text('favorite');
                    infoText = ': Προστέθηκε στα αγαπημένα.';
                } else {
                    $$('.fav-icon').text('favorite_border');
                    infoText = ': Αφαιρέθηκε στα αγαπημένα.';
                }
                // Show toast
                var toastBottom = app.toast.create({
                    text: context.title + infoText,
                    closeTimeout: 2000,
                });
                toastBottom.open();
            });

        })
        .catch(function (error) {
            log.error(error);
        });

});

$$(document).on('page:init', '.page[data-name="details-demo"]', function (e) {
    log.debug('Inside details demo...');
    url = settings.baseUrl + 'items/2';
    axios.get(url, {})
        .then(function (response) {
            log.debug(response);

            var data = response.data[0];

            if (data.gallery !== "") {
                data.gallery = data.gallery.split(',');
                data.gallery = data.gallery.map(function (e) {
                    return settings.imagesUrl + e
                });
            } else if (data.image !== "") {
                data.gallery = [];
                data.gallery[0] = settings.imagesUrl + data.image;
            } else {
                data.gallery = [];
                data.gallery[0] = "images/placeholder.png";
            }

            var context = {
                data: data.gallery
            };

            log.debug(context);

            var html = compiledGalleryTemplate(context);
            console.log(html);

            $$('#gallery-list').html(html);

            var mySwiper = app.swiper.get('#my-swiper');

            mySwiper.update();

        })
        .catch(function (error) {
            log.error(error);
        });

});

$$(document).on('page:init', '.page[data-name="debug"]', function (e) {
    log.debug("debug...");

    var page = e.detail;
    navigator.geolocation.getCurrentPosition(onGeolocationSuccess, onGeolocationError);

    putDeviceData();

    log.debug(page.route.params);
    log.debug(page.router.currentRoute);


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
    log.debug('Register the device');
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


function distance(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p) / 2 +
        c(lat1 * p) * c(lat2 * p) *
        (1 - c((lon2 - lon1) * p)) / 2;

    var result = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km

    if (result > 1.5) {
        return Math.round(result * 100) / 100 + " km";
    } else {
        return Math.round(result * 1000) + " m";
    }
}

function fixData(data) {

    data.forEach(function (arrayItem) {

        if (arrayItem.lat) {
            arrayItem.distance = distance(arrayItem.lat, arrayItem.lng, appCoords.lat, appCoords.lng);
        } else {
            arrayItem.distance = "";
        }
        var placeHolder = 'images/placeholder.png';
        var placeHolderThumb = 'images/thumbs/placeholder.jpg';

        if (arrayItem.likes === null) {
            arrayItem.likes = 0;
        }
        if (arrayItem.thumbnail === "" || arrayItem.thumbnail === placeHolderThumb ) {
            arrayItem.thumbnail = placeHolderThumb;
        } else if (!arrayItem.thumbnail.startsWith("http")) {
            arrayItem.thumbnail = settings.imagesUrl + 'thumbs/' + arrayItem.thumbnail;
        }
        if (arrayItem.image === "" || arrayItem.image === placeHolder) {
            arrayItem.image = placeHolder;
        } else if (!arrayItem.image.startsWith("http")) {
            arrayItem.image = settings.imagesUrl + arrayItem.image;
        }
    });
    log.debug(data);

    return data;
}


// Set data for the swiper gallery
function setGalleryData(context) {

    if (context.gallery !== "") {
        context.gallery = context.gallery.split(',');
        context.gallery = context.gallery.map(function (e) {
            return settings.imagesUrl + e
        });
    } else if (context.image !== "") {
        context.gallery = [];
        context.gallery[0] = settings.imagesUrl + context.image;
    } else {
        context.gallery = [];
        context.gallery[0] = "images/placeholder.png";
    }

    return context.gallery;
}

