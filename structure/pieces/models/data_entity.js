var builder = require('../utils/model_builder');

var attributes_origin = require("./attributes/MODEL_NAME_LOWER.json");
var associations = require("./options/MODEL_NAME_LOWER.json");

module.exports = function (sequelize, DataTypes) {
    var attributes = builder.buildForModel(attributes_origin, DataTypes);
    var options = {
        tableName: 'TABLE_NAME',
        timestamps: true
    };

    var Model = sequelize.define('MODEL_NAME', attributes, options);

    Model.associate = builder.buildAssociation('MODEL_NAME', associations);

    return Model;
};