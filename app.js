app = function () {
  this.data['bart'] = window.bart_stop_times
  this.data['vta'] = {'south_bound':[{"FRMT":"6:12","SNYV":"6:52"},{"FRMT":"7:12","SNYV":"7:58"},{"FRMT":"7:43","SNYV":"8:32"},{"FRMT":"7:58","SNYV":"8:47"},{"FRMT":"8:13","SNYV":"9:02"},{"FRMT":"8:28","SNYV":"9:17"}],'north_bound':[{"SNYV":"16:05","FRMT":"16:57"},{"SNYV":"16:37","FRMT":"17:34"},{"SNYV":"17:05","FRMT":"18:06"},{"SNYV":"17:25","FRMT":"18:24"},{"SNYV":"17:44","FRMT":"18:43"},{"SNYV":"18:13","FRMT":"19:10"}]};


};

app.prototype.data = {};
app.prototype.direction = '';
app.prototype.first_leg = '';
app.prototype.second_leg = '';
app.prototype.now = null;
app.prototype.leg_pointers = {};

app.prototype.run = function (display_div, opt_now, opt_debug) {
  this.now = opt_now ? opt_now : new Date();
  this.debug = opt_debug ? true : false;
  display_div.innerHTML = '';
  if (this.debug) window.console.log('now: ' + this.now);

  this.leg_pointers = {
    'bart': 0, 'vta': 0
  };

  var noon = (new Date()).setHours(12);
  this.before_noon = this.now < noon;
  var direction, first_leg, second_leg;
  if (this.before_noon) {
    if (this.debug) window.console.log('now is before noon');
    this.direction = 'south_bound';
    this.first_leg = 'bart';
    this.second_leg = 'vta';
  } else {
    if (this.debug) window.console.log('now is after noon');
    this.direction = 'north_bound';
    this.first_leg = 'vta';
    this.second_leg = 'bart';
  }


  var first_leg_options = [];
  var second_leg_options = [];
  for (var i=0; i < 2; i++) {
    var option = this.getNextEarliestPosition(this.now, this.first_leg);
    if (! option) {
      if (this.debug) window.console.log('no option returned for first leg.')
      break;
    }
    if (this.debug) window.console.log('first leg option was:');
    if (this.debug) window.console.log(option);
    first_leg_options.push(option);

    var end = this.getEnd('first_leg');
    if (this.debug) window.console.log('first leg end is:' + end);
    option = this.getNextEarliestPosition(option[end], this.second_leg);
    if (this.debug) window.console.log('second leg option:');
    if (this.debug) window.console.log(option);
    second_leg_options.push(option);
    // we need to reset the
    // leg pointer by one so next time we consider
    // the same leg.
    this.leg_pointers[this.second_leg] -= 1;
  }

  this.display(first_leg_options, second_leg_options, display_div);  
};

/**
 * @param {Array.<Ojbect>} first_leg_options The next couple options for the 
 *  first leg of the commute
 * @param {Array.<Object>} second_leg_options Based on the first leg options
 * @param {Node} display_div The div to render into.
 */
app.prototype.display = function(first_leg_options, second_leg_options, display_div) {
  var len = first_leg_options.length;
  var out = [];

  var first_leg_label = this.before_noon ? 'Bart' : 'VTA';
  var second_leg_label = !this.before_noon ? 'Bart' : 'VTA';
  var tmpl1 = '<div class="trip"><div class="leg"><div class="title">'+ first_leg_label +'</div>\n<div class="time">Leave: ';
  var tmpl2 = '</div>\n<div class="time">Arrive: ';
  var tmpl3 = '</div>\n</div><div class="leg"><div class="title">'+ second_leg_label +'</div>\n<div class="time">Leave: ';
  var tmpl4 = '</div>\n<div class="time">Arrive: ';
  var tmpl5 = '</div></div></div>';

  for (var i=0; i < len; i++) {
    out.push(tmpl1);
    out.push(this.prettyDate(first_leg_options[i][this.getStart(this.first_leg)]));
    out.push(tmpl2);
    out.push(this.prettyDate(first_leg_options[i][this.getEnd(this.first_leg)]));
    if (second_leg_options[i]) {
    out.push(tmpl3);
      out.push(this.prettyDate(second_leg_options[i][this.getStart(this.second_leg)]));
      out.push(tmpl4);
      out.push(this.prettyDate(second_leg_options[i][this.getEnd(this.second_leg)]));
      out.push(tmpl5);
    }
  }

  display_div.innerHTML = len ? out.join('') : 'No trips available.'
};


/**
 * @param {Date} date The date to prettify.
 * @return {string} A string representing the provided date.
 */
app.prototype.prettyDate = function(date) {
  var minutes = date.getMinutes().toString();
  if (minutes.length < 2) minutes = "0" + minutes;
  return date.getHours() + ':' + minutes;
};

/**
 * @param {string} leg The leg of the commmute.
 * @return {string} The name of the ending station.
 */
app.prototype.getEnd = function(leg) {
  if (this.direction === 'south_bound') {
    if (leg === 'vta') return 'SNYV';
  } else {
    if (leg === 'bart') return 'FTVL';
  }

  return 'FRMT';
};


/**
 * @param {string} leg The leg of the commmute.
 * @return {string} The name of the starting station.
 */
app.prototype.getStart = function(leg) {
  if (this.direction === 'north_bound') {
    if (leg === 'vta') return 'SNYV';
  } else {
    if (leg === 'bart') return 'FTVL';
  }

  return 'FRMT';
};


/**
 * @param {string} string_date A string representing Hours and Minutes.
 * @return {Date} Sometime today with hours and minutes based on the input.
 */
app.prototype.dateifyString = function (string_date) {
  if(typeof(string_date) !== 'string') {
    throw new Error('string_date was not a string');
  }
  var d = new Date();
  var date_parts = string_date.split(':');
  d.setHours(date_parts[0]);
  d.setMinutes(date_parts[1]);
  return d;
};


/**
 * @param {Date} after The next time must follow this time.
 * @param {string} leg Specifies what lef of a trip.
 * @return {!Object} The next leg option given the provided inputs.
 */
app.prototype.getNextEarliestPosition = function(after, leg) {
  var list = this.data[leg][this.direction];
  var start = this.getStart(leg);
  var end = this.getEnd(leg);

  var item = {};
  // Start yesterday and look through the list.
  // exit the loop as soon as we find a time that
  // is later then 'after'
  item[start] = this.getNow();
  item[start].setDate(this.now.getDate() - 1);

  while (item[start] < after) {
    var tmp_item = list[this.leg_pointers[leg]];
    if (! tmp_item) break;

    item = {};
    for (var key in tmp_item) {
      item[key] = tmp_item[key];
    }

    this.leg_pointers[leg]++;

    item[start] = this.dateifyString(item[start]);
  }

  if (item && item[end]) {
    item[end] = this.dateifyString(item[end]);
    return item;
  }

  return null;
};

/**
 * This method is only for testing.
 * @return {Date} A date object representing now.
 */ 
app.prototype.getNow = function() {
  return new Date();
};