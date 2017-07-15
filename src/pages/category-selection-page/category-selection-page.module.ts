import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CategorySelectionPage } from './category-selection-page';

@NgModule({
  declarations: [
    CategorySelectionPage,
  ],
  imports: [
    IonicPageModule.forChild(CategorySelectionPage),
  ],
  exports: [
    CategorySelectionPage
  ]
})
export class CategorySelectionPageModule {}
