import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddressSelectionPage } from './address-selection-page';

@NgModule({
  declarations: [
    AddressSelectionPage,
  ],
  imports: [
    IonicPageModule.forChild(AddressSelectionPage),
  ],
  exports: [
    AddressSelectionPage
  ]
})
export class AddressSelectionPageModule {}
