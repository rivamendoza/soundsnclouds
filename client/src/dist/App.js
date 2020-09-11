"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var react_1 = require("react");
require("./stylesheets/App.scss");
var login_gif_gif_1 = require("./assets/login-gif.gif");
var cloud_logo_png_1 = require("./assets/cloud-logo.png");
var mobx_1 = require("mobx");
var mobx_react_1 = require("mobx-react");
var react_leaflet_1 = require("react-leaflet");
var semantic_ui_react_1 = require("semantic-ui-react");
var Fade_1 = require("react-reveal/Fade");
require("react-widgets/dist/css/react-widgets.css");
require("semantic-ui-css/semantic.min.css");
var App = /** @class */ (function (_super) {
    __extends(App, _super);
    function App() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // initialise props
        _this.playlistOptions = {
            name: "default",
            description: "default",
            numOfTracks: "default",
            countryMarket: "default",
            public: false
        };
        _this.weather = {
            id: 0,
            city: "",
            country: "",
            iconCode: "",
            main: "",
            description: "",
            temp: "",
            clouds: 0
        };
        _this.currentLocation = {
            useCoords: false,
            city: "",
            country: "",
            lat: 0,
            long: 0
        };
        _this.chosenLocation = {
            useCoords: false,
            city: "",
            country: "",
            lat: 0,
            long: 0
        };
        _this.spotify = {
            accessToken: "",
            userId: ""
        };
        _this.markerPos = [0, 0];
        _this.currentLocationClicked = false;
        _this.spotifyOutput = "";
        _this.leafletMap = react_1["default"].createElement(react_1["default"].Fragment, null);
        _this.playlistSection = react_1["default"].createElement(react_1["default"].Fragment, null);
        _this.askCustomiseSection = react_1["default"].createElement(react_1["default"].Fragment, null);
        _this.customiseSection = react_1["default"].createElement(react_1["default"].Fragment, null);
        _this.locationSection = react_1["default"].createElement(react_1["default"].Fragment, null);
        _this.weatherSection = react_1["default"].createElement(react_1["default"].Fragment, null);
        _this.loggedIn = false;
        return _this;
    }
    /****************************** LOGIN ******************************/
    // private spotifyLogin() {
    //   console.log("fetching login");
    //   return( 
    //     <a href="http://localhost:9000/auth/login">sign in with spotify</a>
    //   );
    //   fetch(`https://accounts.spotify.com/authorize?response_type=code&client_id=c32e2b8a2a74444f9448149ddd2d22d8&scope=user-read-private%20user-read-email&redirect_uri=http%3A%2F%2Flocalhost%3A9000%2Fauth%2Fcallback&state=rs4Meq8AnNV0HvdF`,{
    //     mode: "no-cors"
    //   }).then((res) => console.log(res));
    //   // fetch(`http://localhost:9000/auth/login`, {
    //   //   // mode: "no-cors",
    //   //   // credentials: 'include'
    //   // })
    //   // .then(res => res.text())
    //   // .then(res => this.setSpotifyToken(res))
    //   // .catch(err => console.log("error", err))
    // }
    App.prototype.setSpotifyDetails = function () {
        //set spotify token from endpoint
        this.spotify.accessToken = window.location.pathname.split("/")[1].split("=")[1].split("&user_id")[0];
        this.spotify.userId = window.location.pathname.split("user_id=")[1];
        console.log("token ", this.spotify.accessToken);
        console.log("user", this.spotify.userId);
    };
    /****************************** LOCATION ******************************/
    App.prototype.getCurrentLocation = function () {
        var _this = this;
        // get current location of user
        navigator.geolocation.getCurrentPosition(function (position) {
            _this.currentLocation.lat = parseFloat(position.coords.latitude.toPrecision());
            _this.currentLocation.long = parseFloat(position.coords.longitude.toPrecision());
            _this.markerPos = [_this.currentLocation.lat, _this.currentLocation.long];
            console.log(_this.currentLocation);
            //fetch city and country of geolocation
            fetch("http://localhost:9000/location/" + _this.currentLocation.lat + "/" + _this.currentLocation.long)
                .then(function (res) { return res.json(); })
                .then(function (res) {
                _this.currentLocation.city = res.city;
                _this.currentLocation.country = res.country;
                _this.renderLeafletMap(_this.currentLocation.lat, _this.currentLocation.long);
            })["catch"](function (err) { return err; });
        });
    };
    App.prototype.onSearch = function () {
        var _this = this;
        // fetch weather information of chosen city
        fetch("http://localhost:9000/weather/" + this.chosenLocation.city)
            .then(function (res) { return res.json(); })
            .then(function (res) {
            // update chosen city geolocation and country
            _this.chosenLocation.lat = res.lat;
            _this.chosenLocation.long = res.long;
            _this.chosenLocation.country = res.country;
            // render weather module
            _this.renderWeather(res);
            // re render leaflet map of chosen geolocation
            _this.markerPos = [_this.chosenLocation.lat, _this.chosenLocation.long];
            _this.renderLeafletMap(_this.chosenLocation.lat, _this.chosenLocation.long);
        })["catch"](function (err) { return console.log("error!"); });
    };
    App.prototype.onUseLocation = function () {
        var _this = this;
        // fetch weather information of current geolocation
        fetch("http://localhost:9000/weather/" + this.currentLocation.lat + "/" + this.currentLocation.long)
            .then(function (res) { return res.json(); })
            .then(function (res) {
            // render weather module
            _this.renderWeather(res);
            // set chosen location to current location
            // this.chosenLocation = this.currentLocation;
            // re render leaflet map of current geolocation
            _this.markerPos = [_this.currentLocation.lat, _this.currentLocation.long];
            _this.renderLeafletMap(_this.currentLocation.lat, _this.currentLocation.long);
        })["catch"](function (err) { return err; });
    };
    App.prototype.onMapClicked = function (e) {
        var _this = this;
        this.markerPos = e.latlng;
        this.chosenLocation.lat = e.latlng.lat;
        this.chosenLocation.long = e.latlng.lng;
        // fetch weather information from chosen location coordinates
        fetch("http://localhost:9000/weather/" + this.chosenLocation.lat + "/" + this.chosenLocation.long)
            .then(function (res) { return res.json(); })
            .then(function (res) {
            // update chosen city and country from geolocation
            _this.chosenLocation.city = res.city;
            _this.chosenLocation.country = res.country;
            // render weather module
            _this.renderWeather(res);
            // re render leaflet map of current geolocation
            _this.renderLeafletMap(_this.chosenLocation.lat, _this.chosenLocation.long);
        })["catch"](function (err) { return err; });
    };
    App.prototype.setChosenCity = function (city) {
        this.chosenLocation.city = city;
    };
    /****************************** WEATHER ******************************/
    // private fetchWeatherHistory(city:string) {
    //   console.log("fetching weather history");
    //   fetch(`http://localhost:9000/weather/history/${city}`)
    //   .then(res => res.json())
    //   .then(res => this.renderWeatherWeek(res))
    //   .catch(err => console.log(err))
    // }
    App.prototype.renderWeather = function (details) {
        this.weather = details;
        // let {city, country, iconCode, weather, description, temp} = details;
        var iconUrl = "http://openweathermap.org/img/wn/" + this.weather.iconCode + "@2x.png";
        this.weatherSection = (react_1["default"].createElement(Fade_1["default"], { right: true },
            react_1["default"].createElement("div", { className: "weather-section" },
                react_1["default"].createElement(semantic_ui_react_1.Header, { className: "weather-header", as: "h1" },
                    this.weather.city,
                    ", ",
                    this.weather.country),
                react_1["default"].createElement("img", { className: "weather-icon", src: iconUrl }),
                this.weather.main,
                react_1["default"].createElement("br", null),
                this.weather.description,
                react_1["default"].createElement("br", null),
                this.weather.temp,
                react_1["default"].createElement("br", null))));
        this.renderAskSection();
    };
    App.prototype.renderWeatherWeek = function (details) {
        console.log("rendering weather week");
        var city = details.city, country = details.country, iconCode = details.iconCode, weather = details.weather, description = details.description, temp = details.temp;
        var iconUrl = "http://openweathermap.org/img/wn/" + iconCode + "@2x.png";
        this.weatherSection = (react_1["default"].createElement(Fade_1["default"], { right: true },
            react_1["default"].createElement("div", { className: "weather-section" },
                react_1["default"].createElement(semantic_ui_react_1.Header, { className: "weather-header", as: "h1" },
                    city,
                    ", ",
                    country),
                react_1["default"].createElement("img", { className: "weather-icon", src: iconUrl }),
                weather,
                react_1["default"].createElement("br", null),
                description,
                react_1["default"].createElement("br", null),
                temp,
                react_1["default"].createElement("br", null))));
        this.forceUpdate();
    };
    /********************************* PLAYLIST *********************************/
    App.prototype.setPlaylistOptionDropdown = function (option, event) {
        // changes market or number of tracks
        this.playlistOptions[option] = event.value;
    };
    App.prototype.setPlaylistPublic = function (event) {
        // changes public boolean
        this.playlistOptions.public = event.checked;
    };
    App.prototype.setPlaylistOptionInput = function (option, event) {
        // changes playlist name or description
        this.playlistOptions[option] = event.target.value;
        this.playlistOptions[option] = (this.playlistOptions[option] == "") ? "default" : this.playlistOptions[option];
    };
    App.prototype.makePlaylist = function (customised) {
        var _this = this;
        console.log((customised) ? "making customised" : "making default");
        console.log("market", this.playlistOptions.countryMarket);
        console.log("description", this.playlistOptions.description);
        console.log("name", this.playlistOptions.name);
        console.log("numOfTracks", this.playlistOptions.numOfTracks);
        console.log("public", this.playlistOptions.public);
        //default: create/id/main/description/temp/city/clouds/user/accessToken
        //custom: create/name/pdesc/tracks/market/public/id/main/description/temp/city/clouds/user/accessToken
        ///:name/:playlistDesc/:numTracks/:market/:makePublic/
        ///:id/:main/:weatherDesc/:temp/:city/:clouds/
        ///:user/:accessToken
        if (customised) {
            fetch("http://localhost:9000/create/" +
                (this.playlistOptions.name + "/" + this.playlistOptions.description + "/" + this.playlistOptions.numOfTracks + "/" + this.playlistOptions.countryMarket + "/" + this.playlistOptions.public + "/") +
                (this.weather.id + "/" + this.weather.main + "/" + this.weather.description + "/" + this.weather.temp.split('°')[0] + "/" + this.weather.city + "/" + this.weather.clouds + "/") +
                (this.spotify.userId + "/" + this.spotify.accessToken))
                .then(function (res) { return res.text(); })
                .then(function (res) { return _this.setOutput(res); })["catch"](function (err) { return err; });
        }
        else {
            fetch("http://localhost:9000/create/" + this.weather.id + "/" + this.weather.main + "/" + this.weather.description + "/" + this.weather.temp.split('°')[0] + "/" + this.weather.city + "/" + this.weather.clouds + "/" + this.spotify.userId + "/" + this.spotify.accessToken)
                .then(function (res) { return res.text(); })
                .then(function (res) { return _this.setOutput(res); })["catch"](function (err) { return err; });
        }
    };
    App.prototype.setOutput = function (value) {
        this.spotify.playlistId = value;
        this.renderSpotifyPlaylist();
    };
    /****************************** LEAFLET ******************************/
    App.prototype.renderLeafletMap = function (lat, long) {
        var _this = this;
        var mapCenter = [lat, long];
        var zoomLevel = 8;
        this.leafletMap =
            react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement(semantic_ui_react_1.Label, { pointing: "below" }, "Click on a spot"),
                react_1["default"].createElement(react_leaflet_1.Map, { center: mapCenter, zoom: zoomLevel, onclick: function (e) { return _this.onMapClicked(e); } },
                    react_1["default"].createElement(react_leaflet_1.TileLayer, { attribution: '\u00A9 <a href="http://osm.org/copyright">OpenStreetMap</a> contributors', url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png' }),
                    react_1["default"].createElement(react_leaflet_1.Marker, { position: this.markerPos },
                        react_1["default"].createElement(react_leaflet_1.Popup, null,
                            react_1["default"].createElement("span", null,
                                mapCenter[0],
                                react_1["default"].createElement("br", null),
                                mapCenter[1])))));
    };
    /****************************** RENDER APP ******************************/
    App.prototype.componentDidMount = function () {
        // check access_token
        this.loggedIn = (window.location.pathname.split("/")[1] == "") ? false : true;
        console.log("logged in", this.loggedIn);
        // var req = new XMLHttpRequest();
        // req.open('GET', window.location.pathname, false);
        // req.send(null);
        // var headers = req.getAllResponseHeaders().toLowerCase();
        if (this.loggedIn) {
            this.setSpotifyDetails();
            // this.getCurrentLocation(false);
            this.getCurrentLocation();
            // this.renderLeafletMap(true);
            this.renderLocationOptions();
            // this.renderAskSection();
        }
    };
    App.prototype.renderLocationOptions = function () {
        var _this = this;
        this.locationSection = (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement(semantic_ui_react_1.Header, null, "Step 1. Choose a location "),
            react_1["default"].createElement("div", { className: "location-options" },
                react_1["default"].createElement(semantic_ui_react_1.Input, { className: "location-input", placeholder: "Enter city name", onChange: function (event) { return _this.setChosenCity(event.target.value); } }),
                react_1["default"].createElement(semantic_ui_react_1.Button, { primary: true, className: "search-location-btn", onClick: function () { return _this.onSearch(); } }, "Search"),
                react_1["default"].createElement(semantic_ui_react_1.Button, { className: "use-location-btn", onClick: function () { return _this.onUseLocation(); } }, "Use my location"))));
    };
    App.prototype.renderAskSection = function () {
        var _this = this;
        this.askCustomiseSection = (react_1["default"].createElement(Fade_1["default"], { top: true },
            react_1["default"].createElement("section", { className: "step ask" },
                react_1["default"].createElement("div", { className: "customize-question" },
                    react_1["default"].createElement(semantic_ui_react_1.Header, { className: "question" }, "Would you like to customise the playlist?"),
                    react_1["default"].createElement("div", { className: "buttons" },
                        react_1["default"].createElement(semantic_ui_react_1.Button, { onClick: function () { return _this.renderPlaylistOptions(); } }, "Yes"),
                        react_1["default"].createElement(semantic_ui_react_1.Button, { onClick: function () { return _this.makePlaylist(false); }, primary: true }, " No, make my playlist!"))))));
    };
    App.prototype.renderPlaylistOptions = function () {
        var _this = this;
        var numTracks = [];
        var countryMarket = [
            { key: 0, text: "(" + this.currentLocation.country + ") Market", value: this.currentLocation.country }
        ];
        if (this.chosenLocation.country != "" && this.chosenLocation.country != this.currentLocation.country) {
            countryMarket.push({ key: 1, text: "(" + this.chosenLocation.country + ") Market", value: this.chosenLocation.country });
        }
        for (var i = 1; i <= 50; i++) {
            numTracks.push({ key: i, text: i, value: i });
        }
        this.customiseSection = (react_1["default"].createElement(Fade_1["default"], { top: true },
            react_1["default"].createElement("section", { className: "step customise" },
                react_1["default"].createElement(semantic_ui_react_1.Header, null, "Step 2. Customise Playlist Options"),
                react_1["default"].createElement("div", { className: "playlist-options" },
                    react_1["default"].createElement(semantic_ui_react_1.Input, { className: "playlist-input", label: "Name", labelPosition: "left", onChange: function (e) { return _this.setPlaylistOptionInput("name", e); } }),
                    react_1["default"].createElement(semantic_ui_react_1.Input, { className: "playlist-input", label: "Description", labelPosition: "left", onChange: function (e) { return _this.setPlaylistOptionInput("description", e); } }),
                    react_1["default"].createElement("div", { className: "last-row" },
                        react_1["default"].createElement("div", { className: "other-options" },
                            react_1["default"].createElement(semantic_ui_react_1.Dropdown, { className: "playlist-size", placeholder: "Number of tracks", selection: true, options: numTracks, onChange: function (e, value) { return _this.setPlaylistOptionDropdown("numOfTracks", value); } }),
                            react_1["default"].createElement(semantic_ui_react_1.Dropdown, { className: "playlist-market", placeholder: "Country Market", selection: true, options: countryMarket, onChange: function (e, value) { return _this.setPlaylistOptionDropdown("countryMarket", value); } }),
                            react_1["default"].createElement("div", { className: "public-div" },
                                react_1["default"].createElement(semantic_ui_react_1.Label, { className: "public-label" }, "Make Public?"),
                                react_1["default"].createElement(semantic_ui_react_1.Checkbox, { className: "playlist-public", toggle: true, onChange: function (e, checked) { return _this.setPlaylistPublic(checked); } }))),
                        react_1["default"].createElement(semantic_ui_react_1.Button, { onClick: function () { return _this.makePlaylist(true); }, className: "make-btn", primary: true }, "Make playlist"))))));
    };
    App.prototype.renderSpotifyPlaylist = function () {
        this.playlistSection = (react_1["default"].createElement("section", { className: "step" },
            react_1["default"].createElement("iframe", { src: "https://open.spotify.com/embed/playlist/" + this.spotify.playlistId, width: "300", height: "380", frameBorder: "0", allowTransparency: true, allow: "encrypted-media" })));
    };
    App.prototype.render = function () {
        if (this.loggedIn) {
            console.log("current", this.currentLocation.country);
            console.log("chosen", this.chosenLocation.country);
            return (react_1["default"].createElement("div", { className: "main-page" },
                react_1["default"].createElement("div", { className: "header-div" },
                    react_1["default"].createElement("img", { className: "header-img", src: cloud_logo_png_1["default"] }),
                    react_1["default"].createElement(semantic_ui_react_1.Header, { className: "main-header", as: 'h1' }, "sounds n clouds")),
                react_1["default"].createElement("div", { className: "body-div" },
                    react_1["default"].createElement("section", { className: "step location" },
                        react_1["default"].createElement("div", { className: "location-section" },
                            this.locationSection,
                            react_1["default"].createElement("div", { className: "map" }, this.leafletMap)),
                        this.weatherSection),
                    this.askCustomiseSection,
                    this.customiseSection,
                    this.playlistSection)));
        }
        else {
            return (react_1["default"].createElement("div", { className: "login-page" },
                react_1["default"].createElement("div", { className: "header-div" },
                    react_1["default"].createElement("img", { className: "header-img", src: cloud_logo_png_1["default"] }),
                    react_1["default"].createElement(semantic_ui_react_1.Header, { className: "login-header", as: 'h1' }, "sounds n clouds")),
                react_1["default"].createElement("div", { className: "login-body" },
                    react_1["default"].createElement(semantic_ui_react_1.Label, { className: "login-blurb", pointing: "below" },
                        "to use ",
                        react_1["default"].createElement("i", null, "sounds n clouds"),
                        " you must log in to spotify :)"),
                    react_1["default"].createElement("img", { className: "login-gif", src: login_gif_gif_1["default"] }),
                    react_1["default"].createElement(semantic_ui_react_1.Button, { className: "login-btn", onClick: function () { return window.location.href = "http://localhost:9000/auth/login"; } }, "okay, log me in"))));
        }
    };
    __decorate([
        mobx_1.observable
    ], App.prototype, "playlistOptions");
    __decorate([
        mobx_1.observable
    ], App.prototype, "weather");
    __decorate([
        mobx_1.observable
    ], App.prototype, "currentLocation");
    __decorate([
        mobx_1.observable
    ], App.prototype, "chosenLocation");
    __decorate([
        mobx_1.observable
    ], App.prototype, "spotify");
    __decorate([
        mobx_1.observable
    ], App.prototype, "markerPos");
    __decorate([
        mobx_1.observable
    ], App.prototype, "currentLocationClicked");
    __decorate([
        mobx_1.observable
    ], App.prototype, "spotifyOutput");
    __decorate([
        mobx_1.observable
    ], App.prototype, "leafletMap");
    __decorate([
        mobx_1.observable
    ], App.prototype, "playlistSection");
    __decorate([
        mobx_1.observable
    ], App.prototype, "askCustomiseSection");
    __decorate([
        mobx_1.observable
    ], App.prototype, "customiseSection");
    __decorate([
        mobx_1.observable
    ], App.prototype, "locationSection");
    __decorate([
        mobx_1.observable
    ], App.prototype, "weatherSection");
    __decorate([
        mobx_1.observable
    ], App.prototype, "spotifyToken");
    __decorate([
        mobx_1.observable
    ], App.prototype, "loggedIn");
    __decorate([
        mobx_1.action
    ], App.prototype, "setSpotifyDetails");
    __decorate([
        mobx_1.action
    ], App.prototype, "getCurrentLocation");
    __decorate([
        mobx_1.action
    ], App.prototype, "onSearch");
    __decorate([
        mobx_1.action
    ], App.prototype, "onUseLocation");
    __decorate([
        mobx_1.action
    ], App.prototype, "onMapClicked");
    __decorate([
        mobx_1.action
    ], App.prototype, "setChosenCity");
    __decorate([
        mobx_1.action
    ], App.prototype, "renderWeather");
    __decorate([
        mobx_1.action
    ], App.prototype, "renderWeatherWeek");
    __decorate([
        mobx_1.action
    ], App.prototype, "setPlaylistOptionDropdown");
    __decorate([
        mobx_1.action
    ], App.prototype, "setPlaylistPublic");
    __decorate([
        mobx_1.action
    ], App.prototype, "setPlaylistOptionInput");
    __decorate([
        mobx_1.action
    ], App.prototype, "setOutput");
    __decorate([
        mobx_1.action
    ], App.prototype, "renderLeafletMap");
    __decorate([
        mobx_1.action
    ], App.prototype, "renderLocationOptions");
    __decorate([
        mobx_1.action
    ], App.prototype, "renderAskSection");
    __decorate([
        mobx_1.action
    ], App.prototype, "renderPlaylistOptions");
    __decorate([
        mobx_1.action
    ], App.prototype, "renderSpotifyPlaylist");
    App = __decorate([
        mobx_react_1.observer
    ], App);
    return App;
}(react_1.Component));
exports["default"] = App;
