var fs = require("fs-extra");
var domHelper = require('../utils/jsDomHelper');
var translateHelper = require("../utils/translate");
var helpers = require("../utils/helpers");
var moment = require("moment");

function setupComponentModel(idApplication, folderComponent, componentName, filename, callback) {
    // CREATE MODEL FILE
    var modelTemplate = fs.readFileSync('./structure/pieces/component/' + folderComponent + '/models/model_' + filename + '.js', 'utf8');
    modelTemplate = modelTemplate.replace(/COMPONENT_NAME_LOWER/g, componentName);
    modelTemplate = modelTemplate.replace(/COMPONENT_NAME/g, componentName.charAt(0).toUpperCase() + componentName.toLowerCase().slice(1));
    modelTemplate = modelTemplate.replace(/TABLE_NAME/g, idApplication + '_' + componentName);
    var writeStream = fs.createWriteStream('./workspace/' + idApplication + '/models/' + componentName + '.js');
    writeStream.write(modelTemplate);
    writeStream.end();
    writeStream.on('finish', function () {
        callback();
    });
}

function createComponentAttributesAndOptionsFiles(idApplication, folderComponent, componentName, filename, source, callback) {
    // CREATE MODEL ATTRIBUTES FILE
    var attributesTemplate = fs.readFileSync('./structure/pieces/component/' + folderComponent + '/models/attributes/attributes_' + filename + '.json', 'utf8');
    var writeStream = fs.createWriteStream('./workspace/' + idApplication + '/models/attributes/' + componentName + '.json');
    writeStream.write(attributesTemplate);
    writeStream.end();
    writeStream.on('finish', function () {
        // CREATE MODEL OPTIONS (ASSOCIATIONS) FILE
        var optionsTemplate = fs.readFileSync('./structure/pieces/component/' + folderComponent + '/models/options/options_' + filename + '.json', 'utf8');
        optionsTemplate = optionsTemplate.replace(/SOURCE_ENTITY_LOWER/g, source);
        var writeStreamOption = fs.createWriteStream('./workspace/' + idApplication + '/models/options/' + componentName + '.json');

        writeStreamOption.write(optionsTemplate);
        writeStreamOption.end();
        writeStreamOption.on('finish', function () {
            callback();
        });
    });
}

function setupComponentRoute(idApplication, folderComponent, componentName, urlSource, filename, source, callback) {
    // CREATE ROUTE FILE
    var routeTemplate = fs.readFileSync('./structure/pieces/component/' + folderComponent + '/routes/route_' + filename + '.js', 'utf8');
    routeTemplate = routeTemplate.replace(/COMPONENT_NAME_LOWER/g, componentName.toLowerCase());
    routeTemplate = routeTemplate.replace(/COMPONENT_NAME_URL/g, componentName.toLowerCase().substring(2));
    routeTemplate = routeTemplate.replace(/COMPONENT_NAME/g, componentName.charAt(0).toUpperCase() + componentName.toLowerCase().slice(1));
    routeTemplate = routeTemplate.replace(/SOURCE_ENTITY_LOWER/g, source.toLowerCase());
    routeTemplate = routeTemplate.replace(/SOURCE_URL_ENTITY_LOWER/g, urlSource.toLowerCase());

    var writeStream = fs.createWriteStream('./workspace/' + idApplication + '/routes/' + componentName.toLowerCase() + '.js');
    writeStream.write(routeTemplate);
    writeStream.end();
    writeStream.on('finish', function () {
        callback();
    });
}

function setupComponentRouteForAgenda(idApplication, valueAgenda, valueEvent, valueCategory, callback) {

    var valueAgendaModel = valueAgenda.charAt(0).toUpperCase() + valueAgenda.toLowerCase().slice(1);
    var valueEventModel = valueEvent.charAt(0).toUpperCase() + valueEvent.toLowerCase().slice(1);
    var valueCategoryModel = valueCategory.charAt(0).toUpperCase() + valueCategory.toLowerCase().slice(1);

    var urlRouteAgenda = valueAgenda.substring(2).toLowerCase();

    // CREATE ROUTE FILE
    var routeTemplate = fs.readFileSync('./structure/pieces/component/agenda/routes/route_agenda.js', 'utf8');

    routeTemplate = routeTemplate.replace(/CODE_NAME_LOWER/g, valueAgenda);
    routeTemplate = routeTemplate.replace(/URL_ROUTE/g, urlRouteAgenda);

    routeTemplate = routeTemplate.replace(/CODE_NAME_EVENT_MODEL/g, valueEventModel);
    routeTemplate = routeTemplate.replace(/CODE_NAME_EVENT_URL/g, valueEvent.substring(2));

    routeTemplate = routeTemplate.replace(/CODE_NAME_CATEGORY_MODEL/g, valueCategoryModel);
    routeTemplate = routeTemplate.replace(/CODE_NAME_CATEGORY_URL/g, valueCategory.substring(2));

    var writeStream = fs.createWriteStream('./workspace/' + idApplication + '/routes/' + valueAgenda + '.js');
    writeStream.write(routeTemplate);
    writeStream.end();
    writeStream.on('finish', function () {
        callback();
    });
}

function setupComponentViewForAgenda(idApplication, valueComponent, valueEvent, callback) {

    // Calendar View
    var codeName = valueComponent.toLowerCase();

    var componentViewFolder = __dirname + '/pieces/component/agenda/views';
    var viewsFolder = __dirname + '/../workspace/' + idApplication + '/views/' + codeName;
    fs.copySync(componentViewFolder, viewsFolder);

    var viewPiece = __dirname + '/../workspace/' + idApplication + '/views/agenda/view_agenda.dust';
    var viewFile = __dirname + '/../workspace/' + idApplication + '/views/' + codeName + '/view_agenda.dust';

    var viewTemplate = fs.readFileSync(viewFile, 'utf8');
    viewTemplate = viewTemplate.replace(/CODE_NAME_LOWER/g, codeName);
    viewTemplate = viewTemplate.replace(/CODE_NAME_EVENT_LOWER/g, valueEvent);
    viewTemplate = viewTemplate.replace(/URL_ROUTE/g, codeName.substring(2));
    viewTemplate = viewTemplate.replace(/URL_EVENT/g, valueEvent.toLowerCase().substring(2));

    var writeStream = fs.createWriteStream(viewFile);
    writeStream.write(viewTemplate);
    writeStream.end();
    writeStream.on('finish', function () {

        // Copy the event view folder
        var componentEventViewFolder = __dirname + '/pieces/component/agenda/views_event';
        var eventViewsFolder = __dirname + '/../workspace/' + idApplication + '/views/' + valueEvent;

        fs.copySync(componentEventViewFolder, eventViewsFolder);

        // Replace variable in each files
        var fileToReplace = ["show_fields", "create_fields", "update_fields"];
        var urlEvent = valueEvent.toLowerCase().substring(2);

        for(var i=0; i<fileToReplace.length; i++){
            var eventFile = __dirname + '/../workspace/' + idApplication + '/views/' + valueEvent + '/'+fileToReplace[i]+'.dust';
            var eventTemplate = fs.readFileSync(eventFile, 'utf8');

            eventTemplate = eventTemplate.replace(/CODE_NAME_EVENT_LOWER/g, valueEvent);
            eventTemplate = eventTemplate.replace(/URL_EVENT/g, urlEvent);

            fs.writeFileSync(eventFile, eventTemplate, 'utf8');
        }

        // Inject custom_js
        var fileToInject = ["create", "update"];

        for(var i=0; i<fileToInject.length; i++){
            var eventFile = __dirname + '/../workspace/' + idApplication + '/views/' + valueEvent + '/'+fileToInject[i]+'.dust';
            var eventTemplate = fs.readFileSync(eventFile, 'utf8');

            eventTemplate += "\n\n"+
            "{<custom_js}\n"+
            "    <script type='text/javascript'>\n"+
            "        var format;\n"+
            "        if (lang_user == 'fr-FR')\n"+
            "            format = 'DD/MM/YYYY HH:mm';\n"+
            "        else\n"+
            "            format = 'YYYY-MM-DD HH:mm';\n"+
            "        $(document).on('click', 'button[type=\"submit\"]', function(){\n"+
            "            if($('input[name=\"f_start_date\"]').val() != '' && $('input[name=\"f_end_date\"]').val() != ''){\n"+
            "                var start = moment($('input[name=\"f_start_date\"]').val(), format);\n"+
            "                var end = moment($('input[name=\"f_end_date\"]').val(), format);\n"+
            "                if(end.diff(start) < 0){\n"+
            "                    toastr.error(\"Error: Start date is after end date.\");\n"+
            "                    return false;\n"+
            "                }\n"+
            "            }\n"+
            "            if($('input[name=\"f_end_date\"]').val() != '' && $('input[name=\"f_start_date\"]').val() != ''){\n"+
            "                var start = moment($('input[name=\"f_start_date\"]').val(), format);\n"+
            "                var end = moment($('input[name=\"f_end_date\"]').val(), format);\n"+
            "                if(end.diff(start) < 0){\n"+
            "                    toastr.error(\"Error: End date is before start date.\");\n"+
            "                    return false;\n"+
            "                }\n"+
            "            }\n"+
            "            return true;"+
            "        });\n"+
            "        $(document).on('dp.change', 'input[name=\"f_start_date\"]', function(){\n"+
            "            if($(this).val() != '' && $('input[name=\"f_end_date\"]').val() != ''){\n"+
            "                var start = moment($(this).val(), format);\n"+
            "                var end = moment($('input[name=\"f_end_date\"]').val(), format);\n"+
            "                if(end.diff(start) < 0){\n"+
            "                    $(this).val('');\n"+
            "                }\n"+
            "            }\n"+
            "        });\n"+
            "        $(document).on('dp.change', 'input[name=\"f_end_date\"]', function(){\n"+
            "            if($(this).val() != '' && $('input[name=\"f_start_date\"]').val() != ''){\n"+
            "                var start = moment($('input[name=\"f_start_date\"]').val(), format);\n"+
            "                var end = moment($(this).val(), format);\n"+
            "                if(end.diff(start) < 0){\n"+
            "                    $(this).val('');\n"+
            "                }\n"+
            "            }\n"+
            "        });\n"+
            "    </script>\n"+
            "{/custom_js}\n";

            fs.writeFileSync(eventFile, eventTemplate, 'utf8');
        }


        callback();

        /*var eventShowFile = __dirname + '/../workspace/' + idApplication + '/views/' + valueEvent + '/show_fields.dust';
        var eventCreateFile = __dirname + '/../workspace/' + idApplication + '/views/' + valueEvent + '/create_fields.dust';
        var eventUpdateFile = __dirname + '/../workspace/' + idApplication + '/views/' + valueEvent + '/update_fields.dust'

        var eventShowTemplate = fs.readFileSync(eventShowFile, 'utf8');
        var eventCreateTemplate = fs.readFileSync(eventCreateFile, 'utf8');
        var eventUpdateTemplate = fs.readFileSync(eventUpdateFile, 'utf8');

        eventShowTemplate = eventShowTemplate.replace(/CODE_NAME_EVENT_LOWER/g, valueEvent);
        eventShowTemplate = eventShowTemplate.replace(/URL_EVENT/g, valueEvent.toLowerCase().substring(2));
        eventCreateTemplate = eventCreateTemplate.replace(/CODE_NAME_EVENT_LOWER/g, valueEvent);
        eventCreateTemplate = eventCreateTemplate.replace(/URL_EVENT/g, valueEvent.toLowerCase().substring(2));
        eventUpdateTemplate = eventUpdateTemplate.replace(/CODE_NAME_EVENT_LOWER/g, valueEvent);
        eventUpdateTemplate = eventUpdateTemplate.replace(/URL_EVENT/g, valueEvent.toLowerCase().substring(2));

        var writeStreamEventShow = fs.createWriteStream(eventShowFile);
        writeStreamEventShow.write(eventShowTemplate);
        writeStreamEventShow.end();

        var writeStreamEventCreate = fs.createWriteStream(eventCreateFile);
        writeStreamEventCreate.write(eventCreateTemplate);
        writeStreamEventCreate.end();

        var writeStreamEventUpdate = fs.createWriteStream(eventUpdateFile);
        writeStreamEventUpdate.write(eventUpdateTemplate);
        writeStreamEventUpdate.end();

        writeStreamEventUpdate.on('finish', function () {
            callback();
        });*/
    });
}

function addTab(attr, file, newLi, newTabContent) {
    return new Promise(function (resolve, reject) {
        var source = attr.options.source.toLowerCase();
        domHelper.read(file).then(function ($) {
            // Tabs structure doesn't exist, create it
            var tabs = '';
            var context;
            if ($("#tabs").length == 0) {
                tabs += '<div class="nav-tabs-custom" id="tabs">';
                tabs += '   <!--{^hideTab}-->';
                tabs += '	<ul class="nav nav-tabs">';
                tabs += '		<li class="active"><a data-toggle="tab" href="#home">{@__ key="entity.' + source + '.label_entity" /}</a></li>';
                tabs += '	</ul>';
                tabs += '   <!--{/hideTab}-->';
                tabs += '	<div class="tab-content" style="min-height:275px;">';
                tabs += '		<div id="home" class="tab-pane fade in active"></div>';
                tabs += '	</div>';
                tabs += '</div>';
                context = $(tabs);
                $("#home", context).append($("#fields"));
                $("#home", context).append($(".actions"));
            } else {
                context = $("#tabs");
            }

            // Append created elements to `context` to handle presence of tab or not
            $(".nav-tabs", context).append(newLi);
            $(".tab-content", context).append('<!--{^hideTab}-->');
            $(".tab-content", context).append(newTabContent);
            $(".tab-content", context).append('<!--{/hideTab}-->');
            $('body').empty().append(context);
            domHelper.write(file, $).then(function () {
                resolve();
            });
        });
    });
}

function addAccessManagment(idApplication, urlComponent, urlModule, callback) {
    // Write new data entity to access.json file, within module's context
    var accessPath = __dirname + '/../workspace/' + idApplication + '/config/access.json';
    var accessObject = require(accessPath);
    accessObject[urlModule.toLowerCase()].entities.push({
        name: urlComponent,
        groups: [],
        actions: {
            read: [],
            write: [],
            delete: []
        }
    });
    fs.writeFile(accessPath, JSON.stringify(accessObject, null, 4), function (err) {
        callback();
    });
}

function replaceValuesInFile(filePath, valueToFind, replaceWith) {
    var fileContent = fs.readFileSync(filePath, 'utf8');
    var reg = new RegExp(valueToFind, "g");
    fileContent = fileContent.replace(reg, replaceWith);
    fs.writeFileSync(filePath, fileContent);
}

exports.newLocalFileStorage = function (attr, callback) {

    var componentName = attr.options.value;
    var componentNameLower = componentName.toLowerCase();
    var urlComponent = attr.options.urlValue.toLowerCase();

    var showComponentName = attr.options.showValue;

    var source = attr.options.source;
    var sourceLower = source.toLowerCase();
    var urlSource = attr.options.urlSource;

    var filename = "local_file_storage";

    setupComponentModel(attr.id_application, filename, componentNameLower, filename, function () {
        createComponentAttributesAndOptionsFiles(attr.id_application, filename, componentName, filename, source, function () {
            setupComponentRoute(attr.id_application, filename, componentName, urlSource, filename, source, function () {
                // Add access managment to the component route
                addAccessManagment(attr.id_application, urlComponent, attr.options.moduleName.substring(2), function () {
                    /* --------------- New translation --------------- */
                    translateHelper.writeLocales(attr.id_application, "component", componentName, showComponentName, attr.googleTranslate, function () {
                        // GET COMPONENT PIECES TO BUILD STRUCTURE FILE
                        var componentPiece = fs.readFileSync('./structure/pieces/component/' + filename + '/views/view_' + filename + '.dust', 'utf8');

                        var componentContent = componentPiece.replace(/COMPONENT_NAME_LOWER/g, componentNameLower);
                        componentContent = componentContent.replace(/COMPONENT_URL_NAME_LOWER/g, urlComponent);
                        componentContent = componentContent.replace(/SOURCE_LOWER/g, sourceLower);

                        var newLi = '<li><a id="' + componentNameLower + '-click" data-toggle="tab" href="#' + componentNameLower + '">{@__ key="component.' + componentNameLower + '.label_component" /}</a></li>';
                        var file = __dirname + '/../workspace/' + attr.id_application + '/views/' + sourceLower + '/show_fields.dust';

                        // CREATE THE TAB IN SHOW FIELDS
                        addTab(attr, file, newLi, componentContent).then(callback);
                    });
                });
            });
        });
    });
}

exports.newPrint = function(attr, callback){

	var nameComponent = attr.options.value;
	var nameComponentLower = nameComponent.toLowerCase();
	var showComponentName = attr.options.showValue;
	var entityLower = attr.options.source.toLowerCase();
	var idApp = attr.id_application;

	translateHelper.writeLocales(idApp, "component", nameComponent, showComponentName, attr.googleTranslate, function(){
		var showFieldsPath = __dirname+'/../workspace/'+idApp+'/views/'+entityLower+'/show_fields.dust';

		domHelper.read(showFieldsPath).then(function($) {
			var newLi = '<li><a id="'+nameComponentLower+'-click" data-toggle="tab" href="#'+nameComponentLower+'"><!--{@__ key="component.'+nameComponentLower+'.label_component" /}--></a></li>';
			var componentContent = "";
			componentContent += "<div id='"+nameComponentLower+"' class='tab-pane fade'>\n";
			componentContent += "<style>";
			componentContent += "	@media print {";
			componentContent += "		body{";
			componentContent += "			height: 100%;";
			componentContent += "		}";
			componentContent += "		body * {";
			componentContent += "			visibility: hidden;";
			componentContent += "			overflow: visible;";
			componentContent += "		}";
			componentContent += "		#"+nameComponentLower+"-content,";
			componentContent += "		#"+nameComponentLower+"-content * {";
			componentContent += "			visibility: visible;";
			componentContent += "		}";
			componentContent += "		#"+nameComponentLower+"-content {";
			componentContent += "			position: absolute;";
			componentContent += "			left: 0;";
			componentContent += "			top: 0;";
			componentContent += "			margin: 0px;";
			componentContent += "			padding: 15px;";
			componentContent += "			border: 0px;";
			componentContent += "			width: 100%;";
			componentContent += "			height: 100%;";
			componentContent += "			overflow: visible;";
			componentContent += "		}";
			componentContent += "		#"+nameComponentLower+"{";
			componentContent += "			height: 100%;";
			componentContent += "			overflow: visible;";
			componentContent += "		}";
			componentContent += "		.tab-content{";
			componentContent += "			height: 100%;";
			componentContent += "			min-height: 100%;";
			componentContent += "			overflow: visible;";
			componentContent += "		}";
			componentContent += "		.content-wrapper{";
			componentContent += "			height: 100%;";
			componentContent += "			min-height: 100%;";
			componentContent += "			overflow: visible;";
			componentContent += "		}";
			componentContent += "		.wrapper{";
			componentContent += "			height: 100%;";
			componentContent += "			min-height: 100%;";
			componentContent += "			overflow: visible;";
			componentContent += "		}";
			componentContent += "	}";
			componentContent += "</style>";
			componentContent += "	<button data-component='"+nameComponentLower+"' class='component-print-button btn btn-info'><i class='fa fa-print' aria-hidden='true' style='margin-right:5px;'></i><!--{@__ key=\"global_component.print.action\"/}--></button>\n";
			componentContent += "	<div id='"+nameComponent+"-content' class='print-tab'>\n";

			if($("#tabs .tab-pane").length == 0){
				var titleTab = attr.options.showSource;
				var htmlToInclude = "{>\""+entityLower+"/show_fields\" hideTab=\"true\"/}"
				var contentToAdd = "<div class='dontbreakitplz'><legend>" + titleTab + "</legend>" + htmlToInclude+ "</div>";

				// Change ID to prevent JS errors in DOM
				contentToAdd = contentToAdd.replace(/id=['"](.[^'"]*)['"]/g, "id=\"$1_print\"");
				componentContent += contentToAdd;
			} else{
				$("#tabs .tab-pane").each(function(){
					// Don't add other print tab in the new print tab
					if($(this).find(".print-tab").length == 0){
						var titleTab = $("a[href='#"+$(this).attr("id")+"']").html();
						var htmlToInclude = "";
						if($(this).attr("id") == "home")
							htmlToInclude = "{>\""+entityLower+"/show_fields\" hideTab=\"true\"/}"
						else
							htmlToInclude = $(this)[0].innerHTML;

						var contentToAdd = "<div class='dontbreakitplz'><legend>" + titleTab + "</legend>" + htmlToInclude+ "</div>";

						// Change ID to prevent JS errors in DOM
						contentToAdd = contentToAdd.replace(/id=['"](.[^'"]*)['"]/g, "id=\"$1_print\"");
						componentContent += contentToAdd;
					}
				});
			}

			componentContent += "	</div>";
			componentContent += "</div>";
			componentContent = componentContent.replace("&nbsp;", "");

			addTab(attr, showFieldsPath, newLi, componentContent).then(callback);
		});
	});
}

exports.deletePrint = function (attr, callback) {

    var entityLower = attr.options.source.toLowerCase();
    var idApp = attr.id_application;
    var componentNameLower = attr.options.value.toLowerCase();
    var showFieldsPath = __dirname + '/../workspace/' + idApp + '/views/' + entityLower + '/show_fields.dust';

    domHelper.read(showFieldsPath).then(function ($) {
        try {
            $("#" + componentNameLower).remove();
            $("#" + componentNameLower + "-click").parents("li").remove();
            domHelper.write(showFieldsPath, $).then(function () {
                callback();
            });
        } catch (err) {
            callback(err, null);
        }
    });
}

exports.newContactForm = function (attr, callback) {

    var idApp = attr.id_application;

    // Contact Form entity
    var codeName = attr.options.value;
    var showName = attr.options.showValue;
    var urlName = attr.options.urlValue.toLowerCase();

    // Contact Form Settings entity
    var codeNameSettings = attr.options.valueSettings;
    var showNameSettings = attr.options.showValueSettings;
    var urlNameSettings = attr.options.urlValueSettings;

    var workspacePath = __dirname + '/../workspace/' + idApp;
    var piecesPath = __dirname + '/../structure/pieces/component/contact_form';

    var toSyncObject = JSON.parse(fs.readFileSync(workspacePath + '/models/toSync.json'));
    if(typeof toSyncObject.queries !== "object")
        toSyncObject.queries = [];
    toSyncObject[idApp + "_" + codeNameSettings] = {};

    var mailConfigPath = workspacePath + "/config/mail";
    delete require.cache[require.resolve(mailConfigPath)];
    var mailConfig = require(mailConfigPath);

    var insertSettings = "INSERT INTO `" + idApp + "_" + codeNameSettings + "`(`version`, `f_transport_host`, `f_port`, `f_secure`, `f_user`, `f_pass`, `f_form_recipient`, `createdAt`, `updatedAt`)" +
            " VALUES(1,'" + mailConfig.transport.host + "'," +
            "'" + mailConfig.transport.port + "'," +
            mailConfig.transport.secure + "," +
            "'" + mailConfig.transport.auth.user + "'," +
            "'" + mailConfig.transport.auth.pass + "'," +
            "'" + mailConfig.administrateur + "'," +
            "'" + moment().format("YYYY-MM-DD HH:mm:ss") + "'," +
            "'" + moment().format("YYYY-MM-DD HH:mm:ss") + "');";

    toSyncObject.queries.push(insertSettings);
    fs.writeFileSync(workspacePath + '/models/toSync.json', JSON.stringify(toSyncObject, null, 4));

    // Contact Form View
    fs.copySync(piecesPath + '/views/', workspacePath + '/views/' + codeName + '/');
    fs.unlinkSync(workspacePath + '/views/' + codeName + '/update.dust');
    fs.unlinkSync(workspacePath + '/views/' + codeName + '/update_fields.dust');

    // Contact Form Route
    // Unlink generated route to replace with our custom route file
    fs.unlinkSync(workspacePath + '/routes/' + codeName + '.js');
    fs.copySync(piecesPath + '/routes/route_contact_form.js', workspacePath + '/routes/' + codeName + '.js');

    replaceValuesInFile(workspacePath + '/routes/' + codeName + '.js', "URL_VALUE_CONTACT", urlName);
    replaceValuesInFile(workspacePath + '/routes/' + codeName + '.js', "URL_VALUE_SETTINGS", urlNameSettings);
    replaceValuesInFile(workspacePath + '/routes/' + codeName + '.js', "CODE_VALUE_CONTACT", codeName);
    replaceValuesInFile(workspacePath + '/routes/' + codeName + '.js', "CODE_VALUE_SETTINGS", codeNameSettings);
    replaceValuesInFile(workspacePath + '/routes/' + codeName + '.js', "MODEL_VALUE_CONTACT", codeName.charAt(0).toUpperCase() + codeName.toLowerCase().slice(1));
    replaceValuesInFile(workspacePath + '/routes/' + codeName + '.js', "MODEL_VALUE_SETTINGS", codeNameSettings.charAt(0).toUpperCase() + codeNameSettings.toLowerCase().slice(1));

    replaceValuesInFile(workspacePath + '/views/' + codeName + '/create.dust', "CODE_VALUE_CONTACT", codeName);
    replaceValuesInFile(workspacePath + '/views/' + codeName + '/create.dust', "URL_VALUE_CONTACT", urlName);
    replaceValuesInFile(workspacePath + '/views/' + codeName + '/create.dust', "CODE_VALUE_MODULE", attr.options.moduleName);

    replaceValuesInFile(workspacePath + '/views/' + codeName + '/create_fields.dust', "CODE_VALUE_CONTACT", codeName);

    replaceValuesInFile(workspacePath + '/views/' + codeName + '/show_fields.dust', "CODE_VALUE_CONTACT", codeName);
    replaceValuesInFile(workspacePath + '/views/' + codeName + '/show_fields.dust', "URL_VALUE_CONTACT", urlName);

    replaceValuesInFile(workspacePath + '/views/' + codeName + '/list.dust', "CODE_VALUE_CONTACT", codeName);
    replaceValuesInFile(workspacePath + '/views/' + codeName + '/list.dust', "URL_VALUE_CONTACT", urlName);
    replaceValuesInFile(workspacePath + '/views/' + codeName + '/list.dust', "CODE_VALUE_MODULE", attr.options.moduleName);

    replaceValuesInFile(workspacePath + '/views/' + codeName + '/list_fields.dust', "CODE_VALUE_CONTACT", codeName);
    replaceValuesInFile(workspacePath + '/views/' + codeName + '/list_fields.dust', "URL_VALUE_CONTACT", urlName);

    replaceValuesInFile(workspacePath + '/views/' + codeName + '/settings.dust', "CODE_VALUE_CONTACT", codeName);
    replaceValuesInFile(workspacePath + '/views/' + codeName + '/settings.dust', "URL_VALUE_CONTACT", urlName);
    replaceValuesInFile(workspacePath + '/views/' + codeName + '/settings.dust', "CODE_VALUE_MODULE", attr.options.moduleName);

    replaceValuesInFile(workspacePath + '/views/' + codeName + '/settings_fields.dust', "CODE_VALUE_SETTINGS", codeNameSettings);

    // Delete Contact Form Settings Route and Views
    fs.unlinkSync(workspacePath + '/routes/' + codeNameSettings + '.js');
    helpers.rmdirSyncRecursive(workspacePath + '/views/' + codeNameSettings + '/');

    // Locales FR
    translateHelper.updateLocales(idApp, "fr-FR", ["entity", codeName, "f_name"], "Nom");
	translateHelper.updateLocales(idApp, "fr-FR", ["entity", codeName, "f_sender"], "Expediteur");
	translateHelper.updateLocales(idApp, "fr-FR", ["entity", codeName, "f_recipient"], "Destinataire");
	translateHelper.updateLocales(idApp, "fr-FR", ["entity", codeName, "r_user"], "Utilisateur");
	translateHelper.updateLocales(idApp, "fr-FR", ["entity", codeName, "f_title"], "Titre");
	translateHelper.updateLocales(idApp, "fr-FR", ["entity", codeName, "f_content"], "Contenu");

	translateHelper.updateLocales(idApp, "en-EN", ["entity", codeName, "sendMail"], "Send a mail");
	translateHelper.updateLocales(idApp, "en-EN", ["entity", codeName, "inbox"], "Sent box");
	translateHelper.updateLocales(idApp, "en-EN", ["entity", codeName, "settings"], "Settings");
	translateHelper.updateLocales(idApp, "en-EN", ["entity", codeName, "successSendMail"], "The email has been sent!");

	translateHelper.updateLocales(idApp, "fr-FR", ["entity", codeName, "sendMail"], "Envoyer un mail");
	translateHelper.updateLocales(idApp, "fr-FR", ["entity", codeName, "inbox"], "Boîte de réception");
	translateHelper.updateLocales(idApp, "fr-FR", ["entity", codeName, "settings"], "Paramètres");
	translateHelper.updateLocales(idApp, "fr-FR", ["entity", codeName, "successSendMail"], "Le mail a bien été envoyé !");

	translateHelper.updateLocales(idApp, "en-EN", ["entity", codeNameSettings, "label_entity"], "Settings");
	translateHelper.updateLocales(idApp, "en-EN", ["entity", codeNameSettings, "name_entity"], "Settings");
	translateHelper.updateLocales(idApp, "en-EN", ["entity", codeNameSettings, "plural_entity"], "Settings");

	translateHelper.updateLocales(idApp, "fr-FR", ["entity", codeNameSettings, "label_entity"], "Paramètres");
	translateHelper.updateLocales(idApp, "fr-FR", ["entity", codeNameSettings, "name_entity"], "Paramètres");
	translateHelper.updateLocales(idApp, "fr-FR", ["entity", codeNameSettings, "plural_entity"], "Paramètres");

	translateHelper.updateLocales(idApp, "fr-FR", ["entity", codeNameSettings, "f_transport_host"], "Hôte");
	translateHelper.updateLocales(idApp, "fr-FR", ["entity", codeNameSettings, "f_port"], "Port");
	translateHelper.updateLocales(idApp, "fr-FR", ["entity", codeNameSettings, "f_secure"], "Sécurisé");
	translateHelper.updateLocales(idApp, "fr-FR", ["entity", codeNameSettings, "f_user"], "Utilisateur");
	translateHelper.updateLocales(idApp, "fr-FR", ["entity", codeNameSettings, "f_pass"], "Mot de passe");
	translateHelper.updateLocales(idApp, "fr-FR", ["entity", codeNameSettings, "f_form_recipient"], "Destinataire du formulaire");

	// If default name
	if(codeName == "e_contact_form")
		translateHelper.updateLocales(idApp, "fr-FR", ["entity", codeName, "label_entity"], "Formulaire de contact");
		translateHelper.updateLocales(idApp, "fr-FR", ["entity", codeName, "name_entity"], "Formulaire de contact");
		translateHelper.updateLocales(idApp, "fr-FR", ["entity", codeName, "plural_entity"], "Formulaires de contact");

    var layoutFileName = __dirname+'/../workspace/'+idApp+'/views/layout_'+attr.options.moduleName.toLowerCase()+'.dust';
	domHelper.read(layoutFileName).then(function($) {

		$("#"+urlName+"_menu_item").remove();
		$("#"+urlNameSettings+"_menu_item").remove();

		var li = '';
		li += "<!--{@entityAccess entity=\""+urlName+"\"}-->\n";
    	li += "		<li id=\""+urlName+"_menu_item\" style=\"display:block;\" class=\"treeview\">\n";
		li += "			<a href=\"#\">\n";
        li += "    			<i class=\"fa fa-envelope\"></i>\n";
        li += "    			<span><!--{@__ key=\"entity." + codeName + ".label_entity\" /}--></span>\n";
        li += "    			<i class=\"fa fa-angle-left pull-right\"></i>\n";
        li += "			</a>\n";
        li += "			<ul class=\"treeview-menu\">\n";
        li += "    			<!--{@actionAccess entity=\"" + urlName + "\" action=\"write\"}-->\n";
        li += "    			<li>\n";
        li += "        			<a href=\"/" + urlName + "/create_form\">\n";
        li += "            			<i class=\"fa fa-paper-plane\"></i>\n";
        li += "            			<!--{@__ key=\"entity." + codeName + ".sendMail\" /}-->\n";
        li += "        			</a>\n";
        li += "    			</li>\n";
        li += "    			<!--{/actionAccess}-->\n";
        li += "    			<!--{@actionAccess entity=\"" + urlName + "\" action=\"read\"}-->\n";
        li += "    			<li>\n";
        li += "        			<a href=\"/" + urlName + "/list\">\n";
        li += "            			<i class=\"fa fa-inbox\"></i>\n";
        li += "            			<!--{@__ key=\"entity." + codeName + ".inbox\" /}-->\n";
        li += "        			</a>\n";
        li += "    			</li>\n";
        li += "    			<!--{/actionAccess}-->\n";
        li += "    			<!--{@actionAccess entity=\"" + urlNameSettings + "\" action=\"write\"}-->\n";
        li += "    			<li>\n";
        li += "        			<a href=\"/" + urlName + "/settings\">\n";
        li += "            			<i class=\"fa fa-cog\"></i>\n";
        li += "            			<!--{@__ key=\"entity." + codeName + ".settings\" /}-->\n";
        li += "        			</a>\n";
        li += "    			</li>\n";
        li += "    			<!--{/actionAccess}-->\n";
        li += "			</ul>\n";
        li += "		</li>\n\n";
        li += "<!--{/entityAccess}-->\n";

        // Add new html to document
        $('#sortable').append(li);

        // Write back to file
        domHelper.write(layoutFileName, $).then(function () {
            // Clean empty and useless dust helper created by removing <li>
            var layoutContent = fs.readFileSync(layoutFileName, 'utf8');

            // Remove empty dust helper
            layoutContent = layoutContent.replace(/{@entityAccess entity=".+"}\W*{\/entityAccess}/g, "");

            var writeStream = fs.createWriteStream(layoutFileName);
            writeStream.write(layoutContent);
            writeStream.end();
            writeStream.on('finish', function () {
                callback();
            });
        });
    }).catch(function (err) {
        callback(err, null);
    });
}

exports.newAgenda = function (attr, callback) {

    var idApplication = attr.id_application;

    var valueComponent = attr.options.value;
    var valueComponentLower = valueComponent.toLowerCase();

    var showComponentName = attr.options.showValue;
    var showComponentNameLower = showComponentName.toLowerCase();

    var urlComponent = attr.options.urlValue.toLowerCase();

    var valueEvent = "e_" + urlComponent + "_event";
    var valueCategory = "e_" + urlComponent + "_category";

    var urlEvent = valueEvent.substring(2);
    var urlCategory = valueCategory.substring(2);

    // Update the event options.json to add an belongsToMany relation between event and user
    var eventOptionsPath = './workspace/' + idApplication + '/models/options/' + valueEvent.toLowerCase() + '.json';
    var eventOptionFile = fs.readFileSync(eventOptionsPath);
    var eventOptionObj = JSON.parse(eventOptionFile);

    eventOptionObj.push({
        "target": "e_user",
        "relation": "belongsToMany",
        "through": idApplication + "_" + urlComponent + "_event_user",
        "as": "r_users",
        "foreignKey": "event_id",
        "otherKey": "user_id"
    });

    fs.writeFileSync(eventOptionsPath, JSON.stringify(eventOptionObj, null, 4));

    // Agenda Route
    setupComponentRouteForAgenda(idApplication, valueComponent, valueEvent, valueCategory, function () {
        // Agenda view
        setupComponentViewForAgenda(idApplication, valueComponent, valueEvent, function () {
            // Add access managment to Agenda
            addAccessManagment(idApplication, urlComponent, attr.options.moduleName.substring(2), function () {
                // Add Event translation
                translateHelper.writeLocales(idApplication, "component", valueComponentLower, showComponentName, attr.googleTranslate, function () {

                    // FR translation of the component
                    translateHelper.updateLocales(idApplication, "fr-FR", ["entity", valueEvent, "label_entity"], "Événement " + showComponentName);
                    translateHelper.updateLocales(idApplication, "fr-FR", ["entity", valueEvent, "name_entity"], "Événement " + showComponentName);
                    translateHelper.updateLocales(idApplication, "fr-FR", ["entity", valueEvent, "plural_entity"], "Événement " + showComponentName);
                    translateHelper.updateLocales(idApplication, "fr-FR", ["entity", valueEvent, "f_title"], "Titre");
                    translateHelper.updateLocales(idApplication, "fr-FR", ["entity", valueEvent, "f_place"], "Lieu");
                    translateHelper.updateLocales(idApplication, "fr-FR", ["entity", valueEvent, "f_start_date"], "Date de début");
                    translateHelper.updateLocales(idApplication, "fr-FR", ["entity", valueEvent, "f_end_date"], "Date de fin");
                    translateHelper.updateLocales(idApplication, "fr-FR", ["entity", valueEvent, "f_all_day"], "Toute la journée");
                    translateHelper.updateLocales(idApplication, "fr-FR", ["entity", valueEvent, "r_category"], "Catégorie");

                    translateHelper.updateLocales(idApplication, "fr-FR", ["entity", valueCategory, "label_entity"], "Catégorie " + showComponentName);
                    translateHelper.updateLocales(idApplication, "fr-FR", ["entity", valueCategory, "name_entity"], "Catégorie " + showComponentName);
                    translateHelper.updateLocales(idApplication, "fr-FR", ["entity", valueCategory, "plural_entity"], "Catégorie " + showComponentName);
                    translateHelper.updateLocales(idApplication, "fr-FR", ["entity", valueCategory, "f_color"], "Couleur");

                    var layoutFileName = __dirname + '/../workspace/' + idApplication + '/views/layout_' + attr.options.moduleName.toLowerCase() + '.dust';
                    domHelper.read(layoutFileName).then(function ($) {

                        $("#" + urlEvent + "_menu_item").remove();
                        $("#" + urlCategory + "_menu_item").remove();

                        var li = '';
                        li += "<li id='" + urlComponent + "_menu_item' class='treeview'>\n";
                        li += "    <a href='#'>\n";
                        li += "        <i class='fa fa-calendar-o'></i> <span><!--{@__ key=\"component." + valueComponentLower + ".label_component\" /}--></span>\n";
                        li += "        <span class='pull-right-container'>\n";
                        li += "            <i class='fa fa-angle-left pull-right'></i>\n";
                        li += "        </span>\n";
                        li += "    </a>\n";
                        li += "    <ul class='treeview-menu'>\n";
                        li += "        <li><a href='/" + urlComponent + "'><i class='fa fa-calendar'></i> <!--{@__ key=\"global_component.agenda.menu\" /}--></a></li>\n";
                        li += "        <li id='" + urlEvent + "_menu_item' class='treeview'>\n";
                        li += "            <a href='#'><i class='fa fa-calendar-plus-o'></i> <!--{@__ key=\"entity." + valueEvent + ".label_entity\" /}-->\n";
                        li += "                <span class='pull-right-container'>\n";
                        li += "                    <i class='fa fa-angle-left pull-right'></i>\n";
                        li += "                </span>\n";
                        li += "            </a>\n";
                        li += "            <ul class='treeview-menu'>\n";
                        li += "                <li><a href='/" + urlEvent + "/create_form'><i class='fa fa-plus'></i><!--{@__ key=\"operation.create\" /}--> <!--{@__ key=\"entity." + valueEvent + ".label_entity\" /}--></a></li>\n";
                        li += "                <li><a href='/" + urlEvent + "/list'><i class='fa fa-list'></i><!--{@__ key=\"operation.list\" /}--> <!--{@__ key=\"entity." + valueEvent + ".plural_entity\" /}--></a></li>\n";
                        li += "            </ul>\n";
                        li += "        </li>\n";
                        li += "        <li id='" + urlCategory + "_menu_item' class='treeview'>\n";
                        li += "            <a href='#'><i class='fa fa-bookmark'></i> <!--{@__ key=\"entity." + valueCategory + ".label_entity\" /}-->\n";
                        li += "                <span class='pull-right-container'>\n";
                        li += "                    <i class='fa fa-angle-left pull-right'></i>\n";
                        li += "                </span>\n";
                        li += "            </a>\n";
                        li += "            <ul class='treeview-menu'>\n";
                        li += "                <li><a href='/" + urlCategory + "/create_form'><i class='fa fa-plus'></i><!--{@__ key=\"operation.create\" /}--> <!--{@__ key=\"entity." + valueCategory + ".label_entity\" /}--></a></li>\n";
                        li += "                <li><a href='/" + urlCategory + "/list'><i class='fa fa-list'></i><!--{@__ key=\"operation.list\" /}--> <!--{@__ key=\"entity." + valueCategory + ".plural_entity\" /}--></a></li>\n";
                        li += "            </ul>\n";
                        li += "        </li>\n";
                        li += "    </ul>\n";
                        li += "</li>\n";

                        // Add new html to document
                        $('#sortable').append(li);

                        // Write back to file
                        domHelper.write(layoutFileName, $).then(function () {

                            // Clean empty and useless dust helper created by removing <li>
                            var layoutContent = fs.readFileSync(layoutFileName, 'utf8');

                            // Remove empty dust helper
                            layoutContent = layoutContent.replace(/{@entityAccess entity=".+"}\W*{\/entityAccess}/g, "");

                            var writeStream = fs.createWriteStream(layoutFileName);
                            writeStream.write(layoutContent);
                            writeStream.end();
                            writeStream.on('finish', function () {
                                callback();
                            });
                        });
                    }).catch(function (err) {
                        callback(err, null);
                    });
                });
            });
        });
    });
}

exports.newCra = function (attr, callback) {
    try {
        var workspacePath = __dirname + '/../workspace/' + attr.id_application;
        var piecesPath = __dirname + '/../structure/pieces/component/cra';

        // Copy pieces
        fs.copySync(piecesPath + '/routes/e_cra.js', workspacePath + '/routes/e_cra.js');
        fs.copySync(piecesPath + '/routes/e_cra_team.js', workspacePath + '/routes/e_cra_team.js');
        fs.copySync(piecesPath + '/views/e_cra/', workspacePath + '/views/e_cra/');
        fs.copySync(piecesPath + '/views/e_cra_team/', workspacePath + '/views/e_cra_team/');
        fs.copySync(piecesPath + '/js/', workspacePath + '/public/js/Newmips/component/');

        // Create belongsToMany relation between team and activity for default activities
        var teamOptionsPath = workspacePath + '/models/options/e_cra_team.json';
        var teamOptionObj = require(teamOptionsPath);
        teamOptionObj.push({
            "target": "e_cra_activity",
            "relation": "belongsToMany",
            "through": attr.id_application + "_cra_activity_team",
            "as": "r_default_cra_activity",
            "foreignKey": "team_id",
            "otherKey": "activity_id"
        });
        fs.writeFileSync(teamOptionsPath, JSON.stringify(teamOptionObj, null, 4));

        var teamAttributesPath = workspacePath + '/models/attributes/e_cra_team.json';
        var teamAttributesObj = require(teamAttributesPath);
        teamAttributesObj.fk_id_admin_user = {type:"INTEGER", newmipsType:"integer"};
        fs.writeFileSync(teamAttributesPath, JSON.stringify(teamAttributesObj, null, 4));

        // Get select of module before copying pieces
        domHelper.read(workspacePath + '/views/layout_m_cra.dust').then(function ($workS) {
            var select = $workS("#dynamic_select").html();
            fs.copySync(piecesPath + '/views/layout_m_cra.dust', workspacePath + '/views/layout_m_cra.dust');
            domHelper.read(workspacePath + '/views/layout_m_cra.dust').then(function ($newWorkS) {
                // Insert select of module to copied pieces
                $newWorkS("#dynamic_select").html(select);

                domHelper.write(workspacePath + '/views/layout_m_cra.dust', $newWorkS).then(function () {
                    // Replace locales
                    // fr-FR
                    var workspaceFrLocales = require(workspacePath + '/locales/fr-FR.json');
                    var frLocales = require(piecesPath + '/locales/fr-FR.json');
                    for (var entity in frLocales)
                        workspaceFrLocales.entity[entity] = frLocales[entity];
                    fs.writeFileSync(workspacePath + '/locales/fr-FR.json', JSON.stringify(workspaceFrLocales, null, 4));

                    // en-EN
                    var workspaceEnLocales = require(workspacePath + '/locales/en-EN.json');
                    var enLocales = require(piecesPath + '/locales/en-EN.json');
                    for (var entity in enLocales)
                        workspaceEnLocales.entity[entity] = enLocales[entity];
                    fs.writeFileSync(workspacePath + '/locales/en-EN.json', JSON.stringify(workspaceEnLocales, null, 4));

                    // Update user translations
                    translateHelper.updateLocales(attr.id_application, "fr-FR", ["entity", "e_user", "as_r_users"], "Utilisateurs");
                    translateHelper.updateLocales(attr.id_application, "fr-FR", ["entity", "e_user", "as_r_user"], "Utilisateur");

                    // Update module name
                    translateHelper.updateLocales(attr.id_application, "fr-FR", ["module", "m_cra"], "C.R.A");
                    translateHelper.updateLocales(attr.id_application, "en-EN", ["module", "m_cra"], "A.R");

                    // Remove unwanted tab from user
                    domHelper.read(workspacePath + '/views/e_user/show_fields.dust').then(function ($) {
                        $("#r_cra-click").parents('li').remove();
                        $("#r_cra").remove();
                        domHelper.write(workspacePath + '/views/e_user/show_fields.dust', $).then(function () {
                            // Check activity activate field in create field
                            domHelper.read(workspacePath + '/views/e_cra_activity/create_fields.dust').then(function ($) {
                                $("input[name='f_active']").attr("checked", "checked");
                                domHelper.write(workspacePath + '/views/e_cra_activity/create_fields.dust', $).then(function () {
                                    callback(null, {message: 'Module C.R.A created'});
                                });
                            });
                        });
                    });
                });
            });
        });
    } catch (err) {
        callback(err);
    }
};

exports.setupChat = function(attr, callback) {
    try {
        var workspacePath = __dirname + '/../workspace/'+attr.id_application;
        var piecesPath = __dirname + '/../structure/pieces/component/socket';

        // Check if file exists (in case notification have been implemented first)
        if (!fs.existsSync(workspacePath+'/services/socket.js'))
            fs.copySync(piecesPath+'/socket.js', workspacePath+'/services/socket.js')

        // Copy chat files
        fs.copySync(piecesPath+'/chat/js/chat.js', workspacePath+'/public/js/Newmips/component/chat.js');
        fs.copySync(piecesPath+'/chat/chat_utils.js', workspacePath+'/utils/chat.js');
        fs.copySync(piecesPath+'/chat/routes/chat.js', workspacePath+'/routes/chat.js');

        // Copy chat models
        var chatModels = ['e_channel', 'e_channelmessage', 'e_chatmessage', 'e_user_channel', 'e_user_chat', 'e_chat'];
        for (var i = 0; i < chatModels.length; i++) {
            fs.copySync(piecesPath+'/chat/models/'+chatModels[i]+'.js', workspacePath+'/models/'+chatModels[i]+'.js');
            var model = fs.readFileSync(workspacePath+'/models/'+chatModels[i]+'.js', 'utf8');
            model = model.replace(/ID_APPLICATION/g, attr.id_application);
            fs.writeFileSync(workspacePath+'/models/'+chatModels[i]+'.js', model, 'utf8');
        }
        // Copy attributes
        fs.copySync(piecesPath+'/chat/models/attributes/', workspacePath+'/models/attributes/');
        // Copy options
        fs.copySync(piecesPath+'/chat/models/options/', workspacePath+'/models/options/');

        // Add belongsToMany with e_channel to e_user, belongsToMany with e_user to e_chat
        var userOptions = JSON.parse(fs.readFileSync(workspacePath+'/models/options/e_user.json'));
        userOptions.push({
            target: 'e_chat',
            relation: 'belongsToMany',
            foreignKey: 'id_user',
            otherKey: 'id_chat',
            through: attr.id_application+'_chat_user_chat',
            as: 'r_chat'
        });
        userOptions.push({
            target: "e_channel",
            relation: "belongsToMany",
            foreignKey: "id_user",
            otherKey: "id_channel",
            through: attr.id_application+"_chat_user_channel",
            as: "r_user_channel"
        });
        fs.writeFileSync(workspacePath+'/models/options/e_user.json', JSON.stringify(userOptions, null, 4), 'utf8')

        // Replace ID_APPLICATION in channel.json and chat.json
        var option = fs.readFileSync(workspacePath+'/models/options/e_channel.json', 'utf8');
        option = option.replace(/ID_APPLICATION/g, attr.id_application);
        fs.writeFileSync(workspacePath+'/models/options/e_channel.json', option, 'utf8');
        var option = fs.readFileSync(workspacePath+'/models/options/e_chat.json', 'utf8');
        option = option.replace(/ID_APPLICATION/g, attr.id_application);
        fs.writeFileSync(workspacePath+'/models/options/e_chat.json', option, 'utf8');

        // Set socket and chat config to enabled/true
        var appConf = JSON.parse(fs.readFileSync(workspacePath+'/config/application.json'));
        appConf.socket.enabled = true;
        appConf.socket.chat = true;
        fs.writeFileSync(workspacePath+'/config/application.json', JSON.stringify(appConf, null, 4), 'utf8');

        // Add custom user_channel/user_chat columns to toSync file
        // Id will not be used but is required by sequelize to be able to query on the junction table
        var toSync = JSON.parse(fs.readFileSync(workspacePath+'/models/toSync.json'));
        toSync[attr.id_application+'_chat_user_channel'] = {
            attributes: {
                id_last_seen_message: {type: 'INTEGER', default: 0},
                id: {
                    type: "INTEGER",
                    autoIncrement: true,
                    primaryKey: true
                }
            },
            force: true
        };
        toSync[attr.id_application+'_chat_user_chat'] = {
            attributes: {
                id_last_seen_message: {type: 'INTEGER', default: 0},
                id: {
                    type: "INTEGER",
                    autoIncrement: true,
                    primaryKey: true
                }
            },
            force: true
        };
        fs.writeFileSync(workspacePath+'/models/toSync.json', JSON.stringify(toSync, null, 4), 'utf8');

        // Add chat locales
        // EN
        var piecesLocalesEN = require(piecesPath+'/chat/locales/en-EN');
        var workspaceLocalesEN = require(workspacePath+'/locales/en-EN');
        workspaceLocalesEN.component.chat = piecesLocalesEN.chat;
        fs.writeFileSync(workspacePath+'/locales/en-EN.json', JSON.stringify(workspaceLocalesEN, null, 4), 'utf8');
        // FR
        var piecesLocalesFR = require(piecesPath+'/chat/locales/fr-FR');
        var workspaceLocalesFR = require(workspacePath+'/locales/fr-FR');
        workspaceLocalesFR.component.chat = piecesLocalesFR.chat;
        fs.writeFileSync(workspacePath+'/locales/fr-FR.json', JSON.stringify(workspaceLocalesFR, null, 4), 'utf8');

        // Add chat dust template to main_layout
        domHelper.read(workspacePath+'/views/main_layout.dust').then(function($layout) {
            domHelper.read(piecesPath+'/chat/views/chat.dust').then(function($chat) {
                $layout("#chat-placeholder").html($chat("body")[0].innerHTML);

                domHelper.writeMainLayout(workspacePath+'/views/main_layout.dust', $layout).then(function() {
                    callback(null);
                });
            });
        }).catch(function(e) {
            console.log(e);
            callback(e);
        });

    } catch(e) {
        console.log(e);
        callback(e);
    }
};

exports.addNewComponentAddress = function (attr, callback) {
    try {
        var application_path = __dirname + '/../workspace/' + attr.id_application + '/';
        var c_address_views_path = __dirname + '/pieces/component/address/views/';
        var address_utils = require(__dirname + '/pieces/component/address/utils/address_utils');
        var componentName = 'c_address_' + attr.id_data_entity;
        var source = attr.options.source;
        var componentUrl = source.replace('e_', '') + '_address';
        var moduleName = attr.moduleName.replace('m_', '');
        //models
        var modelAttributes = JSON.parse(fs.readFileSync(c_address_views_path + '../models/attributes/c_address.json', 'utf8'));
        var routeContent = fs.readFileSync(__dirname + '/pieces/routes/data_entity.js', 'utf8');
        routeContent = routeContent.replace(/ENTITY_URL_NAME/g, componentUrl);
        routeContent = routeContent.replace(/ENTITY_NAME/g, componentName);
        routeContent = routeContent.replace(/MODEL_NAME/g, 'C_address_' + attr.id_data_entity);
        fs.writeFileSync(application_path + 'routes/' + componentUrl + '.js', routeContent, 'utf8');
        //generate views data
        var fields = address_utils.generateFields();
        var createFile = fs.readFileSync(c_address_views_path + 'create.dust', 'utf8');
        var updateFile = fs.readFileSync(c_address_views_path + 'update.dust', 'utf8');
        var showFile = fs.readFileSync(c_address_views_path + 'show.dust', 'utf8');
        var listFile = fs.readFileSync(c_address_views_path + 'list.dust', 'utf8');
        var listFields = fs.readFileSync(c_address_views_path + 'list_fields.dust', 'utf8');
        createFile = createFile.replace(/COMPONENT_VALUE_MODULE/g, moduleName).replace(/URL_COMPONENT_ADDRESS/g, componentUrl).replace(/COMPONENT_NAME/g, componentName);
        updateFile = updateFile.replace(/COMPONENT_VALUE_MODULE/g, moduleName).replace(/URL_COMPONENT_ADDRESS/g, componentUrl).replace(/COMPONENT_NAME/g, componentName).replace(/RELATION/g, 'r_' + componentName);
        showFile = showFile.replace(/COMPONENT_VALUE_MODULE/g, moduleName).replace(/COMPONENT_NAME/g, componentName).replace(/URL_COMPONENT_ADDRESS/g, componentUrl);
        listFile = listFile.replace(/COMPONENT_VALUE_MODULE/g, moduleName).replace(/COMPONENT_NAME/g, componentName).replace(/URL_COMPONENT_ADDRESS/g, componentUrl);
        listFields = listFields.replace(/INCLUDE_HEADER/g, fields.headers).replace(/INCLUDE_TD/g, fields.tds).replace(/URL_COMPONENT_ADDRESS/g, componentUrl).replace(/RELATION/g, 'r_' + componentName);
        //Update model attributes
        for (var attribute in fields.db_fields) {
            modelAttributes[attribute] = fields.db_fields[attribute];
        }
        //save new model component attributes file
        fs.writeFileSync(application_path + 'models/attributes/' + componentName + '.json', JSON.stringify(modelAttributes, null, 4), 'utf8');
        //set relation and save it
        var relation = {
            "target": componentName,
            "relation": "hasMany",
            "foreignKey": "fk_id_" + source,
            "as": 'r_' + componentName
        };
        //Update relation file
        var relations = JSON.parse(fs.readFileSync(application_path + 'models/options/' + source + '.json', 'utf8'));
        relations.push(relation);
        fs.writeFileSync(application_path + 'models/options/' + source + '.json', JSON.stringify(relations, null, 4), 'utf8');

        //add new entry for access
        var access = JSON.parse(fs.readFileSync(application_path + 'config/access.json', 'utf8'));
        var newAccess = {
            "name": componentUrl,
            "groups": [],
            "actions": {
                "read": [],
                "write": [],
                "delete": []
            }
        };
        access[moduleName].entities.push(newAccess);
        fs.writeFileSync(application_path + 'config/access.json', JSON.stringify(access, null, 4), 'utf8');
        //copy options
        fs.copySync(c_address_views_path + '../models/options/c_address.json', application_path + 'models/options/' + componentName + '.json');
        //copy public js address component file
        fs.copySync(c_address_views_path + '../public/c_address.js', application_path + 'public/js/c_address.js');
        //create address views files
        fs.copySync(c_address_views_path, application_path + 'views/' + componentName + '/');
        fs.writeFileSync(application_path + 'views/' + componentName + '/' + 'create.dust', createFile, 'utf8');
        fs.writeFileSync(application_path + 'views/' + componentName + '/' + 'create_fields.dust', fields.createHtml, 'utf8');
        fs.writeFileSync(application_path + 'views/' + componentName + '/' + 'update.dust', updateFile, 'utf8');
        fs.writeFileSync(application_path + 'views/' + componentName + '/' + 'update_fields.dust', fields.updateHtml, 'utf8');
        fs.writeFileSync(application_path + 'views/' + componentName + '/' + 'show.dust', showFile, 'utf8');
        fs.writeFileSync(application_path + 'views/' + componentName + '/' + 'show_fields.dust', fields.showHtml, 'utf8');
        fs.writeFileSync(application_path + 'views/' + componentName + '/' + 'list_fields.dust', listFields, 'utf8');
        fs.writeFileSync(application_path + 'views/' + componentName + '/' + 'list.dust', listFile, 'utf8');
        var relationEntityFile = application_path + 'views' + '/' + source + '/show_fields.dust';
        //new entry for source relation view
        var newLi = '<li><a id="r_' + componentName + '-click" data-toggle="tab" href="#r_' + componentName + '">{@__ key="component.c_address.label_component" /}</a></li>';
        var newTabContent = '<div id=r_' + componentName + ' class="tab-pane fade">'
                + '{#r_' + componentName + ' ' + componentName + '=r_' + componentName + '}'
                + '{@eq key=id value=' + componentName + '[0].id}'
                + '{>"' + componentName + '/list_fields" associationAlias="r_' + componentName + '" associationForeignKey="fk_id_' + source.replace('e_', '') + '" associationFlag="{' + source + '.id}" associationSource="' + source + '" associationUrl="' + source.replace('e_', '') + '" for="hasMany" /}'
                + '{/eq}'
                + '{:else}'
                + '{>"' + componentName + '/list_fields" /}'
                + '{/r_' + componentName + '}'
                + '<br>'
                + '<a href="/' + componentUrl + '/create_form?associationAlias=r_' + componentName + '&amp;associationForeignKey=fk_id_' + source + '&amp;associationFlag={' + source + '.id}&amp;associationSource=' + source + '&amp;associationUrl=' + source.replace('e_', '') + '" class="btn btn-success">'
                + '    <i class="fa fa-plus fa-md">&nbsp;&nbsp;</i><span>{@__ key="button.create"/}</span>'
                + '</a>'
                + '</div>';
        addTab(attr, relationEntityFile, newLi, newTabContent);
        //update locales
        var langFR = JSON.parse(fs.readFileSync(application_path + 'locales/fr-FR.json', 'utf8'));
        var langEN = JSON.parse(fs.readFileSync(application_path + 'locales/en-EN.json', 'utf8'));
        langFR.component['c_address'] = fields.locales.fr;
        langEN.component['c_address'] = fields.locales.en;
        fs.writeFileSync(application_path + 'locales/fr-FR.json', JSON.stringify(langFR, null, 4), 'utf8');
        fs.writeFileSync(application_path + 'locales/en-EN.json', JSON.stringify(langEN, null, 4), 'utf8');
        setupComponentModel(attr.id_application, 'address', componentName, 'address', function () {
            callback(null);
        });
    } catch (e) {
        callback(e);
    }
};

exports.deleteComponentAddress = function (attr, callback) {
    try {
        var componentName = 'c_address_' + attr.id_data_entity;
        var componentUrl = attr.entityName.replace('e_', '') + '_address';
        var application_path = __dirname + '/../workspace/' + attr.id_application + '/';
        fs.remove(application_path + 'views/' + componentName);
        fs.remove(application_path + 'routes/' + componentUrl + '.js');
        fs.remove(application_path + 'models/' + componentName + '.js');
        fs.remove(application_path + 'models/attributes/' + componentName + '.json');
        fs.remove(application_path + 'models/options/' + componentName + '.json');
        //remove association
        var relations = JSON.parse(fs.readFileSync(application_path + 'models/options/' + attr.entityName + '.json', 'utf8'));
        for (var i = 0; i < relations.length; i++) {
            var relation = relations[i];
            if (relation.as == 'r_' + componentName) {
                relations.splice(i, 1);
                break;
            }
        }

        //update relation file
        fs.writeFileSync(application_path + 'models/options/' + attr.entityName + '.json', JSON.stringify(relations, null, 4), 'utf8');
        //remove component in access file
        var access = JSON.parse(fs.readFileSync(application_path + 'config/access.json', 'utf8'));
        var moduleName = attr.moduleName.replace('m_', '');
        for (var i = 0; i < access[moduleName].entities.length; i++) {
            var entity = access[moduleName].entities[i];
            if (entity.name == attr.entityName.replace('e_', '') + '_address') {
                access[moduleName].entities.splice(i, 1);
                break;
            }
        }
        fs.writeFileSync(application_path + 'config/access.json', JSON.stringify(access, null, 4), 'utf8');

        domHelper.read(application_path + 'views/' + attr.entityName + '/show_fields.dust').then(function ($showFieldsView) {
            $showFieldsView('#r_' + componentName + '-click').parent().remove();//remove li tab
            $showFieldsView('#r_' + componentName).remove();//remove tab content div
            domHelper.write(application_path + 'views/' + attr.entityName + '/show_fields.dust', $showFieldsView).then(function () {
                return callback(null);
            }).catch(function (e) {
                return callback(e);
            });
        }).catch(function (e) {
            return callback(e);
        });
    } catch (e) {
        return callback(e);
    }
};
