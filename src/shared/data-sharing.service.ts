import { Injectable } from "@angular/core";

@Injectable()
export class DataSharingService {
    directions: any;
    storageIsSet: boolean;
    /**
     * set the route information
     * @param directions The directions obj generated in map-page
     */
    setRouteInfo(directions: any) {
        this.directions = directions;
    }
    /**
     * get route information
     */
    getRouteInfo() {
        return this.directions;
    }
    /**
     * determines if user is able to go to map page
     */
    getStorageIsSet() {
        return this.storageIsSet;
    }
    /**
     * determines if the user is able to go to the map page
     * @param val boolean val
     */
    setStorageIsSet(val: boolean) {
        this.storageIsSet = val;
    }


}