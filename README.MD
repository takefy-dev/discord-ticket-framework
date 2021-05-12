# What is this ?

Discord ticket is a node module that allow you to create ticket simply and easy

# Installation

`npm i discord-ticket`

# Exemple

```js
const Discord = require('discord.js');
const {TicketsManager} = require('discord-ticket');
const client = new Discord.Client();
// this is a sequelize connection you, if you already have one don't do this.

const db = new Sequelize(config.database.name, config.database.user, config.database.password, {
    dialect: "mysql",
    define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
        timestamps: false,
        freezeTableName: true,
    },
    logging: true
})
client.on('ready', () => {
    console.log("client is ready")
    db.authenticate().then(() => console.log("Db login")).catch(err => console.log(err))
    client.ticket = new TicketsManager(client, db) // parsing the Discord.Client and the database connection

})
client.login('token')
```

## Options

This package require 2 options, both are required for the package to work :

* *Discord.Client*
* *Database connection* - _Sequelize_ 

The dabase connection is required for the package to work only sequelize <br>
is **supported** for **now**

## Setup ticket

Before starting creating ticket the guild must setup the ticket system with the cilent.ticket.setup() method

```js 

client.on('message', async (message) => {
    const prefix = config.prefix;
    if (!message.content.startsWith(prefix)) return;
    if (message.author.bot || message.system) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    args.shift();
    if (message.content.includes(`${prefix}setup`)) {
        client.ticket.setup(message, { // parsing the message where the command is executed
            messageId: args[0], // parsin the messageId of the reactrole if none parse empty string
            modRoles: [args[1]], // give the mod role to be add in ticket important for  moderators to see the ticket
        }).then((res) => {
            message.channel.send('Tickets are now setup');
        })
    }
})

```

## Create a ticket

To create a ticket you simply just do client.ticket.create(welcomeMessage, authorId) <br>
welcomeMessage is a string that will be display <br>

You have the method client.ticket.create that allow you to be creative with for exemple <br>
creating a reactrole _clic to to open a ticket_

<br>
https://cccccccccccccccccccccccccccccccccccccccccccccccccccccccccc.cc/bDW4puBH

```js 
    client.on('message', async (message) => {
    const prefix = config.prefix;
    if (!message.content.startsWith(prefix)) return;
    if (message.author.bot || message.system) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    args.shift();
    if (message.content.includes(`${prefix}create`)) {
        // :create
        // This will create a ticket 
        await client.ticket.create(message, {
            welcomeMessage: 'Welcome',
            authorId: message.author.id,
        }).then(ticket => {
            console.log(ticket);
            //this return the ticket information
        })

    }
})
```

## Delete a ticket

To delete a ticket you can react to the reaction on the welcomeMessage or create a command with
client.ticket.deleteTicket(channelId) method.

```js 
    client.on('message', async (message) => {
    const prefix = config.prefix;
    if (!message.content.startsWith(prefix)) return;
    if (message.author.bot || message.system) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    args.shift();
    if (message.content.includes(`${prefix}close`)) {
        // :close
        // This will close the ticket 
        await client.ticket.deleteTicket(message.channel.id)
    }
})
```

## Add somebody to a ticket

```js 
    client.on('message', async (message) => {
    const prefix = config.prefix;
    if (!message.content.startsWith(prefix)) return;
    if (message.author.bot || message.system) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    args.shift();
    const memberToAdd = message.mentions.members.first().id || args[0]; // this will get the id of the member to add
    if (message.content.includes(`${prefix}add`)) {
        await client.ticket.add(memberToAdd, message.channel.id);
    }
})
```

## Remove somebody to a ticket

```js 
    client.on('message', async (message) => {
    const prefix = config.prefix;
    if (!message.content.startsWith(prefix)) return;
    if (message.author.bot || message.system) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    args.shift();
    const memberToRemove = message.mentions.members.first().id || args[0]; // this will get the id of the member to remove
    if (message.content.includes(`${prefix}remove`)) {
        await client.ticket.remove(memberToRemove, message.channel.id);
    }
})
```

### Support

If you need help you can contact open a github issue
