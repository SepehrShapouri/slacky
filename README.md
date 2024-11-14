content that needs to be modified in threads
we have the main parent message.
it can be deleted from the panel,
it can be edited from the panel,
it can be reacted to from the panel,

```required features for the parent message in threads panel

```

[x] - delete parent message from threads panel
[x] - edit parent message from threads panel
[x] - react to parent message from the threads panel

all three actions are actions that not only should be effective on the threads panel instance of the message,
but also they should update the message in the main message list.

```
when deleting the parent message through the threads panel, the message should be deleted from the main message list
when editing the parent message through the threads panel, the messags should be edited in the message list aswell
when reacting to the parent message through the threads panel, the message should be reacted to in the message list aswell
```

[x] - delete parent message from the message list upon deletion in threads panel
[x] - edit parent message in the message list upon editing in the threads panel
[x] - add reactions to the parent message in the message list upon message bein reacted to in the threads panel

‍

```
when the parent message has been deleted, it should be in realtime,
meaning that the parent message should be deleted for all clients in the socket room.
meaning we need to omit the changes to the room so all clients recieve it,
therefore the parent message that was deleted,
will be deleted for everyone in realtime in both the threads panel and the message list.
----------
when the parent message has been edited, it should be edited in realtime for all the users in the socket room,
meaning all clients connected to the socket room should receive the updated message,
 in both their treads panel and in the message list,
"in realtime".
meaning we have to omit the new updated message to the socket,
 and listen for it, we are listening for it in realtime as of now.
-----------
when the parent message has been reacted to through the threads panel,
 it should be updated in realtime in both the threads panel and the messages list for every client connected to the room.
meaning we have to omit the reaction to the socket, and listen for it in both the panel and the message list.
```

[x] - realtime updates for parent message deletion
[x] - realtime updates for parent message editing
[x] - realtime updates for parent message reactions
