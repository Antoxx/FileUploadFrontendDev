(function () {
    var win = window;
    var $ = win.$;
    
    var editor, schema, predefinedFields, predefinedFieldsPaths;
    
    // Step 1. Define default path to file with schema and predefined fields
    var schemaSrc = "js/data/rule.schema.json"; // default path to json schema
    var predefinedSrc = "js/data/rule.predefined.json"; // default path to predefined fields

    // Step 2. If custom path was defined - is it
    if (schemaSrc in win) {
        schemaSrc = win.schemaSrc;    // use custom path if exists
    }
    if (predefinedSrc in win) {
        predefinedSrc = win.predefinedSrc;    // use custom path if exists
    }

    // Step 3. Get data from json files. Call onReady() when schema received
    $.getJSON(schemaSrc, function (data) {
        schema = data;
        $.getJSON(predefinedSrc, function (data) {
            predefinedFields = data;
            predefinedFieldsPaths = getPredefinedFieldsPaths();
            onReady();
        });    
    });    
    
    // Init loader
    var loader = new Loader();
    loader.show();

    // Init IframeHelper
    var inno = new IframeHelper();    
    var rules;
    var onReady = function () {
        inno.onReady(function () {
            inno.getRules(function (success, els) {
                if (!success) {
                    alert('Rules were not loaded due to error. Please reload screen.');
                    return;
                }

                rules = els;
                inno.getProfileSchemaAttributes(function (els) {
                    mappingTypeValues.profileAttribute = prepareEls(els);

                    inno.getProfileSchemaEventDefinitions(function (els) {
                        var newEls = prepareEls(els);
                        var eventSchema = schema.items.properties.event;

                        mappingTypeValues.event = newEls;

                        eventSchema.enum = newEls[0];
                        
                        editor = $('#form-setting').alpaca({
                            schema: schema,
                            options: {
                                items: {
                                    fields: {
                                        id: {
                                            disabled: true
                                        },
                                        event: {
                                            type: 'select',
                                            optionLabels: newEls[1],
                                            noneLabel: "-- Select --"
                                        },
                                        ruleSettings: {
                                            fields: {
                                                storage: {
                                                    type: 'select'
                                                },
                                                ftpHost: {
                                                    dependencies: {
                                                        storage: "ftp"
                                                    }
                                                },
                                                ftpPort: {
                                                    dependencies: {
                                                        storage: "ftp"
                                                    }
                                                },
                                                ftpUser: {
                                                    dependencies: {
                                                        storage: "ftp"
                                                    }
                                                },
                                                ftpPwd: {
                                                    dependencies: {
                                                        storage: "ftp"
                                                    }
                                                },
                                                ftpPath: {
                                                    dependencies: {
                                                        storage: "ftp"
                                                    }
                                                },
                                                ftpActiveExternalIPAddress: {
                                                    dependencies: {
                                                        storage: "ftp"
                                                    }
                                                },
                                                ftpActiveMode: {
                                                    dependencies: {
                                                        storage: "ftp"
                                                    }
                                                },
                                                ftpActiveModePortRangeMin: {
                                                    dependencies: {
                                                        storage: "ftp"
                                                    }
                                                },
                                                ftpActiveModePortRangeMax: {
                                                    dependencies: {
                                                        storage: "ftp"
                                                    }
                                                },
                                                sftpHost: {
                                                    dependencies: {
                                                        storage: "sftp"
                                                    }
                                                },
                                                sftpPort: {
                                                    dependencies: {
                                                        storage: "sftp"
                                                    }
                                                },
                                                sftpUser: {
                                                    dependencies: {
                                                        storage: "sftp"
                                                    }
                                                },
                                                sftpPwd: {
                                                    dependencies: {
                                                        storage: "sftp"
                                                    }
                                                },
                                                sftpPath: {
                                                    dependencies: {
                                                        storage: "sftp"
                                                    }
                                                },
                                                sftpSsh: {
                                                    dependencies: {
                                                        storage: "sftp"
                                                    }
                                                },
                                                sftpEncryption: {
                                                    dependencies: {
                                                        storage: "sftp"
                                                    }
                                                },
                                                sftpComment: {
                                                    dependencies: {
                                                        storage: "sftp"
                                                    }
                                                },
                                                sftpPublicKey: {
                                                    dependencies: {
                                                        storage: "sftp"
                                                    }
                                                },
                                                sftpPrivateKey: {
                                                    dependencies: {
                                                        storage: "sftp"
                                                    }
                                                },
                                                sftpPrivateMac: {
                                                    dependencies: {
                                                        storage: "sftp"
                                                    }
                                                }
                                            }
                                        },
                                        fieldSets: {
                                            //type: 'table',
                                            items: {
                                                fields: {
                                                    fields: {
                                                        type: 'table',
                                                        items: {
                                                            fields: {
                                                                type: {
                                                                    optionLabels: [
                                                                        "Profile Attribute",
                                                                        "Session Data",
                                                                        "Event Data",
                                                                        "Macro",
                                                                        "Meta",
                                                                        "Static"
                                                                    ],
                                                                    removeDefaultNone: true
                                                                }
                                                            },
                                                            postRender: fieldPostRender
                                                        }
                                                    }
                                                },
                                                postRender: fieldsetPostRender
                                            }
                                        }
                                    },
                                    postRender: rulePostRender
                                },
                                postRender: mainPostRender,
                                toolbar: {
                                    "showLabels": true,
                                    "actions": [{
                                        "label": "I addeth thee",
                                        "action": "add"
                                    }]
                                }
                            },
                            view: {
                                parent: "bootstrap-edit-horizontal"
                            }
                        });

                        loader.hide();
                    });
                });
            });
        });
    };
    
    var mappingTypeValues = {
        profileAttribute: [],
        sessionValue: [],
        eventValue: [],
        macro: [
            ['timestamp_now','request_ip','user_agent','profileId'],
            ['Timestamp','Request IP','User-agent','Profile ID']
        ],
        meta: [
            ['company_id','bucket_id','event_def_id','app_section_event','collect_app','section'],
            ['Company ID','Bucket ID','Event definition ID','Event with scope','Collect app','Section']
        ],
        event: []
    };
    
    function mainPostRender (callback) {
        // load existing rules
        var newRules = [];
        rules.forEach(function (rule) {
            newRules.push(
                $.extend(true, {}, predefinedFields, rule)
            );
        });

        this.setValue(newRules);

        callback();
    }
    
    function rulePostRender (callback) {
        // it will be "callback" or "control"
        if (!(callback instanceof Function)) {
            return;
        }

        // fix new rule with predefined fields
        var value = this.getValue();
        var newValue = $.extend(true, {}, predefinedFields, {
            id: randomId()
        }, value);

        this.setValue(newValue); 

        callback();
    }  
    
    function fieldsetPostRender (callback) {
        if (!(callback instanceof Function)) {
            return;
        }

        callback();

        // disable "name" field and actions
        if (isPredefinedField(this.path)) {
            this.childrenByPropertyId.setName.disable();     
        }
    }
    
    function fieldPostRender (callback) {
        if (!(callback instanceof Function)) {
            return;
        }

        callback();

        var me = this;

        // disable "name" field and actions
        if (isPredefinedField(this.path)) {
            this.childrenByPropertyId.fieldName.disable();

            setTimeout(function () {
                $(me.containerItemEl).find(".alpaca-array-actionbar").hide();
            }, 300);
        }

        var typeField = this.childrenByPropertyId["type"];
        var valueField = this.childrenByPropertyId["value"];
        valueField.subscribe(typeField, function(val) {
            var mapping = mappingTypeValues[val] || [];
            if (!mapping.length) {
                return;
            }
            
            this.schema.enum = mapping[0];
            this.options.type = 'select';
            this.options.optionLabels = mapping[1];
            //this.refresh();
            
            console.log(typeField);
            debugger;
            this.parent.createItem(this.propertyId, this.schema, this.options, null, typeField.propertyId, function (callback) {
                if (callback instanceof Function) {
                    callback();
                }
            });
        });                                                                
    }
    
//    var changeEvent = function (path) {
//        var eventField = editor.getEditor(path);
//        if (!eventField) {
//            return;
//        }
//        
//        var newValue = eventField.getValue();
//        var parts, appId, sectionId, eventId;
//        
//        if (!newValue || eventField.oldValue === newValue) {
//            return;
//        }
//        
//        parts = newValue.split('/');
//        appId = parts[0];
//        sectionId = parts[1];
//        eventId = parts[2];
//
//        inno.getProfileSchemaSessionDatas(appId, sectionId, function (els) {
//            mappingTypeValues.sessionValue = prepareEls(els);
//        });        
//
//        inno.getProfileSchemaEventDefinitionDatas(appId, sectionId, eventId, function (els) {
//            mappingTypeValues.eventValue = prepareEls(els);
//        });
//        
//        eventField.oldValue = newValue;
//    };
    
    function prepareEls (els) {
        var newEls = [[], []];
        els.forEach(function (el) {
            newEls[0].push(el);
            newEls[1].push(el.split('/').join(' / '));
        });
        return newEls;
    }
    
    function randomId () {
        return +new Date;
    }
    
    function getPredefinedFieldsPaths () {
        var res = [];
        predefinedFields.fieldSets.forEach(function (fs, fsIdx) {
            var fsPath = 'fieldSets[' + fsIdx + ']';
            res.push(fsPath);
            fs.fields.forEach(function (f, fIdx) {
                var path = [fsPath, 'fields[' + fIdx + ']'].join('/');
                res.push(path);
            });
        });
        return res;
    }
    
    function isPredefinedField (path) {
        return predefinedFieldsPaths.some(function (fp) {
            return path.indexOf(fp) !== -1;
        });
    }

    // Listen submit button click event
    $('#submit-setting').on('click', function () {
        var errors = editor.validate();
        if (errors.length) {
            errors = errors.map(function (error) {
                var field = editor.getEditor(error.path),
                    title = field.schema.title;
                return title + ': ' + error.message;
            });
            alert(errors.join('\n'));
        } else {
            loader.show();
            inno.setRules(editor.getValue(), function (success) {
                loader.hide();
                if (success) {
                    alert('Rules were successfully saved.');
                }
            });
        }
    });

})();