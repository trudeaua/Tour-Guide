import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs';
import { Observable } from 'rxjs/Observable';
import { Storage } from "@ionic/storage";

@Injectable()
/**
 * a service that allows global access of the database at https://tour-guide-74328.firebaseio.com/
 * Based off of the elite-api.service.ts from Steve Michelotti's Ionic 2 Course on PluralSight
 */
export class CategoryApi {
    private baseUrl = 'https://tour-guide-74328.firebaseio.com/';
    currentCategory: any = {};
    currentLoc: any = {};
    private categoryData = {};

    constructor(private storage: Storage, private http: Http) { }
    /**
     * return all category objects containing their id and name
     */
    getCategories() {
        return new Promise(resolve => {
            this.http.request(`${this.baseUrl}/categories.json`)
                .subscribe(res => resolve(res.json()));
        });
    }
    getAllCategoryData() {
        return new Promise(resolve => {
            this.http.request(`${this.baseUrl}/category-data.json`)
                .subscribe(res => resolve(res.json()));
        });
    }
    /**
     * get data associated with a category by id
     * @param categoryId the category id used to return the data
     * @param forceRefresh used to determine if we need to load the data from firebase again
     */
    getCategoryData(categoryId, forceRefresh: boolean = false): Observable<any> {
        //we don't need to refresh the data, just return what was retrieved earlier
        if (!forceRefresh && this.categoryData[categoryId]) {
            this.currentCategory = this.categoryData[categoryId];
            console.log('**no need to make HTTP call, just return the data');
            return Observable.of(this.currentCategory);
        }

        // don't have data yet
        console.log('**about to make HTTP call');
        return this.http.get(`${this.baseUrl}/category-data/${categoryId}.json`)
            .map(response => {
                this.categoryData[categoryId] = response.json();
                this.currentCategory = this.categoryData[categoryId];
                return this.currentCategory;
            });
    }
    /**
     * refresh the data associated with a category
     */
    refreshCurrentCategory() {
        return this.getCategoryData(this.currentCategory.id, true);
    }
}