import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable, fromEvent, interval, noop, timer } from 'rxjs';
import { createHttpObservable } from '../utils';
import { map } from 'rxjs/operators';

@Component({
  selector: 'about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor() { }

  ngOnInit() {

  //   document.addEventListener('click', event => {
  //     console.log(event)                             // event which is based on user actions
  //   })

  // let counter = 0

  // setInterval(()=> {                     // continuous event which might stop emitting values or might not stop
  //   console.log(counter);
  //   counter++;
  // }, 1000)


  // setTimeout(()=> {
  //   console.log("timeout is over")       //similar to http request
  // }, 1000);


  /*

      if we want to combine all the above events then we need to nest them inside each other, which is quite difficult and reduces scalability

  */
          // const interval$ = interval(1000);   // this is just the declaration of stream of values, not actual stream 

          // interval$.subscribe(val => console.log("stream 1 " + val)); // values will be emitted only when we subscribe to an observable

          // interval$.subscribe(val => console.log("stream 2 " + val)); 

          // let interval$ = timer(3000, 1000);

          // interval$.subscribe((val => {console.log("stream 1 "+ val)}))

          // const click$ = fromEvent(document, 'click')
          // click$.subscribe((event=> {
          //   console.log(event)
          // }))


          // const http$ = createHttpObservable('./api/courses')

          // const httpSubscription1 = http$.subscribe(
          //   (data)=>{console.log(data)},
          //   noop,
          //   ()=>{console.log('http1 -> completed')}
            
          // )


          // const response$ = http$.pipe(                          // here we are converting an observable into another observable
                                                                 // which will emit data in the form we want.
          //   map(
          //     (res)=>{
          //       return Object.values(res["payload"])
          //     }
          //     )
          // )


          // const httpSubscription2 = response$.subscribe(
          //   (data)=>{console.log(data)},
          //   noop,
          //   ()=>{console.log('http2 -> completed')}
            
          // )
          // httpSubscription.unsubscribe()

          const http$ = createHttpObservable('/api/courses')
          const sub = http$.subscribe()
          sub.unsubscribe()
          

  }

  
}
