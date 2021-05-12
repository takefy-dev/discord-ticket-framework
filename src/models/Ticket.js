const { DataTypes, Model } = require("sequelize");

module.exports = class Ticket extends Model {
    static init(sequelize){
        return super.init({
            ticketId: {
                type: DataTypes.INTEGER,    
                autoIncrement: true,
                primaryKey: true,

            },
            channelId: {
                type: DataTypes.STRING(25),
            },
            guildId: {
                type: DataTypes.STRING(25),
            },
            resolved :{
                type:  DataTypes.BOOLEAN,
            },
            welcomeMessageId:{
                type: DataTypes.STRING(25)
            },
            authorId: {
                type: DataTypes.STRING(25)
            },
            welcomeMessage: {
                type: DataTypes.TEXT

            }
        }, {
            tableName: 'Ticket',
            sequelize
        })
    }
}