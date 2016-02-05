Running tests
-------------

* npm install
* create a personal access token [here](https://github.com/settings/tokens)
* create a server/configs/secrets.json file with the following contents (replacing XXXXXX with the token generated in the previous step)
  ```
  { "oauthToken": "XXXXXX" }
  ```
  DO NOT COMMIT THE secrets.json FILE
* npm test

