/*global NoteApp _config*/

var NoteApp = window.NoteApp || {};
NoteApp.notes = NoteApp.notes || {};

(function noteScopeWrapper($) {
    var authToken;
    NoteApp.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
            displayAuthToken(token);
        } else {
            window.location.href = '/signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/signin.html';
    });

    function displayAuthToken(token) {
        $('.authToken').text(token);
    }

    function createNote() {
        var title = $('#title').val();
        var content = $('#content').val();

        if (!title || !content) {
            alert("Both title and content are required!");
            return;
        }

        $.ajax({
            method: 'POST',
            url: window._config.api.invokeUrl + '/notes',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                title: title,
                content: content
            }),
            contentType: 'application/json',
            success: function(result) {
                displayUpdate('Note titled "' + result.Title + '" has been created.');
                $('#title').val('');
                $('#content').val('');
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error creating note: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occurred when creating your note:\n' + jqXHR.responseText);
            }
        });
    }

    function readNote() {
        var notesID = $('#notesID').val();

        if (!notesID) {
            alert("Note ID is required!");
            return;
        }

        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/notes',
            headers: {
                Authorization: authToken
            },
            data: { notesID: notesID },
            success: function(result) {
                displayUpdate('Note titled "' + result.Title + '" has been retrieved.');
                $('#title').val(result.Title);
                $('#content').val(result.Content);
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error retrieving note: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occurred when retrieving your note:\n' + jqXHR.responseText);
            }
        });
    }

    function updateNote() {
        var notesID = $('#notesID').val();
        var title = $('#title').val();
        var content = $('#content').val();

        if (!notesID || !title || !content) {
            alert("Note ID, title, and content are required!");
            return;
        }

        $.ajax({
            method: 'PUT',
            url: _config.api.invokeUrl + '/notes',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                notesID: notesID,
                Updates: {
                    Title: title,
                    Content: content
                }
            }),
            contentType: 'application/json',
            success: function(result) {
                displayUpdate('Note titled "' + title + '" has been updated.');
                listNotesWithUpdate(); // Refresh the list of notes after update
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error updating note: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occurred when updating your note:\n' + jqXHR.responseText);
            }
        });
    }

    function deleteNote() {
        var notesID = $('#notesID').val();

        if (!notesID) {
            alert("Note ID is required!");
            return;
        }

        $.ajax({
            method: 'DELETE',
            url: _config.api.invokeUrl + '/notes',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                notesID: notesID
            }),
            contentType: 'application/json',
            success: function(result) {
                displayUpdate('Note with ID "' + notesID + '" has been deleted.');
                $('#title').val('');
                $('#content').val('');
                listNotesWithDelete(); // Refresh the list of notes after deletion
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error deleting note: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occurred when deleting your note:\n' + jqXHR.responseText);
            }
        });
    }

    function listNotes() {
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/notes',
            headers: {
                Authorization: authToken
            },
            success: function(result) {
                $('#notesList').empty(); // Clear previous list
                result.forEach(function(note) {
                    $('#notesList').append(
                        '<li class="list-group-item">' +
                        'Note ID: ' + note.notesID + '<br>' +
                        'Title: ' + note.Title + '<br>' +
                        'Content: ' + note.Content +
                        '</li>'
                    );
                });
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error listing notes: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occurred when listing your notes:\n' + jqXHR.responseText);
            }
        });
    }

    function listNotesWithDelete() {
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/notes',
            headers: {
                Authorization: authToken
            },
            success: function(result) {
                $('#notesList').empty(); // Clear previous list
                result.forEach(function(note) {
                    $('#notesList').append(
                        '<li class="list-group-item">' +
                        'Note ID: ' + note.notesID + '<br>' +
                        'Title: ' + note.Title + '<br>' +
                        'Content: ' + note.Content + '<br>' +
                        '<button class="btn btn-danger btn-sm delete-btn" data-id="' + note.notesID + '">Delete</button>' +
                        '</li>'
                    );
                });
                // Attach click handler for delete buttons
                $('.delete-btn').click(function() {
                    var notesID = $(this).data('id');
                    $('#notesID').val(notesID); // Set the notesID in the form
                    deleteNote();
                });
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error listing notes: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occurred when listing your notes:\n' + jqXHR.responseText);
            }
        });
    }

    function listNotesWithUpdate() {
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/notes',
            headers: {
                Authorization: authToken
            },
            success: function(result) {
                $('#notesList').empty(); // Clear previous list
                result.forEach(function(note) {
                    $('#notesList').append(
                        '<li class="list-group-item">' +
                        'Note ID: ' + note.notesID + '<br>' +
                        'Title: ' + note.Title + '<br>' +
                        'Content: ' + note.Content + '<br>' +
                        '<button class="btn btn-warning btn-sm update-btn" data-id="' + note.notesID + '" data-title="' + note.Title + '" data-content="' + note.Content + '">Update</button>' +
                        '</li>'
                    );
                });
                // Attach click handler for update buttons
                $('.update-btn').click(function() {
                    var notesID = $(this).data('id');
                    var title = $(this).data('title');
                    var content = $(this).data('content');
                    $('#notesID').val(notesID); // Set the notesID in the form
                    $('#title').val(title); // Set the title in the form
                    $('#content').val(content); // Set the content in the form
                });
            },
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error listing notes: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occurred when listing your notes:\n' + jqXHR.responseText);
            }
        });
    }

    // Register click handler for buttons
    $(function onDocReady() {
        $('#createNote').click(createNote);
        $('#readNote').click(readNote);
        $('#updateNote').click(updateNote);
        $('#listNotes').click(listNotes);
        $('#listNotesWithDelete').click(listNotesWithDelete);
        $('#listNotesWithUpdate').click(listNotesWithUpdate);

        NoteApp.authToken.then(function updateAuthMessage(token) {
            if (token) {
                displayUpdate('You are authenticated. Click to see your <a href="#authTokenModal" data-toggle="modal">auth token</a>.');
                $('.authToken').text(token);
            }
        });

        if (!_config.api.invokeUrl) {
            $('#noApiMessage').show();
        }
    });

    function displayUpdate(text) {
        $('#updates').append($('<li class="list-group-item">' + text + '</li>'));
    }
}(jQuery));
