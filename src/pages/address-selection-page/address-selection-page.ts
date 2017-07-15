import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { CategorySelectionPage } from '../../shared/pages';
import { CategoryApi } from "../../shared/category-api.service";
import { Storage } from "@ionic/storage";

@IonicPage()
@Component({
  selector: 'page-address-selection-page',
  templateUrl: 'address-selection-page.html',
})
export class AddressSelectionPage {

  addresses: any[];

  constructor(public navCtrl: NavController, public navParams: NavParams, private categoryApi: CategoryApi, private storage: Storage) {
    this.addresses = this.navParams.data;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddressSelectionPage');
  }
  /**
   * Set the user's current address (or hbLoc) and retrieve all categories from storage
   * @param address input address
   */
  goToCategoriesPage(address: any) {
    this.storage.get("allcategories").then(data => {
      let categoryData = JSON.parse(data);
      let categories = [];
      for (var key in categoryData) {
        categories.push(categoryData[key].name);
      }
      //rows lets us do 3 rows for category display... looks v nice
      let rows = Array.from(Array(Math.ceil(categories.length / 3)).keys());
      let params = { address: address, categoryData: categoryData, categories: categories, rows: rows };
      this.navCtrl.push(CategorySelectionPage, params);
    }).catch(error => console.log('ERR', error));
  }

}
