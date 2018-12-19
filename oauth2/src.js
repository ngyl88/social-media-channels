/** 
 * REF: https://developers.google.com/youtube/v3/guides/auth/client-side-web-apps
**/

const oauthSettings = {
    redirectURI: 'http://localhost:5500/oauth2test.html',
    // scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
};

const extractQueryString = async () => {
    console.log('--> Extract query string: ');
    if (window.location.hash) {  // url fragment starting from "#..."
        const fragment = window.location.hash.substring(1);
        const response = getInfoFromServerResponse(fragment);
        await validateAndExchangeOAuthToken(response['access_token']);
    // } else if (localStorage.getItem('oauth2-test-params')) {
    //     console.log(localStorage.getItem('oauth2-test-params'));
    //     displayOAuthResponseInfo(JSON.parse(localStorage.getItem('oauth2-test-params')));
    }
};

const trySampleRequest = () => {
    if (!window.location.hash) {
        initOAuthSignIn();
    }
};

// View Functions
const displayOAuthResponseInfo = token => {
    const section = document.createElement("table");
    
    const sectionTitle = document.createElement("th")
    sectionTitle.setAttribute('colspan', 2);
    sectionTitle.setAttribute('style', 'text-align:left');
    sectionTitle.innerText = 'OAuth Server Response';
    section.append(sectionTitle);
    
    Object.keys(token).forEach(key => {
        if (['aud', 'azp'].indexOf(key) !== -1) return;
        const row = document.createElement("tr");
        row.innerHTML = `<td><b>${key}: </b></td><td>${token[key]}</td>`;
        section.append(row);
    });
    document.body.append(section);
};

// Supporting Functions

// STEP 1: Redirect to Google's OAuth 2.0 server using OAUTH 2.0 ENDPOINTS, redirect back to the same page
const initOAuthSignIn = () => {
    // Google's OAuth 2.0 endpoint for requesting an access token
    var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

    // Create <form> element to submit parameters to OAuth 2.0 endpoint.
    var form = document.createElement('form');
    form.setAttribute('method', 'GET'); // Send as a GET request.
    form.setAttribute('action', oauth2Endpoint);

    // Parameters to pass to OAuth 2.0 endpoint.
    var params = {
        'client_id': GOOGLE_CLIENT_ID,
        'redirect_uri': oauthSettings.redirectURI,
        'response_type': 'token',
        'scope': oauthSettings.scope,
        'include_granted_scopes': 'true',
        'state': 'pass-through value'
    };

    // Add form parameters as hidden input values.
    for (var p in params) {
        var input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', p);
        input.setAttribute('value', params[p]);
        form.appendChild(input);
    }

    // Add form to page and submit it to open the OAuth 2.0 endpoint.
    document.body.appendChild(form);
    form.submit();
};

// STEP 2: Upon redirect, handle Google's OAuth 2.0 server response
const getInfoFromServerResponse = queryString => {
    let regex = /([^&=]+)=([^&]*)/g, m;
    const params = {};
    while (m = regex.exec(queryString)) {
        console.log(decodeURIComponent(m[1]), decodeURIComponent(m[2]));
        params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    return params;
};

// STEP 3: Validate User Token
const validateAndExchangeOAuthToken = async accessToken => {
    console.log('--> Exchange Token: ');
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`);
    const data = await response.json();
    displayOAuthResponseInfo(data);

    
    // Verify that the 'aud' property in the response matches YOUR_CLIENT_ID.
    // console.log('readyState = ' + response.readyState); // undefined, available for xhr
    if (response.status == 200 &&
        data['aud'] &&
        data['aud'] == GOOGLE_CLIENT_ID) {
      localStorage.setItem('oauth2-test-params', JSON.stringify(data) );
    }
}