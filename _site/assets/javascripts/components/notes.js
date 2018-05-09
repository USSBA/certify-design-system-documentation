$(document).ready(function(){
  var note_heading = $('.note-popup__heading').text();
  $('#add_note, #compose-new-note').on('click', function(){
    $('.note-popup').addClass('visible');
    $('.note-popup__heading').text(note_heading);
    return false;
  });

  $('#note-popup-toggle').on('click', function(){
    $('.note-popup form').toggleClass('hidden');
    $('.note-popup__heading').text(note_heading);
    return false;
  });

  $('#note-popup-close').on('click', function(){
    $('.note-popup').removeClass('visible');
    $('.note-popup form').removeClass('hidden');
    $('.note-popup__heading').text(note_heading);
    return false;
  });

  $('.note-popup form button').on('click', function(){
    $('.note-popup form').toggleClass('hidden');
    $('.note-popup__heading').text('Note added!');
    return false;
  });
});
