'use strict';

const apiKey = '3b6fad00a2c74ff824beeac05b9f2b8f';
const searchURL = 'https://api.edamam.com/search';

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURI(key)}=${encodeURI(params[key])}`)
  return queryItems.join('&');
}

function displayResults(responseJson) {

  $('.results').removeClass('hidden')
  $('.list').empty()
  for (let i = 0; i < responseJson.hits.length; i++ ){
    console.log(responseJson.hits[i].recipe.label)
    $('.list').append(`
      <div class="recipe">
        <img class="photo" src="${responseJson.hits[i].recipe.image}">
        <h3>${responseJson.hits[i].recipe.label}</h3>
        <p>${responseJson.hits[i].recipe.source}</p>
        <a href="${responseJson.hits[i].recipe.url}" target="_blank">Link</a>
      </div>
    `)
  }
}

function getRecipes(query, optionCalories, healthOptions, dietOptions) {
  // Params for query
  const params = {
    q: query,
    'app_id': '336c7cc0',
    'app_key': apiKey,
    calories: optionCalories,
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

function watchForm() {
  $('form').submit(event => {
    event.preventDefault();

    // Form Options
    let healthChecks = []
    $(`#js-health :checkbox[name='health']:checked`).each(function () {
      healthChecks.push($(this).val());
    });
    let dietChecks = []
    $(`#js-diet :checkbox[name='diet']:checked`).each(function () {
      dietChecks.push($(this).val());
    });

    const searchTerm = $('#js-search-term').val();
    const optionCalories = $('#js-calories').val();
    const healthOptions = $.makeArray(healthChecks).join('&health=');
    const dietOptions = $.makeArray(dietChecks).join('&health=');
    console.log(healthOptions);
    getRecipes(searchTerm, optionCalories, healthOptions, dietOptions);
    displayResults();
  })
}

$(watchForm);