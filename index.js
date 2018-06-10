var urlParams = new URLSearchParams(window.location.search);
let userid = Math.random().toString(36).substr(7);
$('#fromuser').val(userid);
$('#callname').val(userid);
let queryParams = 'userid=' + userid;
const socket = io('http://192.168.43.209:3000/?' + queryParams, {
  path: '/test'
});
$(function() {
  resizeBox();
  $(window).on('resize', function() {
    resizeBox();
  });
  // let userid = urlParams.get('userid');
  $('form').submit(function() {
    if ($('#msgsend').val() !== '') {
      socket.emit('chat message', {
        msgsend: $('#msgsend').val(),
        touser: $('#touser').val(),
        fromuser: $('#fromuser').val()
      });
      $('#msgsend').val('');
    }
    return false;
  });
  $('#callname').blur(function() {
    if ($(this).val() !== '') {
      socket.emit('change name', {
        userid: userid,
        newname: $('#callname').val()
      });
    } else {
      $(this).focus();
    }
  });
  socket.on('chat message', function(data) {
    $('#messages').append($('<li class="list-group-item user-' + data.fromuser + '">').html('<i class="fas fa-comment text-info"> <span class="showname">' + data.callname + ' :</span></i> ' + data.msgsend));
    scrollMessage();
  });
  socket.on('chat message error', function(data) {
    $('#messages').append($('<li>').text('Not found user::' + data.touser));
    scrollMessage();
  });
  socket.on('user connect', function(data) {
    $.each(data, function(i, v) {
      if ($('#listusers').find('.user-' + i).length == 0) {
        $('#listusers').append($('<li class="list-group-item user-' + i + '">').html('<i class="fas fa-user"></i> <span class="showname">' + v.callname + '</span>'));
        if (i !== $('#fromuser').val()) {
          $('#touser').append($('<option value="' + i + '" class="user-' + i + '">' + v.callname + '</option>'));
        }
      }
    });
  });
  socket.on('update name', function(data) {
    $('#touser').find('[value="' + data.userid + '"]').text(data.newname);
    $('#listusers').find('.user-' + data.userid).find('.showname').text(data.newname);
    $('#messages').find('.user-' + data.userid).find('.showname').text(data.newname);
  });
  socket.on('user disconnect', function(data) {
    if (data.user !== userid) {
      $('#touser').find('.user-' + data.user).remove();
      $('#listusers').find('.user-' + data.user).remove();
    }
  });
});
function resizeBox() {
  let boxDoc = $(document).height();
  let boxSubmit = $('form').height();
  let boxContent = $('.box-content').height();
  $('.box-content').height(boxDoc - (boxSubmit * 1.5));
}
function scrollMessage() {
  $('#messages').parents('.box-content').animate({
     scrollTop: $('#messages li:last').position().top - $('#messages li:first').position().top
  }, 200);
}