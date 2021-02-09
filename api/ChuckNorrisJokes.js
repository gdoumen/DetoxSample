
const URL = 'https://api.icndb.com/jokes/random'

export default class ChuckNorrisJokes {

    constructor() {
        this.url = URL;
    }

    get() {
        return new Promise ( (resolve,reject)  => {
            fetch( this.url)
            .then( response => response.json() )
            .then( json=> {
                if ( json.type==='success' && json.value) {
                    let joke = json.value.joke;
                    joke = joke.replace(/\&quot;/ig,"'")
                    joke = joke.replace(/\./ig,".\n")
                    resolve(joke)
                }
                else { 
                    reject( "invalid response")
                }
            })
            .catch( err => { 
                reject( err ) 
            })  
        })

    }
}