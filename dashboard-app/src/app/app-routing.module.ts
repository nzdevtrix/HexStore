import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { SellerDashboardComponent } from './seller-dashboard/seller-dashboard.component';
import { BuyerDashboardComponent } from './buyer-dashboard/buyer-dashboard.component';

const routes: Routes = [
  { path: '', component: AppComponent, pathMatch: 'full' },
  { path: 'seller', component: SellerDashboardComponent },
  { path: 'buyer', component: BuyerDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }