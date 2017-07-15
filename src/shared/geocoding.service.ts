import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
declare var google: any;

Injectable()
export class GeocodingService {
    /**
     * geocode an address query to return data information
     * @param address input query string
     */
    geocodeInputAddress(address: string) {
        try {

            let geocoder = new google.maps.Geocoder();
            let request;
            if (address != null && address != '' && address != undefined) { request = { 'address': address } }
            else {
                return;
            }
            return Observable.create(observer => {
                geocoder.geocode(request, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        observer.next(results);
                        observer.complete();
                    } else {
                        console.log('Error - ', results, ' & Status - ', status);
                        observer.next({});
                        observer.complete();
                    }
                });
            });
        }
        catch (e) {
            return null;
        }
    }
}