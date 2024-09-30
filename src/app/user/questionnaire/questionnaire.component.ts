import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.css']
})
export class QuestionnaireComponent {

  data: any[] = [];

  constructor(private route: Router, private service: UserService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.getEventData();
  }

  getEventData() {
    this.service.getApi('/admin/userAnswered').subscribe({
      next: resp => {
        this.data = resp.UserAnswered;
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  deleteField(id: any) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger"
      },
    });

    swalWithBootstrapButtons.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
      confirmButtonColor: "#b92525",
    })
      .then((result) => {
        if (result.isConfirmed) {
          const formURlData = new URLSearchParams();
          formURlData.set('id', id);
          this.service.gdeleteApi(`/admin/userAnswered/${id}`).subscribe({
            next: resp => {
              console.log(resp)
              this.toastr.success(resp.message)
              this.getEventData();
            },
            error: error => {
              console.log(error.message)
            }
          });
        }
      });
  }

  downloadExcel(): void {
    // Selecting only specific columns
    const selectedColumnsData = this.data.map(item => ({
      Name: item.user.full_name,
      Email: item.user.email,
      Question: item.question.title,
      Answer: item.option,
    }));

    // Create a new workbook
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();

    // Convert selected columns data to worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(selectedColumnsData);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Events Data');

    // Write the workbook to a binary string
    const excelBuffer: ArrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Convert the binary string to a Blob
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Trigger download
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(data);
      link.setAttribute("href", url);
      link.setAttribute("download", "events_data.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }


}
