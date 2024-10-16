fetch('/api/user')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error('Fetch error:', error));

export const  baseURL = 'https://node-api-app-dxecgpajapacc4gs.northeurope-01.azurewebsites.net'