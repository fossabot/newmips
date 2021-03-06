/**
 * @apiDefine token
 * @apiParam (Query parameters) {String} token API Bearer Token, required for authentication
 */
/**
 * @apiDefine tokenLimitOffset
 * @apiParam (Query parameters) {String} token API Bearer Token, required for authentication
 * @apiParam (Query parameters) {Integer} [limit=50] The number of rows to be fetched
 * @apiParam (Query parameters) {Integer} [offset=0] The offset by which rows will be fetched
 */

/**
 * @api {get} /api/getToken/ Basic Auth


 * @apiVersion 1.0.0
 * @apiGroup 1-Authentication

 * @apiDescription To be able to interact with the API, you need to generate a Bearer Token using the <code>/api/getToken/</code> url
 *
 * Set your HTTP header like so with basic64 encoding : <code>Authorization clientID:clientSecret</code>

 * @apiExample {node} Example
 * var request = require('request');
 *
 * // API credentials
 * var clientKey = 'THcfYQ7sGW3jRdq';
 * var clientSecret = 'dexXLYNwdhezlxk';
 *
 * // Base64 encoding
 * var auth = 'Basic ' + new Buffer(clientKey + ':' + clientSecret).toString('base64');
 *
 * // API request
 * request(
 *     {
 *         url : 'http://127.0.0.1:9034/api/getToken',
 *         headers : {
 *             "Authorization" : auth
 *         }
 *     },
 *     function (error, response, body) {
 *     	body = JSON.parse(body);
 *         console.log(body.token);
 *     }
 * );

 * @apiHeader {String} ClientID Generated application's API credentials
 * @apiHeader {String} ClientSecret Generated application's API credentials

 * @apiSuccess {String} token Bearer Token, required for further API calls

 * @apiError (Error 500) BadAuthorizationHeader There is an invalid or no authorization header
 * @apiError (Error 401) AuthenticationFailed Couldn't match clientID/clientSecret with database
 */

