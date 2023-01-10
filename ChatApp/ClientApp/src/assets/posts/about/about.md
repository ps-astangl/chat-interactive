# The Coop And Pablo Chat App

## About

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
is `ImageBot` which can use [stable diffusion pipelines](https://huggingface.co/docs/diffusers/api/pipelines/stable_diffusion) to create an
image based on the user's input.

All other AI models
are [Medium Or Large GPT-2 Models](https://huggingface.co/gpt2) [fine-tuned using simple transformers](https://simpletransformers.ai/)
on a data derived from the [PushShift API On Comments From Reddit](https://files.pushshift.io/reddit/comments/).

## How It Works

TODO:
Provide a high level description of how it all works. This needs a picture.

### Tech Stack

Technologies:

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
    - Azure Storage Queue/Blobs

### Back-End Architecture

TODO:
In depth description of the back-end architecture. This needs a picture.

### Front-End Architecture/Design

TODO:
In depth description of the front-end architecture. This needs a picture.

### AI Architecture/Design

TODO:
In depth description of the AI architecture. This needs a picture.

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