/***
 *     __ _                   
 *    / _\ |__   _____      __
 *    \ \| '_ \ / _ \ \ /\ / /
 *    _\ \ | | | (_) \ V  V / 
 *    \__/_| |_|\___/ \_/\_/  
 *                            
 */
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
		  items+='<div class="icon-name"><a href="/u/'+data.owner_name+'">'+data.owner_name+'</a></div>';
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

/***
 *       __ _     _   
 *      / /(_)___| |_ 
 *     / / | / __| __|
 *    / /__| \__ \ |_ 
 *    \____/_|___/\__|
 *                    
 */
function timerList(id,element_id) {
	$(element_id).addClass("loading");
	$.ajax({
	  url: '/u/'+id+'/list',
	  dataType: 'json',
	  type: 'GET',
	  success: function (data) {
	    $(element_id).removeClass("loading");
		if (data.length === 0) {
	      $(element_id).append('<center><p>У пользователя нет публичных таймеров.</p></center>');
	    }
	    data.forEach(function (val) {
	      timerListAppend(val,element_id);
	    });
	  }
	});
}

function timerListAppend(val,element_id) {
	var number_attr = $(element_id).attr('number') || '0';
	var number = parseInt(number_attr.replace(/[^0-9-]/,""),10) || 0;
	var currentRow = Math.floor(number / 3);
	var currentRowId = element_id.replace('#','')+'row'+currentRow;
	if (number%3 == 0) {
	  $(element_id).append('<div class="row-fluid" id="'+currentRowId+'"></div>');
	}
	$('#'+currentRowId).append('<div class="span4 well timer" id="counter'+val+'"></div>');
	timerShow(val,'#counter'+val);
	$(element_id).attr('number',number + 1);
}

function timerListFriends(id,element_id) {
	$(element_id).addClass("loading");
	$.ajax({
	  url: '/f/'+id+'/list',
	  dataType: 'json',
	  type: 'GET',
	  success: function (data) {
	    $(element_id).removeClass("loading");
		if (data.length === 0) {
	    } else {
	      $(element_id).append('<hr><div class="row-fluid"><div class="span12"><p class="lead">Таймеры друзей</p></div></div>');
	    }
	    data.forEach(function (val) {
		timerListAppend(val,element_id);
	    });
	  }
	});
}

/***
 *       __                               
 *      /__\ ___ _ __ ___   _____   _____ 
 *     / \/// _ \ '_ ` _ \ / _ \ \ / / _ \
 *    / _  \  __/ | | | | | (_) \ V /  __/
 *    \/ \_/\___|_| |_| |_|\___/ \_/ \___|
 *                                        
 */
function timerRemove(id,element_id) {
	$(element_id).addClass("loading");
	$.ajax({
	  url: '/t/'+id+'/remove',
	  dataType: 'json',
	  type: 'GET',
	  success: function (data) {
	    $(element_id).remove();
	  }
	});
}

/***
 *       __           _             _   
 *      /__\ ___  ___| |_ __ _ _ __| |_ 
 *     / \/// _ \/ __| __/ _` | '__| __|
 *    / _  \  __/\__ \ || (_| | |  | |_ 
 *    \/ \_/\___||___/\__\__,_|_|   \__|
 *                                      
 */
function timerRestart(id,element_id,stop_timer) {
	//console.log(element_id+' stopping'+stop_timer);
	clearInterval(stop_timer);
	$(element_id).addClass("loading");
	$.ajax({
	  url: '/t/'+id+'/restart',
	  dataType: 'json',
	  type: 'GET',
	  success: function (data) {
	    $(element_id).removeClass("loading");
	    timerShow(id,element_id);
	  }
	});
}

/***
 *     __      _   
 *    / _\ ___| |_ 
 *    \ \ / _ \ __|
 *    _\ \  __/ |_ 
 *    \__/\___|\__|
 *                 
 */
function timerSet(id,element_id,stop_timer) {
	stop_timer = stop_timer || 0;
	if (stop_timer != 0) clearInterval(stop_timer);
	$(element_id).addClass("loading");
	$.ajax({
	  url: '/t/'+id+'/show',
	  dataType: 'json',
	  type: 'GET',
	  success: function (data) {
	    $(element_id).removeClass("loading");
	    timerShowForm(data,element_id);
	  }
	});

}  

function timerShowForm(data,element_id) {
	data.name = data.name || '';
	//data.good = data.good || 1;
	if (data.good != 0) {
	  data.good = 1;
	} else {
	  data.good = 0;
	}
	data.public = data.public || 0;
	var name_link = element_id.replace('#','')+'name';
	var len_link = element_id.replace('#','')+'len';
	var save_link = element_id.replace('#','')+'save';
	var cancel_link = element_id.replace('#','')+'cancel';
	var remove_link = element_id.replace('#','')+'remove';
	var good_link = element_id.replace('#','')+'good';
	var public_link = element_id.replace('#','')+'public';
	var public_eye_link = element_id.replace('#','')+'public_eye_link';
	var date_link = element_id.replace('#','')+'date_link';
	var date_date = element_id.replace('#','')+'date';
	var date_time = element_id.replace('#','')+'time';
	var items = '';
	items+='<form class=""><div class="input-append"><center>';
	items+='<input type="text" class="span10" placeholder="Название таймера" value="'+data.name+'" id="'+name_link+'">';
	items+='<span class="add-on" id="'+len_link+'">120</span>';
	items+='</center></div>';
	items+='<div class=""><center>';
	if (data.id == -1) {
	  items+='<span><a class="btn" href="#" id="'+date_link+'"><i class="icon-calendar"></i> Начать ранее</a></span>&nbsp;';
	}
	items+='<label class="checkbox inline" rel="popover" data-placement="bottom" data-title="Позитивный">';
	items+='<input type="checkbox" id="'+good_link+'" value="good"';
	if (data.good == 1) {
	  items+='checked="checked"';
	}
	//items+='> <span class="timer-good background-good"><i class="icon-thumbs-up"></i></span>/<span class="timer-bad background-bad"><i class="icon-thumbs-down"></i></span></label>';
	items+='> <span class="timer-good background-good"><i class="icon-thumbs-up"></i></span></label>';
	items+='&nbsp;<label class="checkbox inline" rel="popover" data-placement="bottom" data-title="Виден всем">';
	items+='<input type="checkbox" id="'+public_link+'" value="public"';
	if (data.public == 1) {
	  items+='checked="checked"';
	}
	//items+='> <i class="icon-eye-open"></i>/<i class="icon-eye-close"></i></label>';
	items+='> <i class="icon-eye-open"></i></label>';
	items+='</center></div>';
	items+='</form>';
	if (data.public == 1) {
	  items+='<div class="icon-public" id="'+public_eye_link+'"><i class="icon-eye-open"></i></div>';
	} else {
	  items+='<div class="icon-public" id="'+public_eye_link+'"><i class="icon-eye-close"></i></div>';
	}
	
	// Need button with onclick for save and timerShow
	items+='<div class=""><center>';
	items+='  <a class="btn btn-success" href="#" id="'+save_link+'"><i class="icon-white icon-ok"></i> Сохранить</a>';
	items+='  <a class="btn" href="#" id="'+cancel_link+'"><i class="icon-ban-circle"></i> Отмена</a>';
	if (data.id != -1) {
	  items+='  <a class="btn btn-danger pull-right" href="#" id="'+remove_link+'">&nbsp;<i class="icon-white icon-trash"></i>&nbsp;</a>';
	}
	items+='</center></div>';
	$('#'+element_id).html(items);
	// popovers
	$('#'+good_link).parent().popover({'content':'<span class="timer-good background-good"><i class="icon-thumbs-up timer-good"></i> — хорошие события и привычки.</span> Пример: «Не курю».<br /><span class="timer-bad background-bad"><i class="icon-thumbs-down timer-bad"></i> — плохие события или вредные привычки.</span> Пример: «Не видел родителей».'});
	$('#'+public_link).parent().popover({'content':'<i class="icon-eye-open"></i> — таймер виден всем посетителям страницы профиля.<br /><i class="icon-eye-close"></i> — таймер виден исключительно владельцу.'});
	// length
	var length = 120 - $('#'+name_link).val().length;
	$('#'+len_link).html(length);
	$('#'+name_link).keyup(function() {
	  var length = 120 - $('#'+name_link).val().length;
	  $('#'+len_link).html(length);
	});
	// good
	var good = $('#'+good_link).is(':checked');
	if (good == true) {
	  $('#'+element_id).removeClass("timer-good timer-bad timer-neutral").addClass("timer-good");
	} else {
	  $('#'+element_id).removeClass("timer-good timer-bad timer-neutral").addClass("timer-bad");
	}
	$('#'+good_link).change(function() {
	  var good = $('#'+good_link).is(':checked');
	  if (good == true) {
	    $('#'+element_id).removeClass("timer-good timer-bad timer-neutral").addClass("timer-good");
	  } else {
	    $('#'+element_id).removeClass("timer-good timer-bad timer-neutral").addClass("timer-bad");
	  }
	});
	// public
	var public = $('#'+public_link).is(':checked');
	if (public == true) {
	  $('#'+element_id).removeClass("timer-public timer-private").addClass("timer-public");
	  $('#'+public_eye_link).remove();
	  $('#'+element_id).append('<div class="icon-public" id="'+public_eye_link+'"><i class="icon-eye-open"></i></div>');
	} else {
	  $('#'+element_id).removeClass("timer-public timer-private").addClass("timer-private");
	  $('#'+public_eye_link).remove();
	  $('#'+element_id).append('<div class="icon-public" id="'+public_eye_link+'"><i class="icon-eye-close"></i></div>');
	}
	$('#'+public_link).change(function() {
	  var public = $('#'+public_link).is(':checked');
	  if (public == true) {
	    $('#'+element_id).removeClass("timer-public timer-private").addClass("timer-public");
	    $('#'+public_eye_link).remove();
	    $('#'+element_id).append('<div class="icon-public" id="'+public_eye_link+'"><i class="icon-eye-open"></i></div>');
	  } else {
	    $('#'+element_id).removeClass("timer-public timer-private").addClass("timer-private");
	    $('#'+public_eye_link).remove();
	    $('#'+element_id).append('<div class="icon-public" id="'+public_eye_link+'"><i class="icon-eye-close"></i></div>');
	  }
	});
	// cancel
	$('#'+cancel_link).click(function() {
	  timerShow(data.id,'#'+element_id);
	  return false;
	});
	// date
	$('#'+date_link).click(function() {
	  var now = new Date();
	  var now_string = now.getDate()+'.'+(now.getMonth()+1)+'.'+now.getFullYear();
	  $('#'+date_link).parent().html('<span class="input-prepend date" id="'+date_date+'" data-date-weekstart="1" data-date="'+now_string+'" data-date-format="dd.mm.yyyy"><span class="add-on"><i class="icon-th"></i></span><input class="span3" size="16" type="text" value="'+now_string+'" readonly=""></span><span class="input-append bootstrap-timepicker-component"><input type="text" class="timepicker-default input-mini" id="'+date_time+'" value="12:00"><span class="add-on"><i class="icon-time"></i></span></span>');
	  $('#'+date_date).datepicker();
	  $('#'+date_time).timepicker({showInputs: true, disableFocus: true, showMeridian: false, defaultTime: 'value'});
	  //$('#'+date_date).datepicker().on('changeDate', function(ev) {
	  //  console.log($('#'+date_date+' > :input').val());
	  //});
	  //$('#'+date_time).change(function(ev) {
	  //  console.log($('#'+date_time).val());
	  //});
	  return false;
	});
	//save
	$('#'+save_link).click(function() {
	  //console.log('save');
	  var formData = {};
	  formData['id'] = data.id;
	  formData['name'] = $('#'+name_link).val();
	  if ($('#'+date_date+' > :input').length > 0) { // If date is set
	    var last_update = $('#'+date_date+' > :input').val();
	    var last_update_time = $('#'+date_time).val();
	    last_update = last_update.replace(/(\d+)\.(\d+)\.(\d+)/, '$2/$1/$3');
	    last_update = new Date(last_update);
	    last_update_time = last_update_time.match(/(\d+)(?::(\d\d))?\s*(p?)/);    
	    last_update = Math.round(last_update.getTime() / 1000 + parseInt(last_update_time[1])*3600 + parseInt(last_update_time[2])*60);
	    //last_update = Math.round(last_update.getTime() / 1000 + last_update_time.getTime() / 1000);
	    console.log('last_update:'+last_update);
	    //console.log($('#'+date_date+' > :input').length);
	    formData['last_update'] = last_update;
	  } else {
	    formData['last_update'] = -1;
	  }
	  var public = $('#'+public_link).is(':checked');
	  if (public == true) {
	    formData['public'] = 1;
	  } else {
	    formData['public'] = 0;
	  }
	  var good = $('#'+good_link).is(':checked');
	  if (good == true) {
	    formData['good'] = 1;
	  } else {
	    formData['good'] = 0;
	  }
	  
	  // POST data
	  $(element_id).addClass("loading");
	  $.ajax({
	    url: '/t/'+data.id+'/set',
	    data: formData,
	    //data: formData,
	    dataType: 'json',
	    type: 'GET',
	    success: function (data) {
	      $(element_id).removeClass("loading");
	      //console.log('data sent, response:'+data.id);
	      $('#'+element_id).attr("id", 'counter'+data.id);
	      timerShow(data.id,'#counter'+data.id);
	      
	      // Adding new Add timer
	      if (formData['id'] == -1) {
		var container_id = $('#counter'+data.id).parent().parent().attr("id");
		//var number_attr = $('#'+container_id).attr('number') || '0';
		//var number = parseInt(number_attr.replace(/[^0-9-]/,""),10) || 0;
		//$('#'+container_id).attr('number',number + 1);
		timerListAppend("-1",'#'+container_id); // 
	      }
	    }
	  });

	  return false;
	});
	// remove
	if (data.id != -1) {
	  $('#'+remove_link).click(function() {
	    console.log('remove');
	    timerRemove(data.id,'#'+element_id);
	    return false; // NEED QUESTION WITH ALERT HERE
	  });
	}
}