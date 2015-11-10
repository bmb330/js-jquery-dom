events = [
	'click',
	'dblclick',
	'mousedown',
	'mouseup',
	'mouseover',
	'mouseout',
	'mousemove',
	'mouseenter',
	'mouseleave',
	'contextmenu',
	'select',
	'change',
	'submit',
	'reset',
	'focus',
	'blur',
	'scroll',
	'keydown',
	'keypress',
	'keyup',
	'input'
];

var useFilter = true,
//array of regex: all caps, moz- prefix, webkit- prefix
filters = [/^([A-Z,_]+)$/, /moz/, /webkit/],
filterOut = function(s) {
	for(var i = 0; i < filters.length; i++) {
		if(filters[i].test(s)) return true;
	}

	return false;
},
lastEvent = null,
animate = function(selector) {
	$(selector).removeClass()
	.addClass('fadeIn animated bg-success')
	.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
		$(selector).removeClass('fadeIn animated');
	});
},

showEventData = function(evName, ev) {
	lastEvent = {
		name: evName,
		ev: ev
	};
	var data = $('#event-data').html('');

	console.log(evName, this, ev);

	for(var k in ev) {
		if(!useFilter || (useFilter && !filterOut(k))) {
			data.append($('<li>').append('<strong>' + k + ':</strong> ' + ev[k]));
		}
	}
};

$('#filter').on('change', function(ev) {
	useFilter = $(this).is(':checked');
	showEventData(lastEvent.name, lastEvent.ev);
});

window.addEventListener("load", function(event){

	jQuery.each(events, function(i, event_name){
		var elements = document.getElementsByClassName(event_name)
		jQuery.each(elements, function(j, element){
			element.addEventListener(event_name, function(event){
				showEventData.call(this, event_name, event);
				animate('#' + event_name + 'ed');
			}, false)
		});
	});

	showEventData.call(this, 'load', event);
	animate('#loaded');
}, false);

$(window).resize(function(event){
	showEventData.call(this, 'resize', event);
	animate('#resizeed');
});

document.addEventListener('DOMContentLoaded', function(event) {
	showEventData.call(this, 'DOMContentLoaded', event);
	animate('#domloaded');
}, false);

$(window).ready(function(event){
	showEventData.call(this, 'ready', event);
	animate('#readyed');
});

$.each(['mouseenter', 'mouseleave', 'mouseover', 'mouseout'], function(i, evName) {
	$('.vis-mouseenter').on(evName, function(ev) {
		var el = $(this).children('.' + evName.replace('mouse', '')),
		i = +el.html();

		el.html(++i);
	});
});