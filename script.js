'use strict';

const apiKey = '3b6fad00a2c74ff824beeac05b9f2b8f';
const searchURL = 'https://api.edamam.com/search';

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function getRecipes(query) {
  const params = {
    q: query,
    'app_id': '336c7cc0',
    'app_key': apiKey
  };
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

function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    const searchTerm = $('#js-search-term').val();
    getRecipes(searchTerm);
    displayResults();
  })
}

$(watchForm);