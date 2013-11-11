function timerShow(id,element_id) {
	$(element_id).addClass("loading");
	$.ajax({
	  url: '/t/'+id+'/show',
	  dataType: 'json',
	  type: 'GET',
	  success: function (data) {
	    //console.log('1show id:'+id+' element_id:'+element_id);
	    $(element_id).attr("id","counter"+data.id);
	    //console.log('2show id:'+id+' element_id:'+$(element_id).attr("id"));
	    element_id = '#'+$(element_id).attr("id");
	    //console.log('3show id:'+id+' element_id:'+element_id);
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
		  items+='<div class="icon-name"><a href="http://'+window.location.hostname+'/u/'+data.owner_name+'">'+data.owner_name+'</a></div>';
		}
		items+='<div class=""><center>';
		items+=data.name;
		items+='</center></div>';
		items+='<div class="" id="'+element_id_time+'"><center>';
		items+='</center></div>';
		items+='<div class=""><center>';
		if (data.can_edit == 1 || data.id == 0) {
		  items+='<a class="btn btn-danger" href="#" id="'+restart_link+'"><i class="icon-white icon-repeat"></i> Сброс</a>';
		}
		if (data.public == 1) {
		  //items+=' <a class="btn btn-primary" href="#" id=""><i class="icon-white icon-retweet"></i> Твитнуть</a>';
		  if (data.owner_name != null) {
		    var url='http://'+window.location.hostname+'/u/'+data.owner_name;
		  } else {
		    var url='http://'+window.location.hostname;
		  }
		  items+=' <a href="" class="twitter-share-button btn btn-inverse" target="_blank" id="'+twitter_link+'"><img src="https://twitter.com/favicons/favicon.ico"> Твитнуть</a>';
		}
		if (data.can_edit == 1) {
		  items+=' <a href="#" id="'+edit_link+'" class="btn">&nbsp;<i class="icon-pencil"></i>&nbsp;</a>';
		}
		items+='</center></div>';
		$(element_id).html(items);
		//if (data.id == 14) { debug = 1; }
		timerShowTime(data.last_restart,'#'+element_id_time,0,debug);
		timerTwitterButtonHref('#'+twitter_link,url,data.owner_name,data.name,data.last_restart);
		var stop_timer = setInterval(
		  function() {
		    timerShowTime(data.last_restart,'#'+element_id_time);
		    timerTwitterButtonHref('#'+twitter_link,url,data.owner_name,data.name,data.last_restart);
		  },1000
		); // was no ^var
		//console.log(element_id_time+' stop_timer'+stop_timer);
		if (data.can_edit == 1 || data.id == 0) {
		  $('#'+restart_link).click(function() {
		      timerRestart(data.id,'#'+element_id.replace('#',''),stop_timer);
		      return false;
		  });
		}
		if (data.can_edit == 1) {
		  $('#'+edit_link).click(function() {
		      timerSet(data.id,element_id.replace('#',''),stop_timer);
		      return false;
		  });
		}
	      } else {
		var items = '';
		items+='<div class=""><center>';
		items+='Доступ к таймеру запрещён';
		items+='</center></div>';
		$(element_id).html(items);
	      }
	    } else {
	      var items = '';
	      var edit_link = element_id.replace('#','')+'edit';
	      items+='<div class=""><p><center>';
	      items+='<h3>Создать таймер</h3>';
	      items+='</center></p></div>';
	      //items+='<div class="" id="">';
	      //items+='<center>';
	      //items+='<h1>0<small> c</small></h1>';
	      //items+='</center>';
	      //items+='</div>';
	      items+='<div class=""><center>';
	      if (data.id == -1) {
		items+=' <a class="btn btn-success btn-large" href="#" id="'+edit_link+'"><i class="icon-white icon-plus"></i> Добавить</a>';
	      }
	      items+='</center></div>';
	      items+='<div class=""><p><center>';
	      items+=' ';
	      items+='</center></p></div>';
	      $(element_id).html(items);
	      $(element_id).removeClass("timer-good timer-bad timer-neutral").addClass("timer-neutral");
	      if (data.id == -1) {
		$('#'+edit_link).click(function() {
		  timerSet(data.id,element_id.replace('#',''));
		  return false;
		});
	      }
	    }
	  }
	});
}

function timerShowTime(last_restart,element_id_time, nonformat, debug) {
	debug = debug || 0;
	nonformat = nonformat || 0;
	var time_string_was = $(element_id_time).html();
	var time = timerGetTime(last_restart,0,debug);
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

function timerGetTime(last_restart, format, debug) {
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

// timerTwitterButtonHref(element_id,url,data.owner_name,data.name,data.last_restart)
function timerTwitterButtonHref(element_id,url,owner_name,name,last_restart) {
	url = url || '';
	owner_name = owner_name || '';
	name = name || '';
	last_restart = last_restart || 0;
	var items='';
	var items_was = $(element_id).attr("href");
	var time = timerGetTime(last_restart);
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