const { DataTypes, Model } = require("sequelize");

module.exports = class TicketConfig extends Model {
    static init(sequelize){
        return super.init({
            messageId: {
                type: DataTypes.STRING(25),
                primaryKey: true,
            },
            guildId: {
                type: DataTypes.STRING(25),
            },
            modRoles: {
                type: DataTypes.TEXT(),
                get: function () {
                    return JSON.parse(this.getDataValue('modRoles'));
                },
                set: function (value) {
                    this.setDataValue('modRoles', JSON.stringify(value));
                },
            },



        }, {
            tableName: 'TicketConfig',
            sequelize
        })
    }
}