import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AccountComponent } from './account.component';
import { AppRoutingModule } from './app-routing.module';
import { SellerDashboardComponent } from './seller-dashboard/seller-dashboard.component';
import { BuyerDashboardComponent } from './buyer-dashboard/buyer-dashboard.component';

@NgModule({
  declarations: [AppComponent, AccountComponent, SellerDashboardComponent, BuyerDashboardComponent],
  imports: [BrowserModule, FormsModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
