import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Signos } from './../../_model/signos';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SignosService } from './../../_service/signos.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-signos',
  templateUrl: './signos.component.html',
  styleUrls: ['./signos.component.css']
})
export class SignosComponent implements OnInit {

  cantidad: number = 0;
  dataSource: MatTableDataSource<Signos>;
  displayedColumns = ['idSignos', 'paciente', 'fecha', 'temperatura', 'pulso', 'ritmoRespiratorio', 'acciones'];
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;


  constructor(
    private signosService: SignosService,
    private snackBar: MatSnackBar,
    public route: ActivatedRoute
    ) { }

  ngOnInit(): void {

    this.signosService.listarPageable(0, 10).subscribe(data => {
      this.cantidad = data.totalElements;
      this.dataSource = new MatTableDataSource(data.content);
      this.dataSource.sort = this.sort;
    });

    this.signosService.getSignoCambio().subscribe(data => {      
      this.crearTabla(data);
    });

    this.signosService.getMensajeCambio().subscribe(data => {
      this.snackBar.open(data, 'AVISO', {
        duration: 5000,
        verticalPosition: "top",
        horizontalPosition: "right"
      });
    });
  }

  eliminar(id: number) {
    this.signosService.eliminar(id).subscribe(() => {
      this.signosService.listar().subscribe(data => {
        this.signosService.setSignocambio(data);
        this.signosService.setMensajeCambio('SE ELIMINO');
      });
    });
  }
  crearTabla(data: Signos[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  filtrar(valor: string) {
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  mostrarMas(e: any) {
    this.signosService.listarPageable(e.pageIndex, e.pageSize).subscribe(data => {
      this.cantidad = data.totalElements;
      this.dataSource = new MatTableDataSource(data.content);
      this.dataSource.sort = this.sort;
    });
  }
}
