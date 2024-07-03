#### Setup

MONGO_URI
JWT_SECRET
JWT_LIFETIME

```bash
npm install && npm start
```

#### APIs

/api/v1/auth
/api/v1/search
/api/v1/message
/api/v1/friends

#### Registration

/api/v1/auth/register
Method: POST
Payload: { name, title, email, password }

#### Login

/api/v1/auth/login
Method: POST
Payload: {email, password}

#### Verification while login (when refresh)

/api/v1/auth/verifyToken
Method: POST
Payload: {token}

#### Search for user

/api/v1/search/:searchTerm
Method: GET
Payload: None, use url parameter

#### Send Message

/api/v1/message
Method: POST
Payload: {receiver(id), messageText}

#### Retrieve Messages

/api/v1/message/get
Method: POST
Payload: {receiverId}

#### Add friend

/api/v1/friends
Method: POST
Payload: {recipientId}

#### Accept Friend Request

/api/v1/friends
Method: POST
Payload: {friendRequestId}
