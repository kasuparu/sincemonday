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