# Note Taking Application

### Goal 

To create an application which can create, read, update, and delete user submitted notes. The users must be logged in to create notes and can only update and delete their own notes. All of the notes must be publicly visible without being logged in.


### Description 

This application takes user input in the form of a note, which is stored securely in a MongoDB database. In order to create a note the user must have an account on the app and be signed in. The user may then view all of their notes as well as edit and delete them. Further, all of the notes written by any user may be viewed publicly without an account on the app. Interaction with the database is facilitated by a custom API created using Express.js. The user interface is minimal, exists only for ease of use interacting with the database API, and is made with the Handlebars template engine.


### How To Run

To run this app locally pull from Github, save env variables like so:
``` $env:username = "emmanwise" ```, and use ``` npm run start ```. 