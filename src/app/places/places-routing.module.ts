import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlacesPage } from './places.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: PlacesPage,
    children: [
      { path: 'discover', 
        children: [
          {
            path: '',
            // loadChildren: './discover/discover.module#DiscoverPageModule'
            loadChildren: () => import('./discover/discover.module').then(m => m.DiscoverPageModule)
          },
          {
            path: ':placeId',
            loadChildren: '.discover/place-detail/place-detail.module#PlaceDetailPageModule'
          }
        ]
      },
      {
        path: 'offers',
        children: [
          {
            path: '',
             //loadChildren: './offers/offers.module#OffersPageModule'
            loadChildren: () => import('./offers/offers.module').then(m => m.OffersPageModule)
          },
          {
            path: 'new',
            //loadChildren: './offers/new-offer/new-offer.module#NewOfferPageModule'
            loadChildren: () => import('./offers/new-offer/new-offer.module').then(m => m.NewOfferPageModule)
          },
          {
            path: 'edit/:placeId',
            //loadChildren: './offers/edit-offer/edit-offer.module#EditOfferPageModule'
            loadChildren: () => import('./offers/edit-offer/edit-offer.module').then(m => m.EditOfferPageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/places/tabs/discover',
        pathMatch: 'full'
      }
    ]
  }, 
  {
    path: '',
    redirectTo: '/places/tabs/discover',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlacesPageRoutingModule {}
