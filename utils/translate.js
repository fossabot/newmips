var fs = require('fs');
var helpers = require("./helpers");
var translateKey = require("../config/googleAPI").translate;

// Google translation
var googleTranslate = require('google-translate')(translateKey);

module.exports = {
    writeLocales: function(idApplication, type, keyValue, value, toTranslate, callback) {

        // If field value is an array
        if(type == "field"){
            var keyValueField = value[0];
            value = value[1];
        }
        else if(type == "aliasfield"){
            var alias = value[0];
            value = value[1];
        }

        // Replace euro sign from char code since javascript can't read `€`
        value = value.replace(String.fromCharCode(65533), "€");

        // Current application language
        var languageFileData = helpers.readFileSyncWithCatch(__dirname+'/../workspace/'+idApplication+'/config/language.json');
        var appLang = JSON.parse(languageFileData);
        appLang = appLang.lang;

        // Google won't fr-FR, it just want fr
        var appLang4Google = appLang.slice(0, -3);

        // All available languages to write
        var languagePromises = [];

        function pushLanguagePromise(urlFile, dataLocales, file){
            // Create an array of promises to write all translations file
            languagePromises.push(new Promise(function(resolve, reject) {
                fs.writeFile(urlFile, JSON.stringify(dataLocales, null, 4), function(err) {
                    if (err){
                        console.log(err);
                        reject();
                    }
                    else{
                        //console.log('File => locales/'+file+' ------------------ UPDATED');
                        resolve();
                    }
                });
            }));
        }

        function addLocales(type, value2, data, lang){
            if(type == "application"){
                data.app.name = value2;
            }
            else if(type == "module"){
                data.module[keyValue.toLowerCase()] = value2;
            }
            else if(type == "entity"){
                var content = '  { \n\t\t\t"label_entity": "'+ value2 +'",\n';
                content += '\t\t\t"name_entity": "'+ value2 +'",\n';
                content += '\t\t\t"plural_entity": "'+ value2 +'",\n';
                content += '\t\t\t"id_entity": "ID"\n';
                content += '\t\t}\n';
                data.entity[keyValue.toLowerCase()] = JSON.parse(content);
            }
            else if(type == "component"){
                var content = '  { \n\t\t\t"label_component" : "'+value2+'",\n';
                content += '\t\t\t"name_component" : "'+value2+'",\n';
                content += '\t\t\t"plural_component" : "'+value2+'"\n';
                content += '\t\t}\n';
                data.component[keyValue.toLowerCase()] = JSON.parse(content);
            }
            else if(type == "field"){
                data.entity[keyValue.toLowerCase()][keyValueField.toLowerCase()] = value2;
            }
            else if(type == "aliasfield"){
                data.entity[keyValue.toLowerCase()][alias.toLowerCase()] = value2;
            }

            return data;
        }

        function doneLocales(cpt, length){
            // If process is over we can continue
            if(cpt == length){
                Promise.all(languagePromises).then(function(){
                    callback();
                }).catch(function(err){
                    console.log(err);
                });
            }
        }

        // Get all the differents languages to handle
        var localesDir = fs.readdirSync(__dirname+'/../workspace/'+idApplication+'/locales').filter(function(file){
            return (file.indexOf('.') !== 0) && (file.slice(-5) === '.json') && (file != "enum_radio.json");
        });

        var nbLocales = localesDir.length;
        var localesCpt = 0;
        var manualModuleTranslationArray = ["home", "authentication"];
        var manualEntityTranslationArray = ["user", "role", "group"];
        var manualFieldTranslationArray = ["login", "email", "role", "group", "label"];

        localesDir.forEach(function(file){
            var urlFile = __dirname+'/../workspace/'+idApplication+'/locales/'+file;
            delete require.cache[require.resolve(urlFile)];
            var dataLocales = require(urlFile);
            var workingLocales = file.slice(0, -5);
            var workingLocales4Google = workingLocales.slice(0, -3);

            if(type == "module" && manualModuleTranslationArray.indexOf(value.toLowerCase()) != -1){
                if(value.toLowerCase() == "home"){
                    if(workingLocales == "fr-FR"){
                        dataLocales[type][keyValue.toLowerCase()] = "Accueil";
                    }else{
                        dataLocales[type][keyValue.toLowerCase()] = "Home";
                    }
                }
                else if(value.toLowerCase() == "authentication"){
                    if(workingLocales == "fr-FR"){
                        dataLocales[type][keyValue.toLowerCase()] = "Authentification";
                    }else{
                        dataLocales[type][keyValue.toLowerCase()] = "Authentication";
                    }
                }
                pushLanguagePromise(urlFile, dataLocales, file);
                localesCpt++;
                doneLocales(localesCpt, nbLocales);
            } else if(type == "entity" && manualEntityTranslationArray.indexOf(value.toLowerCase()) != -1){
                if(value.toLowerCase() == "user"){
                    if(workingLocales == "fr-FR"){
                        value = "Utilisateur";
                    }else{
                        value = "User";
                    }
                } else if(value.toLowerCase() == "role"){
                    if(workingLocales == "fr-FR"){
                        value = "Rôle";
                    }else{
                        value = "Role";
                    }
                } else if(value.toLowerCase() == "group"){
                    if(workingLocales == "fr-FR"){
                        value = "Groupe";
                    }else{
                        value = "Group";
                    }
                }

                dataLocales = addLocales(type, value, dataLocales, workingLocales4Google);
                pushLanguagePromise(urlFile, dataLocales, file);
                localesCpt++;
                doneLocales(localesCpt, nbLocales);
            } else if((type == "field" || type == "aliasfield") && manualFieldTranslationArray.indexOf(value.toLowerCase()) != -1){
                if(value.toLowerCase() == "login"){
                    if(workingLocales == "fr-FR"){
                        value = "Identifiant";
                    }else{
                        value = "Login";
                    }
                } else if(value.toLowerCase() == "role"){
                    if(workingLocales == "fr-FR"){
                        value = "Rôle";
                    }else{
                        value = "Role";
                    }
                } else if(value.toLowerCase() == "email"){
                    if(workingLocales == "fr-FR"){
                        value = "Email";
                    }else{
                        value = "Email";
                    }
                } else if(value.toLowerCase() == "group"){
                    if(workingLocales == "fr-FR"){
                        value = "Groupe";
                    }else{
                        value = "Group";
                    }
                } else if(value.toLowerCase() == "label"){
                    if(workingLocales == "fr-FR"){
                        value = "Libellé";
                    }else{
                        value = "Label";
                    }
                }

                dataLocales = addLocales(type, value, dataLocales, workingLocales4Google);
                pushLanguagePromise(urlFile, dataLocales, file);
                localesCpt++;
                doneLocales(localesCpt, nbLocales);

            } else if(workingLocales != appLang){
                if(translateKey != "" && toTranslate){
                    googleTranslate.translate(value, appLang4Google, workingLocales4Google, function(err, translations) {
                        if(!err){
                            dataLocales = addLocales(type, translations.translatedText, dataLocales, workingLocales4Google);
                        }
                        else{
                            console.log(err);
                            dataLocales = addLocales(type, value, dataLocales, workingLocales4Google);
                        }
                        pushLanguagePromise(urlFile, dataLocales, file);
                        localesCpt++;
                        doneLocales(localesCpt, nbLocales);
                    });
                }
                else{
                    if(translateKey == "" && googleTranslate && toTranslate)
                        console.log("Error: Empty API key for google translation!");

                    dataLocales = addLocales(type, value, dataLocales, workingLocales4Google);
                    pushLanguagePromise(urlFile, dataLocales, file);
                    localesCpt++;
                    doneLocales(localesCpt, nbLocales);
                }
            } else{
                dataLocales = addLocales(type, value, dataLocales, workingLocales4Google);

                pushLanguagePromise(urlFile, dataLocales, file);
                localesCpt++;
                doneLocales(localesCpt, nbLocales);
            }
        });
    },
    removeLocales: function(idApplication, type, value, callback){
        // Get all the differents languages to handle
        var localesDir = fs.readdirSync(__dirname+'/../workspace/'+idApplication+'/locales').filter(function(file){
            return (file.indexOf('.') !== 0) && (file.slice(-5) === '.json') && (file != "enum_radio.json");
        });

        localesDir.forEach(function(file){
            var urlFile = __dirname+'/../workspace/'+idApplication+'/locales/'+file;
            delete require.cache[require.resolve(urlFile)];
            var dataLocales = require(urlFile);

            if(type == "field"){
                delete dataLocales.entity[value[0]][value[1]];
            }

            fs.writeFileSync(urlFile, JSON.stringify(dataLocales, null, 4));
        });

        callback();
    },
    updateLocales: function(idApplication, lang, keys, value){
        var urlFile = __dirname+'/../workspace/'+idApplication+'/locales/'+lang+".json";
        delete require.cache[require.resolve(urlFile)]
        var dataLocales = require(urlFile);

        var depth = dataLocales;
        for (var i=0; i<keys.length; i++) {
            if (typeof depth[keys[i]] !== 'undefined'){
                if(i+1 == keys.length)
                    depth[keys[i]] = value;
                else
                    depth = depth[keys[i]];
            } else{
                if(i+1 == keys.length)
                    depth[keys[i]] = value;
            }
        }
        fs.writeFileSync(urlFile, JSON.stringify(dataLocales, null, 4));
    }
}