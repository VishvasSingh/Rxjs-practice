import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Course} from "../model/course";
import {
    debounceTime,
    distinctUntilChanged,
    startWith,
    tap,
    delay,
    map,
    concatMap,
    switchMap,
    withLatestFrom,
    concatAll, shareReplay
} from 'rxjs/operators';
import {merge, fromEvent, Observable, concat} from 'rxjs';
import {Lesson} from '../model/lesson';
import { createHttpObservable } from '../utils';


@Component({
    selector: 'course',
    templateUrl: './course.component.html',
    styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit, AfterViewInit {


    course$: Observable<Course>;
    lessons$: Observable<Lesson[]>;
    courseId: string;


    @ViewChild('searchInput', { static: true }) input: ElementRef;

    constructor(private route: ActivatedRoute) {


    }

    ngOnInit() {

        this.courseId = this.route.snapshot.params['id'];
        this.course$ = createHttpObservable(`/api/courses/${this.courseId}`)
        


    }

    ngAfterViewInit() {

        // const search$ = fromEvent<any>(this.input.nativeElement, 'keyup')
        // .pipe(
        //     map(event => event.target.value),
        //     debounceTime(400),
        //     distinctUntilChanged(),
        //     switchMap((search)=> this.loadLessons(search))
        // )
        // const initialLessons$ = this.loadLessons()
        
        // this.lessons$ = concat(initialLessons$, search$)


        /*

            The above code is implementing search logic, initially we have all the data then we display data based on search query but we can write it in a shorter way using startsWith operator of rxjs and do not need to concat two observables 

        */


        this.lessons$ = fromEvent<any>(this.input.nativeElement, 'keyup')
        .pipe(
            map(event => event.target.value),
            startWith(''),                               // start with reduces the lines of code and makes the logic cleaner for above code while keeping the functionality
                                                         // intact
            debounceTime(400),    // debounce time is used to wait for value to become stable, we'll wait for 400ms and after every input and check if there is any new
                                  // incoming value, if there is then again wait for 400 ms else continue 
            distinctUntilChanged(),
            switchMap((search)=> this.loadLessons(search))
        )

    }

    loadLessons(search: string = ''): Observable<Lesson[]> {
        return createHttpObservable(`/api/lessons?courseId=${this.courseId}&pageSize=100&filter=${search}`)
        .pipe(
            map((res)=> res['payload'])
        )
    }




}


/*
    DEBOUNCE TIME: It is used to wait for values to become stable, we wait for sometime after every input and if it is the only input in that time then we emit that value 
                   else continue waiting again

    THROTTLING:    It is used to rate limit, even if server is sending stream of values, we emit one value and then wait for sometime, we ignore all the values that are 
                   coming during the wait time, when the counter is over, we emit the first value and again wait for sometime. 

                   NOTE: In throttling, there is no guarantee that the values that are emitted are the latest, the value picked up by the operator is in FIFO order after 
                         wait time is over. 

*/