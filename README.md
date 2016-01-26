Running tests
-------------

* npm install
* create a personal access token [here](https://github.com/settings/tokens)
* create a server/config.json file with the following contents (replacing XXXXXX with the token generated in the previous step)
```
{ "oauthToken": "XXXXXX" }
```
DO NOT COMMIT THIS FILE
* npm test

