function enumerate_time () {
    var d = document;
    var ts = d.createElement('select');
    ts.setAttribute('id', 'time_select');
    ts.setAttribute('style', 'display: none;');
    for (var hour=5; hour < 19; hour++) {
        for (var minute = 0; minute < 60; minute += 15) {
            var el = d.createElement('option');
            var m = String(minute);
            if (m.length < 2) m = '0' + m;
            el.appendChild(d.createTextNode(hour +' : '+ m));
            ts.appendChild(el);
        }
    }

    d.querySelector('#chooser').appendChild(ts);
}

function show_hide_selector () {
    var os = document.querySelector('#option_select');
    var ts = document.querySelector('#time_select');
    ts.setAttribute('style', os.selectedIndex ? '' : 'display: none;');
}