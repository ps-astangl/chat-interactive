import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ChatCardComponent} from "./components/chat-card/chat-card.component";
import {NotFoundComponent} from "./components/not-found/not-found.component";
import {AuthGuardService} from "./services/auth-guard.service";
import {LoginComponent} from "./components/login/login.component";


const routes: Routes = [
  {path: '', component: ChatCardComponent, canActivate: [AuthGuardService]},
  {path: 'login', component: LoginComponent},
  {path: '**', component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
