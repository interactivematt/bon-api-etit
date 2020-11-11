'use strict';



function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURI(key)}=${encodeURI(params[key])}`)
  return queryItems.join('&');
}

function displayResults(responseJson) {
  $('.results').empty().append('<article class="list"></article>');

  const summary =  $('#js-options :checked').map( function(){
    return $(this).val()
  }).get().join(' + ');
  const searchQuery = $('#js-search-term').val();
  
  console.log(summary.length);
  // Search query
  $('.results').removeClass('hidden').prepend(
    `<div class="summary">
        <h3>Results for ${searchQuery} <span id="extras" class="hidden"> + </span>${summary}</h3>
      </div>
    `
  )
  if (summary.length > 0) {
    $('#extras').removeClass('hidden');
  }
  $('.list').empty()
  for (let i = 0; i < responseJson.hits.length; i++ ){
    console.log(responseJson.hits[i].recipe.label)
    let uri = responseJson.hits[i].recipe.uri
    let identifier = uri.replace("http://www.edamam.com/ontologies/edamam.owl#recipe_", "")
    console.log(responseJson.hits[i].recipe.uri)
    $('.list').append(`
      <div class="recipe">
        <img class="photo" src="${responseJson.hits[i].recipe.image}">
        <h3>${responseJson.hits[i].recipe.label}</h3>
        <a href="${responseJson.hits[i].recipe.url}" target="_blank">${responseJson.hits[i].recipe.source}</a>
        <div class="recipe-data">
          <p>Servings: ${responseJson.hits[i].recipe.yield}</p>
          <p>Labels: ${responseJson.hits[i].recipe.healthLabels}</p>
        </div>
        <button onClick="postPDF('${responseJson.hits[i].recipe.url}')">Save as PDF</button>
        <div class="detail">
          <ul class="ingredients ${identifier}">
          </ul>
          <ol class="instructions ${identifier}">
          </ol>
        </div>
      </div>
    `)
    const ingredientLines = responseJson.hits[i].recipe.ingredientLines
    
    $.each(ingredientLines, function(index, value) {
      $(`ul.${identifier}`).append(`<li>${value}</li>`)
    });
  }
}

function getRecipes(query, optionCalories, healthOptions, dietOptions) {
  const apiKey = '3b6fad00a2c74ff824beeac05b9f2b8f';
  const searchURL = 'https://api.edamam.com/search';
  // Params for query
  const params = {
    q: query,
    'app_id': '336c7cc0',
    'app_key': apiKey,
    calories: '0-' + optionCalories,
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

function postPDF(documentURL){

  const access_key = 'd5e7a05ccf3022c6f93594ecc789bf47'
  const postURL = 'http://api.pdflayer.com/api/convert';

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
    const optionCalories = $('#js-calories').val();
    const healthOptions = $.makeArray(healthChecks).join('&health=');
    const dietOptions = $.makeArray(dietChecks).join('&diet=');
    
    getRecipes(searchTerm, optionCalories, healthOptions, dietOptions);
    displayResults();
  })
}

$(watchForm);