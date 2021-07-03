import { Component, OnInit } from '@angular/core';
import { LoginService } from './../../_service/login.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from './../../../environments/environment.prod';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  usuario: string;
  rol: string;

  constructor(
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    const helper = new JwtHelperService();
    if (this.loginService.estaLogueado) {
      let token = sessionStorage.getItem(environment.TOKEN_NAME);
      const decodedToken = helper.decodeToken(token);
      this.usuario = decodedToken.user_name;
      const roles: string[] = decodedToken.authorities;
      this.rol = roles.join(', ');
    } else {
      this.loginService.cerrarSesion();
    }
  }

}
