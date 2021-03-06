$(document).ready(function() {
    var hideAjaxLoader;
    
    loadLastReadTimes(); // update times on start
    // check every 45 seconds for unread feeds and display notifications
    setInterval(loadLastReadTimes, 45000);
    
    
    // hide message box initially
    $("#message-box").hide();
    
    // bind jquery dialog widget to read-feed-dialog
    var readFeedDialog = $("#read-feed-dialog").dialog({
        //dialogClass: "no-title",
        modal: true,
        autoOpen: false,  
        resizable: false,
        draggable: false,
        width: 800,
        height: 600,
        position: {
            my: "center",
            at: "center",
            of: ".container" 
        }
    });
    
    // ajax callbacks
    $(document).ajaxSend(function(event, request, settings) {
        if (hideAjaxLoader = 1) {
            hideAjaxLoader = 0;
        } else {
            $("body").addClass("hide-scrollbar");
            $('#loading-indicator').show();
        }
    });

    $(document).ajaxComplete(function(event, request, settings) {
        $("body").removeClass("hide-scrollbar");
        $('#loading-indicator').hide();
    });
    
    // rss row click event handler
    $(".rss-row").unbind().click(function(e) {  
        // prevent delete buttons from firing this event
        if (e.target.nodeName === "BUTTON") {
            return;
        }
        $("body").addClass("hide-scrollbar");
        $('#loading-indicator').show();
        var feedId      = $(this).attr("feed-id");
        var feedName    = $(this).attr("feed-name");
        $.ajax({
            method: "post",
            url: "ajax_handler.php",
            data: {feed: feedId, target: "feed", method: "read"}
        }).done(function(response) {
            loadLastReadTimes();
            $("#read-feed-dialog").html(response);
            $(".ui-dialog-title").html("Feeds from " + feedName);
            $("#read-feed-dialog").dialog("open");
        });
    });
    
    // event handler for the delete feed button
    $(".btn-delete-feed").unbind().click(function(e) {
        // confirmation check
        var popupChoice = confirm("Do you really want to delete this feed ?");
        
        // make ajax call and delete the feed
        if (popupChoice) {
            var feed_id = $.trim($(this).attr("feed-id"));
        
            $.ajax({
                method: "post",
                url: "ajax_handler.php",
                data: {feed: feed_id, target: "feed", method: "delete"}
            }).done(function(response) {
               afterAjaxTasks("#read-feed-dialog", "deleted RSS Feed", "#rss-table", response);
            });
        }
    });
    
    // bind jquery dialog widget to add-feed-dialog
    var addFeedDialog = $("#add-feed-dialog").dialog({
        dialogClass: "no-close",
        modal: true,
        autoOpen: false,  
        resizable: false,
        draggable: false,
        width: 430,
        position: {
            my: "center",
            at: "center",
            of: ".container" 
        }
    });
    
    // event handler for the add feed button
    $(".btn-add-feed" ).unbind().click(function(e) {
        $(".ui-dialog-title").html("Add a new RSS Feed");
        $("#add-feed-dialog").removeClass("hidden");
        $("#add-feed-dialog").dialog("open");
    });
    
    // confirmation to add a feed
    $("#modal-add-feed").unbind().click(function(e) {
        var feedName    = $("#feed-name").val();
        var feedUrl     = $("#feed-url").val();
        
        $("body").addClass("hide-scrollbar");
        $('#loading-indicator').show();
        
        // only make ajax call when we have data
        if (feedName && feedUrl) {
            $.ajax({
                method: "post",
                url: "ajax_handler.php",
                data: {feed_name: feedName, feed_url: feedUrl, target: "feed", method: "add"}
            }).done(function(response) {
                $("#feed-name").val("");
                $("#feed-url").val("");
                
                if (response != -1) {
                    afterAjaxTasks("#add-feed-dialog", "added new RSS Feed", "#rss-table", response);
                } else {
                    $("#add-feed-error").html("The given URL cannot be parsed");
                    $("body").removeClass("hide-scrollbar");
                    $("#loading-indicator").hide();
                    $("#add-feed-error").fadeIn(1400).fadeOut(1400);
                }
            });     
        }        
    });
    
    // cancel while adding a feed
    $("#modal-add-feed-cancel").unbind().click(function(e) {
            e.preventDefault(); // prevent notification
            $("#feed-name").val("");
            $("#feed-url").val("");
            $("#add-feed-dialog").dialog("close")
    });
    
    // center dialogs after resizing window
    $(window).resize(function() {
        $("#add-feed-dialog").dialog("option", "position", {my: "center", at: "center", of: ".container"});
        $("#read-feed-dialog").dialog("option", "position", {my: "center", at: "center", of: ".container"});
    });
    
    // helper functions to avoid redundant code
    
    /*
    * cleanse input fields, show message, render response
    */
    function afterAjaxTasks(dialogSelector, message, responseSelector, response) {
        $(dialogSelector).dialog("close");
        if (response) {
            $(responseSelector).html(response); // update the dynamic content
        };
        $("#message-box").html(message);
        $("#message-box").fadeIn(1400).fadeOut(1400);
    }
    
    /**
    * update times displayed when the feed was last read
    */
    function loadLastReadTimes() {
        var feedId = $(this).attr("id")
        var json = new Array();
        $(".rss-row").each(function(index) {
            json.push($(this).attr("feed-id"));    
        });
        
        if (json.length == 0) {
            return;
        }
        
        hideAjaxLoader = 1
        
        $.ajax({
            method: "post",
            url: "ajax_handler.php",
            data: {feeds: json, target: "feed", method: "check"},
            dataType:'json'
        }).done(function(response) {
            $.each(response, function(index) {
                var diff = new Date(new Date().getTime() - response[index].last_read * 1000).getMinutes();
                if (diff > 30) {
                    diff = "> 30";
                };
                $("#news-" + response[index].feed_id).html("");                
                $("#news-" + response[index].feed_id).html(diff + "m ago");
            });
        });
    }
});