const Discord = require("discord.js")
const Tickets = require('./models/Ticket');
const TicketConfig = require('./models/TicketConfig')
const {Collection} = require("discord.js");
const Ticket = require('./Ticket')
const cron = require('node-cron')
module.exports = class TicketManager {
    /**
     * @param {Discord.Client} client Discord Client
     // * @param {TicketManager} options The options
     * @param {Database} database
     */
    constructor(client, database) {
        if (!client) throw new Error("Client is required");
        if (!database) throw new Error("Database is required");
        /**
         * Discord Client
         * @type {Discord.Client}
         */
        this.client = client;

        // /**
        //  * The  options
        //  * @type {TicketManager}
        //  */
        //
        // this.options = options;


        /**
         * The  database
         * @type {Database}
         */
        this.database = database;
        Tickets.init(this.database);
        TicketConfig.init(this.database);
        Tickets.sync();
        TicketConfig.sync();

        /**
         * All the tickets
         * @type {Ticket}
         */
        this.tickets = new Collection();


        this._init();

        this.client.on('messageReactionAdd', async (reaction, user) => {
            if (user.bot) return;
            if (reaction.message.partial) await reaction.message.fetch();
            if (reaction.partial) await reaction.fetch();
            if (reaction.emoji.name !== "🔒") return;
            await reaction.users.remove(user)
            if (!this.tickets.has(reaction.message.channel.id)) return;
            this.deleteTicket(reaction.message.channel.id)
        })

    }


    add(authorId, channelId) {
        if (!this.tickets.has(channelId)) throw new Error('Try to add to a  person none ticket channel')
        this.tickets.get(channelId).add(authorId)
    }

    remove(authorId, channelId) {
        if (!this.tickets.has(channelId)) throw new Error('Try to remove a person to a none ticket channel')

        this.tickets.get(channelId).remove(authorId)
    }

    /**
     *
     * @param message
     * @param options
     * @example {welcomeMmessage: "Hey", authorId: "id"}
     *
     * @returns {Promise<ticket>}
     */

    create(message, options) {
        return new Promise(async (resolve, reject) => {
            if (!message || !message.id) {
                return reject('message is invalid');
            }
            if (!options.welcomeMessage) options.welcomeMessage = `Welcome please wait for support to come`
            const {guild} = message;
            const ticket = new Ticket(this, {
                authorId: options.authorId,
                id: 1,
                guildId: guild.id,
                parentId: message.channel.parentID,
                welcomeMessageId: message.id,
                welcomeMessage: options.welcomeMessage
            })
            this.generateTicketChannel(ticket).then(async (channel) => {
                await Tickets.create({
                    channelId: channel.id,
                    guildId: guild.id,
                    resolved: false,
                    welcomeMessageId: channel.messages.cache.first().id,
                    welcomeMessage: ticket.welcomeMessage,
                    authorId: options.authorId
                }).then((res) => {
                    const ticketDb = res.get();
                    ticket.updateId = ticketDb.ticketId;
                    ticket.updateChannelId = channel.id;
                    ticket.updateWelcomeMessageId = channel.messages.cache.first().id
                    this.tickets.set(channel.id, ticket);

                })
            })
            resolve(ticket);

        })
    }

    async generateTicketChannel(ticket) {
        const guild = this.client.guilds.cache.get(ticket.guildId);
        const author = guild.members.cache.get(ticket.authorId)
        const parentChannel = guild.channels.cache.get(ticket.parentId);
        const guildOptions = await TicketConfig.findOne({
            where: {
                guildId: guild.id,
            }
        })
        const perm = [
            {
                id: author.id,
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],

            },
            {
                id: guild.roles.everyone.id,
                deny: ['VIEW_CHANNEL']
            }
        ]
        for (const id of guildOptions.get().modRoles) {
            perm.push({
                id,
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
            })
        }
        const ticketChannel = await guild.channels.create(`Ticket - ${author.user.username}`, {
            type: 'text',
            topic: "Ticket manager by TakeFy",
            parent: parentChannel,
            reason: `Ticket created`,
            permissionOverwrites: perm
        });

        await ticketChannel.send({
            embed: {
                description: ticket.welcomeMessage,
            }
        }).then(m => m.react('🔒'));
        await ticketChannel.send(`${author}`).then((m) => m.delete());
        return ticketChannel
    }


    /**
     *
     * @example {
     *     messageId: (for clic to open ticket)
     *     guildId: (the guildId)
     *     modRoles: (the modroles)
     *     welcomeMessage: (the welcome message to put in embed)
     * }
     */

    async setup(message, options) {
        if (!options) throw new Error('Options is required to do the setup');
        if (!options.messageId) throw  new Error('No messageId was provided in the option object');
        if (!options.modRoles) throw  new Error('No modRoles array was provided in the option object');
        if (!options.welcomeMessage) options.welcomeMessage = `Support will come shortly please wait`;
        for (const id of options.modRoles) {
            const role = message.guild.roles.cache.get(id);
            if (!role) throw new Error(`Role with the id ${id} does not exist`);
        }
        try {
            return await TicketConfig.create({
                messageId: options.messageId,
                guildId: message.guild.id,
                modRoles: options.modRoles,
                welcomeMessage: options.welcomeMessage
            })
        } catch (e) {
            throw new Error(e);
        }
    }


    deleteTicket(channelId) {
        const channel = this.client.channels.cache.get(channelId);
        if (channel && !channel.deleted) {
            channel.send({
                embed: {
                    description: `The ticket will be closed in 5s`,
                    color: 'RED'
                }
            })
            setTimeout(() => {
                channel.delete(`Ticket closed`)
            }, 5000)
        }
        Tickets.destroy({where: {channelId}}).then(() => {
            if (this.tickets.has(channelId)) {
                this.tickets.delete(channelId);
            }
        })
    }

    async _init() {
        const rawTickets = await Tickets.findAll();
        if (rawTickets.length > 0) {
            for (const rawTicket of rawTickets) {
                const {
                    ticketId,
                    channelId,
                    guildId,
                    resolved,
                    welcomeMessageId,
                    authorId,
                    welcomeMessage
                } = rawTicket.get();
                const guild = this.client.guilds.cache.get(guildId);
                const channel = guild.channels.cache.get(channelId);
                if (!channel || channel.deleted) this.deleteTicket(channelId);
                this.tickets.set(channelId, new Ticket(this, {
                    authorId: authorId,
                    welcomeMessageId: welcomeMessageId,
                    welcomeMessage: welcomeMessage,
                    guildId,
                    channelId: channel.id,
                    parentId: channel.parentID,
                    id: ticketId,
                }))
            }
        }

        cron.schedule('*/5 * * * *', () => {
            if (!this.tickets.size > 0) {
                this.tickets.forEach(ticket => {
                    const channel = this.client.channels.cache.get(ticket.channelId);
                    if (!channel || channel.deleted) {
                        this.deleteTicket(ticket.channelId);
                    }
                })
            }
        })
    }


}