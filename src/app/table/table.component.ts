import { Component, OnInit } from '@angular/core';
//import { Element } from 'dom';
import * as XLSX from 'xlsx';

@Component({
  selector: 'tableComponent',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  table: any[][];
  editMode: boolean;
 
  constructor() {
    this.table = [];
    this.editMode=false;
  }

  ngOnInit() {
    // Load data from local storage
    const savedTable = localStorage.getItem('table');
    console.log(savedTable);
    if (savedTable) {
      this.table = JSON.parse(savedTable);
    } else {
      this.table = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
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
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        this.table = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        this.editMode = false;
      };
      reader.readAsArrayBuffer(files[0]);
    }
  }
  
  addRow() {
    this.table.push(Array(this.table[0].length).fill(' '));
    this.editMode = true;
  }
  addColumn() {
    this.table.forEach(row => row.push(''));
    this.editMode = true;
  }

  edit() {
    this.editMode = true;
  }

  save() {
    if (this.editMode) {
      // Exit edit mode
      this.editMode = false;
      
      // Save data to local storage
      localStorage.setItem('table', JSON.stringify(this.table));
      
      // Convert table data to workbook
      const worksheet = XLSX.utils.json_to_sheet(this.table);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // Save workbook to Excel file
      const file = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

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
  }
  
}
