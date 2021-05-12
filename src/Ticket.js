const Discord = require("discord.js");

module.exports = class Ticket {
    /**
     * @param {TicketManager} manager Ticket Manager
     * @param {TicketData} data  The ticket infirmation
     */
    constructor(manager, data) {

        /**
         * The Ticket manager
         * @type {TicketManager}
         */
        this.manager = manager;
        /**
         * The Discord Client
         * @type {Discord.Client}
         */
        this.client = manager.client;
        /**
         * The authorId of the ticket
         * @type {Discord.Snowflake}
         */
        this.authorId = data.authorId;

        /**
         * The ticket id
         * @type {Number}
         *
         */
        this.id = data.id;


        /**
         * The channelId of the ticket
         * @type {Discord.Snowflake}
         */
        this.channelId = data.channelId;

        /**
         * The parentId of the ticket
         * @type {Discord.Snowflake}
         */
        this.parentId = data.parentId;

        /**
         * The welcommeMessageId of the ticket
         * @type {Discord.Snowflake}
         */
        this.welcomeMessageId = data.welcomeMessage


        /**
         * The guildId of the ticket
         * @type {Discord.Snowflake}
         */

        this.guildId = data.guildId;

        /**
         * The ticket data
         * @type {TicketData}
         */

        this.data = data;
        /**
         * The welcome message of the ticket
         * @type {String}
         */

        this.welcomeMessage = data.welcomeMessage;
    }


    set updateId(newId){
        this.id = newId;
    }

    set updateChannelId(newId){
        this.channelId = newId
    }

    set updateWelcomeMessageId(newId){
        this.welcomeMessageId = newId;
    }

    add(authorId){
        const channel = this.client.channels.cache.get(this.channelId);
        channel.updateOverwrite(authorId, {
            VIEW_CHANNEL : true,
            SEND_MESSAGES: true
        })
    }
    remove(authorId){
        const channel = this.client.channels.cache.get(this.channelId);
        channel.updateOverwrite(authorId, {
            VIEW_CHANNEL : false,
            SEND_MESSAGES: false
        })
    }

}