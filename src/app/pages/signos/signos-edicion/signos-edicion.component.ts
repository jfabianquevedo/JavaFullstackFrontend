import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { SignosService } from './../../../_service/signos.service';
import { PacienteService } from 'src/app/_service/paciente.service';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { Signos } from 'src/app/_model/signos';
import { Paciente } from 'src/app/_model/paciente';

@Component({
  selector: 'app-signos-edicion',
  templateUrl: './signos-edicion.component.html',
  styleUrls: ['./signos-edicion.component.css']
})
export class SignosEdicionComponent implements OnInit {
  form: FormGroup;
  id: number;
  edicion: boolean;
  options: string[] = [];
  filteredOptions: Observable<string[]>;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private signosService: SignosService,
    private pacienteService: PacienteService,
    private datepipe: DatePipe,
    public dialog: MatDialog

  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      'id': new FormControl(0),
      'id_paciente': new FormControl(''),
      'nombre': new FormControl(''),
      'fecha': new FormControl(''),
      'temperatura': new FormControl(''),
      'pulso': new FormControl(''),
      'ritmoRespiratorio': new FormControl('')
    });

    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
      this.edicion = params['id'] != null;
      this.initForm();
      this.filteredOptions = this.form.controls['nombre'].valueChanges.pipe(
        map(val => this.filter(val))
      );
      this.form.get('nombre').valueChanges.subscribe((nomb: string) => {
        const idx = nomb.indexOf(':');
        this.form.patchValue({
          'id_paciente': idx > 0 ? parseInt(nomb.substring(0, idx)) : ''
        });
      })
    });
  }

  initForm() {
    if (this.edicion) {
      this.signosService.listarPorId(this.id).subscribe(data => {
        this.form = new FormGroup({
          'id': new FormControl(data.idSignos),
          'id_paciente': new FormControl(data.paciente.idPaciente),
          'nombre': new FormControl(data.paciente.idPaciente + ': ' + data.paciente.nombres + ' ' + data.paciente.apellidos),
          'fecha': new FormControl(this.datepipe.transform(new Date(data.fechaRegistro), 'yyyy-MM-dd')),
          'temperatura': new FormControl(data.temperatura),
          'pulso': new FormControl(data.pulso),
          'ritmoRespiratorio': new FormControl(data.ritmoRespiratorio)
        });
      });
    }
    this.actualizarAutocomplete();
  }

  actualizarAutocomplete() {
    this.pacienteService.listar().subscribe(data => {
      this.options = data.map(paciente => {
        return (paciente.idPaciente + ': ' + paciente.nombres + ' ' + paciente.apellidos).trim();
      });
    });
  }

  filter(val: string): string[] {
    return this.options.filter(option => {
      return option.toLowerCase().match(val.toLowerCase());
    });
  }

  get f() { return this.form.controls; }

  operar() {
    let signos = new Signos();
    signos.idSignos = this.form.value['id'];
    signos.paciente = new Paciente();
    signos.paciente.idPaciente = this.form.value['id_paciente'];
    signos.fechaRegistro = new Date(this.form.value['fecha']);
    signos.temperatura = this.form.value['temperatura'];
    signos.pulso = this.form.value['pulso'];
    signos.ritmoRespiratorio = this.form.value['ritmoRespiratorio'];

    if (this.edicion) {
      this.signosService.modificar(signos).subscribe(() => {
        this.signosService.listar().subscribe(data => {
          this.signosService.setSignocambio(data);
          this.signosService.setMensajeCambio('Se Modifico')
        })
      });
    } else {
      this.signosService.registrar(signos).subscribe(() => {
        this.signosService.listar().subscribe(data => {
          this.signosService.setSignocambio(data);
          this.signosService.setMensajeCambio('Se Registro')
        });
      });
    }
    this.router.navigate(['/pages/signos']);
  }
}
