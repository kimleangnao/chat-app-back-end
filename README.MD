#### Setup

MONGO_URI<br />
JWT_SECRET<br />
JWT_LIFETIME

```bash
npm install && npm start
```

#### APIs

/api/v1/auth<br />
/api/v1/search<br />
/api/v1/message<br />
/api/v1/friends<br />

#### Registration

/api/v1/auth/register<br />
Method: POST<br />
Payload: { name, title, email, password }

#### Login

/api/v1/auth/login<br />
Method: POST<br />
Payload: {email, password}

#### Verification while login (when refresh)

/api/v1/auth/verifyToken<br />
Method: POST<br />
Payload: {token}

#### Search for user

/api/v1/search/:searchTerm<br />
Method: GET<br />
Payload: None, use url parameter

#### Send Message

/api/v1/message<br />
Method: POST<br />
Payload: {receiver(id), messageText}

#### Retrieve Messages

/api/v1/message/get
Method: POST<br />
Payload: {receiverId}

#### Add friend

/api/v1/friends<br />
Method: POST<br />
Payload: {recipientId}

#### Accept Friend Request

/api/v1/friends<br />
Method: POST<br />
Payload: {friendRequestId}
