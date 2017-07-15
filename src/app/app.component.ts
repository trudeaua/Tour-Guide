import { Component } from '@angular/core';
import { Events, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from "@ionic/storage";

import { CategoryApi } from "../shared/category-api.service";
import { DataSharingService } from "../shared/data-sharing.service";
import { HomePage } from '../pages/home/home';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = HomePage;
  allCategoryData: any;
  categories: any[];
  ids: any[];

  constructor(private dataSharing: DataSharingService, private categoryApi: CategoryApi, private events: Events, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, private storage: Storage) {
    platform.ready().then(() => {
      //checks for an update to categories
      //ideally we'd want to send a notification to let the app know to update the db, but whatever this works fine
      //as long as we change the categories in the db. 
      this.categoryApi.getCategories().then((data: any[]) => {
        this.storage.keys().then(keys => {
          if (keys.length - 1 == data.length) {
            for (let i = 0; i < data.length; i++) {
              if (keys.indexOf(data[i].id) < 0) {
                this.getCategories();
                this.getAllCategoryData();
                break;
              }
            }
            //if the user navigates real fast, the "Generate" btn on category-selection.page is disabled
            //until this fires
            this.events.publish("storage:set");
            this.dataSharing.setStorageIsSet(true);
          }
          else {
            this.getCategories();
            this.getAllCategoryData();
          }
        });
      }).catch(err => console.error(err));

      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
  /**
   * get all categories from firebase 
   */
  getCategories() {
    this.categoryApi.getCategories().then((data: any[]) => {
      this.addCategoriesToStorage(data);
    }).catch(err => console.log(err));
  }
  /**
   * get all data associated with each category from firebase
   */
  getAllCategoryData() {
    this.categoryApi.getAllCategoryData().then(data => {
      this.addAllCategoryDataToStorage(data);
    }).catch(err => console.error(err));
  }
  /**
   * Add all categories to storage
   * @param data Data to be stored
   */
  addCategoriesToStorage(data) {
    return new Promise(resolve => {
      this.storage.set("allcategories", JSON.stringify(data)).then(() => {
        resolve();
      });
    });
  }
  /**
   * Add all category data to storage
   * @param categoryData Data to be stored
   */
  addAllCategoryDataToStorage(categoryData) {
    for (var key in categoryData) {

      this.addCategoryDataToStorage(categoryData[key].category.id, JSON.stringify(
        {
          category:
          {
            name: categoryData[key].category.name, id: categoryData[key].category.id
          },
          locations: categoryData[key].locations
        }
      ));
    }
    this.events.publish("storage:set");
    this.dataSharing.setStorageIsSet(true);
  }
  /**
   * Add an individual category data to storage
   * @param key key
   * @param val value
   */
  addCategoryDataToStorage(key, val) {
    return new Promise(resolve => {
      this.storage.set(key, val).then(() => {
        resolve();
      }).catch(err => console.error(err));
    });
  }

}

