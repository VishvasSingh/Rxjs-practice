import {Component, OnInit} from '@angular/core';
import {Course} from "../model/course";
import {interval, noop, Observable, of, throwError, timer} from 'rxjs';
import {catchError, delayWhen, finalize, map, retryWhen, shareReplay, tap} from 'rxjs/operators';
import { createHttpObservable } from '../utils';


@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    // beginnerCourses : Course[] = []
    // advancedCourses: Course[] = []

    beginnerCourses$: Observable<Course[]>;
    advancedCourses$: Observable<Course[]>;

    constructor() {

    }

    ngOnInit() {

        const http$ = createHttpObservable('./api/courses')
        const courses$ = http$.pipe(
            // tap(()=>{console.log('http request executed')}), // tap is used to produce side effects in observables chain, used for updating variable at component level or logging something etc.

            // map(data => Object.values(data['payload'])),

            // shareReplay(), // share replay is used to share the result to multiple subscribers, without this, all of the subscribers will trigger multiple subscriptions and http request will be executed for each subscriber

            // catchError((error) => {
            //     console.log(`error `, error)
            //     return throwError(error)           // this will create an observable which errors out immediately with the initial error
            // }),

            // finalize(()=>{console.log('finalized executed')})  // finalize is used to do some clean up operation either after receiving an error or after the observable is complete


            /*
                IMPORTANT: catch error and finalize is going to be executed twice because of share Replay, we are using the same observable at two places, if we want the error and finalize to be executed only once then we can move catchError and finalize before even the tap operator, it is a good practice to catch the error as close to the source as possible
            */


            /*
            _______________________________________________________________
                BELOW CODE EXPLAINS HOW TO RETRY WHEN AN HTTP REQUEST FAILS
            _______________________________________________________________
            */

            tap(()=>{console.log('http request executed')}), 

            map(data => Object.values(data['payload'])),

            shareReplay(), 

            catchError((error) => {
                console.log(`error `, error)
                return throwError(error)           
            }),

            retryWhen((error)=>{
                return error.pipe(
                    delayWhen (()=> timer(2000))
                )
            }) 



        ) 
        
        // courses$.subscribe((data)=>console.log(data), ()=>{console.log('only runs when error occurs')}, ()=>{console.log('completed')})
        

        /* 

            The below method is not recommended because:
            1. It leads to multiple nested callbacks leading to CALLBACK HELL 
            2. The code is not scalable and difficult to maintain 

        // courses$.subscribe(
        //         (data) => {
        //             console.log(data)
        //             this.beginnerCourses = data.filter((course)=> {return course.category == 'BEGINNER' })
        //             this.advancedCourses = data.filter((course)=> {return course.category == 'ADVANCED' })
        //         },
        //         noop,                                                        
        //         ()=> {
        //             console.log(this.beginnerCourses)
        //             console.log(this.advancedCourses)
        //         }
        // )

        */

        /*
            It is a better approach to code like below
        */


        this.beginnerCourses$ = courses$.pipe(
            map(
                (course:Course[]) => {return course.filter((course)=> course.category=='BEGINNER')} 
            )
        )

        this.advancedCourses$ = courses$.pipe(
            map(
                (course:Course[]) => {return course.filter((course)=> course.category=='ADVANCED')} 
            )
        )

        
    }

}
