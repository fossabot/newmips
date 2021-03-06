var crypto = require('crypto');
var studioConfig = require('../config/studio_manager.json');
var cloudConfig = require('../config/cloud_manager.json');
var request = require('request');

var algorithm = 'aes-256-ctr';

function encrypt(text, securityKey){
	var cipher = crypto.createCipher(algorithm, securityKey);
	var crypted = cipher.update(text,'utf8','hex')
	crypted += cipher.final('hex');
	return crypted;
}

function decrypt(text, securityKey) {
	var decipher = crypto.createDecipher(algorithm, securityKey)
	var dec = decipher.update(text,'hex','utf8')
	dec += decipher.final('utf8');
	return dec;
}

function getAuthorization(config) {
	var cryptedLogin = encrypt(config.login, config.securityKey);
	var cryptedPassword = encrypt(config.password, config.securityKey);
	var auth = "Basic "+ new Buffer(cryptedLogin+":"+cryptedPassword).toString("base64");

	return auth;
}

////////////////////
// Studio-manager //
////////////////////
exports.createApplicationDns = function(subdomain, name_application, id_application) {
	return new Promise(function(resolve, reject) {
		var url = studioConfig.url+'/api/environment/application/create';
		request.post({
			headers: {
				"Authorization": getAuthorization(studioConfig),
				'content-type' : 'application/json'
			},
			url: url,
			rejectUnauthorized: false,
		    form: {subdomain: subdomain, application_name: name_application, id_application: id_application}
		}, function(error, response, body) {
			if (error) {
				console.log(error);
				return reject({error: error, response: response});
			}
			resolve({response: response, body: body});
		});
	});
}

///////////////////
// Cloud-manager //
///////////////////
exports.createCloudDns = function(subdomain, user) {
	return new Promise(function(resolve, reject) {
		var url = cloudConfig.url+'/api/environment/create';
		request.post({
			headers: {
				"Authorization": getAuthorization(cloudConfig),
				'content-type' : 'application/json'
			},
			url: url,
			rejectUnauthorized: false,
		    form: {subdomain: subdomain, user: user}
		}, function(error, response, body) {
			if (error) {
				console.log(err);
				return reject({error: error, response: response});
			}

			body = JSON.parse(body);
			// Set cloud-manager's waiting room url. It'll wait for new cloud environment to be ready
			body.url = cloudConfig.url+'/waiting?redirect='+body.url;
			resolve({response: response, body: body});
		});
	});
}
