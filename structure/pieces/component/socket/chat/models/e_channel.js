var builder = require('../utils/model_builder');

var attributes_origin = require("./attributes/e_channel.json");
var associations = require("./options/e_channel.json");

module.exports = function (sequelize, DataTypes) {
    var attributes = builder.buildForModel(attributes_origin, DataTypes);
    var options = {
        tableName: 'ID_APPLICATION_e_chat_channel',
        timestamps: true,
		constraints: false
    };

    var Model = sequelize.define('E_channel', attributes, options);

    Model.associate = builder.buildAssociation('E_channel', associations);

    return Model;
};