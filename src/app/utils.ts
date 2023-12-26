import { Observable } from "rxjs"

export function createHttpObservable(url: string) {
    return Observable.create((observer)=> {

        const controller = new AbortController()
        const signal = controller.signal

        fetch(url, {signal}).then(
          (response) => {
            if(response.ok){
              return response.json()
            }
            else {
                return observer.error(`An error occurred with status -> ${response.status}`)
            }
          }
        ).then (
          (data) => {
            observer.next(data)
            observer.complete()
          }
        ). catch((error)=> {
          observer.error(error)
        })
        return () => controller.abort()
    }      
      )

}