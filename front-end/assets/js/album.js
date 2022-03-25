// var url = 'https://xl98cj7ty8.execute-api.us-east-1.amazonaws.com/test-stage/upload/6998-assignment2-b2/';
var image_data = ""
var image_type = ""
var image_name = ""


$(function(){
  // get_image();
  $("#submit_btn").click(function(){
    upload_img()
  });
  $('form').bind("keypress", function(e) {
    if (e.keyCode == 13) {               
      e.preventDefault();
      return false;
    }
  });
  $('#recording').hide();
  $('#record_btn').click(function(){
    speechRecognition();
  })
  $('#search_btn').click(function(){
    search_img();
  })
});

// get picture and preview
function get_image(user_labels){
  console.log('enter get_file function');
  let image = $("input:file")[0].files[0];
  image_type = image.type;
  image_name = image.name;
  // url += image.name;

  // get picture and preview
  const reader = new FileReader();
  reader.addEventListener("load", function(){
    image_data = reader.result.split(',')[1];
    // console.log('1', image_data)
    $('#preview_photo').empty();
    $('#preview_photo').append(
              $('<img>').attr('src', reader.result)
                        .attr('alt', 'preview_picture')
                        .attr('id', 'preview_picture')
    );
  }, false);
  if(image){
    reader.readAsDataURL(image);
  }
}

// upload picture to api gateway
function upload_img(){
  let tags = [];
  $(".tag").each(function(){
    tags.push($(this).text())
  })
  if(image_data == ""){
    alert("Please choose a picture file")
  }
  else{
    console.log("type", image_type)
    var param = { 
      "Content-Type": image_type+';base64',
      "X-Api-Key": "1zARWwiM0waDfKg06CegN3mpriSGvYmJ6tYoFBZz",
      "x-amz-meta-customLabels": tags,
      "filename": image_name
    }
    console.log("param", param)
    // console.log(url)
    sdk.uploadPut(param, image_data)
      .then(function(result){
        console.log(result)
        if(result.status == 200){
          alert("upload successfully");
          $('#preview_photo').empty();
          // $('#img_file').empty();
          $('.hidden_input').remove();
          $('.tag').remove();
        }
        else{
          alert("failed" + result);
        }
      })
  }
}

// speech recognition
function speechRecognition(){
  var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
  recognition.lang = 'en-US';

  recognition.start();
  $('#recording').show();

  recognition.onresult = function(event) {
    var transcript = event.results[0][0].transcript;
    console.log('transcript result: ', transcript);
    console.log('Confidence: ' + event.results[0][0].confidence);
    $('#search_input').val(transcript);
  }

  $('#stop_btn').click(function(){
    recognition.stop();
    $('#recording').hide();
  })

  recognition.onerror = function(event) {
    alert('Could not process input. Please try again.')
    console.log(event);
  }
}

// Search for pictures
function search_img(){
  let search_word = $('#search_input').val().toLowerCase();
  if(search_word == ""){
    alert('Search word should not be empty!')
    return
  }
  $('#search_input').val("");
  var param = {
    "x-api-key": "1zARWwiM0waDfKg06CegN3mpriSGvYmJ6tYoFBZz",
    'q': search_word
    // "x-api-key":"bc2kD6kNp11BR1Ldi5NDZ6q3eHKkvMwZ9cy8t0wG"
  }
  sdk.searchGet(param, {})
    .then(function(result){
      console.log(result)
      if(result.data == "No such photos."){
        $('#album').empty();
        $('#album').append($('<div class="title"> Sorry, there are no results. <div/>'))
      }
      else{
        var photos_url = result.data
        console.log(photos_url);
        $('#album').empty();
        for(url of photos_url){
          $('#album').append($(`<div class="col-md-2 col-sm-4"> <img src=${url} class="album_img"/></div>`))
        }
      }
    })
}

// add tags -------- start
[].forEach.call(document.getElementsByClassName('tags-input'), function (el) {
  let hiddenInput = document.createElement('input'),
      mainInput = document.createElement('input'),
      tags = [];
  
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', el.getAttribute('data-name'));
  hiddenInput.setAttribute('class', 'hidden_input');

  mainInput.setAttribute('type', 'text');
  mainInput.classList.add('main-input');
  mainInput.addEventListener('input', function () {
      let enteredTags = mainInput.value.split(',');
      if (enteredTags.length > 1) {
          enteredTags.forEach(function (t) {
              let filteredTag = filterTag(t);
              if (filteredTag.length > 0)
                  addTag(filteredTag);
          });
          mainInput.value = '';
      }
  });

  mainInput.addEventListener('keydown', function (e) {
      let keyCode = e.which || e.keyCode;
      if (keyCode === 8 && mainInput.value.length === 0 && tags.length > 0) {
          removeTag(tags.length - 1);
      }
  });

  el.appendChild(mainInput);
  el.appendChild(hiddenInput);

  function addTag (text) {
      let tag = {
          text: text,
          element: document.createElement('span'),
      };

      tag.element.classList.add('tag');
      tag.element.textContent = tag.text;

      let closeBtn = document.createElement('span');
      closeBtn.classList.add('close');
      closeBtn.addEventListener('click', function () {
          removeTag(tags.indexOf(tag));
      });
      tag.element.appendChild(closeBtn);

      tags.push(tag);

      el.insertBefore(tag.element, mainInput);

      refreshTags();
  }

  function removeTag (index) {
      let tag = tags[index];
      tags.splice(index, 1);
      el.removeChild(tag.element);
      refreshTags();
  }

  function refreshTags () {
      let tagsList = [];
      tags.forEach(function (t) {
          tagsList.push(t.text);
      });
      hiddenInput.value = tagsList.join(',');
  }

  function filterTag (tag) {
      return tag.replace(/[^\w -]/g, '').trim().replace(/\W+/g, '-');
  }
});
// add tags -------- end