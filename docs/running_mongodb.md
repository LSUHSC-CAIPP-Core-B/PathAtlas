
In order to run mongodb, you will have to install the community version.
To do so, run the following commands in your terminal:

```bash
$ brew tap mongodb/brew
$ brew install mongodb-community@8.0
```


After you've installed MongoDB (Community Edition), you can start it with:

```bash
$ brew services start mongodb-community
```




Connecting to the Mongo Shell and opening admin

```bash
$ mongosh
$ use admin
```
