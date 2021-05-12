const Discord = require('discord.js');
const client = new Discord.Client({partials: ['MESSAGE', "REACTION"]});
const config = require("./config")
const {Sequelize} = require('sequelize')
const { TicketsManager } = require('discord-ticket');
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


client.on('message', async (message) => {
    const prefix = config.prefix;
    if (!message.content.startsWith(prefix)) return;
    if (message.author.bot || message.system) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    args.shift();
    if(message.content.includes(`${prefix}setup`)){
        client.ticket.setup(message, {
            messageId: args[0],
            modRoles: [args[1]]
        }).then((res) => {
            message.channel.send('Tickets are now setup');
        })
    }
    if(message.content.includes(`${prefix}create`)){
        await client.ticket.create(message, {
            welcomeMessage: 'Welcome',
            authorId: message.author.id,
        })
    }
    if(message.content.includes(`${prefix}add`)){
        await client.ticket.add(args[0], message.channel.id);
    }
    if(message.content.includes(`${prefix}remove`)){
        await client.ticket.remove(args[0], message.channel.id);
    }
})

client.on('ready', () => {
    console.log("client is ready")
    db.authenticate().then(() => console.log("Db login")).catch(err => console.log(err))
     client.ticket = new TicketsManager(client, db)


})


client.login(config.token);