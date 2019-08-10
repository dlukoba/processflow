// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
$(document).ready(function () {
    var database = "processFlowDB"    
    var db = new Dexie(database);
    db.version(1).stores({
        processFlows: 'id,previousStepId,level'
    });

    db.on("ready", function () {
        return db.processFlows.count(function (count) {
            if (count > 0) {
                console.log("already populated")
            }
            else {
                console.log("Empty db, populating ...")

                return new Promise(function (resolve, reject) {
                    $.ajax("/home/processflow", {
                        type: 'get',
                        dataType: 'json',
                        error: function (xhr, textStatus) {
                            // Rejecting promise to make db.open() fail.
                            reject(textStatus);
                        },
                        success: function (data) {
                            // Resolving Promise will launch then() below.
                            resolve(data);
                        }
                    })
                }).then(function (data) {
                    console.log("Got ajax response. We'll now add the objects.");
                    // By returning the db.transaction() promise, framework will keep
                    // waiting for this transaction to commit before resuming other
                    // db-operations.
                    return db.transaction('rw', db.processFlows, function () {
                        data.forEach(function (item) {
                            // console.log("Adding object: " + JSON.stringify(item));
                            db.processFlows.add(item);
                        })
                    });
                }).then(function () {
                    console.log("Transaction committed");
                })
            }
        })
    })

    db.open();

    $.fn.displayFlow = function (previousStepId, levelId, direction) {
        $("#process-flow").replaceWith('<div class="row" id="process-flow"></div>')
        
        var newLevelId
        if (previousStepId == null) {
            newLevelId = levelId

            db.processFlows.where({ level: levelId }).each(function (item) {
                $.fn.buildRow(item)
            }).catch(error => {
                console.error(error.stack || error);
            })
        }
        else if (direction == "forward") {
            newLevelId = Number(levelId) + 1
            
            db.processFlows.where({ previousStepId: Number(previousStepId) }).each(function (item) {
                if (item.symlink != null) {
                    db.processFlows.where({ id: item.symlink }).each(function (innerItem) {
                        $.fn.buildRow(innerItem)
                    })
                }
                else {
                    $.fn.buildRow(item)
                }
            }).catch(error => {
                console.error(error.stack || error);
            })
        }
        else if (direction == "backward") {
            newLevelId = Number(levelId) - 1
            
            db.processFlows.where({ id: Number(previousStepId) }).first(function (item) {
                // get the parent
                db.processFlows.where({ id: item.previousStepId }).first(function (parent) {
                    if (parent.previousStepId == null) {
                        db.processFlows.where({ level: parent.level }).each(function (sibling) {
                            $.fn.buildRow(sibling)
                        })
                    }
                    else {
                        // get parent & siblings
                        db.processFlows.where({ previousStepId: parent.previousStepId }).each(function (sibling) {
                            $.fn.buildRow(sibling)
                        })
                    }
                })
            })
        }
        
        $("#currentLevelId").attr("value", newLevelId)
    }

    $.fn.buildRow = function (rowItem) {
        var row = "<div class='col-sm-4'>"
        row += "<h4>" + rowItem.title + "</h4>"
        row += "<p>" + rowItem.description + "</p>"
        row += "<p><textarea class='form-control'></textarea></p>"
        row += "<button type='button' class='btn btn-primary btn-sm' id='backward_" + rowItem.id + "' data-parent-id='" + rowItem.previousStepId + "' data-sym-link='" + rowItem.symlink + "'>Previous</button>"
        row += "<button type='button' class='btn btn-primary btn-sm' id='forward_" + rowItem.id + "' data-parent-id='" + rowItem.previousStepId + "' data-sym-link='" + rowItem.symlink + "'>Next</button>"
        row += "</div>"

        $("#process-flow").append(row)
    }

    // on page load
    $.fn.displayFlow(null, 1, "forward")

    // on next/prev button click
    $(".pb-3").on("click", "#process-flow .btn", function () {
        var stepId = $(this).attr("id").split("_")
        var previousStepId = stepId[1]
        var direction = stepId[0]
        //var parentId = $(this).data("parentId")
        //var symlink = $(this).data("symlink")
        
        $("#currentStepId").attr("value", previousStepId)
        var levelId = $("#currentLevelId").val()
        
        $.fn.displayFlow(previousStepId, levelId, direction)
    })

/*db.delete().then(() => {
    console.log("Database successfully deleted");
}).catch((err) => {
    console.error("Could not delete database");
}).finally(() => {
    // Do what should be done next...
});*/
})