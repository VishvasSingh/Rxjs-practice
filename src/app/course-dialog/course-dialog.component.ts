import {AfterViewInit, Component, ElementRef, Inject, OnChanges, OnInit, SimpleChanges, ViewChild, ViewEncapsulation} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {Course} from "../model/course";
import {FormBuilder, Validators, FormGroup} from "@angular/forms";
import * as moment from 'moment';
import {fromEvent, noop, of} from 'rxjs';
import {concatMap, distinctUntilChanged, exhaustMap, filter, mergeMap, tap} from 'rxjs/operators';
import {fromPromise} from 'rxjs/internal-compatibility';


@Component({
    selector: 'course-dialog',
    templateUrl: './course-dialog.component.html',
    styleUrls: ['./course-dialog.component.css']
})
export class CourseDialogComponent implements OnInit, AfterViewInit {

    form: FormGroup;
    course:Course;
    disabled: boolean = false;

    @ViewChild('saveButton', { static: true }) saveButton: ElementRef;

    @ViewChild('searchInput', { static: true }) searchInput : ElementRef;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<CourseDialogComponent>,
        @Inject(MAT_DIALOG_DATA) course:Course ) {

        this.course = course;

        this.form = fb.group({
            description: [course.description, Validators.required],
            category: [course.category, Validators.required],
            releasedAt: [moment(), Validators.required],
            longDescription: [course.longDescription,Validators.required]
        });
        
    }

    ngOnInit() {
        /*
        In the below method we are trigging save call when the data changes in form, but we are triggering call for every change
        and also not waiting for previous call to complete 
        
        // this.form.valueChanges.pipe(
        //     filter(()=>this.form.valid)
        // )
        // .subscribe(changes=> {
        //     const saveCourse$ = fromPromise(fetch(`/api/courses/${this.course.id}`, {
        //         method: 'PUT',
        //         body: JSON.stringify(changes),
        //         headers: {
        //             'content-type': 'application/json'
        //         }
        //     }));

        //     saveCourse$.subscribe(res => res.json()
        //     .then(
        //         data=>{
        //             console.log(data)
        //         })
        //     );
        // })
        
        */

        /* 
                        ------------------------------
        */

        this.form.valueChanges
        .pipe(
            filter(()=> this.form.valid),
            concatMap((changes)=> this.saveCourse(changes))  // concat map is used to combine observables and when first observable is complete 
                                                             //  then only the next one will start emitting stream of values
                                                             // over here, for each change in form we will be creating a new observable and can trigger
                                                             // save call for each observable one by one, only when previous one is finished 
                                                             // NOTE: SUBSCRIPTION WILL ALSO BE DONE BY CONCAT MAP for each observable, but only if 
                                                             // the main subscription is created by developer
        )
        .subscribe()


       
    }

    ngAfterViewInit() {

        fromEvent(this.saveButton.nativeElement, 'click')
        .pipe(
            concatMap(()=> this.saveCourse(this.form.value))
        )
        .subscribe()

    }

    saveCourse (changes) {
        return fromPromise(fetch(`/api/courses/${this.course.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(changes),
                    headers: {
                        'content-type': 'application/json'
                    }
                }))
    }

    close() {
        this.dialogRef.close();
    }

    save(event) {
        of(event)
        .pipe(
                tap(()=> {this.disabled = true}),
                exhaustMap(()=> this.saveCourse(this.form.value))
        )
        .subscribe(noop, noop, ()=>{this.disabled = false})
    }

}





/*

Concat ->     merges observables only when they are complete 

Concat Map -> takes observables as input, applies some function to create a new observable, merges them after that, only when 
              they are complete 
              USE CASE: When we want the first api call to finish and then only trigger next api call (in case of saving a form)

merge ->      takes observables and merges them without waiting for anyone to complete first 

Merge map ->  takes observables as inputs, applies some function to create new observables, merges them without waiting for 
              any one to complete
              USE CASE: When we want to make multiple api calls parallel 

Exhaust Map-> takes observables as inputs, applies some function to create new observables, merges them but ignores the new ones
              in case the previous is not finished yet.
              USE CASE: User clicks save button multiple times but we trigger a call only when previous BE call is finished, ignoring
              all other save button click events while a request is on going.

*/ 