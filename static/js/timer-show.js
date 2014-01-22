var SinceMondayTimerJquery = function(opts) {
	
}

SinceMondayTimerJquery.url = 'http://dev.sincemonday.net';

SinceMondayTimerJquery.getElementByClass = function(className, parent) {
  parent || (parent = document);
  var descendants= parent.getElementsByTagName('*'), i=-1, e, result=[];
  while (e=descendants[++i]) {
    ((' '+(e['class']||e.className)+' ').indexOf(' '+className+' ') > -1) && result.push(e);
  }
  return result;
}

SinceMondayTimerJquery.loadTimerXMLHTTP = function(id, callback) {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            if (callback) {
				callback(JSON.parse(xmlhttp.responseText));
            }
        }
    }
    xmlhttp.open('GET', SinceMondayTimerJquery.url + '/t/' + id + '/show', true);
    xmlhttp.send();
}

SinceMondayTimerJquery.restartTimerXMLHTTP = function(id, callback) {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            if (callback) {
				callback(JSON.parse(xmlhttp.responseText));
            }
        }
    }
    xmlhttp.open('GET', SinceMondayTimerJquery.url + '/t/' + id + '/restart', true);
    xmlhttp.send();
}

SinceMondayTimerJquery.removeClass = function(element, className) {
    return element.className = String.prototype.split.call(element.className, ' ').reduce(function(p, v) {
		if (v && v != className) p.push(v);
		return p;
	}, []).join(' ');
}

SinceMondayTimerJquery.addClass = function(element, className) {
	return element.className = String.prototype.split.call(element.className, ' ').reduce(function(p, v) {
		if (v) p.push(v);
		return p;
	}, [className]).join(' ');
}

SinceMondayTimerJquery.timerShow = function(id, element_id, element) {
	SinceMondayTimerJquery.addClass(element, 'sincemonday-loading sincemonday-well');
	SinceMondayTimerJquery.loadTimerXMLHTTP(id, function(data) {
		SinceMondayTimerJquery.showTimerFromData(element, data);
	});
}

SinceMondayTimerJquery.showTimerFromData =  function(element, data) {
	SinceMondayTimerJquery.removeClass(element, 'sincemonday-loading');
	if (data.set == 1) {
		data.denied = data.denied || 0;
		if (data.denied == 0) {
			var debug = 0;
			var items = '';
			var element_id_time = element_id.replace('#','')+'time';
			var restart_link = element_id.replace('#','')+'restart';
			var edit_link = element_id.replace('#','')+'edit';
			var twitter_link = element_id.replace('#','')+'twitter';
			SinceMondayTimerJquery.removeClass(element, 'sincemonday-timer-good');
			SinceMondayTimerJquery.removeClass(element, 'sincemonday-timer-bad');
			SinceMondayTimerJquery.removeClass(element, 'sincemonday-timer-neutral');
			SinceMondayTimerJquery.removeClass(element, 'sincemonday-timer-public');
			SinceMondayTimerJquery.removeClass(element, 'sincemonday-timer-private');
			if (data.good == 1) {
				SinceMondayTimerJquery.addClass(element, 'sincemonday-timer-good');
				items+='<div class="sincemonday-icon-good"><i class="sincemonday-icon-thumbs-up"></i></div>';
			} else if (data.good == 0) {
				SinceMondayTimerJquery.addClass(element, 'sincemonday-timer-bad');
				items+='<div class="sincemonday-icon-good"><i class="sincemonday-icon-thumbs-down"></i></div>';
			} else {
				SinceMondayTimerJquery.addClass(element, 'sincemonday-timer-neutral');
				items+='<div class="sincemonday-icon-good"><i class="sincemonday-icon-adjust"></i></div>';
			}
			if (data.public == 1) {
				SinceMondayTimerJquery.addClass(element, 'sincemonday-timer-public');
				items+='<div class="sincemonday-icon-public"><i class="sincemonday-icon-eye-open"></i></div>';
			} else if (data.public == 0) {
				SinceMondayTimerJquery.addClass(element, 'sincemonday-timer-private');
				items+='<div class="sincemonday-icon-public"><i class="sincemonday-icon-eye-close"></i></div>';
			}
			if (data.owner_name) {
				items+='<div class="sincemonday-icon-name"><a class="sincemonday-a" href="http://'+SinceMondayTimerJquery.url+'/#!/u/'+data.owner_name+'">'+data.owner_name+'</a></div>';
			}
			items+='<div class=""><center>';
			items+=data.name;
			items+='</center></div>';
			items+='<div class="" id="'+element_id_time+'" title="' + (new Date(data.last_restart * 1000).toString())+ '"><center>';
			items+='</center></div>';
			items+='<div class=""><center>';
			if (data.can_edit == 1 || data.id == 0 || data.id == 74) {
				items+='<a class="sincemonday-a sincemonday-btn sincemonday-btn-danger" href="#" id="'+restart_link+'"><i class="sincemonday-icon-white sincemonday-icon-repeat"></i> Сброс</a>';
			}
			if (data.public == 1) {
				if (data.owner_name != null) {
				var url=SinceMondayTimerJquery.url+'/#!/u/'+data.owner_name;
				} else {
				var url=SinceMondayTimerJquery.url;
				}
				items+=' <a href="" class="sincemonday-a sincemonday-twitter-share-button sincemonday-btn sincemonday-btn-inverse" target="_blank" id="'+twitter_link+'"><img src="https://twitter.com/favicons/favicon.ico"> Твитнуть</a>';
			}
			items+='</center></div>';
			element.innerHTML = items;
			setTimeout(function() {
				SinceMondayTimerJquery.timerShowTime(data.last_restart, element_id_time, 0, debug);
				SinceMondayTimerJquery.timerTwitterButtonHref(twitter_link, url, data.owner_name, data.name, data.last_restart);
				var stop_timer = setInterval(
					function() {
					SinceMondayTimerJquery.timerShowTime(data.last_restart, element_id_time);
					SinceMondayTimerJquery.timerTwitterButtonHref(twitter_link, url, data.owner_name, data.name, data.last_restart);
					},1000
				);
				if (data.can_edit == 1 || data.id == 0) {
					document.getElementById(restart_link).onclick = function() {
						SinceMondayTimerJquery.timerRestart(data.id, element_id, stop_timer);
						return false;
					};
				}
			}, 1);
			
		} else {
			var items = '';
			items+='<div class=""><center>';
			items+='Доступ к таймеру запрещён';
			items+='</center></div>';
			element.innerHTML = items;
		}
	}
}

SinceMondayTimerJquery.timerShowTime = function(last_restart, element_id_time, nonformat, debug) {
	debug = debug || 0;
	nonformat = nonformat || 0;
	var time_string_was = document.getElementById(element_id_time).innerHTML;
	var time = SinceMondayTimerJquery.timerGetTime(last_restart, 0, debug);
	var items = '';
	if (nonformat == 0) {
	  items+='<center>';
	  items+='<h1>'+time[0]+'<small class="sincemonday-small"> '+time[1]+' '+time[2]+' '+time[3]+'</small></h1>';
	  items+='</center>';
	} else {
	  items+=time[0]+' '+time[1]+' '+time[2]+' '+time[3];
	}
	if (time_string_was != items) {
	  document.getElementById(element_id_time).innerHTML = items;
	}
}

SinceMondayTimerJquery.timerGetTime = function(last_restart, format, debug) {
	debug = debug || 0;
	format = format || 0;
	var date_1 = new Date();
	var date_2 = new Date(last_restart * 1000);
	var time = Array(4);
	if ( date_1.getTime() > date_2.getTime() ) { // last_restart is in future
	  date_1 = date_2;
	  date_2 = new Date();
	}
	if (format == 0) {
	  var date_diff = Array(6);
	  date_diff[0] = Date.DateDiff('yyyy',date_1,date_2,1);
	  date_diff[1] = Date.DateDiff('m',date_1,date_2,1);
	  date_diff[2] = Date.DateDiff('d',date_1,date_2,1);
	  date_diff[3] = Date.DateDiff('h',date_1,date_2,1);
	  date_diff[4] = Date.DateDiff('n',date_1,date_2,1);
	  date_diff[5] = Date.DateDiff('s',date_1,date_2,1);
	  if (debug == 1) {
	    console.log('debugging timerGetTime: '+last_restart+' yyyy'+date_diff[0]+' m'+date_diff[1]+' d'+date_diff[2]+' h'+date_diff[3]+' n'+date_diff[4]+' s'+date_diff[5]);
	  }
	  if (date_diff[0] != 0) { // diff is MORE than year
	    if (debug == 1) { console.log('diff is MORE than year'); }
	    time[0] = date_diff[0];
	    time[1] = 'г.';
	    time[2] = Date.DateDiff('m',Date.DateAdd('yyyy',time[0],date_1),date_2,1);
	    time[3] = 'мес.';
	    if (time[2] < 0) {
	      time[0] = date_diff[0] - 1;
	      time[2] = Date.DateDiff('m',Date.DateAdd('yyyy',time[0],date_1),date_2,1);
	      if (time[0] == 0) {
		time[0] = time[2];
		time[1] = time[3];
		time[2] = Date.DateDiff('d',Date.DateAdd('m',time[0],date_1),date_2,1);
		time[3] = 'д.';
		if (time[2] < 0) {
		  time[0] = date_diff[1] - 1;
		  time[2] = Date.DateDiff('d',Date.DateAdd('m',time[0],date_1),date_2,1);
		}
		// if a few days over the year -->
		if (time[0] == 0) {
		  time[0] = time[2];
		  time[1] = time[3];
		  time[2] = Date.DateDiff('h',Date.DateAdd('d',time[0],date_1),date_2,1);
		  time[3] = 'ч';
		  if (time[2] < 0) {
		    time[0] = date_diff[1] - 1;
		    time[2] = Date.DateDiff('h',Date.DateAdd('d',time[0],date_1),date_2,1);
		  }
		}
		// <-- if a few days over the year. NEED NEW YEAR TESTING FOR HOURS AND MINUTES
	      }
	    }
	  } else { // diff is less than year
	    if (date_diff[1] != 0) { // diff is MORE than month
	      if (debug == 1) { console.log('diff is MORE than month'); }
	      time[0] = date_diff[1];
	      time[1] = 'мес.';
	      time[2] = Date.DateDiff('d',Date.DateAdd('m',time[0],date_1),date_2,1);
	      time[3] = 'д.';
	      if (time[2] < 0) {
		time[0] = date_diff[1] - 1;
		time[2] = Date.DateDiff('d',Date.DateAdd('m',time[0],date_1),date_2,1);
		if (time[0] == 0) {
		  time[0] = time[2];
		  time[1] = time[3];
		  time[2] = Date.DateDiff('h',Date.DateAdd('d',time[0],date_1),date_2,1);
		  time[3] = 'ч';
		}
	      }
	    } else { // diff is less than month
	      if (date_diff[2] != 0) { // diff is MORE than day
		if (debug == 1) { console.log('diff is MORE than day'); }
		time[0] = date_diff[2];
		time[1] = 'д.';
		time[2] = Date.DateDiff('h',Date.DateAdd('d',time[0],date_1),date_2,1);
		time[3] = 'ч';
	      } else { // diff is less than day
		if (date_diff[3] != 0) { // diff is MORE than hour
		  if (debug == 1) { console.log('diff is MORE than hour'); }
		  time[0] = date_diff[3];
		  time[1] = 'ч';
		  time[2] = Date.DateDiff('n',Date.DateAdd('h',time[0],date_1),date_2,1);
		  time[3] = 'мин';
		} else { // diff is less than hour
		  if (date_diff[4] != 0) { // diff is MORE than minute
		    if (debug == 1) { console.log('diff is MORE than minute'); }
		    time[0] = date_diff[4];
		    time[1] = 'мин';
		    time[2] = Date.DateDiff('s',Date.DateAdd('n',time[0],date_1),date_2,1);
		    time[3] = 'с';
		  } else { // diff is less than minute
		    if (debug == 1) { console.log('diff is less than minute'); }
		    time[0] = date_diff[5];
		    time[1] = 'с';
		    time[2] = '';
		    time[3] = '';
		  }
		}
		
	      }
	    }
	  }
	}
	if (time[2] == 0) {
	  time[2] = '';
	  time[3] = '';
	}
	return time;
}

SinceMondayTimerJquery.timerTwitterButtonHref = function(element_id, url,owner_name, name, last_restart) {
	url = url || '';
	owner_name = owner_name || '';
	name = name || '';
	last_restart = last_restart || 0;
	var items='';
	var items_was = document.getElementById(element_id).getAttribute('href');
	var time = SinceMondayTimerJquery.timerGetTime(last_restart);
	items+='https://twitter.com/share?url='+url+'&text=';
	if (owner_name != '') {
	  items+='@'+owner_name+': ';
	}
	items+=name+' '+time[0]+' '+time[1];
	if (time[3] != '') {
	  items+=' '+time[2]+' '+time[3];
	}
	items+='&hashtags=sincemo';
	if (items_was != items) {
	  document.getElementById(element_id).setAttribute('href', items);
	}
}

SinceMondayTimerJquery.timerRestart = function(id, element_id, stop_timer) {
	var element = document.getElementById(element_id);
	clearInterval(stop_timer);
	SinceMondayTimerJquery.addClass(element, 'sincemonday-loading');
	SinceMondayTimerJquery.restartTimerXMLHTTP(id, function(data) {
		SinceMondayTimerJquery.removeClass(element, 'sincemonday-loading');
	    SinceMondayTimerJquery.showTimerFromData(element, data);
	});
} 

SinceMondayTimerJquery.createCSSSelector = function(selector, style) {
    if(!document.styleSheets) {
        return;
    }

    if(document.getElementsByTagName("head").length == 0) {
        return;
    }

    var stylesheet;
    var mediaType;
    if(document.styleSheets.length > 0) {
        for( i = 0; i < document.styleSheets.length; i++) {
            if(document.styleSheets[i].disabled) {
                continue;
            }
            var media = document.styleSheets[i].media;
            mediaType = typeof media;

            if(mediaType == "string") {
                if(media == "" || (media.indexOf("screen") != -1)) {
                    styleSheet = document.styleSheets[i];
                }
            } else if(mediaType == "object") {
                if(media.mediaText == "" || (media.mediaText.indexOf("screen") != -1)) {
                    styleSheet = document.styleSheets[i];
                }
            }

            if( typeof styleSheet != "undefined") {
                break;
            }
        }
    }

    if( typeof styleSheet == "undefined") {
        var styleSheetElement = document.createElement("style");
        styleSheetElement.type = "text/css";

        document.getElementsByTagName("head")[0].appendChild(styleSheetElement);

        for( i = 0; i < document.styleSheets.length; i++) {
            if(document.styleSheets[i].disabled) {
                continue;
            }
            styleSheet = document.styleSheets[i];
        }

        var media = styleSheet.media;
        mediaType = typeof media;
    }

    if(mediaType == "string") {
        for( i = 0; i < styleSheet.rules.length; i++) {
            if(styleSheet.rules[i].selectorText && styleSheet.rules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
                styleSheet.rules[i].style.cssText = style;
                return;
            }
        }

        styleSheet.addRule(selector, style);
    } else if(mediaType == "object") {
        for( i = 0; i < styleSheet.cssRules.length; i++) {
            if(styleSheet.cssRules[i].selectorText && styleSheet.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
                styleSheet.cssRules[i].style.cssText = style;
                return;
            }
        }

        styleSheet.insertRule(selector + "{" + style + "}", 0);
    }
}

SinceMondayTimerJquery.createCSSSelector('h1 small.sincemonday-small', 'font-weight: normal; line-height: 1; color: #999999;');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-icon-thumbs-up', 'background-position: -96px -144px;');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-icon-thumbs-down', 'background-position: -120px -144px;');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-icon-adjust', 'background-position: -48px -72px;');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-icon-eye-open', 'background-position: -96px -120px;');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-icon-eye-close', 'background-position: -120px -120px;');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-icon-repeat', 'background-position: -216px -24px;');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-icon-white', 'background-image: url("http://sincemonday.net/plusstrap/docs/assets/img/glyphicons-halflings-white.png");');

SinceMondayTimerJquery.createCSSSelector('[class^="sincemonday-icon-"], [class*=" sincemonday-icon-"]', 'display: inline-block; width: 14px; height: 14px; *margin-right: .3em; line-height: 14px; vertical-align: text-top; background-image: url("http://sincemonday.net/plusstrap/docs/assets/img/glyphicons-halflings.png"); background-position: 14px 14px; background-repeat: no-repeat;');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-btn-inverse:focus, .sincemonday-btn-danger:focus', '-webkit-box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .5); -moz-box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .5); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .5); outline: none;');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-btn-inverse', 'color: #ffffff; text-shadow: 0 1px 0 #373337; background-color: #535154; background-image: -moz-linear-gradient(top, #555555, #514b52); background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#555555), to(#514b52)); background-image: -webkit-linear-gradient(top, #555555, #514b52); background-image: -o-linear-gradient(top, #555555, #514b52); background-image: linear-gradient(to bottom, #555555, #514b52); background-repeat: repeat-x; filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#ff555555\', endColorstr=\'#ff514b52\', GradientType=0); border-color: #443f45; *background-color: #514b52; filter: progid:DXImageTransform.Microsoft.gradient(enabled = false);');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-btn-inverse:not(.active):hover', 'background-color: #554e56; background-image: -moz-linear-gradient(top, #59525a, #4e494f); background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#59525a), to(#4e494f)); background-image: -webkit-linear-gradient(top, #59525a, #4e494f); background-image: -o-linear-gradient(top, #59525a, #4e494f); background-image: linear-gradient(to bottom, #59525a, #4e494f); background-repeat: repeat-x; filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#ff59525a\', endColorstr=\'#ff4e494f\', GradientType=0);');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-btn-inverse:hover, .sincemonday-btn-inverse:active, .sincemonday-btn-inverse.active, .sincemonday-btn-inverse.disabled, .sincemonday-btn-inverse[disabled]', 'color: #ffffff; background-color: #4e494f; *background-color: #443f45; -webkit-box-shadow: 0 1px 0px #dedede; -moz-box-shadow: 0 1px 0px #dedede; box-shadow: 0 1px 0px #dedede; border-color: #2a262a;');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-btn-inverse:active, .sincemonday-btn-inverse.active', 'background-color: #373337 \9; -webkit-box-shadow: inset 0 1px 2px rgba(0, 0, 0, .2); -moz-box-shadow: inset 0 1px 2px rgba(0, 0, 0, .2); box-shadow: inset 0 1px 2px rgba(0, 0, 0, .2);');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-btn-danger', 'color: #ffffff; text-shadow: 0 1px 0 #ad3727; background-color: #d84a38; background-image: -moz-linear-gradient(top, #dd4b39, #d14836); background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#dd4b39), to(#d14836)); background-image: -webkit-linear-gradient(top, #dd4b39, #d14836); background-image: -o-linear-gradient(top, #dd4b39, #d14836); background-image: linear-gradient(to bottom, #dd4b39, #d14836); background-repeat: repeat-x; filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#ffdd4b39\', endColorstr=\'#ffd14836\', GradientType=0); border-color: #c13e2c; *background-color: #d14836; filter: progid:DXImageTransform.Microsoft.gradient(enabled = false);');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-btn-danger:not(.active):hover', 'background-color: #d24d3c; background-image: -moz-linear-gradient(top, #d45342, #d04432); background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#d45342), to(#d04432)); background-image: -webkit-linear-gradient(top, #d45342, #d04432); background-image: -o-linear-gradient(top, #d45342, #d04432); background-image: linear-gradient(to bottom, #d45342, #d04432); background-repeat: repeat-x; filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#ffd45342\', endColorstr=\'#ffd04432\', GradientType=0);');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-btn-danger:hover, .sincemonday-btn-danger:active, .sincemonday-btn-danger.active, .sincemonday-btn-danger.disabled, .sincemonday-btn-danger[disabled]', 'color: #ffffff; background-color: #d04432; *background-color: #c13e2c; -webkit-box-shadow: 0 1px 0px #dedede; -moz-box-shadow: 0 1px 0px #dedede; box-shadow: 0 1px 0px #dedede; border-color: #983023;');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-btn-danger:active, .sincemonday-btn-danger.active', 'background-color: #ad3727 \9; -webkit-box-shadow: inset 0 1px 2px rgba(0, 0, 0, .2); -moz-box-shadow: inset 0 1px 2px rgba(0, 0, 0, .2); box-shadow: inset 0 1px 2px rgba(0, 0, 0, .2);');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-btn', 'display: inline-block; *display: inline; *zoom: 1; padding: 0px 8px; font-weight: bold; margin-bottom: 0; font-size: 11px; line-height: 22px; *line-height: 22px; text-align: center; vertical-align: middle; cursor: default; color: #333333; text-shadow: 0 1px 1px rgba(255, 255, 255, 0.75); background-color: #f3f3f3; background-image: -moz-linear-gradient(top, #f5f5f5, #f1f1f1); background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#f5f5f5), to(#f1f1f1)); background-image: -webkit-linear-gradient(top, #f5f5f5, #f1f1f1); background-image: -o-linear-gradient(top, #f5f5f5, #f1f1f1); background-image: linear-gradient(to bottom, #f5f5f5, #f1f1f1); background-repeat: repeat-x; filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#fff5f5f5\', endColorstr=\'#fff1f1f1\', GradientType=0); border-color: #e4e4e4; *background-color: #f1f1f1; filter: progid:DXImageTransform.Microsoft.gradient(enabled = false); border: 1px solid rgba(0, 0, 0, 0.1); *border: 0; border-bottom-color: rgba(0, 0, 0, 0.1); -webkit-border-radius: 2px; -moz-border-radius: 2px; border-radius: 2px; *margin-left: .3em; border-color: #c5c5c5; border-color: rgba(0, 0, 0, 0.15) rgba(0, 0, 0, 0.15) rgba(0, 0, 0, 0.25);');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-btn:not(.active):hover', 'background-color: #f5f5f5; background-image: -moz-linear-gradient(top, #f9f9f9, #eeeeee); background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#f9f9f9), to(#eeeeee)); background-image: -webkit-linear-gradient(top, #f9f9f9, #eeeeee); background-image: -o-linear-gradient(top, #f9f9f9, #eeeeee); background-image: linear-gradient(to bottom, #f9f9f9, #eeeeee); background-repeat: repeat-x; filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#fff9f9f9\', endColorstr=\'#ffeeeeee\', GradientType=0);');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-btn:hover, .sincemonday-btn:active, .sincemonday-btn.active, .sincemonday-btn.disabled, .sincemonday-btn[disabled]', 'color: #333333; background-color: #eeeeee; *background-color: #e4e4e4; -webkit-box-shadow: 0 1px 0px #dedede; -moz-box-shadow: 0 1px 0px #dedede; box-shadow: 0 1px 0px #dedede; border-color: #cbcbcb;');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-btn:active, .sincemonday-btn.active', 'background-color: #d8d8d8 \9; -webkit-box-shadow: inset 0 1px 2px rgba(0, 0, 0, .2); -moz-box-shadow: inset 0 1px 2px rgba(0, 0, 0, .2); box-shadow: inset 0 1px 2px rgba(0, 0, 0, .2);');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-btn:first-child', '*margin-left: 0;');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-btn:hover', 'color: #333333; text-decoration: none; background-color: #e6e6e6; *background-color: #d9d9d9; -webkit-transition: background-position 0.1s linear; -moz-transition: background-position 0.1s linear; -o-transition: background-position 0.1s linear; transition: background-position 0.1s linear;');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-btn:focus', 'outline: thin dotted #333; outline: 5px auto -webkit-focus-ring-color; outline-offset: -2px;');


// Timer CSS classes
SinceMondayTimerJquery.createCSSSelector('.sincemonday-timer', 'position: relative; max-width: 500px; color: #333333; font-family: Arial,sans-serif; font-size: 13px; line-height: 20px;');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-timer-good', '-moz-box-shadow: 0 0 10px rgba(45,159,12,0.7); -webkit-box-shadow: 0 0 10px rgba(45,159,12,0.7); box-shadow: 0 0 10px rgba(45,159,12,0.7);');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-timer-bad', '-moz-box-shadow: 0 0 10px rgba(246,62,12,0.7); -webkit-box-shadow: 0 0 10px rgba(246,62,12,0.7); box-shadow: 0 0 10px rgba(246,62,12,0.7);');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-timer-neutral', '-moz-box-shadow: 0 0 10px rgba(192,192,192,0.7); -webkit-box-shadow: 0 0 10px rgba(192,192,192,0.7); box-shadow: 0 0 10px rgba(192,192,192,0.7);');

SinceMondayTimerJquery.createCSSSelector('div.sincemonday-timer > div.sincemonday-icon-public', 'position: absolute; right: 5px; top: 4px;');

SinceMondayTimerJquery.createCSSSelector('div.sincemonday-timer > div.sincemonday-icon-good', 'position: absolute; right: 22px; top: 4px;');

SinceMondayTimerJquery.createCSSSelector('div.sincemonday-timer > div.sincemonday-icon-name', 'font-size: 80%; position: absolute; left: 5px; top: 4px;');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-loading', 'background-image: url("http://sincemonday.net/loading.gif"); background-repeat: no-repeat; background-position: center center;');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-a', 'color: #4d90fe; text-decoration: none;');

SinceMondayTimerJquery.createCSSSelector('.sincemonday-well', 'background-color: #F5F5F5; border: 1px solid #E3E3E3; border-radius: 2px; box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05) inset; margin-bottom: 20px; min-height: 20px; padding: 19px;');

SinceMondayTimerJquery.init = function() {
	elements = SinceMondayTimerJquery.getElementByClass('sincemonday-timer');
	elements.forEach(function(element) {
		timer_id = element.getAttribute('data-id');
		element_id = 'sincemonday-counter' + timer_id;
		element.setAttribute('id', element_id);
		SinceMondayTimerJquery.timerShow(timer_id, element_id, element);
	});
}

window.onload = SinceMondayTimerJquery.init;

