// Dom7
var $$ = Dom7;

var app = new Framework7({
    // App root element
    root: '#app',
    // App Name
    name: 'Trave Guide App',
    // App id
    id: 'com.myapp.test',
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

var mainView = app.views.create('.view-main');

$$(document).on('page:init', '.page[data-name="places"]', function (e) {
    console.log("places...");
});

$$(document).on('page:init', '.page[data-name="beaches"]', function (e) {
    console.log("beaches...");
});

