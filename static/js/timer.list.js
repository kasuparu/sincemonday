function timerList(id,element_id) {
	$.ajax({
	  url: '/u/'+id+'/list',
	  dataType: 'json',
	  type: 'GET',
	  success: function (data) {
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
	$.ajax({
	  url: '/f/'+id+'/list',
	  dataType: 'json',
	  type: 'GET',
	  success: function (data) {
	    if (data.length === 0) {
	      //$(element_id).append('<center><p>У пользователя нет публичных таймеров.</p></center>');
	    } else {
	      $(element_id).append('<hr><div class="row-fluid"><div class="span12"><p class="lead">Таймеры друзей</p></div></div>');
	    }
	    data.forEach(function (val) {
		timerListAppend(val,element_id);
	    });
	  }
	});
}