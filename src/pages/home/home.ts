import { Component } from '@angular/core';
import { AlertController, NavController, NavParams, Events } from 'ionic-angular';
import { NgForm } from "@angular/forms";

import { AddressSelectionPage } from '../../shared/pages';
import { GeocodingService } from "../../shared/geocoding.service";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  address: string;
  addresses: any[];
  displayErrMsg: boolean;

  constructor(private alertCtrl: AlertController, private events: Events, public navCtrl: NavController, public navParams: NavParams, private geocoding: GeocodingService) { }
  /**
   * handle the address input from the user
   * @param form input data form
   */
  processData(form: NgForm) {
    if (form.value.inputAddress != '' && form.value != null) {
      this.address = form.value.inputAddress;
      this.displayErrMsg = false;
      let addressData = this.geocoding.geocodeInputAddress(this.address);
      if (addressData != null) {

        addressData.subscribe(results => {
          if (results.length > 0) {
            //there is at least 1 match!
            this.addresses = results;
            this.navCtrl.push(AddressSelectionPage, this.addresses);
          }
          else {
            //no matches...
            let alert = this.alertCtrl.create({
              title: 'No addresses found',
              subTitle: 'Please try entering another address',
              buttons: [
                {
                  text: 'Okay',
                  role: 'cancel'
                }
              ]
            });
            alert.present();
          }
        });

      }
      else {
        this.alertCtrl.create({
          title: 'Could Not Locate Address',
          subTitle: 'Please check your internet connection',
          buttons: [
            {
              text: 'Okay'
            }
          ]
        }).present();
      }
    }
    else {
      this.displayErrMsg = true;
    }
  }

}
