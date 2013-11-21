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
