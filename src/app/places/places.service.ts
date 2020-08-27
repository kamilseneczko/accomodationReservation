import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

//#region dummy data without database (firebase)
// new Place(
//   'p1', 
//   'Manhattan Mansion', 
//   'In the heart of new york ciy', 
//   'https://cdn.galleries.smcloud.net/t/galleries/gf-LhUy-bMWN-czfZ_zdjecie-dnia-664x442-nocrop.png', 
//   149,
//   new Date('2020-01-01'),
//   new Date('2022-12-31'),
//   'abc'
// ),
// new Place(
//   'p2', 
//   'Amour Toujours', 
//   'A romantic place in paris', 
//   'https://i.content4travel.com/cms/img/u/mobile/se/xfrparp_1.jpg?version=1', 
//   189,
//   new Date('2020-01-01'),
//   new Date('2022-12-31'),
//   'abc'
// ),
// new Place(
//   'p3', 
//   'Foggy Palace', 
//   'Not your average city trip', 
//   'https://cdn.galleries.smcloud.net/t/galleries/gf-LhUy-bMWN-czfZ_zdjecie-dnia-664x442-nocrop.png', 
//   99,
//   new Date('2020-01-01'),
//   new Date('2022-12-31'),
//   'abc'
// )
//#endregion

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);

  get places() {
    return this._places.asObservable();
  }
  constructor(
    private authService: AuthService, 
    private http: HttpClient
  ) { }

  fetchPlaces() {
    return this.http.get<{[key: string]: PlaceData}>('https://ionic-angular-course-a0bb3.firebaseio.com/offered-places.json')
      .pipe(
        map(resData => {
          const places = [];
          for (const key in resData) {
            if (resData.hasOwnProperty(key)) {
              places.push(new Place(
                key, 
                resData[key].title,
                resData[key].description,
                resData[key].imageUrl,
                resData[key].price,
                new Date(resData[key].availableFrom),
                new Date(resData[key].availableTo),
                resData[key].userId
              ));
            }
          }
          return places;
      }),
      tap(places => {
        this._places.next(places);
      })
    );
  }

  getPlace(id: string) {
    return this.http.get<PlaceData>(`https://ionic-angular-course-a0bb3.firebaseio.com/offered-places/${id}.json`)
      .pipe(map(placeData => {
        return new Place(
          id,
          placeData.title,
          placeData.description,
          placeData.imageUrl,
          placeData.price,
          new Date(placeData.availableFrom),
          new Date(placeData.availableTo),
          placeData.userId
        );
      }));
    
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo:Date) {
    let generatedId: string;
    const newPlace = new Place(
      Math.random().toString(), 
      title, 
      description, 
      'https://cdn.galleries.smcloud.net/t/galleries/gf-LhUy-bMWN-czfZ_zdjecie-dnia-664x442-nocrop.png', 
      price, 
      dateFrom, 
      dateTo,
      this.authService.userId
    );
    return this.http.post<{name: string}>('https://ionic-angular-course-a0bb3.firebaseio.com/offered-places.json', { ...newPlace, id: null })
      .pipe(
        switchMap(resData => {
          generatedId = resData.name
          return this.places;
        }),
        take(1),tap(places => {
          newPlace.id = generatedId;
          this._places.next(places.concat(newPlace));
        })
      );
    // return this._places.pipe(take(1), delay(1000), tap((places) => {
    //   setTimeout(() => {
    //     this._places.next(places.concat(newPlace));
    //   }, 1000)
    // }));
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    return this.places.pipe(take(1), switchMap(places => {
      if(!places || places.length <= 0) {
        return this.fetchPlaces();
      } else {
        return of(places);
      }
    }),
    switchMap(places => {
      const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
      const updatedPlaces = [...places];
      const oldPlace = updatedPlaces[updatedPlaceIndex];
      updatedPlaces[updatedPlaceIndex] = new Place(
        oldPlace.id, 
        title, 
        description, 
        oldPlace.imageUrl, 
        oldPlace.price, 
        oldPlace.availableFrom, 
        oldPlace.availableTo, 
        oldPlace.userId
      );
      return this.http.put(`https://ionic-angular-course-a0bb3.firebaseio.com/offered-places/${placeId}.json`,
        {...updatedPlaces[updatedPlaceIndex], id: null}
      );
    }), 
    tap(() => {
      this._places.next(updatedPlaces);
    }));
  }
}
