'use strict';

// Formatting the query params for API
function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURI(key)}=${encodeURI(params[key])}`)
  return queryItems.join('&');
}

// Displaying results in the DOM
function displayResults(responseJson) {
  
  // Empty the results list
  $('.results').empty().append('<article class="list"></article>');
  
  // Show summary of query in DOM
  const summary =  $('#js-options :checked').map( function(){
    return $(this).val()
  }).get().join(' + ');
  const searchQuery = $('#js-search-term').val();
  $('.results').removeClass('hidden').prepend(
    `<h3 class="summary">${responseJson.hits.length} results for ${searchQuery} <span id="plus" class="hidden"> + </span>${summary}</h3>
  `);
  if (summary.length > 0) {
    $('#plus').removeClass('hidden');
  }

  // Populate list based on API
  $('.list').empty()
  for (let i = 0; i < responseJson.hits.length; i++ ){
    console.log(responseJson.hits[i].recipe.label)
    let uri = responseJson.hits[i].recipe.uri
    let identifier = uri.replace("http://www.edamam.com/ontologies/edamam.owl#recipe_", "")
    console.log(responseJson.hits[i].recipe.uri)
    $('.list').append(`
      <div class="recipe ${identifier}" >
        <div class="photo"><img src="${responseJson.hits[i].recipe.image}"></div>
        <div class="recipe-data">
          <h3>${responseJson.hits[i].recipe.label}</h3>
          <h4>From <a href="${responseJson.hits[i].recipe.url}" target="_blank">${responseJson.hits[i].recipe.source}</a></h4>
          <p><b>Servings:</b> ${responseJson.hits[i].recipe.yield}</p>
          <p><b>Labels:</b> ${responseJson.hits[i].recipe.healthLabels}</p>
        </div>
        <div class="buttons">
          <input id="save" class="btn secondary" type="button" value="Save PDF" onClick="postPDF('${responseJson.hits[i].recipe.url}')">
        </div>
      </div>
    `)};
}

// Get recipes from Recipe API
function getRecipes(query, calorieMin, calorieMax, healthOptions, dietOptions) {
  const apiKey = '3b6fad00a2c74ff824beeac05b9f2b8f';
  const searchURL = 'https://api.edamam.com/search';
  // Params for query
  const params = {
    q: query,
    'app_id': '336c7cc0',
    'app_key': apiKey,
    from: 0,
    to: 100,
    calories: calorieMin + '-' + calorieMax,
    health: healthOptions,
    diet: dietOptions
  };
  // Remove null params
  let key = params.key
  for (key in params){
    if (params[key]=="") delete params[key];
  }
  // Create URL
  const queryString = formatQueryParams(params)
  const url = searchURL + '?' + queryString
  // Fetch
  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
  console.log(url);
}

// Post PDF to PDF API
function postPDF(documentURL){
  const access_key = 'd5e7a05ccf3022c6f93594ecc789bf47'
  const postURL = 'https://api.pdflayer.com/api/convert';

  const params = {
    '?access_key': access_key,
    document_url: documentURL,
    'document_name': 'recipe',
    // 'test': 1,
    'no_images': 1,
    'no_hyperlinks': 1,
    'no_javascript': 1,
    'use_print_media': 1,
    'delay': 0
  }
  const queryString = formatQueryParams(params)
  const url = postURL + queryString
  fetch(url)
  .then(response => response.text())
  .then(result => 
    window.location.assign(url)
  )
  .catch(error => console.log('error', error));
  console.log(url)
}

// Function to watch form search + options, and pass arguments
function watchForm() {
  $('form').submit(event => {
    event.preventDefault();

    // Form Options
    let healthChecks = []
    $(`#js-options :checkbox[name='health']:checked`).each(function () {
      healthChecks.push($(this).val());
    });
    let dietChecks = []
    $(`#js-options :checkbox[name='diet']:checked`).each(function () {
      dietChecks.push($(this).val());
    });

    // Form Inputs
    const searchTerm = $('#js-search-term').val();
    const optionCalories = `$('#js-calorie-min').val();' + ' - ' + $('#js-calorie-max').val();`
    const calorieMin = $('#js-calorie-min').val();
    const calorieMax = $('#js-calorie-max').val();
    const healthOptions = $.makeArray(healthChecks).join('&health=');
    const dietOptions = $.makeArray(dietChecks).join('&diet=');
    
    getRecipes(searchTerm, calorieMin, calorieMax, healthOptions, dietOptions);
    displayResults();
  })
}

// Toggle to show/hide options in DOM
$(".show").click(function(){
  $("#extras").toggle(500);
  $(this).find('i').toggleClass('flip');
  $(this).find('span').text($(this).find('span').text() == 'Show options' ? 'Hide options' : 'Show options');
});

// Callback
$(watchForm);