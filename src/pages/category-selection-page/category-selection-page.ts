import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Loading, ToastController, Events } from 'ionic-angular';
import { Storage } from "@ionic/storage";

import { CategoryApi } from "../../shared/category-api.service";
import { DataSharingService } from "../../shared/data-sharing.service";
import { MapPage } from "../../shared/pages";

const MAX_RADIUS: number = 10;

@IonicPage()
@Component({
  selector: 'page-category-selection-page',
  templateUrl: 'category-selection-page.html',
})
export class CategorySelectionPage {
  categoryData: any;
  categories: string[] = [];
  enableBtn: boolean = true;
  hbLoc: {
    latitude: any;
    longitude: any;
    name: string;
  };
  load: Loading;
  selectedCategories: any[];
  rows: any[];
  tourString: string;
  waypointIds: string[];
  waypointLocs: any[];
  waypointNames: string[];

  constructor(
    private events: Events,
    private dataSharing: DataSharingService,
    public navCtrl: NavController,
    public navParams: NavParams,
    private categoryApi: CategoryApi,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private storage: Storage,
    private toastCtrl: ToastController) {

    this.events.subscribe("storage:set", () => {
      this.enableBtn = true;
    });

    this.enableBtn = this.dataSharing.getStorageIsSet();

    this.categoryData = this.navParams.data.categoryData;
    this.categories = this.navParams.data.categories;
    this.rows = this.navParams.data.rows;
    this.selectedCategories = [this.navParams.data.address];
    this.tourString = '';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CategorySelectionPage');
  }

  addToTrip(category: string) {
    if (this.selectedCategories.length < 23) {
      this.selectedCategories.push(category);
      let toast = this.toastCtrl.create({
        message: category + ' added to tour.',
        position: 'bottom',
        duration: 1500
      });
      toast.present();
    }
    else {
      let alert = this.alertCtrl.create({
        title: 'Cannot Add Anymore Categories',
        subTitle: 'The maximum number of allowed categories is 22.',
        buttons: [
          {
            text: 'Okay'
          }
        ]
      });
      alert.present();
    }
  }
  /**
   * Review category selections and go to map page
   */
  goToMap() {
    if (this.selectedCategories.length > 1) {

      let items = this.selectedCategories.slice(1);
      let itemList = "";
      for (let i = 0; i < items.length; i++) {
        itemList += "-" + items[i];
        if (i + 1 < items.length) {
          itemList += "<br>"
        }
      }
      let review = this.alertCtrl.create({
        title: 'Review Your Tour',
        subTitle: 'Are you sure you want to see the following categories on your tour? <br>Please note that all categories may not be present in your current area.',
        message: itemList,
        buttons: [
          {
            text: "Yes, Generate My Tour",
            handler: data => {
              //find locations within radius and closest to user
              this.load = this.loadingCtrl.create({
                content: 'Generating your tour...',
                spinner: 'crescent'
              });
              this.load.present();

              this.waypointIds = [];
              this.waypointLocs = [];
              this.hbLoc = {
                latitude: this.selectedCategories[0].geometry.location.lat(),
                longitude: this.selectedCategories[0].geometry.location.lng(),
                name: this.selectedCategories[0].formatted_address
              };
              this.waypointNames = this.selectedCategories.slice(1);
              //get waypoint ids to retrieve data from storage
              for (let i = 0; i < this.waypointNames.length; i++) {
                for (var key in this.categoryData) {
                  if (this.waypointNames[i].indexOf(this.categoryData[key].name) > -1 && this.waypointIds.indexOf(this.categoryData[key].id) < 0) {
                    this.waypointIds.push(this.categoryData[key].id);
                  }
                }
              }
              this.getMultipleCategoryData(this.waypointIds);
            }
          },
          {
            text: "No, I Want To Start Over",
            role: 'cancel',
            handler: data => {
              this.selectedCategories = [this.navParams.data.address];
            }
          }
        ]
      });
      review.present();
    }
  }
  getMultipleCategoryData(categoryIds: string[]) {
    let promises: Promise<any>[] = [];
    for (let i = 0; i < this.waypointIds.length; i++) {
      promises.push(this.storage.get(this.waypointIds[i]));
    }
    //so now we've fetched all data from each selected category
    Promise.all(promises)
      .then(dataArr => {
        //now we have an array of all the unparsed data, so loop through it
        for (let categoryIndex = 0; categoryIndex < dataArr.length; categoryIndex++) {
          let dataArray = JSON.parse(dataArr[categoryIndex]);
          let occurences = this.occurences(dataArray.category.name, this.waypointNames);
          let filteredLocs = dataArray.locations.filter(loc => this.distanceTo(loc, this.hbLoc) < MAX_RADIUS);
          let foundLocs = [];
          //fill filteredLocs with first n, n = occurences, entries of data 
          for (let n = 0; n < occurences; n++) {
            if (filteredLocs[n] != undefined) {
              foundLocs[n] = filteredLocs[n];
            }
          }
          //find locations closest to hbLoc (homebase location), and add them to waypoints array
          for (let j = 0; j < foundLocs.length; j++) {
            for (let k = 0; k < filteredLocs.length; k++) {
              if (this.distanceTo(this.hbLoc, filteredLocs[k]) < this.distanceTo(this.hbLoc, foundLocs[j]) && foundLocs.indexOf(filteredLocs[k]) < 0) {
                foundLocs[j] = filteredLocs[k];
              }
            }
          }
          if (foundLocs.length > 0 && foundLocs.indexOf(undefined) < 0) {
            for (let m = 0; m < foundLocs.length; m++) {
              this.waypointLocs.push(foundLocs[m]);
            }
          }

        }
      }).then(() => {
        let params = { waypointLocs: this.waypointLocs, hbLoc: this.hbLoc };
        this.navCtrl.setRoot(MapPage, params);
        this.load.dismiss();
      }).catch(err => console.error(err));
  }
  /**
   * calculates the distance bewteen latitude-longitude pairs (accounting for curvature of earth)
   */
  distanceTo(loc1, loc2) {
    let earthR = 6371;
    let longDiff = this.toRad(loc1.longitude - loc2.longitude);
    let latDiff = this.toRad(loc1.latitude - loc2.latitude);

    let a = Math.sin(latDiff / 2) * Math.sin(latDiff / 2) + Math.cos(this.toRad(loc2.latitude)) *
      Math.cos(this.toRad(loc1.latitude)) * Math.sin(longDiff / 2) * Math.sin(longDiff / 2);
    return (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))) * earthR;
  }
  /**
   * convert degrees to radians
   */
  toRad(deg) {
    return deg * (Math.PI / 180);
  }
  /**
   * Returns the total occurences of category within array
   * @param category the category name
   * @param array the array of selected categories
   */
  occurences(category: string, array: string[]) {
    let count = 0;
    for (let i = 0; i < array.length; i++) {
      if (category == array[i]) {
        count++;
      }
    }
    return count;
  }
}
