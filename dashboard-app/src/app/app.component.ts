import { Component, OnInit } from '@angular/core';
import { FirebaseService } from './firebase.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'HexStore Dashboard';
  users: any[] = [];
  metrics: any = { users: 0, sellers: 0, buyers: 0 };

  constructor(private fb: FirebaseService) {}

  async ngOnInit() {
    // try to load users; falls back gracefully if Firebase not configured
    try {
      this.users = await this.fb.listUsers();
      this.metrics.users = this.users.length;
      this.metrics.sellers = this.users.filter(u=>u.role==='seller').length;
      this.metrics.buyers = this.users.filter(u=>u.role==='buyer').length;
    } catch (e) {
      console.warn('Firebase not initialized or listUsers failed', e);
    }
  }
}
