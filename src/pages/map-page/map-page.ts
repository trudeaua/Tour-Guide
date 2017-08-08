import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Loading, Events } from 'ionic-angular';
import { IonPullUpFooterState } from "ionic-pullup";
import { DataSharingService } from '../../shared/data-sharing.service';
import { CategoryApi } from '../../shared/category-api.service';
import { HomePage } from "../../shared/pages";

declare var google: any;

@IonicPage()
@Component({
  selector: 'page-map-page',
  templateUrl: 'map-page.html',
})
export class MapPage {
  activeTab: string;
  convertedWaypts: any[];
  directionsDisplay: any;
  footerState: IonPullUpFooterState;
  hbLoc: any;
  infoWindows: any[];
  legs: any[];
  loading: Loading;
  map: any;
  markers: any[];
  routeInfo: any;
  travelMode: string;
  waypointLocs: any[];

  constructor(
    private alertCtrl: AlertController,
    private categoryApi: CategoryApi,
    private dataSharing: DataSharingService,
    private events: Events,
    private loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public navParams: NavParams) {

    this.footerState = IonPullUpFooterState.Collapsed;
    this.waypointLocs = this.navParams.data.waypointLocs;
    this.convertedWaypts = [];
    for (let i = 0; i < this.waypointLocs.length; i++) {
      this.convertedWaypts.push({
        location: '' + this.waypointLocs[i].latitude + ', ' + this.waypointLocs[i].longitude,
        stopover: true
      });
    }

    this.hbLoc = this.navParams.data.hbLoc;
  }
  /**
   * fires when the footer expands
   */
  footerExpanded() {
    console.log('expanded');
  }
  /**
   * fires when the footer collapses
   */
  footerCollapsed() {
    console.log('collapsed');
  }
  /**
   * toggle the footer state
   */
  toggleFooter() {
    this.footerState = this.footerState == IonPullUpFooterState.Collapsed ? IonPullUpFooterState.Expanded : IonPullUpFooterState.Collapsed;
  }
  /**
   * not to be confused with ionViewDidLoad(), although its similar
   * refreshes the route being displayed and makes the tabs work
   */
  viewDidLoad() {
    console.log('ionViewDidLoad MapPage');
    let loader = this.loadingCtrl.create({
      content: 'Loading...'
    });
    loader.present().then(() => {
      this.hbLoc = this.navParams.data.hbLoc;
      this.waypointLocs = this.navParams.data.waypointLocs;
      this.convertedWaypts = [];
      for (let i = 0; i < this.waypointLocs.length; i++) {
        this.convertedWaypts.push({
          location: '' + this.waypointLocs[i].latitude + ', ' + this.waypointLocs[i].longitude,
          stopover: true
        });
      }
      loader.dismiss();
    });
  }
  viewOnMap(leg: any) {
    this.toggleFooter();
    this.map.panTo({lat: leg.Start.latitude, lng: leg.Start.longitude});
    this.map.setZoom(17);
  }
  /**
   * initialize map, directions, and segments
   */
  ionViewDidEnter() {
    this.travelMode = 'DRIVING';
    this.activeTab = 'car';
    this.events.subscribe('routeInfo:changed', () => {
      this.routeInfo = this.dataSharing.getRouteInfo();
      this.legs = [];
      for (let i = 0; i < this.routeInfo.Segments.length; i++) {
        this.legs.push(
          {
            Instructions: this.routeInfo.Segments[i].Instructions,
            Label: this.routeInfo.Segments[i].Label,
            Name: this.routeInfo.Segments[i].Waypoint.name,
            Start: this.routeInfo.Segments[i].Start,
            Travel: this.routeInfo.Segments[i].Travel
          }
        );
      }
      console.log(this.legs);
    });
    this.initMap();
  }
  /**
   * initialize the map
   */
  initMap() {
    this.map = new google.maps.Map(document.getElementById('map'));
    this.directionsDisplay = new google.maps.DirectionsRenderer({ suppressMarkers: true });
    this.initDirections();
  }
  /**
   * initialize directions
   */
  initDirections() {
    var directionsService = new google.maps.DirectionsService;
    this.directionsDisplay.setMap(null);
    this.markers = [];
    this.infoWindows = [];
    this.calculateAndDisplayRoute(directionsService, this.directionsDisplay, this.travelMode);
  }
  /**
   * Calculate the direcitons route and display it on the map
   * @param directionsService An instance of google.maps.DirectionsService
   * @param directionsDisplay An instance of google.maps.DirectionsDisplay
   * @param travelMode The travel mode
   */
  calculateAndDisplayRoute(directionsService, directionsDisplay, travelMode) {
    var self = this;

    //init direcitons route
    directionsService.route({
      origin: { lat: this.hbLoc.latitude, lng: this.hbLoc.longitude },
      destination: { lat: this.hbLoc.latitude, lng: this.hbLoc.longitude },
      waypoints: this.convertedWaypts,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode[travelMode],
      unitSystem: google.maps.UnitSystem.METRIC
    }, function (response, status) {
      if (status === 'OK') {
        //now its time for the directions segments
        var directions = {
          Segments: []
        };
        self.waypointLocs = self.waypointLocs;
        var route = response.routes[0];
        let waypointOrder = [];
        for (let i = 0; i < route.waypoint_order.length; i++) {
          waypointOrder.push(self.waypointLocs[route.waypoint_order[i]]);
        }
        let trip = waypointOrder.concat(self.hbLoc);
        let tripOrder = [self.hbLoc].concat(waypointOrder);
        //add all legs of the route to segments
        for (var i = 0; i < route.legs.length; i++) {
          directions.Segments.push({
            Start: tripOrder[i],
            Label: String.fromCharCode(65 + i),
            End: route.legs[i].end_address,
            Travel: route.legs[i].distance.text,
            Duration: route.legs[i].duration.text,
            Instructions: [],
            Waypoint: trip[i]
          });
          //add marker for all points on route
          self.markers.push(new google.maps.Marker({
            position: { lat: route.legs[i].start_location.lat(), lng: route.legs[i].start_location.lng() },
            map: self.map,
            label: String.fromCharCode(65 + i)
          }));
          for (var j = 0; j < route.legs[i].steps.length; j++) {
            if (j + 1 >= route.legs[i].steps.length) {
              directions.Segments[i].Instructions.push(
                route.legs[i].steps[j].instructions.replace('Destination', '<br><b>' + trip[i].name + '</b>')
              );
            }
            else {
              directions.Segments[i].Instructions.push(route.legs[i].steps[j].instructions);
            }
          }
        }
        //add info window for hbLoc
        self.infoWindows.push(new google.maps.InfoWindow({
          content: self.hbLoc.name
        }));
        //add info windows for all other markers
        for (let i = 1; i < route.waypoint_order.length + 1; i++) {
          self.infoWindows.push(new google.maps.InfoWindow({
            content: self.waypointLocs[route.waypoint_order[i - 1]].name,
          }));
        }
        //add click events to all markers
        for (let i = 0; i < self.markers.length; i++) {
          self.markers[i].addListener('click', function () {
            self.infoWindows[i].open(self.map, self.markers[i]);
          });
        }
        //now get total time and total dist
        let hours = 0;
        let minutes = 0;
        let kms = 0;
        let m = 0;
        for (let i = 0; i < directions.Segments.length; i++) {
          //some string manipulation to get time and dist
          let split: string[] = directions.Segments[i].Duration.split(' ');
          if (split[1].substring(0, 4) == 'hour') {
            hours += Number.parseFloat(split[0]);
            minutes += Number.parseFloat(split[2]);
          }
          else {
            minutes += Number.parseFloat(split[0]);
          }
          split = directions.Segments[i].Travel.split(' ');
          if (split[1] == 'km') {
            kms += Number.parseFloat(split[0])
          }
          else {
            m += Number.parseFloat(split[0]);
          }
        }
        let hoursTemp;
        //some more string manipulation to get total time and dist and add to DOM
        if (minutes > 59) {
          hoursTemp = Math.floor(minutes / 60);
          minutes = Math.floor((minutes - (hoursTemp * 60)));
        }
        hours += hoursTemp;
        document.getElementById('totalTime').innerHTML = hours > 0 ? hours + " hr " + minutes + " min" : minutes + " min";
        document.getElementById('totalDist').innerHTML = kms > 0 ? "(" + (kms + m / 1000).toFixed(1) + " km)" : "( " + m.toFixed(0) + " m)";

        self.dataSharing.setRouteInfo(directions);
        self.events.publish('routeInfo:changed');

        directionsDisplay.setDirections(response);
        directionsDisplay.setMap(self.map);
        self.viewDidLoad();
      } else {
        //error msg
        let alert = self.alertCtrl.create({
          title: 'No results for this location.',
          subTitle: 'Please try entering a different location.',
          buttons: [
            {
              text: 'Okay',
              handler: () => {
                self.navCtrl.setRoot(HomePage);
              }
            }
          ]
        });
        alert.present();
      }
    });
  }
  /**
   * clear all map markers
   * @param markersArray An array of markers
   */
  clearOverlays(markersArray: any[], infoWindows: any[]) {
    for (let i = 0; i < markersArray.length; i++) {
      markersArray[i].setMap(null);
      infoWindows[i].setMap(null);
    }
    infoWindows.length = 0;
    markersArray.length = 0;
  }
  /**
   * let the user start a new tour, go back to address input page
   */
  startOver() {
    let alert = this.alertCtrl.create({
      title: 'Start Over?',
      subTitle: 'Would you like to generate a new tour?',
      buttons: [
        {
          text: 'Yes',
          handler: data => {
            this.navCtrl.setRoot(HomePage);
            this.dataSharing.setRouteInfo(null);
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    });
    alert.present();
  }
  /**
   * Change the directions' travel mode
   * @param travelMode The travel mode
   */
  changeTravelMode(travelMode: 'DRIVING' | 'WALKING' | 'BICYCLING') {
    if (travelMode != this.travelMode) {
      this.travelMode = travelMode;
      this.clearOverlays(this.markers, this.infoWindows);
      this.initDirections();
    }
  }
  /**
   * Determines which button is highlighted, active travel mode button is highlighted
   * @param travelMode The travel mode
   */
  whichTravelMode(travelMode: 'DRIVING' | 'WALKING' | 'BICYCLING') {
    return travelMode == this.travelMode;
  }

}
