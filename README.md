# User Information Dashboard Project
This is a practice of React UI. This dashboard UI pulls data from a backend service. 
This dashboard allows the user to specify a role to view their information in a list.

## Backend Service
Users will be streamed out with 1 second in between.
- [User Provider](https://github.com/yingqiaogit/user-provider)

## Configuration 
- `npm install`
- Add a `.env.development` file in the project folder with the line:
  `VITE_BACKEND_SERVER=http://localhost:8080`

## Run 
- `npm run dev`

### UI
#### With Users
A list of users will be displayed after a role is selected:
![All](readme/all.png)

#### Error
An alert will appear when an error occurs:
![Alert](readme/error.png)
