
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

Connecting to the Mongo Shell and opening a database

```bash
$ mongosh
$ use path-atlas
```

Let's create a user to be used.

```bash
$ db.createUser({ user: "path-atlas", pwd: passwordPrompt(), roles: [ { role: "readWrite", db: "path-atlas" } ] })
```

Let's verify if the user exists

```bash
$ db.getUsers()
```

Once the user has be created, make sure you specify the login credentials are used in the environment variables

```env
DATABASE_USER=<username>
DATABASE_PASS=<password>
```

While you're at it, update the host environment variables

```env
DATABASE_NAME=<database name>
DATABASE_URL=<host or ip>
DATABASE_PROTOCOL=mongodb or mongodb+srv
```
