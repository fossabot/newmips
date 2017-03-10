/**
 * @apiDefine token
 * @apiParam (Query parameters) {String} token API Bearer Token, required for authentication
 */

/**
 * @apiDefine tokenLimitOffset
 * @apiParam (Query parameters) {String} token API Bearer Token, required for authentication
 * @apiParam (Query parameters) {Integer} limit The number of rows to be fetched
 * @apiParam (Query parameters) {Integer} offset The offset by which rows will be fetched
 */

/**
 * @api {get} /api/getToken/ Basic Auth

 * @apiName BearerToken
 * @apiGroup 1-Authentication

 * @apiDescription To be able to interact with the API, you need to generate a Bearer Token using the /api/getToken/ url.
 * Set your HTTP header like so with basic64 encoding : Authorization clientID:clientSecret

 * @apiHeader {String} ClientID Generated application's API credentials
 * @apiHeader {String} ClientSecret Generated application's API credentials

 * @apiSuccess {String} token Bearer Token, required for further API calls

 * @apiError (Error 500) BadAuthorizationHeader There is invalid authorization header or none
 * @apiError (Error 401) AuthenticationFailed Couldn't match clientID/clientSecret with database
 */

