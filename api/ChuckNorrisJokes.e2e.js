
export default class ChuckNorrisJokes {

    constructor() {
        this.url = URL;
        this.jokeNo = 0;
    }

    get() {
        return new Promise ( (resolve,reject)  => {
            const jokeNo = this.jokeNo++;
            const jokeStr = jokeNo==0 ? '' : `#${jokeNo+1}`;
            resolve(`some very bad joke${jokeStr}`);
        })

    }
}

