/* globals Prefs, MimeActions */
'use strict';
Prefs.init();
var $ = document.getElementById.bind(document);

function bindBooleanPref(prefName) {
    var checkbox = $('pref-' + prefName);
    checkbox.onchange = function() {
        Prefs.set(prefName, this.checked);
    };
    Prefs.setPrefHandler(prefName, function(isEnabled) {
        checkbox.checked = isEnabled;
    });
}

function renderMimeMappings(mimeMappings) {
    var table = $('mime-mappings');
    var mimeKeys = Object.keys(mimeMappings);
    if (mimeKeys.length === 0) {
        table.hidden = true;
        return;
    }

    var tbody = document.createElement('tbody');
    var button =  document.createElement('input');
    button.type = 'button';
    button.title = 'Click to restore the default handler for this type. Click again to undo.';
    button.value = 'Restore default';

    mimeKeys.sort().forEach(function(originalMimeType) {
        var row = tbody.insertRow(-1);
        row.insertCell(0).textContent = originalMimeType;

        var mimeAction = Prefs.getMimeAction(originalMimeType);
        var actionMessage;
        var mimeType = mimeAction.mime;
        if (mimeType) {
            if (mimeAction.action === MimeActions.OIB_GENERIC) {
                mimeType = mimeType === 'text/plain' ? 'Text' :
                           mimeType === 'text/html' ? 'Web page' :
                           mimeType === 'text/xml' ? 'XML document' :
                           mimeType === 'image/png' ? 'Image' :
                           mimeType;
            }
            actionMessage = 'Open in browser as ' + mimeType;
        } else if (mimeAction.action === MimeActions.OIB_SERVER_SENT) {
            actionMessage = 'Open in browser with server-sent MIME';
        } else if (mimeAction.action === MimeActions.DOWNLOAD) {
            actionMessage = 'Save file';
        }
        row.insertCell(1).textContent = actionMessage;

        row.insertCell(2).appendChild(button.cloneNode()).onclick = function() {
            row.classList.toggle('restored-to-default');
            var isRemoved = row.classList.contains('restored-to-default');
            if (isRemoved) {
                this.value = 'Undo reset';
                Prefs.removeMimeAction(originalMimeType);
            } else {
                this.value = 'Restore default';
                Prefs.setMimeAction(originalMimeType, mimeAction);
            }
        };
    });
    table.removeChild(table.tBodies[0]);
    table.appendChild(tbody);
    table.hidden = false;
}

bindBooleanPref('text-nosniff');

bindBooleanPref('octet-sniff-mime');

Prefs.setPrefHandler('mime-mappings', renderMimeMappings);
