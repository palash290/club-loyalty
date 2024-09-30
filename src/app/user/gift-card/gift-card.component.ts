import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gift-card',
  templateUrl: './gift-card.component.html',
  styleUrls: ['./gift-card.component.css']
})
export class GiftCardComponent {

  newForm!: FormGroup;
  updateForm!: FormGroup;
  data: any[] = [];
  @ViewChild('closeModal') closeModal!: ElementRef;
  @ViewChild('closeModal1') closeModal1!: ElementRef;
  updateDet: any;
  updateId: any;

  constructor(private route: Router, private service: UserService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.initForm();
    this.initUpdateForm();
    this.getScratchData()
  }

  initForm() {
    this.newForm = new FormGroup({
      title: new FormControl('', Validators.required),
      points: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]+$'),    Validators.min(1),               // Minimum value 1
        Validators.max(15)  
      ]),
      endDate: new FormControl('', Validators.required),
    })
  }

  initUpdateForm() {
    this.updateForm = new FormGroup({
      title: new FormControl(this.updateDet?.title, Validators.required),
      points: new FormControl(this.updateDet?.points, Validators.required),
      endDate: new FormControl(this.updateDet?.endDate, Validators.required),
    })
  }

  getScratchData() {
    this.service.getApi('/admin/scratchCards').subscribe({
      next: resp => {
        this.data = resp.scratchCards.reverse();
      },
      error: error => {
        console.log(error.message)
      }
    });
  }

  onSubmit() {
    this.newForm.markAllAsTouched();
    //return
    if (this.newForm.valid) {
      const formURlData = new URLSearchParams();
      formURlData.set('title', this.newForm.value.title)
      formURlData.set('endDate', this.newForm.value.endDate)
      formURlData.set('points', this.newForm.value.points)
      this.service.postAPI('/admin/addScratchCard', formURlData).subscribe({
        next: (resp) => {
          if (resp.success === true) {
            this.closeModal.nativeElement.click();
            this.newForm.reset();
            this.toastr.success(resp.message);
            this.getScratchData();
          } else {
            this.toastr.warning(resp.message);
          }
          //this.getSupplyData()
        },
        error: error => {
          this.toastr.warning('Something went wrong.');
          console.log(error.message)
        }
      })
    }
  }

  patchUpdate(details: any) {
    this.updateDet = details;
    this.updateId = details.id;
    this.initUpdateForm();
  }

  onUpdate() {
    this.updateForm.markAllAsTouched();
    if (this.updateForm.valid) {
      const formURlData = new URLSearchParams();
      formURlData.set('title', this.updateForm.value.title)
      formURlData.set('endDate', this.updateForm.value.endDate)
      formURlData.set('points', this.updateForm.value.points)
      formURlData.set('id', this.updateId)
      this.service.postAPI('/admin/editScratchCard', formURlData).subscribe({
        next: (resp) => {
          if (resp.success === true) {
            this.closeModal1.nativeElement.click();
            // this.toastr.success(resp.message);
            this.toastr.success('Update successful!');
            this.getScratchData()
          } else {
            this.toastr.warning(resp.message);
          }
          //this.newForm.reset();  
        },
        error: error => {
          this.toastr.warning('Something went wrong.');
          console.log(error.message)
        }
      })
    }
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
          this.service.gdeleteApi(`/admin/scratchCard/${id}`).subscribe({
            next: resp => {
              console.log(resp)
              this.toastr.success(resp.message)
              this.getScratchData();
            },
            error: error => {
              console.log(error.message)
            }
          });
        }
      });
  }


}
