import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpModule } from "@angular/http";
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonPullupModule } from 'ionic-pullup';
import { IonicStorageModule } from "@ionic/storage";
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { CategoryApi } from "../shared/category-api.service";
import { DataSharingService } from "../shared/data-sharing.service";
import { GeocodingService } from "../shared/geocoding.service";
import { HomePage, AddressSelectionPage, CategorySelectionPage, MapPage } from '../shared/pages';
@NgModule({
  declarations: [
    MyApp,
    HomePage, AddressSelectionPage, CategorySelectionPage, MapPage
  ],
  imports: [
    BrowserModule, HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot({
      name: '_tourguidedb',
      driverOrder: ['indexeddb', 'sqlite']
    }),
    IonPullupModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage, AddressSelectionPage, CategorySelectionPage, MapPage
  ],
  providers: [
    StatusBar,
    SplashScreen, GeocodingService, DataSharingService, CategoryApi,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
