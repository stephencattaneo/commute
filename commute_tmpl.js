(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['commute.tmpl'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, self=this;

function program1(depth0,data) {
  
  
  return "\n<div class='leg'>\n  <div>Bart</div>\n  <div>Leave: </div>\n  <div>Arrive: </div>\n  <div>VTA</div>\n  <div>Leave: </div>\n  <div>Arrive: </div>\n</div>\n";
  }

  buffer += " "
    + "\n";
  stack1 = helpers.each.call(depth0, depth0.first_leg_options, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;
  });
})();