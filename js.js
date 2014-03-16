var socket = io.connect('v3.ruosen.io:2345');

socket.on('hello-s', function () {
	socket.emit('im-client-c');
});

socket.on('alert-s',function(data){
	alert(data);
});

var checkValue = function(){
	var valid = true;
	$('input').each(function(){
		if( $(this).val() == '' ){
			valid = false;
		}
	});
	return valid;
}

$(function(){
	var resLock = false;

	var $btn = $('#send');

	$btn.click(function(){
	var $this = $(this);
	if ( $this.hasClass('locked') )
		return;
	if ( checkValue() == false ){
		alert('空');
		return;
	}
	$this.addClass('locked');
	socket.emit('send-order-c',{
		id : $('#clientID').val(),
		order : $('#js').val()
	});
	socket.on('result-s',function(data){
		if( !resLock ){
			resLock = true;
			console.log('==res==============');
			console.log(data);
			var str = '';
			if( !data ){
				str = "";
			}else if( typeof data == "object"){
				str = "This is an Object, See Console for detail;"
			}else{
				str = data;
			}
			$('#recive').text(str);

			setTimeout(function(){
                resLock = false;
            },500);
		}
		$btn.removeClass('locked');
	});
	socket.on('error-s',function(err){
		if( !resLock ){
			resLock = true;
			console.error(err);
			setTimeout(function(){
                resLock = false;
            },500);
		}
		$btn.removeClass('locked');
	});
});
})