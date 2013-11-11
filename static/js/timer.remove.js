 function timerRemove(id,element_id) {
	$(element_id).addClass("loading");
	$.ajax({
	  url: '/t/'+id+'/remove',
	  dataType: 'json',
	  type: 'POST',
	  success: function (data) {
	    //$(element_id).removeClass("loading");
	    //timerShow(-1,element_id); Show Add new form.
	    //var container_id = $('#'+element_id).parent().parent().attr("id");
	    $(element_id).remove();
	    //var number_attr = $(container_id).attr('number') || '0';
	    //var number = parseInt(number_attr.replace(/[^0-9-]/,""),10) || 0;
	    //$('#'+container_id).attr("number", number - 1);
	    
	  }
	});
}
