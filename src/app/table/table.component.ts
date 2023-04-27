import {LiveAnnouncer} from '@angular/cdk/a11y';
import { Component, OnInit ,ViewChild,AfterViewInit,OnChanges, SimpleChanges} from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import * as XLSX from 'xlsx';
import {MatSort,Sort} from '@angular/material/sort';

export interface columnElements {
  carID:number;
  licenseDate:Date;
  testDate:Date;
  hosDate:Date;
  calibration:Date;
  category:String;
  status:String;
  comments:String;
}
@Component({
  selector: 'tableComponent',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit,OnChanges{
  element: string;
  dataSource: MatTableDataSource<any>;
  editMode: boolean;
  displayedColumns: string[] = ["מספר רכב", "תאריך רשיון", "תאריך טסט", "תאריך חו''ס","כיול", "קטגוריה", "סטטוס","הערות"];
  today = new Date();
  tableWithStatus: any[][];
  element_data: columnElements[]|any;


  constructor(private _liveAnnouncer: LiveAnnouncer) {
    //this.dataSource = new MatTableDataSource<any>();
    this.dataSource = new MatTableDataSource(this.element_data);

    this.element = '';
    this.editMode = false;
    this.tableWithStatus = [];
  }

  @ViewChild('empTbSort') empTbSort = new MatSort();

  ngOnChanges(changes: SimpleChanges):void {    
    if(changes['dataSource']?.currentValue.length){
    this.dataSource.sort = this.empTbSort;
    }
  }

  /** Announce the change in sort state */
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {

      this.dataSource.sort=this.empTbSort;
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  ngOnInit(): void {
    // Load data from local storage
    const savedTable = localStorage.getItem('table');
    console.log(savedTable);
    if (savedTable) {
      this.dataSource.data = JSON.parse(savedTable);
    }
    this.editMode = false;
  }

  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input && input.files) {
      const files = input.files;
      const reader = new FileReader();
      reader.onload = () => {
        const data = new Uint8Array(reader.result as ArrayBuffer);
        const workbook = XLSX.read(data,{type:"array",cellDates: true});
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const date_format = 'dd.mm.yyyy'; 

        // this.dataSource.data = XLSX.utils.sheet_to_json(worksheet, {
        //   raw: false,
        //   header: 1,
        //   dateNF: date_format
        // })

        this.element_data = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          header: 1,
          dateNF: date_format
        })
        this.editMode = false;
      };
      reader.readAsArrayBuffer(files[0]);
    }
  }
  
  edit(element: any) {
    this.editMode = true;
  }

  addRow() {
      this.dataSource.data.push(this.dataSource.data[0].fill(''));
      this.editMode = true;
    }

  deleteRow() {
    this.dataSource.data.pop();
    this.editMode = true;
  }

  addColumn() {
    this.dataSource.data.forEach(row => row.push(''));
    this.editMode = true;
  }

  save() {
    // Exit edit mode
    this.editMode = false;
    console.log(this.dataSource.data);
    // Save data to local storage
    localStorage.setItem('table', JSON.stringify(this.dataSource.data));
    console.log(localStorage.getItem);
    const locale = 'he'; // set the locale to Hebrew
  
    // Convert table data to workbook
    const date_format = {day: undefined, month: undefined, year: undefined, timeZone: 'UTC'};

    // Convert table data to workbook
    const worksheet = XLSX.utils.json_to_sheet(this.dataSource.data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
      // Save workbook to Excel file
    const file = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' ,cellDates: true});

    const blob = new Blob([file], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'table.xlsx';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  }


  formatDate(date: Date, format: string, locale: string) {
    const options = { day: undefined, month: undefined, year: undefined, timeZone: 'UTC' };
    const formatter = new Intl.DateTimeFormat(locale, options);
    const parts = formatter.formatToParts(date);
    const replacements: { [key: string]: string } = {};
    parts.forEach(part => {
    if (part.type === 'day') {
    replacements['dd'] = part.value.padStart(2, '0');
    replacements['d'] = part.value;
    } else if (part.type === 'month') {
    replacements['mm'] = part.value.padStart(2, '0');
    replacements['m'] = part.value;
    } else if (part.type === 'year') {
    replacements['yyyy'] = part.value;
    }
    });
    let result = format;
    Object.keys(replacements).forEach(key => {
    result = result.replace(key, replacements[key]);
    });
    return result;
  }

  update(element: any, index: number) {
      element[index] = element.value;
      // update the table array with the new value
      const rowIndex = this.dataSource.data.indexOf(element);
      this.dataSource.data[rowIndex][index] = element.value;
      this.editMode = false;
      localStorage.setItem('table', JSON.stringify(this.dataSource.data));
  }


}