import React, { Component } from 'react';
import './stylesheets/App.scss';
import 'react-widgets/dist/css/react-widgets.css';
import 'semantic-ui-css/semantic.min.css'
import login_gif from './assets/login-gif.gif';
import logo from './assets/cloud-logo.png';
import Fade from 'react-reveal/Fade';
import { observable, action, observe } from "mobx";
import { observer } from "mobx-react";
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import { Input, Button, Label, Header, Dropdown, Checkbox } from 'semantic-ui-react'

export interface PlaylistProps{
  name:string;       
  description:string;
  numOfTracks:string; 
  countryMarket:string;
  public:boolean;
}

export interface WeatherProps{
  date?:string,
  index: number,
  id:number;
  city:string;
  country:string;
  iconCode:string;
  main:string;
  description:string;
  temp:string;
  clouds:number;
}

export interface LocationProps{
  city:string;
  country:string;
  lat:number;
  long:number;
}

export interface SpotifyProps{
  accessToken:string;
  userId:string;
  playlistId?:string;
}

@observer
class App extends Component{  
  // stores customised playlist options
  @observable
  private playlistOptions:PlaylistProps = {
    name: "default",
    description:"default",
    numOfTracks: "default",
    countryMarket: "default",
    public:false
  };
  
  // stores today's weather information
  @observable
  private currentWeather:WeatherProps = {
    id: 0,
    index: 0,
    city: "",
    country: "",
    iconCode: "",
    main: "",
    description: "",
    temp: "",
    clouds:0
  };

  // stores week's weather information in array
  @observable
  private forecast:WeatherProps[] = [];

  // stores weather chosen to make playlist from
  @observable
  private chosenWeather:WeatherProps = {
    id: 0,
    index: 0,
    city: "",
    country: "",
    iconCode: "",
    main: "",
    description: "",
    temp: "",
    clouds:0
  };
  
  // stores user's current location
  @observable
  private currentLocation:LocationProps = {
    city: "",
    country: "",
    lat: 0,
    long: 0
  };

  // stores location chosen to get weather from
  @observable
  private chosenLocation:LocationProps = {
    city: "",
    country: "",
    lat: 0,
    long: 0
  };

  // stores user's spotify information
  @observable
  private spotify:SpotifyProps = {
    accessToken: "",
    userId:""
  }

  @observable
  private markerPos:LatLngTuple = [0,0];

  @observable
  private loggedIn:boolean = false;

  @observable
  private nextSteps:boolean = false;
  
  @observable
  private tokenExpired:boolean = false;

  // elements to render
  @observable
  private leafletMap = <></>;

  @observable
  private playlistSection = <></>;

  @observable
  private askCustomiseSection = <></>;

  @observable
  private customiseSection = <></>;

  @observable
  private locationSection = <></>;
  
  @observable
  private weatherSection = <></>;

  @observable
  private footer!: HTMLDivElement | null;  

  private hostName:string = window.location.hostname;


  /****************************** LOGIN ******************************/
  /** 
   * set spotify access token from endpoint
   */
  @action
  private setSpotifyDetails() {
    this.spotify.accessToken = window.location.pathname.split("/")[1].split("=")[1].split("&user_id")[0];
    this.spotify.userId = window.location.pathname.split("user_id=")[1];
  }

  /****************************** LOCATION ******************************/
  /**
   * get current location of user
   */
  @action
  private getCurrentLocation(){
    navigator.geolocation.getCurrentPosition((position) => {
      this.currentLocation.lat = parseFloat(position.coords.latitude.toPrecision());
      this.currentLocation.long = parseFloat(position.coords.longitude.toPrecision());
      this.markerPos = [this.currentLocation.lat, this.currentLocation.long];

      //fetch city and country of geolocation
      fetch(`http://${this.hostName}:9000/location/${this.currentLocation.lat}/${this.currentLocation.long}`)
        .then(res => res.json())
        .then(res => {
          // case of invalid geolocation
          if(res.error) {
            alert(`Error: ${res.error}`)
          }
          else {
            // assign current location to variable
            this.currentLocation.city = res.city;
            this.currentLocation.country = res.country;

            // re render leaflet map with current location as map center
            this.renderLeafletMap(this.currentLocation.lat, this.currentLocation.long);
          }
        })
    })
  }

  /** 
   * fetch weather information of chosen city
   */
  @action
  private onSearch() {
    fetch(`http://${this.hostName}:9000/weather/${this.chosenLocation.city}`)
      .then(res => res.json())
      .then(res => {
        // serverside error
        if(res.error) {
          alert(`Error: ${res.error}`);
        }
        else {
          // reset next steps if user has picked a new location
          if(this.weatherSection != <></>) this.resetToStep(1);

          // update chosen city geolocation and country
          this.chosenLocation.lat = res.lat;
          this.chosenLocation.long = res.long;
          this.chosenLocation.country = res.country;

          // assign current and chosen weather
          this.currentWeather = res;
          this.chosenWeather = res;

          // fetch weather forecast for this location
          this.fetchWeatherForecast(this.chosenLocation);

          // re render leaflet map of chosen geolocation
          this.markerPos = [this.chosenLocation.lat, this.chosenLocation.long];
          this.renderLeafletMap(this.chosenLocation.lat, this.chosenLocation.long);
        }
      })
      .catch(err => alert(err))
  }

  /** 
   * fetch weather information of current geolocation
   */
  @action
  private onUseLocation(){
    fetch(`http://${this.hostName}:9000/weather/${this.currentLocation.lat}/${this.currentLocation.long}`)
      .then(res => res.json())
      .then(res => {
          // serverside error
          if(res.error) {
            alert(`Error: ${res.error}`);
          }
          else {
            // reset next steps if user has picked a new location
            if(this.weatherSection != <></>) this.resetToStep(1);

            // assign current and chosen weather
            this.currentWeather = res;
            this.chosenWeather = res;
            this.chosenWeather.index = 0;

            // fetch weather forecast for this location
            this.fetchWeatherForecast(this.currentLocation);

            // re render leaflet map of current geolocation
            this.markerPos = [this.currentLocation.lat, this.currentLocation.long];
            this.renderLeafletMap(this.currentLocation.lat, this.currentLocation.long);
          }
        }
      )
  }

  /**
   * fetch weather information of geolocation clicked by user using map 
   * @param e: coordinates of clicked location
   */
  @action
  private onMapClicked(e:any) {
    // update marker position and chosen location variables
    this.markerPos = e.latlng;
    this.chosenLocation.lat = e.latlng.lat;
    this.chosenLocation.long = e.latlng.lng;

    // reset next steps if user has picked a new location
    if(this.weatherSection != <></>) this.resetToStep(1);
    
    fetch(`http://${this.hostName}:9000/weather/${this.chosenLocation.lat}/${this.chosenLocation.long}`)
      .then(res => res.json())
      .then(res => {
          // serverside error
          if(res.error) {
            alert(`Error: ${res.error}`);
          }
          else {
            // update chosen city and country from geolocation
            this.chosenLocation.city = res.city;
            this.chosenLocation.country = res.country;

            // assign current and chosen weather
            this.currentWeather = res;
            this.chosenWeather = res;

            // re render leaflet map of current geolocation
            this.renderLeafletMap(this.chosenLocation.lat, this.chosenLocation.long);

            // fetch weather forecast for this location
            this.fetchWeatherForecast(this.chosenLocation);
          }          
        }
      )
  }

  @action
  private setChosenCity(city:any){
    this.chosenLocation.city = city;
  }

  /****************************** WEATHER ******************************/  

  /**
   * fetch weather forecast for the next 7 days of given location
   * @param location
   */
  private fetchWeatherForecast(location:any) {
    // clear old forecasts;
    this.forecast = []; 

    fetch(`http://${this.hostName}:9000/weather/forecast/${location.lat}/${location.long}`)
    .then(res => res.json())
    .then(res => {
      // serverside error
      if(res.error) {
        alert(`Error: ${res.error}`);
      }

      // assign results to forecast array
      res.forEach((day, i) => {
        this.forecast.push({
          index: i+1, //i+1 because 0 is taken by current weather
          date: day.date,
          id: day.id,
          city: location.city,
          country: location.country,
          iconCode: day.iconCode,
          main: day.main,
          description: day.description,
          temp: day.temp,
          clouds: day.clouds
        })
      })

      // render weather section with no chosen index
      this.renderWeatherSection(-1);
    })
  }

  @action
  private onSetChosenWeather(weather:any){
    this.chosenWeather = weather;
    this.renderWeatherSection(weather.index);
    this.renderAskSection();
  }


  /********************************* PLAYLIST *********************************/
  /**
   * updates playlist option from dropdown inputs to value
   * @param option: market or number of tracks
   * @param event: new value
   */
  @action
  private setPlaylistOptionDropdown(option:string, event:any) {
    this.playlistOptions[option] = event.value;
  }

  /**
   * updates playlist publicity option 
   * @param event: true or false
   */
  @action
  private setPlaylistPublic(event:any) {
    this.playlistOptions.public = event.checked;
  }

  /**
   * updates playlist option from text inputs to value, updates to "default" if left blank
   * @param option: playlist name or description
   * @param event: new value
   */
  @action
  private setPlaylistOptionInput(option:string, event:any){
    this.playlistOptions[option] = event.target.value;
    this.playlistOptions[option] = (this.playlistOptions[option] == "") ? "default" : this.playlistOptions[option];
  }

  /**
   * fetches new playlist from chosen weather
   * @param customised: true or false
   */
  private makePlaylist(customised:boolean) {
    if(customised) {
      fetch(`http://${this.hostName}:9000/create/`+
              `${this.playlistOptions.name}/${this.playlistOptions.description}/${this.playlistOptions.numOfTracks}/${this.playlistOptions.countryMarket}/${this.playlistOptions.public}/` + 
              `${this.chosenWeather.id}/${this.chosenWeather.main}/${this.chosenWeather.description}/${this.chosenWeather.temp.split('°')[0]}/${this.chosenWeather.city}/${this.chosenWeather.clouds}/` + 
              `${this.spotify.userId}/${this.spotify.accessToken}`)
      .then(res => res.text())
      .then(res => {
        // case where country market doesn't exist
        if(res.includes("400")) {
          alert(res);
          this.resetToStep(3);
        }
        // case where access token has expired or user id is invalid
        else if(res.includes("Account Error")) {
          this.tokenExpired = true;
          alert(res);
        }
        // other spotify related error
        else if(res.includes("Error")){
          alert(res);
        }
        else {
          this.setPlaylist(res)
        }
      })
    }
    else {
      this.resetToStep(3)
      fetch(`http://${this.hostName}:9000/create/`+
            `${this.chosenWeather.id}/${this.chosenWeather.main}/${this.chosenWeather.description}/${this.chosenWeather.temp.split('°')[0]}/${this.chosenWeather.city}/${this.chosenWeather.clouds}/`+
            `${this.spotify.userId}/${this.spotify.accessToken}`)
      .then(res => res.text())
      .then(res => {
        // case where access token has expired or user id is invalid
        if(res.includes("Account Error")) {
          this.tokenExpired = true;
          alert(res);
        }
        // other spotify related error
        else if(res.includes("Error")){
          alert(res);
        }
        else {
          this.setPlaylist(res)
        }
      })
    }
  }
  
  @action
  private setPlaylist(value:string) {
    this.spotify.playlistId = value;
    this.renderPlaylistSection();
  }

  /****************************** RENDER APP ******************************/
  public componentDidMount() {
    // check access_token
    this.loggedIn = (window.location.pathname.split("/")[1] == "") ? false : true
    
    // start main application process if logged in
    if(this.loggedIn) {
      this.setSpotifyDetails();
      this.getCurrentLocation();
    }
  }

  public componentDidUpdate() {
    // if user has selected a location, scroll page to bottom to show next steps
    if(this.nextSteps) {
      this.scrollToBottom();
    }
  }

  private scrollToBottom() {
    return this.footer?.scrollIntoView({behavior:'smooth'});
  }

  private resetToStep(step:number) {
    // reset to customise option section
    if(step <= 4) {
      this.playlistSection = <></>;
    }
    // reset to ask customise section
    if(step <= 3) {
      this.playlistOptions = {
        name: "default",
        description:"default",
        numOfTracks: "default",
        countryMarket: "default",
        public:false
      };
      this.customiseSection = <></>;
    }
    // reset to weather forecast section
    if(step <= 2) {
      this.askCustomiseSection = <></>;
    }
    // reset to location section 
    if(step <= 1) {
      this.forecast = [];
      this.weatherSection = <></>;
    }
  }

  private keyPressed(e:any) {
    if(e.key == "Enter"){
      this.onSearch();
    }
  }
  
  private renderLeafletMap(lat:number, long:number) {
    let mapCenter:LatLngTuple = [lat, long];
    let zoomLevel = 8;

    this.leafletMap = (
      <div className="map">
        <Label pointing="below">you can click on the map to pick a location!</Label>
        <Map center={mapCenter} 
              zoom={zoomLevel} 
              onclick={(e) => this.onMapClicked(e)}
              minZoom={3}
              maxZoom={8}
              bounceAtZoomLimits={true}
        >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
            />
            <Marker position={this.markerPos}>
            <Popup>
              <span>{mapCenter[0]}<br/>{mapCenter[1]}</span>
            </Popup>
          </Marker> 
        </Map>
      </div>
    );

    this.renderLocationSection();
  }

  @action
  private renderLocationSection() {
    this.locationSection = (
        <Fade top>
          <section className="step-card">
            <div className="step-title">
              <Header className="step-header">location</Header>
            </div>

            <div className="step location">
              <div className="location-section">
                <div className="location-options">
                  <Input
                    className="location-input"
                    placeholder={"Enter city name"}
                    onKeyDown={(e) => this.keyPressed(e)}
                    onChange={(event) => this.setChosenCity(event.target.value)}
                  />

                  <Button 
                    primary={true} 
                    className="search-location-btn" 
                    onClick={() => this.onSearch()}
                  >
                  Search
                  </Button>

                  <Button 
                    secondary={true}
                    className="use-location-btn" 
                    onClick={() => this.onUseLocation()}
                  >
                    Use my location
                  </Button>              
                </div>
                {this.leafletMap}
                
            </div>
          </div>
        </section>
      </Fade>
    );
  }

  @action
  private renderWeatherSection(chosen:number) {
    this.nextSteps = true;
    if(this.askCustomiseSection != <></>) this.resetToStep(2);
    let header = (this.currentWeather.country == "") ? "Unknown Place" : `${this.currentWeather.city}, ${this.currentWeather.country}`;
    let todayIcon = "http://openweathermap.org/img/wn/" + this.currentWeather.iconCode + "@2x.png";
    let dailyWeather:any = [];
    let classNames = ["", "", "", "", "", "", "",""];
    
    // determine class name of each card depending on if they are the chosen weather
    for(let i = 0; i < 8; i++) {
      if(i == chosen) {
        classNames[i] = "weather-card selected";
      }
      else{
        classNames[i] = "weather-card";
      }
    }

    dailyWeather.push(
      <Fade top>
        <div className={classNames[0]} onClick={() => this.onSetChosenWeather(this.currentWeather)}>
            <Header className="title" as="h3">Today</Header>
            <img className="icon" src={todayIcon}></img>
            <div className="main">{this.currentWeather.main}</div>
            <div className="description">{this.currentWeather.description}</div> 
            <div className="temp">{this.currentWeather.temp}</div>   
        </div>
      </Fade>
    )

    this.forecast.forEach((day, i) => {
      let icon = "http://openweathermap.org/img/wn/" + day.iconCode + "@2x.png";

      dailyWeather.push(
        <Fade top>
          <div className={classNames[i+1]} onClick={() => this.onSetChosenWeather(day)}>
              <Header className="title" as="h3">{day.date}</Header>
              <img className="icon" src={icon}></img>
              <div className="main">{day.main}</div>
              <div className="description">{day.description}</div> 
              <div className="temp">{day.temp}</div>   
          </div>
        </Fade>
      )
    })

    this.weatherSection = (
      <Fade top>
        <section className="step-card">
          <div className="step-title">
              <Header className="step-header">weather</Header>
          </div>

          <div className="step weather">
            <div className="weather-section">
              <Header className="weather-header" as="h1">{header}</Header>
              <div className="weather-cards">
                {dailyWeather}
              </div> 
            </div>
          </div>
        </section>
      </Fade>
    );
  }

  @action
  private renderAskSection() {
    this.askCustomiseSection = (
      <Fade top>
        <section className="step-card">
          <div className="step ask">
            <div className="customize-question">
              <Header className="question">Would you like to customise the playlist?</Header>
              <div className="buttons">
                <Button onClick={() => this.renderCustomiseSection()} secondary={true}>Yes</Button>
                <Button onClick={() => this.makePlaylist(false)} primary={true}> No, make my playlist!</Button>
              </div>
            </div>
          </div>
        </section>
      </Fade>
    );
  }

  @action
  private renderCustomiseSection() {
    // reset playlist section if user changes their customise answer
    if(this.playlistSection != <></>) this.resetToStep(4);

    let numTracks:any = [];
    let countryMarket = [
      {key: 0, text: `(${this.currentLocation.country}) Market`, value: this.currentLocation.country}
    ];

    if(this.chosenLocation.country != "" && this.chosenLocation.country != this.currentLocation.country){
      countryMarket.push({key: 1, text: `(${this.chosenLocation.country}) Market`, value: this.chosenLocation.country});
    }

    for(let i = 1; i <= 50; i++) {
      numTracks.push({key: i, text: i, value: i});
    }

    this.customiseSection = (
      <Fade top>
        <section className="step-card">
          <div className="step-title">
            <Header className="step-header">options</Header>
          </div>

          <div className="step customise">
            <div className="playlist-options">
              <Input 
                className="playlist-input"
                label="Name"
                labelPosition="left"
                onChange={(e) => this.setPlaylistOptionInput("name", e)}
              />
              <Input 
                className="playlist-input"
                label="Description"
                labelPosition="left"
                onChange={(e) => this.setPlaylistOptionInput("description", e)}
              />

              <div className="last-row">
                <div className="other-options">
                    <Dropdown 
                      className="playlist-size"
                      placeholder="Number of tracks"
                      selection
                      options={numTracks}
                      onChange={(e, value) => this.setPlaylistOptionDropdown("numOfTracks", value)}
                    />

                    <Dropdown
                      className="playlist-market"
                      placeholder="Country Market"
                      selection
                      options={countryMarket}
                      onChange={(e, value) => this.setPlaylistOptionDropdown("countryMarket", value)}
                    />
                  
                    <div className="public-div">
                      <Label className="public-label">Make Public?</Label>
                      <Checkbox
                        className="playlist-public"
                        toggle={true}
                        onChange={(e, checked) => this.setPlaylistPublic(checked)}
                      />
                    </div>
                </div>

                <Button onClick={() => this.makePlaylist(true)} className="make-btn" primary={true}>Make playlist</Button>
              </div>
            </div>  
          </div>
        </section>
        
      </Fade>
    );
  }

  @action
  private renderPlaylistSection() {
    this.playlistSection = (
      <section className="step-card">
        <div className="step-title">
          <Header className="step-header">playlist!</Header>
        </div>
        <div className="step playlist">
          <iframe className="spotify" src={`https://open.spotify.com/embed/playlist/${this.spotify.playlistId}`} frameBorder="0" allowTransparency={true} allow="encrypted-media"></iframe>
        </div>
      </section>
    );
  }

  render() {
    console.log(window.location.hostname);
    // render main page if user has logged in to spotify
    if(this.loggedIn && !this.tokenExpired) {
      return (
        <div className="main-page">
          <div className="header-div">
            <img className="header-img" src={logo}></img>
            <Header className="main-header" as='h1'>sounds n clouds</Header>
          </div>
          
          <div className="body-div">
            {this.locationSection}
            {this.weatherSection}
            {this.askCustomiseSection}
            {this.customiseSection}
            {this.playlistSection}
          </div>    

          <div className="footer-div" ref={(el) => { this.footer = el; }}>
          </div>
        </div>
      )
    }
    // render log in page
    else {
      return(
        <div className="login-page">
          <div className="header-div">
            <img className="header-img" src={logo}></img>
            <Header className="login-header" as='h1'>sounds n clouds</Header>
          </div>

          <div className="login-body">
            <Label className={"login-blurb"} pointing="below">to use <i>sounds n clouds</i> you must log in to spotify :)</Label>
            <img className="login-gif" src={login_gif}></img>
            <Button className="login-btn" onClick={() => window.location.href = `http://${this.hostName}:9000/auth/login`}>okay, log me in</Button>
          </div>
        </div>
      )
    }
  }
}

export default App;
