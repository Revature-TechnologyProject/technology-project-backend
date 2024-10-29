# Music Review Forum Backend
Team: Cameron Castanares, Jonathan Her, Kyle Walters
## Project Overview
A website for music enthusiasts to review or share their opinions on different music genres, artists, and songs. The passion for music will be shared to all and expose different people to different types of music, genres, and artists they may not have heard about before.

Frontend Repository Link: https://github.com/hubmelco/technology-project-frontend

## Features
### Login/Register
As a user, I would like to be able to register and login so that I can make posts

### Update Profile Information
As a user, I would like to be able to update my profile so that I can share my background and favorite music genres for others to see

### Tag Posts
As a user, I would like to be able to tag posts so that I can filter posts by tags to see posts related to my likes and dislikes

### Like and Dislike Posts
As a user, I would like to like and dislike posts that share or don't share the same opinion as I do

### Create Replies to Posts
As a user, I would like to reply to posts so that I can have thoughtful discussions about different types of music

### Update/Delete Posts
As a user, I would like to update/delete my posts so that I can fix errors or delete posts that I no longer want to share

### View own Posts
As a user, I would like to be able to view my own posts so that I can easily update and delete them if needed.

### Feed
As a user, I would like to be able to see a feed of posts so that I can view the opinions people have of different music.

### Song search
As a user, I would like to be able to search up songs so that I can create posts about them

## Technology Stack
### Backend
- DynamoDB
- Node.js
- Express.js
- Hashing of passwords (ex. BCrypt)
- JWTs for auth
### Frontend
- React
- TypeScript
### Testing
- Jest
- Cypress
- Postman
### DevOps
- AWS EC2
- CodePipeline (CodeBuild, CodeDeploy)
- AWS S3

## Installation Steps
### DynamoDB
- TableName: `Technology_Project`
- Primary Key
    - Partition Key `class (string)`
    - Sort Key `itemID (number)`
- Secondary Indexes:
    - Local:
        - username-index `Partition Key: class (string), Sort Key: username (string)`
    - Global:
        - class-isFlagged-index `Partition Key: class (string), Sort Key: isFlagged (number)`
        - class-postedBy-index `Partition Key: class (string), Sort Key: postedBy (string)`
- Objects/Entities
    - User
    ``` typescript
    interface User {
        class: "user",
        itemID: string, // uuid.v4
        bio: string,
        genres: string[],
        password: string,
        profileImage: string,
        role: string,
        username: string
    }
    ```
    - Post
    ``` typescript
    interface Post {
        class: "post",
        itemID: string,         // uuid.v4,
        description: string,
        isFlagged: number,
        likedBy: number,
        postedBy: string,       // should be user itemID
        replies: Reply[],
        score: number,
        song: Song,
        tags: {},               // Record of strings to true
        time: number,
        title: string
    }

    interface Reply {
        itemID: string,         // uuid
        postedBy: string,
        description: string
    }

    // Modified Spotify API track
    interface Song {
        name: string,
        link: string,
        image : string,
        spotifyId: string,
        artists: Artist[],
        popularity : number,
    }

    // Modified Spotify API Artist
    interface Artist {
        url: string,
        id: string,
        name: string
    }
    ```

### S3
- Create a bucket `techprojectmedia`
- create folder `images`

### Application
- Install node LTS (https://nodejs.org/en), project built using v20.17.0
- Verify npm is installed with node `npm --version`, project built using v10.8.2
- Create .env file in the root directory following .env.sample file
- Create system environment variables for AWS credentials
    - AWS_ACCESS_KEY_ID
    - AWS_DEFAULT_REGION
    - AWS_SECRET_ACCESS_KEY
- run `npm install`
- start the application with `npm start`

# Endpoints
## GET /users/:userID
Returns user with ID userID

## POST /users
requires `username` and `password` in body

returns the created user and jwt token

## POST /users/login
requires `username` and `password` in body

returns the user and jwt token for the user

## PUT /users/:userID
Updates user with fields in the body. Valid fields are `username`, `genres`, `bio`, `profileImage`


returns the updated user as well as an updated jwt token

## DELETE /users/:userID
Deletes user specifiec by userID. Must be a registered admin.

returns the `data: userID` where userID is the id of the user deleted

## PATCH /users/:userID/role
Updates the role of a user. Must be admin level. Requires `role` in the body. 

returns the token for the updated user

## PATCH /users/:userID/profile-image
Updates the profile image of a user. Must be the account owner or an admin. Requires `image` in the body. `image` must contain `data` and `mime` properties. `data` should be formatted to base64.

returns the updated imageURL for the user

## POST /posts
creates a post. Must be signed in with jwt token. Requires `text`, `score`, `title`, `song`, `tags` in the body. `tags` is optional.

returns the created post

## PATCH /posts/:postID
Updates a post with the provided properties. Valid properties are `description`, `title`, `score`, `flag`. You can only provide `flag` if you do not own the post and aren't an admin

returns the postID and the updatable properties of the post.

## GET /posts/:postID
Retrieves a post by the postID

returns the post

## GET /posts
Retrieves all posts by default. If a query is provided the posts are filtered by the query. Valid query properties are `isFlagged` and `postedBy`

returns an array of posts

## GET /posts/tags/search
Retrieves all post with tags provided in the query. Valid query propties are `tags` and `inclusive`.

returns an array of posts

## PATCH /posts/:postID/replies
Creates a reply by updating the replies attribute in a post. Requires `text` in the body

returns the created reply

## PATCH /posts/postID/likes
Updates the likes of a post. requires `like` in the body.

Returns whether you disliked or liked the post.

## DELETE /posts/postID
Deletes post with itemID=postID

returns the deleted postID

## DELETE /posts/:postId/replies/:replyId
Deletes the reply in a post with id=replyID

returns deleted replyID

## GET /songs
Searches for songs via the spotify API filtered by query properties. Valid properties are `track`, `artist`, `year`, `genre`, `album`, `offset`.

returns an array of songs

