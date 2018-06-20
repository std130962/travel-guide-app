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
    statusbar: {
        enabled: true,
        overlay: true,
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
    // If geolocation fail on device use these lat-lng as defaults
    coords: {
        lng: 24.940424,
        lat: 37.441811
    }
};

// Set the logger mode
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
var appGeoData = {};

// Initialize deviceData with defaults data in case the app run from browser (Debugging mode)
var deviceData = {
    cordova: "web",
    model: "web",
    platform: "web",
    uuid: 0,
    version: "web",
    manufacturer: "web",
    isVirtual: "web",
    serial: 0
};

var onGeolocationSuccess = function(position) {
    log.debug('onGeolocationSuccess');
    appGeoData.latitude = position.coords.latitude;
    appGeoData.longitude = position.coords.longitude;
    appGeoData.altitude = position.coords.altitude;
    appGeoData.accuracy = position.coords.accuracy;
    appGeoData.altitudeAccuracy = position.coords.altitudeAccuracy;
    appGeoData.heading = position.coords.heading;
    appGeoData.speed = position.coords.speed;
    appGeoData.timestamp = position.timestamp / 1000;
    appGeoData.success = true;

    localStorage.setItem('appGeoData', JSON.stringify(appGeoData));

    log.debug(appGeoData);

    // Toast with geolocation info (for debug mode)
    if (settings.mode === 'debug') {
        var toastWithCustomButton = app.toast.create({
            text: 'lng: ' +  position.coords.longitude + ' lat: ' + position.coords.latitude,
            closeButton: true,
            closeButtonText: 'Close',
            closeButtonColor: 'red',
        });
        toastWithCustomButton.open();
    }

};

var onGeolocationError = function(error) {
    log.debug('onGeolocationError');
    //If localstorage have previous geo data use them
    if (localStorage.appGeoData) {
        log.debug('localstorage have appGeoData');
        appGeoData = JSON.parse(localStorage.getItem('appGeoData'));
        appGeoData.success = false;
    } else {
        //No appGeoData on localstorage and geolocation fail
        //Use defaults lng lat from settings
        appGeoData.latitude = settings.coords.lat;
        appGeoData.longitude =settings.coords.lng;
        appGeoData.altitude = '';
        appGeoData.accuracy = '';
        appGeoData.altitudeAccuracy = '';
        appGeoData.heading = '';
        appGeoData.speed = '';
        appGeoData.timestamp = '';
        appGeodata.success = false;

        localStorage.setItem('appGeoData', JSON.stringify(appGeoData));
    }

    if (settings.mode==='debug'){
        var text = 'code: ' + error.code + ' | ' + 'message: ' + error.message + '\n' ;
        log.debug(text);
        var toastWithCustomButton = app.toast.create({
            text: text,
            closeButton: true,
            closeButtonText: 'Close',
            closeButtonColor: 'red',
        });
        toastWithCustomButton.open();
    }

};


if (app.device.cordova) {
    log.debug('It is inside cordova');
    document.addEventListener("deviceready", onDeviceReady, false);
} else {
    //if app run on Cordova the checkApp will happens onDeviceReady
    checkApp();

}


function onDeviceReady() {
    log.debug('Inside onDeviceReady');
    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);

    document.addEventListener("backbutton", onBackKeyDown, false);
    // Add similar listeners for other events

    setDeviceData();

    checkApp();
}



function onPause() {
    // Handle the pause event
}

function onResume() {
    // Handle the resume event
}

// For Android back button
function onBackKeyDown() {

    var panelLeft = app.panel.get('left');
    if (panelLeft.opened ) {
        app.panel.close('left');

    } else {
        mainView.router.back();
    }

}



var mainView = app.views.create('.view-main');
//app.statusbar.show();

// Compile the templates
var homeFavoritesTemplate = $$('script#home-favorites-template').html();
var compiledHomeFavoritesTemplate = Template7.compile(homeFavoritesTemplate);

var homeNearbyTemplate = $$('script#home-nearby-template').html();
var compiledHomeNearbyTemplate = Template7.compile(homeNearbyTemplate);

var homePopularTemplate = $$('script#home-popular-template').html();
var compiledHomePopularTemplate = Template7.compile(homePopularTemplate);

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



// If app runs on Cordova set device data
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

    // Check geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onGeolocationSuccess, onGeolocationError, { maximumAge: 5000, timeout: 15000, enableHighAccuracy: true });
    } else {
        // for browsers that dont support geolocation

    }

    // Check favorites on localstorage
    if (localStorage.appFavorites) {
        log.debug('localstorage has appFavorites');
        appFavorites = JSON.parse(localStorage.getItem('appFavorites'));
        //appFavorites.ids = appFavorites.favorites.map(function(a) {return a.id;});
    } else {
        log.debug('set appFavorites');
        localStorage.setItem('appFavorites', JSON.stringify(appFavorites));
    }

    showHomeComponents();
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

function showHomeComponents() {
    $$('#home-fav').text('fav');
    $$('#home-nearby').text('near');

    createHomeSliders();
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


$$(document).on('page:init', '.page[data-name="home"]', function (e) {
    log.debug("Init home");
    createHomeSliders();
});

$$(document).on('page:init', '.page[data-name="places"]', function (e) {
    log.debug("Init places");

    url = settings.baseUrl + 'places';
    axios.get(url)
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
    log.debug("Init info");

    url = settings.baseUrl + 'info';
    axios.get(url, {})
        .then(function (response) {
            var context = {
                data: fixData(response.data)
            };
            var html = compiledInfoTemplate(context);
            $$('#info-list').html(html);
        })
        .catch(function (error) {
            console.log(error);
        });
});

$$(document).on('page:init', '.page[data-name="beaches"]', function (e) {
    log.debug("Init beaches");

    url = settings.baseUrl + 'beaches';
    axios.get(url)
        .then(function (response) {
            var context = {
                data: fixData(response.data)
            };
            var html = compiledListTemplate(context);
            $$('#beaches-list').html(html);
        })
        .catch(function (error) {
            console.log(error);
        });
});

$$(document).on('page:init', '.page[data-name="sights"]', function (e) {
    log.debug("init sights");

    url = settings.baseUrl + 'sights';
    axios.get(url)
        .then(function (response) {
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
    log.debug("Init favorites");

    var context = {
        data: fixData(appFavorites.favorites)
    };

    var html = compiledListTemplate(context);
    $$('#favorites-list').html(html);
});

$$(document).on('page:init', '.page[data-name="details"]', function (e) {
    log.debug('Init details');
    url = settings.baseUrl + 'items/2';
    axios.get(url)
        .then(function (response) {
            log.debug(response);
        })
        .catch(function (error) {
            log.error(error);
        });
});

$$(document).on('page:init', '.page[data-name="details-template"]', function (e) {
    log.debug('Inside details template');
    var page = e.detail;
    var url = settings.baseUrl + 'items/' + page.route.params.id;

    // Request data for one item
    axios.get(url)
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


    $$('#send-history').on('click', function (e) {
        log.debug('send history');

        var url = settings.baseUrl + 'history';
        axios({
            method: 'post',
            url: url,
            data: {
                guid: appData.guid,
                lat: appGeoData.latitude,
                lng: appGeoData.longitude,
                timestamp: appGeoData.timestamp
            }
        })
            .then(function (response) {
                log.debug(response);
            })
            .catch(function (error) {
                log.debug(error);
            });
    });

});




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

// Create guid
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


function createHomeSliders() {
    //var url = settings.baseUrl + 'all';
    var urlNearby = "http://travel-guide.lrn.gr/api/public/index.php/all?limit=6&offset=0";
    axios({
        method: 'get',
        url: urlNearby,
    })
        .then(function (response) {
            log.debug(response.data);
            var data = response.data;
            var placeHolderThumb = 'images/thumbs/placeholder.jpg';
            data.forEach(function (arrayItem) {
                if (arrayItem.thumbnail === "" || arrayItem.thumbnail === placeHolderThumb ) {
                    arrayItem.thumbnail = placeHolderThumb;
                } else if (!arrayItem.thumbnail.startsWith("http")) {
                    arrayItem.thumbnail = settings.imagesUrl + 'thumbs/' + arrayItem.thumbnail;
                }
            });

            log.debug(data);

            var context = {
                data: data
            };

            var html = compiledHomeNearbyTemplate(context);
            log.debug(compiledHomeNearbyTemplate(context));
            $$('#home-nearby').html(html);

            var mySwiper = app.swiper.get('#home-nearby-swiper');
            mySwiper.update();
        })
        .catch(function (error) {
            log.debug(error);
        });

    var urlPopular = "http://travel-guide.lrn.gr/api/public/index.php/all?limit=6&offset=0";
    axios({
        method: 'get',
        url: urlPopular,
    })
        .then(function (response) {
            log.debug(response.data);
            var data = response.data;
            var placeHolderThumb = 'images/thumbs/placeholder.jpg';
            data.forEach(function (arrayItem) {
                if (arrayItem.thumbnail === "" || arrayItem.thumbnail === placeHolderThumb ) {
                    arrayItem.thumbnail = placeHolderThumb;
                } else if (!arrayItem.thumbnail.startsWith("http")) {
                    arrayItem.thumbnail = settings.imagesUrl + 'thumbs/' + arrayItem.thumbnail;
                }
            });

            var context = {
                data: data
            };

            var html = compiledHomePopularTemplate(context);
            log.debug(compiledHomePopularTemplate(context));
            $$('#home-popular').html(html);

            var mySwiper = app.swiper.get('#home-popular-swiper');
            mySwiper.update();
        })
        .catch(function (error) {
            log.debug(error);
        });

    // Favorites Swipper
    var favoritesData = JSON.parse(localStorage.getItem('appFavorites'));
    var favoritesContex = {
        data: favoritesData.favorites.slice(0, 6)
    };

    log.debug(favoritesContex);

    // Put a timeout for template to be ready
    setTimeout(function(){
        var favoritesHtml = compiledHomeFavoritesTemplate(favoritesContex);
        $$('#home-favorites').html(favoritesHtml);
        var myFavoritesSwiper = app.swiper.get('#home-favorites-swiper');
        myFavoritesSwiper.update();
        }, 1000);

    //log.debug(compiledHomeFavoritesTemplate(context));
    

}