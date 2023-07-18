# TENSFER

## Starting the Application

1. Create a .env file and copy the contents of .env.schema into it, then fill in all the values
2. Run `yarn ` or `npm install` to install dependencies

```javascript
  $ yarn
  $ npm install
```

3. Run `yarn run start:dev` or `npm start:dev` to start the application locally

```javascript
  $ yarn
  $ npm install
```

## Using the Application

There are two endpoints

1. Create - Create a user, saves to the database and request a confirmation code which would be sent to the user's email.
   ```shell
    Method: POST
    Body: {
      email
      password
    }
   ```
   In a second path where the user recently has authenticated recently, the user is authenticated without confirmation code and user document is updated with information from the account
   <hr/>
2. Validate - Validates the code against the user and updates the user document with the information from the account
   ```shell
    Method: PUT
    Body: {
      code
      id
    }
   ```
