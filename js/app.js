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

var  settings = {
    baseUrl: 'http://travel-guide-api.lrn.gr/public/index.php/'
};

var mainView = app.views.create('.view-main');

// Compile the templates
var beachesTemplate = $$('script#beaches-template').html();
var compiledBeachesTemplate = Template7.compile(beachesTemplate);

var listTemplate = $$('script#list-template').html();
var compiledListTemplate = Template7.compile(listTemplate);

$$(document).on('page:init', '.page[data-name="places"]', function (e) {
    console.log("places...");

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
    console.log("beaches...");

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
    console.log("beaches...");

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

