// Dom7
var $ = Dom7;

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
            url: 'pages/about.html',
        },
        {
            path: '/places/',
            url: 'pages/places.html',
        },
        {
            path: '/beaches/',
            url: 'pages/beaches.html',
        },
        {
            path: '/sights/',
            url: 'pages/sights.html'
        }
    ],
    // ... other parameters
});

var mainView = app.views.create('.view-main');
