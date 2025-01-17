import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {TestStep} from "../../models/test-step.model";
import {AuthenticationGuard} from "../../shared/guards/authentication.guard";
import {NotificationsService, NotificationType} from "angular2-notifications";
import {TranslateService} from '@ngx-translate/core';
import {ToastrService} from "ngx-toastr";
import {BaseComponent} from "../../shared/components/base.component";
import {TestStepService} from "../../services/test-step.service";
import {TestStepPriority} from "../../enums/test-step-priority.enum";
import {MatCheckbox} from "@angular/material/checkbox";
import {FormGroup, FormControl, AbstractControl} from "@angular/forms";

@Component({
  selector: 'app-step-bulk-update-form',
  templateUrl: './step-bulk-update-form.component.html',
  styles: []
})
export class StepBulkUpdateFormComponent extends BaseComponent implements OnInit {
  public disabled: boolean = null;
  public priority: TestStepPriority = null;
  public waitTime: number = null;
  public formSubmitted: Boolean= false;
  public saving: boolean = false;
  bulkUpdateForm: FormGroup = new FormGroup({
    priority: new FormControl(null),
    disabled: new FormControl(null)
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public options: {
      steps: TestStep[]
    },
    private dialogRef: MatDialogRef<StepBulkUpdateFormComponent>,
    private testStepService: TestStepService,
    public authGuard: AuthenticationGuard,
    public notificationsService: NotificationsService,
    public translate: TranslateService,
    public toastrService: ToastrService) {
    super(authGuard, notificationsService, translate, toastrService);
  }

  ngOnInit(): void {
  }

  save() {
    this.formSubmitted = true;
    this.saving = true;
    if(this.waitTime > 120) return;
    Object.assign(this, {...this, ...this.bulkUpdateForm.getRawValue()} );
    if(this.priority!=null)
       this.priority = this.priority? TestStepPriority.MAJOR : TestStepPriority.MINOR;
    this.testStepService.bulkUpdateProperties(this.options.steps, this.priority, this.waitTime, this.disabled).subscribe(() => {
      this.translate.get('test_step.bulk.update.success').subscribe((res: string) => {
        this.showNotification(NotificationType.Success, res);
        this.dialogRef.close(true);
        this.saving = false;
      });
    }, error => {
      this.translate.get('test_step.bulk.update.Failure').subscribe((res) => {
        this.showAPIError(error, res);
        this.saving = false;
      })
    });
  }

  get stepPriority() {
    return Object.values(TestStepPriority);
  }

  changeTriStateCheckBox(priority: MatCheckbox, formControl: AbstractControl) {
    if(formControl.value==null) {
      priority.checked = true;
      formControl.setValue(true);
    } else if(formControl.value==false){
      priority.checked = false;
      priority.indeterminate = true;
      formControl.setValue(null);
    } else {
      priority.checked=false;
      formControl.setValue(false);
    }
  }
}
