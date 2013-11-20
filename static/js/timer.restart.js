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
