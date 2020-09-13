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
        // stores customised playlist options
        _this.playlistOptions = {
            name: "default",
            description: "default",
            numOfTracks: "default",
            countryMarket: "default",
            public: false
        };
        // stores today's weather information
        _this.currentWeather = {
            id: 0,
            index: 0,
            city: "",
            country: "",
            iconCode: "",
            main: "",
            description: "",
            temp: "",
            clouds: 0
        };
        // stores week's weather information in array
        _this.forecast = [];
        // stores weather chosen to make playlist from
        _this.chosenWeather = {
            id: 0,
            index: 0,
            city: "",
            country: "",
            iconCode: "",
            main: "",
            description: "",
            temp: "",
            clouds: 0
        };
        // stores user's current location
        _this.currentLocation = {
            useCoords: false,
            city: "",
            country: "",
            lat: 0,
            long: 0
        };
        // stores location chosen to get weather from
        _this.chosenLocation = {
            useCoords: false,
            city: "",
            country: "",
            lat: 0,
            long: 0
        };
        // stores user's spotify information
        _this.spotify = {
            accessToken: "",
            userId: ""
        };
        _this.markerPos = [0, 0];
        _this.loggedIn = false;
        _this.nextSteps = false;
        _this.tokenExpired = false;
        // elements to render
        _this.leafletMap = react_1["default"].createElement(react_1["default"].Fragment, null);
        _this.playlistSection = react_1["default"].createElement(react_1["default"].Fragment, null);
        _this.askCustomiseSection = react_1["default"].createElement(react_1["default"].Fragment, null);
        _this.customiseSection = react_1["default"].createElement(react_1["default"].Fragment, null);
        _this.locationSection = react_1["default"].createElement(react_1["default"].Fragment, null);
        _this.weatherSection = react_1["default"].createElement(react_1["default"].Fragment, null);
        return _this;
    }
    /****************************** LOGIN ******************************/
    /**
     * set spotify access token from endpoint
     */
    App.prototype.setSpotifyDetails = function () {
        this.spotify.accessToken = window.location.pathname.split("/")[1].split("=")[1].split("&user_id")[0];
        this.spotify.userId = window.location.pathname.split("user_id=")[1];
    };
    /****************************** LOCATION ******************************/
    /**
     * get current location of user
     */
    App.prototype.getCurrentLocation = function () {
        var _this = this;
        navigator.geolocation.getCurrentPosition(function (position) {
            _this.currentLocation.lat = parseFloat(position.coords.latitude.toPrecision());
            _this.currentLocation.long = parseFloat(position.coords.longitude.toPrecision());
            _this.markerPos = [_this.currentLocation.lat, _this.currentLocation.long];
            //fetch city and country of geolocation
            fetch("http://localhost:9000/location/" + _this.currentLocation.lat + "/" + _this.currentLocation.long)
                .then(function (res) { return res.json(); })
                .then(function (res) {
                // case of invalid geolocation
                if (res.error) {
                    alert("Error: " + res.error);
                }
                else {
                    // assign current location to variable
                    _this.currentLocation.city = res.city;
                    _this.currentLocation.country = res.country;
                    // re render leaflet map with current location as map center
                    _this.renderLeafletMap(_this.currentLocation.lat, _this.currentLocation.long);
                }
            });
        });
    };
    /**
     * fetch weather information of chosen city
     */
    App.prototype.onSearch = function () {
        var _this = this;
        fetch("http://localhost:9000/weather/" + this.chosenLocation.city)
            .then(function (res) { return res.json(); })
            .then(function (res) {
            // serverside error
            if (res.error) {
                alert("Error: " + res.error);
            }
            else {
                // reset next steps if user has picked a new location
                if (_this.weatherSection != react_1["default"].createElement(react_1["default"].Fragment, null))
                    _this.resetToStep(1);
                // update chosen city geolocation and country
                _this.chosenLocation.lat = res.lat;
                _this.chosenLocation.long = res.long;
                _this.chosenLocation.country = res.country;
                // assign current and chosen weather
                _this.currentWeather = res;
                _this.chosenWeather = res;
                // fetch weather forecast for this location
                _this.fetchWeatherForecast(_this.chosenLocation);
                // re render leaflet map of chosen geolocation
                _this.markerPos = [_this.chosenLocation.lat, _this.chosenLocation.long];
                _this.renderLeafletMap(_this.chosenLocation.lat, _this.chosenLocation.long);
            }
        })["catch"](function (err) { return alert(err); });
    };
    /**
     * fetch weather information of current geolocation
     */
    App.prototype.onUseLocation = function () {
        var _this = this;
        fetch("http://localhost:9000/weather/" + this.currentLocation.lat + "/" + this.currentLocation.long)
            .then(function (res) { return res.json(); })
            .then(function (res) {
            // serverside error
            if (res.error) {
                alert("Error: " + res.error);
            }
            else {
                // reset next steps if user has picked a new location
                if (_this.weatherSection != react_1["default"].createElement(react_1["default"].Fragment, null))
                    _this.resetToStep(1);
                // assign current and chosen weather
                _this.currentWeather = res;
                _this.chosenWeather = res;
                _this.chosenWeather.index = 0;
                // fetch weather forecast for this location
                _this.fetchWeatherForecast(_this.currentLocation);
                // re render leaflet map of current geolocation
                _this.markerPos = [_this.currentLocation.lat, _this.currentLocation.long];
                _this.renderLeafletMap(_this.currentLocation.lat, _this.currentLocation.long);
            }
        });
    };
    /**
     * fetch weather information of geolocation clicked by user using map
     * @param e: coordinates of clicked location
     */
    App.prototype.onMapClicked = function (e) {
        var _this = this;
        // update marker position and chosen location variables
        this.markerPos = e.latlng;
        this.chosenLocation.lat = e.latlng.lat;
        this.chosenLocation.long = e.latlng.lng;
        // reset next steps if user has picked a new location
        if (this.weatherSection != react_1["default"].createElement(react_1["default"].Fragment, null))
            this.resetToStep(1);
        fetch("http://localhost:9000/weather/" + this.chosenLocation.lat + "/" + this.chosenLocation.long)
            .then(function (res) { return res.json(); })
            .then(function (res) {
            // serverside error
            if (res.error) {
                alert("Error: " + res.error);
            }
            else {
                // update chosen city and country from geolocation
                _this.chosenLocation.city = res.city;
                _this.chosenLocation.country = res.country;
                // assign current and chosen weather
                _this.currentWeather = res;
                _this.chosenWeather = res;
                // re render leaflet map of current geolocation
                _this.renderLeafletMap(_this.chosenLocation.lat, _this.chosenLocation.long);
                // fetch weather forecast for this location
                _this.fetchWeatherForecast(_this.chosenLocation);
            }
        });
    };
    App.prototype.setChosenCity = function (city) {
        this.chosenLocation.city = city;
    };
    /****************************** WEATHER ******************************/
    /**
     * fetch weather forecast for the next 7 days of given location
     * @param location
     */
    App.prototype.fetchWeatherForecast = function (location) {
        var _this = this;
        // clear old forecasts;
        this.forecast = [];
        fetch("http://localhost:9000/weather/forecast/" + location.lat + "/" + location.long)
            .then(function (res) { return res.json(); })
            .then(function (res) {
            // serverside error
            if (res.error) {
                alert("Error: " + res.error);
            }
            // assign results to forecast array
            res.forEach(function (day, i) {
                _this.forecast.push({
                    index: i + 1,
                    date: day.date,
                    id: day.id,
                    city: location.city,
                    country: location.country,
                    iconCode: day.iconCode,
                    main: day.main,
                    description: day.description,
                    temp: day.temp,
                    clouds: day.clouds
                });
            });
            // render weather section with no chosen index
            _this.renderWeatherSection(-1);
        });
    };
    App.prototype.onSetChosenWeather = function (weather) {
        this.chosenWeather = weather;
        this.renderWeatherSection(weather.index);
        this.renderAskSection();
    };
    /********************************* PLAYLIST *********************************/
    /**
     * updates playlist option from dropdown inputs to value
     * @param option: market or number of tracks
     * @param event: new value
     */
    App.prototype.setPlaylistOptionDropdown = function (option, event) {
        this.playlistOptions[option] = event.value;
    };
    /**
     * updates playlist publicity option
     * @param event: true or false
     */
    App.prototype.setPlaylistPublic = function (event) {
        this.playlistOptions.public = event.checked;
    };
    /**
     * updates playlist option from text inputs to value, updates to "default" if left blank
     * @param option: playlist name or description
     * @param event: new value
     */
    App.prototype.setPlaylistOptionInput = function (option, event) {
        this.playlistOptions[option] = event.target.value;
        this.playlistOptions[option] = (this.playlistOptions[option] == "") ? "default" : this.playlistOptions[option];
    };
    /**
     * fetches new playlist from chosen weather
     * @param customised: true or false
     */
    App.prototype.makePlaylist = function (customised) {
        var _this = this;
        if (customised) {
            fetch("http://localhost:9000/create/" +
                (this.playlistOptions.name + "/" + this.playlistOptions.description + "/" + this.playlistOptions.numOfTracks + "/" + this.playlistOptions.countryMarket + "/" + this.playlistOptions.public + "/") +
                (this.chosenWeather.id + "/" + this.chosenWeather.main + "/" + this.chosenWeather.description + "/" + this.chosenWeather.temp.split('°')[0] + "/" + this.chosenWeather.city + "/" + this.chosenWeather.clouds + "/") +
                (this.spotify.userId + "/" + this.spotify.accessToken))
                .then(function (res) { return res.text(); })
                .then(function (res) {
                // case where country market doesn't exist
                if (res.includes("400")) {
                    alert(res);
                    _this.resetToStep(3);
                }
                // case where access token has expired or user id is invalid
                else if (res.includes("Account Error")) {
                    _this.tokenExpired = true;
                    alert(res);
                }
                // other spotify related error
                else if (res.includes("Error")) {
                    alert(res);
                }
                else {
                    _this.setPlaylist(res);
                }
            });
        }
        else {
            this.resetToStep(3);
            fetch("http://localhost:9000/create/" +
                (this.chosenWeather.id + "/" + this.chosenWeather.main + "/" + this.chosenWeather.description + "/" + this.chosenWeather.temp.split('°')[0] + "/" + this.chosenWeather.city + "/" + this.chosenWeather.clouds + "/") +
                (this.spotify.userId + "/" + this.spotify.accessToken))
                .then(function (res) { return res.text(); })
                .then(function (res) {
                // case where access token has expired or user id is invalid
                if (res.includes("Account Error")) {
                    _this.tokenExpired = true;
                    alert(res);
                }
                // other spotify related error
                else if (res.includes("Error")) {
                    alert(res);
                }
                else {
                    _this.setPlaylist(res);
                }
            });
        }
    };
    App.prototype.setPlaylist = function (value) {
        this.spotify.playlistId = value;
        this.renderPlaylistSection();
    };
    /****************************** RENDER APP ******************************/
    App.prototype.componentDidMount = function () {
        // check access_token
        this.loggedIn = (window.location.pathname.split("/")[1] == "") ? false : true;
        if (this.loggedIn) {
            this.setSpotifyDetails();
            this.getCurrentLocation();
        }
    };
    App.prototype.componentDidUpdate = function () {
        // if user has selected a location, scroll page to bottom to show next steps
        if (this.nextSteps) {
            this.scrollToBottom();
        }
    };
    App.prototype.scrollToBottom = function () {
        var _a;
        return (_a = this.footer) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
    };
    App.prototype.resetToStep = function (step) {
        // reset to customise option section
        if (step <= 4) {
            this.playlistSection = react_1["default"].createElement(react_1["default"].Fragment, null);
        }
        // reset to ask customise section
        if (step <= 3) {
            this.playlistOptions = {
                name: "default",
                description: "default",
                numOfTracks: "default",
                countryMarket: "default",
                public: false
            };
            this.customiseSection = react_1["default"].createElement(react_1["default"].Fragment, null);
        }
        // reset to weather forecast section
        if (step <= 2) {
            this.askCustomiseSection = react_1["default"].createElement(react_1["default"].Fragment, null);
        }
        // reset to location section 
        if (step <= 1) {
            this.forecast = [];
            this.weatherSection = react_1["default"].createElement(react_1["default"].Fragment, null);
        }
    };
    App.prototype.keyPressed = function (e) {
        if (e.key == "Enter") {
            this.onSearch();
        }
    };
    App.prototype.renderLeafletMap = function (lat, long) {
        var _this = this;
        var mapCenter = [lat, long];
        var zoomLevel = 8;
        this.leafletMap =
            react_1["default"].createElement("div", { className: "map" },
                react_1["default"].createElement(semantic_ui_react_1.Label, { pointing: "below" }, "you can click on the map to pick a location!"),
                react_1["default"].createElement(react_leaflet_1.Map, { center: mapCenter, zoom: zoomLevel, onclick: function (e) { return _this.onMapClicked(e); } },
                    react_1["default"].createElement(react_leaflet_1.TileLayer, { attribution: '\u00A9 <a href="http://osm.org/copyright">OpenStreetMap</a> contributors', url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png' }),
                    react_1["default"].createElement(react_leaflet_1.Marker, { position: this.markerPos },
                        react_1["default"].createElement(react_leaflet_1.Popup, null,
                            react_1["default"].createElement("span", null,
                                mapCenter[0],
                                react_1["default"].createElement("br", null),
                                mapCenter[1])))));
        this.renderLocationSection();
    };
    App.prototype.renderLocationSection = function () {
        var _this = this;
        this.locationSection = (react_1["default"].createElement(Fade_1["default"], { top: true },
            react_1["default"].createElement("section", { className: "step-card" },
                react_1["default"].createElement("div", { className: "step-title" },
                    react_1["default"].createElement(semantic_ui_react_1.Header, { className: "step-header" }, "location")),
                react_1["default"].createElement("div", { className: "step location" },
                    react_1["default"].createElement("div", { className: "location-section" },
                        react_1["default"].createElement("div", { className: "location-options" },
                            react_1["default"].createElement(semantic_ui_react_1.Input, { className: "location-input", placeholder: "Enter city name", onKeyDown: function (e) { return _this.keyPressed(e); }, onChange: function (event) { return _this.setChosenCity(event.target.value); } }),
                            react_1["default"].createElement(semantic_ui_react_1.Button, { primary: true, className: "search-location-btn", onClick: function () { return _this.onSearch(); } }, "Search"),
                            react_1["default"].createElement(semantic_ui_react_1.Button, { secondary: true, className: "use-location-btn", onClick: function () { return _this.onUseLocation(); } }, "Use my location")),
                        this.leafletMap)))));
    };
    App.prototype.renderWeatherSection = function (chosen) {
        var _this = this;
        this.nextSteps = true;
        if (this.askCustomiseSection != react_1["default"].createElement(react_1["default"].Fragment, null))
            this.resetToStep(2);
        var header = (this.currentWeather.country == "") ? "Unknown Place" : this.currentWeather.city + ", " + this.currentWeather.country;
        var todayIcon = "http://openweathermap.org/img/wn/" + this.currentWeather.iconCode + "@2x.png";
        var dailyWeather = [];
        var classNames = ["", "", "", "", "", "", "", ""];
        // determine class name of each card depending on if they are the chosen weather
        for (var i = 0; i < 8; i++) {
            if (i == chosen) {
                classNames[i] = "weather-card selected";
            }
            else {
                classNames[i] = "weather-card";
            }
        }
        dailyWeather.push(react_1["default"].createElement(Fade_1["default"], { top: true },
            react_1["default"].createElement("div", { className: classNames[0], onClick: function () { return _this.onSetChosenWeather(_this.currentWeather); } },
                react_1["default"].createElement(semantic_ui_react_1.Header, { className: "title", as: "h3" }, "Today"),
                react_1["default"].createElement("img", { className: "icon", src: todayIcon }),
                react_1["default"].createElement("div", { className: "main" }, this.currentWeather.main),
                react_1["default"].createElement("div", { className: "description" }, this.currentWeather.description),
                react_1["default"].createElement("div", { className: "temp" }, this.currentWeather.temp))));
        this.forecast.forEach(function (day, i) {
            var icon = "http://openweathermap.org/img/wn/" + day.iconCode + "@2x.png";
            dailyWeather.push(react_1["default"].createElement(Fade_1["default"], { top: true },
                react_1["default"].createElement("div", { className: classNames[i + 1], onClick: function () { return _this.onSetChosenWeather(day); } },
                    react_1["default"].createElement(semantic_ui_react_1.Header, { className: "title", as: "h3" }, day.date),
                    react_1["default"].createElement("img", { className: "icon", src: icon }),
                    react_1["default"].createElement("div", { className: "main" }, day.main),
                    react_1["default"].createElement("div", { className: "description" }, day.description),
                    react_1["default"].createElement("div", { className: "temp" }, day.temp))));
        });
        this.weatherSection = (react_1["default"].createElement(Fade_1["default"], { top: true },
            react_1["default"].createElement("section", { className: "step-card" },
                react_1["default"].createElement("div", { className: "step-title" },
                    react_1["default"].createElement(semantic_ui_react_1.Header, { className: "step-header" }, "weather")),
                react_1["default"].createElement("div", { className: "step weather" },
                    react_1["default"].createElement("div", { className: "weather-section" },
                        react_1["default"].createElement(semantic_ui_react_1.Header, { className: "weather-header", as: "h1" }, header),
                        react_1["default"].createElement("div", { className: "weather-cards" }, dailyWeather))))));
    };
    App.prototype.renderAskSection = function () {
        var _this = this;
        this.askCustomiseSection = (react_1["default"].createElement(Fade_1["default"], { top: true },
            react_1["default"].createElement("section", { className: "step-card" },
                react_1["default"].createElement("div", { className: "step ask" },
                    react_1["default"].createElement("div", { className: "customize-question" },
                        react_1["default"].createElement(semantic_ui_react_1.Header, { className: "question" }, "Would you like to customise the playlist?"),
                        react_1["default"].createElement("div", { className: "buttons" },
                            react_1["default"].createElement(semantic_ui_react_1.Button, { onClick: function () { return _this.renderCustomiseSection(); }, secondary: true }, "Yes"),
                            react_1["default"].createElement(semantic_ui_react_1.Button, { onClick: function () { return _this.makePlaylist(false); }, primary: true }, " No, make my playlist!")))))));
    };
    App.prototype.renderCustomiseSection = function () {
        var _this = this;
        // reset playlist section if user changes their customise answer
        if (this.playlistSection != react_1["default"].createElement(react_1["default"].Fragment, null))
            this.resetToStep(4);
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
            react_1["default"].createElement("section", { className: "step-card" },
                react_1["default"].createElement("div", { className: "step-title" },
                    react_1["default"].createElement(semantic_ui_react_1.Header, { className: "step-header" }, "options")),
                react_1["default"].createElement("div", { className: "step customise" },
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
                            react_1["default"].createElement(semantic_ui_react_1.Button, { onClick: function () { return _this.makePlaylist(true); }, className: "make-btn", primary: true }, "Make playlist")))))));
    };
    App.prototype.renderPlaylistSection = function () {
        this.playlistSection = (react_1["default"].createElement("section", { className: "step-card" },
            react_1["default"].createElement("div", { className: "step-title" },
                react_1["default"].createElement(semantic_ui_react_1.Header, { className: "step-header" }, "playlist!")),
            react_1["default"].createElement("div", { className: "step playlist" },
                react_1["default"].createElement("iframe", { className: "spotify", src: "https://open.spotify.com/embed/playlist/" + this.spotify.playlistId, frameBorder: "0", allowTransparency: true, allow: "encrypted-media" }))));
    };
    App.prototype.render = function () {
        var _this = this;
        // render main page if user has logged in to spotify
        if (this.loggedIn && !this.tokenExpired) {
            return (react_1["default"].createElement("div", { className: "main-page" },
                react_1["default"].createElement("div", { className: "header-div" },
                    react_1["default"].createElement("img", { className: "header-img", src: cloud_logo_png_1["default"] }),
                    react_1["default"].createElement(semantic_ui_react_1.Header, { className: "main-header", as: 'h1' }, "sounds n clouds")),
                react_1["default"].createElement("div", { className: "body-div" },
                    this.locationSection,
                    this.weatherSection,
                    this.askCustomiseSection,
                    this.customiseSection,
                    this.playlistSection),
                react_1["default"].createElement("div", { className: "footer-div", ref: function (el) { _this.footer = el; } })));
        }
        // render log in page
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
    ], App.prototype, "currentWeather");
    __decorate([
        mobx_1.observable
    ], App.prototype, "forecast");
    __decorate([
        mobx_1.observable
    ], App.prototype, "chosenWeather");
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
    ], App.prototype, "loggedIn");
    __decorate([
        mobx_1.observable
    ], App.prototype, "nextSteps");
    __decorate([
        mobx_1.observable
    ], App.prototype, "tokenExpired");
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
    ], App.prototype, "footer");
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
    ], App.prototype, "onSetChosenWeather");
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
    ], App.prototype, "setPlaylist");
    __decorate([
        mobx_1.action
    ], App.prototype, "renderLocationSection");
    __decorate([
        mobx_1.action
    ], App.prototype, "renderWeatherSection");
    __decorate([
        mobx_1.action
    ], App.prototype, "renderAskSection");
    __decorate([
        mobx_1.action
    ], App.prototype, "renderCustomiseSection");
    __decorate([
        mobx_1.action
    ], App.prototype, "renderPlaylistSection");
    App = __decorate([
        mobx_react_1.observer
    ], App);
    return App;
}(react_1.Component));
exports["default"] = App;
