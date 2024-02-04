
# TripWise
TripWise is a mobile application that helps you optimize your free time during your business trip by recommending activities and restaurants based on your interests. 

# Production Test
## Installation

1- Clone the repository \
2- Setup frontend
```console
cd frontend/TripWise
npm install
```
2 a) Web
```console
npm run web
```
2 b) Android (android studio required) 
```console
npx expo run:android
```

2 c) IOS (Xcode required) 
```console
npx expo run:ios
```

3- Setup backend
```console
cd backend
npm install
npm run start
```

## Overview Project Structure
We are using a monolithic repository that contains the code for our frontend, NodeJS server, and Python server (each in their respective folders).

### Frontend Structure
The Frontend is broken up into "Screens" which are further broken up into "Components". To navigate between screens we use the react-navigation Router. The Router contains "Stacks", different stacks are served to the user based on their authentication status (Example: loggedInStack). 

  
### NodeJS Server Structure
The NodeJS server contains three files: Trips.JS, Users.JS, Places.JS
Each of these files contain the appropriate API routes.


### Python Server Structure
//TODO

## Flowchart
![engr490flowchart drawio](https://github.com/mattmazzone/engr-490/assets/68865174/d0d5248d-1a40-43e5-b8a3-e2e841c7c4f2)

