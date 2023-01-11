# The Coop And Pablo Chat App

## Introduction

The **_GPT2-Chat App_** is an application inspired by the my side
project/hoppy: [r/CoopAndPabloPlayhouse](https://www.reddit.com/r/CoopAndPabloPlayhouse/). An entire subreddit occupied
by bots, that talk amongst each-other constantly. The idea behind this application is to provide a similar user
interface to
communicate with these AI models in real time outside reddit. The design is such that it
emulates
some characteristics similar to those present in social media applications e.g. Facebook, Twitter, Reddit, etc.

In terms of basic experience, a user can log in and create/join _chat rooms_. Each room can be joined by multiple users
where they can chat with each other or with an AI. These rooms are persistent (history is preserved) and take the form
of a _thread_. This is a purposeful design choice to allow users to have a more natural conversation
with each other and with the AI consistent with how users would interact with aforementioned social media websites.

By default, a user will be able to chat with an AI in the _CoopAndPabloPlayHouse_ room. The default AI
is `ImageBot` which can
use [stable diffusion pipelines](https://huggingface.co/docs/diffusers/api/pipelines/stable_diffusion) to create an
image based on the user's input.

All other AI models
are [Medium Or Large GPT-2 Models](https://huggingface.co/gpt2) [fine-tuned using simple transformers](https://simpletransformers.ai/)
on a data derived from the [PushShift API On Comments From Reddit](https://files.pushshift.io/reddit/comments/).

## Tech Stack

Before we talk about how it works and what it does, let's talk about the tech stack. The application is built using:

- Azure
    - Storage Account
        - Azure Table Storage
        - Azure Blob Storage
        - Azure Queue Storage
    - Azure App Service
    - VNET (not required)

- ASP.NET Core 6.0
    - SignalR
    - SPA Hosting Environment (Web Server)
    - HostedService
    - Storage Queue/Tables/Blobs

- Angular 15.0
    - TypeScript
    - Material Design

- Python
    - Torch
    - Hugging Face
    - Simple Transformers
    - Azure Storage Queue/Blobs/Tables (Azure Storage)

Everything in this stack is something we use internally at `CRISP` (except python and torch). This design choice was due
to familiarity with the Azure cloud resources and SDKs and the fact that I wanted to use a stack that I'm familiar
with. This is not to say that other stacks cannot be used, but it is a design choice that I made, and it might change
over-time as it's an ongoing project.

## How It Works

At its core, it's a simple application that consists of 3 primary components tied together
through [Azure Storage](https://learn.microsoft.com/en-us/azure/storage/common/storage-introduction)

- A Server (Back-end): CSharp application that implements   [SignalR](https://dotnet.microsoft.com/apps/aspnet/signalr)
  as the primary mechanism for communication between the server, client, and AI processing engine
- A Client (Front-end): Angular application that implements [SignalR](https://dotnet.microsoft.com/apps/aspnet/signalr)
  as the primary mechanism for communication between the server, client, and AI processing engine
- An AI Processing Engine: Python application that is integrated with the Azure Storage Queue and Blob Storage to
  process requests from the server and client

| Communications Flows                               |
|----------------------------------------------------|
| ![](/assets/posts/about/basic-workflow.drawio.svg) |

In the above diagram, we see the of a life cycle of a message:

1. One or many clients from any platform can connect to the app via SignalR. The backend will establish this connection
   and hold onto the connection until a user disconnects.
2. While Connected, the server will accept the message, create and send a message to the input-queue, and write the
   message to table storage
3. A python worker(s) monitor the input-queue, perform a computationally heavy task, and send the result to the
   output-queue.
4. The backend server will pick up the response from the output-queue, update the table record, and send the message to
   a Client method, and render the result on the webpage

That's it! It sounds so simple right? Well, it is. But it's also a lot of work to get it to work. Let's talk about each
component in more detail.

### Back-End Design And Description

The fun part of this for me is that there is no traditional 'API' the client interacts with. The client interacts with
the server directly via websockets.

So what does that look like?

###### Note: For the sake of brevity, I'm going to skip over the details of how to make a web app and add NuGET packages to it...I'll assume you know how to do that

**Program.cs**
First, we need to add the SignalR a Hub to our application:

```csharp 
app.UseEndpoints(endpoints => 
{ 
    endpoints.MapHub<ChatHub>("/hub"); 
});
```

**ChatHub.cs**
Next, we need to implement an interface and Hub class that will handle the communication between the client and server:

```csharp
public interface IChatHub
{
    Task ReceiveMessage(Message message);
    Task SendMessages(Message[] messages);
    Task SendMessage(Message message);
    Task Connect(Message message);
    Task Disconnect(Message message);
}

public class ChatHub : Hub<IChatHub>
{
    // ...
}
```

And a background service to handle the processing of messages:

**ChatHostedService.cs**
Then we need to add a background service to handle the processing of messages

```csharp
public class ChatHostedService : BackgroundService
{
    // ...
}
```

**Message.cs**
And finally a contract to define the message object:

```csharp
public string Sender { get; set; } = string.Empty;
public string Text { get; set; } = string.Empty;
public string Prompt { get; set; } = string.Empty;
public string ConnectionId { get; set; } = string.Empty;
public string Topic { get; set; } = string.Empty;
public string Channel { get; set; } = string.Empty;
public int CommentId { get; set; }
public bool IsBot { get; set; }
public bool IsThinking { get; set; }
```

The `ChatHub` class implements the `IChatHub` interface. This interface defines the methods that the client can call and
is a typed hub meaning and exposes the methods defined in the interface as the Client/Server contract for the RPC calls.

As an example, when a user clicks the `Connect` button on the client. The client will remotley invoke the `Connect`
method on the hub:`

Client Side Invocation To Connect:

```ts
 this.chatService.getConnection()
    .send('Connect', message)
    .then(() => {
        this.panelOpenState = false;
    });
```

Server Side Method To Connect:

```csharp
public async Task Connect(Message message)
{
    _logger.LogInformation(":: Connect From Client {Id}", message.ConnectionId);
    await Groups.AddToGroupAsync(message.ConnectionId, message.Channel);

    var messages = _tableStorageRepository.GetMessagesForChannel(message.Channel);

    async void Action(Message x)
    {
        await Clients.Client(message.ConnectionId).SendMessage(x);
    }

    messages.ForEach(Action);
    
    await Clients.Group(message.Channel).SendMessage(message);
}
```

In the above code snippets, we see the implementation of the `Connect` method invoked by the client.
The method will add the client to a group, retrieve messages for the group from table storage, and for each message,
execute a call to the front-end to `SendMessage` method defined by the front-end.

```ts
this.chatService.getConnection()
    .send('Connect', message)
    .then(() => {
    });
```

This event is immediately followed by:

```ts
this.chatService.getConnection()
    .send('GetMessagesForChannel', this.channel)
    .then(() => {
    });
```

And looking at the Hub:

```csharp
public async Task GetMessagesForChannel(string channel)
{
    _logger.LogInformation(":: GetMessagesForChannel {Channel}", channel);
    var messages = _tableStorageRepository.GetMessagesForChannel(channel);
    await Clients.Group(channel).SendMessages(messages.ToArray());
}
```

Notices the symmetry?

- The client invokes the `GetMessagesForChannel` method on the server and that method exists in the hub.
- The server invokes the `SendMessages` method on the client and that method exists in the client.

But where is `SendMessages`? It's in a service in the front end but can be thought of as this stub:

```ts
    this.chatService.getConnection().on('SendMessage', (message: Message) => {
    // This is where the message from the server is recieved in the client
});
// or....
this.chatService.getConnection().on('SendMessages', (messages: Message[]) => {
    // This is where the messages from the server are recieved in the client
});
```

I can't stress how important **this is but this is hard it is to follow at first**. The best way to understand it is to think
about it like RPC contracts. The client and server have a contract that defines the methods that can be invoked and the
parameters that can be passed. The client and server are loosely coupled and can be updated independently.

If we can expose a back-end method, we can create a corresponding front-end method to receive it. Within the hub we can do a lot more in terms of routing to channels; but the idea of sending to a client is the same.

### Front-End Architecture/Design

[Let's just look at the app and ask ourselves what we think I did](https://gpt2-chat-app.azurewebsites.net/)

However -  I do want to point out this:

```ts
export interface Message {
  sender: string;
  text: string;
  prompt: string;
  channel: string;
  topic: string;
  connectionId: string;
  commentId: number;
  isThinking: boolean;
  isBot: boolean;
}
```

Note how closely this resembles the `Message` contract in the back-end. This is intentional. This also matches the dictionary python expects to receive from the front-end.


### AI Architecture/Design

The AI is a GPT-2 model that I trained on a dataset of comments from various subreddits subreddit. This topic is extremely complicated, so I'll simplify down to the basics.

- Each bot has a unique model that is trained on a specific subreddit or series of subreddits.

It has its own syntax so let's break it down:
```
<|soss r/{{NAME}}|><|sot|>{{TITLE}}<|eot|><|sost|>{{BODY}}<|eost|><|sor u/{{AUTHOR}}|>{{INITALCOMMENT<|eor|><|sor|>{{REPLY_COMMENT}}<|eor|><|eoss|>
```
The above is a string used for fine-tuning this model. It has `tags`:
- <|soss|>: Start of Post
- <|sot|>: Start Of Title
- <|eot|>: End Of Title
- <|sost|>: Start Of Body
- <|eost|>: End Of Body
- <|sor|>: Start Of Reply
- <|eor|>: End Of Reply
- <|eoss|>: End Of Post

The model knows how to make these strings. And the model is an auto-predict on steroids so...
```
<|soss r/{{NAME}}|><|sot|>{{TITLE}}<|eot|><|sost|>{{BODY}}<|eost|><|sor u/{{AUTHOR}}|>{{INITALCOMMENT<|eor|><|sor|>....It will fill all this out until <|eoss|> and the stop token is reached.
```

Then we can strip out the tags, clean up the text, and post send out the message.

**Python Application**
The underlying mechanism for how this works requires more time than today to explain. We can talk about it during the demo

### Running It Yourself

Don't...The back end and front end are simple enough but the thing that powers the AI is specific with its needs. It's
possible to deploy the python worker as a web job hosted in within the web app but...

**THIS WILL NOT SCALE**

The python worker will quickly exhaust any compute power a typical app service is designed to do.
App services **are not meant** to produce high levels of compute. And AI models are compute intensive and...

**GPU IN THE CLOUD IS NOT CHEAP**

I have found it less expensive to shift the computing to my own workstation as this only requires
the cost of the electricity. If this is to run in the cloud we would need something like hosted VM with access to a GPU.
In that environment the python application can be used in the same manner as the current implementation.