import { Component, OnInit } from '@angular/core';
import { FirebaseService } from './firebase.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  email = '';
  password = '';
  name = '';
  phone = '';
  loggedInUser: any = null;
  mode: 'login' | 'register' = 'login';

  constructor(private fb: FirebaseService) {}

  ngOnInit() {
    this.fb.onAuthState((user:any)=>{
      this.loggedInUser = user;
      if (user) {
        this.email = user.email || '';
        this.name = user.displayName || '';
      }
    });
  }

  async submit() {
    try {
      if (this.mode === 'login') {
        await this.fb.signIn(this.email, this.password);
      } else {
        await this.fb.register(this.email, this.password, this.name, { phone: this.phone });
      }
      this.password = '';
    } catch (e:any) {
      alert(e.message || 'Auth error');
    }
  }

  async saveProfile() {
    try {
      await this.fb.updateProfileData({ displayName: this.name, phone: this.phone });
      alert('Profile updated');
    } catch (e:any) { alert(e.message || 'Update failed'); }
  }

  async changePassword() {
    const p = prompt('Enter new password (will update current account)');
    if (!p) return;
    try { await this.fb.updatePassword(p); alert('Password updated'); }
    catch(e:any){ alert(e.message||'Password update failed'); }
  }

  async signOut() { await this.fb.signOutUser(); this.loggedInUser = null; }
}
