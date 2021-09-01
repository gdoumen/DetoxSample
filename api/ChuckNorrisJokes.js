const URL = 'https://api.icndb.com/jokes/random';

export default class ChuckNorrisJokes {
  constructor() {
    this.url = URL;
  }

  get() {
    console.log('get');
    return new Promise((resolve, reject) => {
      fetch(this.url)
        .then((response) => response.json())
        .then((json) => {
          console.log(json);
          if (json.type === 'success' && json.value) {
            let joke = json.value.joke;
            joke = joke.replace(/\&quot;/gi, "'");
            joke = joke.replace(/\./gi, '.\n');
            console.log(`got ${joke}`);
            resolve(joke);
          } else {
            reject('invalid response');
          }
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  }
}
