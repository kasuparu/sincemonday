var SinceMondayTimerJquery = function(opts) {
	this.url = 'sincemonday.net';
}

// TODO: Create classes
// TODO: Include bootstrap icons and styles

SinceMondayTimerJquery.timerShow = function(id,element_id) {
	$(element_id).addClass("loading");
	$.ajax({
	  url: '/t/'+id+'/show',
	  dataType: 'json',
	  type: 'GET',
	  success: function (data) {
	    $(element_id).removeClass("loading");
	    if (data.set == 1) {
	      data.denied = data.denied || 0;
	      if (data.denied == 0) {
		var debug = 0;
		var items = '';
		var element_id_time = element_id.replace('#','')+'time';
		var restart_link = element_id.replace('#','')+'restart';
		var edit_link = element_id.replace('#','')+'edit';
		var twitter_link = element_id.replace('#','')+'twitter';
		if (data.good == 1) {
		  $(element_id).removeClass("timer-good timer-bad timer-neutral").addClass("timer-good");
		  items+='<div class="icon-good"><i class="icon-thumbs-up"></i></div>';
		} else if (data.good == 0) {
		  $(element_id).removeClass("timer-good timer-bad timer-neutral").addClass("timer-bad");
		  items+='<div class="icon-good"><i class="icon-thumbs-down"></i></div>';
		} else {
		  $(element_id).removeClass("timer-good timer-bad timer-neutral").addClass("timer-neutral");
		  items+='<div class="icon-good"><i class="icon-adjust"></i></div>';
		}
		if (data.public == 1) {
		  $(element_id).removeClass("timer-public timer-private").addClass("timer-public");
		  items+='<div class="icon-public"><i class="icon-eye-open"></i></div>';
		} else if (data.public == 0) {
		  $(element_id).removeClass("timer-public timer-private").addClass("timer-private");
		  items+='<div class="icon-public"><i class="icon-eye-close"></i></div>';
		}
		if (data.owner_name) {
		  items+='<div class="icon-name"><a href="http://'+this.url+'/#!/u/'+data.owner_name+'">'+data.owner_name+'</a></div>';
		}
		items+='<div class=""><center>';
		items+=data.name;
		items+='</center></div>';
		items+='<div class="" id="'+element_id_time+'"><center>';
		items+='</center></div>';
		items+='<div class=""><center>';
		if (data.public == 1) {
		  if (data.owner_name != null) {
		    var url='http://'+this.url+'/#!/u/'+data.owner_name;
		  } else {
		    var url='http://'+this.url;
		  }
		  items+=' <a href="" class="twitter-share-button btn btn-inverse" target="_blank" id="'+twitter_link+'"><img src="https://twitter.com/favicons/favicon.ico"> Твитнуть</a>';
		}
		if (data.can_edit == 1) {
		  items+=' <a href="#" id="'+edit_link+'" class="btn">&nbsp;<i class="icon-pencil"></i>&nbsp;</a>';
		}
		items+='</center></div>';
		$(element_id).html(items);
		//if (data.id == 14) { debug = 1; }
		SinceMondayTimerJquery.timerShowTime(data.last_restart,'#'+element_id_time,0,debug);
		SinceMondayTimerJquery.timerTwitterButtonHref('#'+twitter_link,url,data.owner_name,data.name,data.last_restart);
		var stop_timer = setInterval(
		  function() {
		    SinceMondayTimerJquery.timerShowTime(data.last_restart,'#'+element_id_time);
		    SinceMondayTimerJquery.timerTwitterButtonHref('#'+twitter_link,url,data.owner_name,data.name,data.last_restart);
		  },1000
		);
	      } else {
		var items = '';
		items+='<div class=""><center>';
		items+='Доступ к таймеру запрещён';
		items+='</center></div>';
		$(element_id).html(items);
	      }
	  }
	});
}

SinceMondayTimerJquery.timerShowTime = function(last_restart,element_id_time, nonformat, debug) {
	debug = debug || 0;
	nonformat = nonformat || 0;
	var time_string_was = $(element_id_time).html();
	var time = SinceMondayTimerJquery.timerGetTime(last_restart,0,debug);
	var items = '';
	if (nonformat == 0) {
	  items+='<center>';
	  items+='<h1>'+time[0]+'<small> '+time[1]+' '+time[2]+' '+time[3]+'</small></h1>';
	  items+='</center>';
	} else {
	  items+=time[0]+' '+time[1]+' '+time[2]+' '+time[3];
	}
	if (time_string_was != items) {
	  $(element_id_time).html(items);
	}
}

SinceMondayTimerJquery.timerGetTime = function(last_restart, format, debug) {
	debug = debug || 0;
	format = format || 0;
	var date_1 = new Date();
	var date_2 = new Date(last_restart * 1000);
	var time = Array(4);
	//console.log('time_now: '+time_now[0]+' '+time_now[1]+' '+time_now[2]+' '+time_now[3]+' '+time_now[4]+' '+time_now[5]);
	//console.log('time_restart: '+time_restart[0]+' '+time_restart[1]+' '+time_restart[2]+' '+time_restart[3]+' '+time_restart[4]+' '+time_restart[5]);
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

SinceMondayTimerJquery.timerTwitterButtonHref = function(element_id,url,owner_name,name,last_restart) {
	url = url || '';
	owner_name = owner_name || '';
	name = name || '';
	last_restart = last_restart || 0;
	var items='';
	var items_was = $(element_id).attr("href");
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
	  $(element_id).attr("href",items);
	}
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

SinceMondayTimerJquery.createCSSSelector('.sincemonday-well', 'background-color: #F5F5F5; border: 1px solid #E3E3E3; border-radius: 2px; box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05) inset; margin-bottom: 20px; min-height: 20px; padding: 19px;');