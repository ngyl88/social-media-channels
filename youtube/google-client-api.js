// settings
const searchSettings = {
    maxResults: 10,
    videoEmbeddable: true
}

const embededVideoSize = {
    width: 640,
    height: 320,
    allowfullscreen: true
};

// functions

const start = () => {
    gapi.client.init({
        'apiKey': GOOGLE_API_KEY,
        'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
    }).then(function () {
        const request = buildRequest('#ClubHeal');
        executeRequestWithCallback(request, renderSearchResult);
    });
};

// Loads the JavaScript client library and invokes `start` afterwards.
const handleClientLoad = () => {
    gapi.load('client', start);
}

// To use OAuth 2.0 Bearer Token
// https://developers.google.com/youtube/v3/guides/auth/client-side-web-apps#redirecting
// https://developers.google.com/youtube/v3/docs/#calling-the-api
// ------------------------------------------------------------------------------
// const createFetchRequest = () => {
//     const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=%23Clubheal&key=${GOOGLE_API_KEY}`);
//     console.log(response);
// }

// ----------------------- Supporting functions ---------------------

const executeRequestWithCallback = (request, callback) => request.execute(callback);

const buildRequest = queryParam => {
    // See full sample for buildApiRequest() code, which is not 
    // specific to a particular API or API method.

    return buildApiRequest('GET',
        '/youtube/v3/search',
        {
            'maxResults': searchSettings.maxResults,
            'part': 'snippet',
            'q': queryParam,
            'type': 'video',
            'videoEmbeddable': searchSettings.videoEmbeddable,
        });
}


// ----------------------- Rendering functions ---------------------
const createDOMelementForSearchResultItem = resultItem => {
    let videoId = resultItem.id.videoId;
    let publishedBy = resultItem.snippet.channelTitle;
    let publishedTime = resultItem.snippet.publishedAt;
    let { description, title } = resultItem.snippet;

    let iframe = $('<iframe/>').attr('type', 'text/html');
    iframe.attr('width', embededVideoSize.width).attr('height', embededVideoSize.height);
    iframe.attr('allowfullscreen', embededVideoSize.allowfullscreen);
    iframe.attr('src', `https://www.youtube.com/embed/${videoId}`);

    let videoSection = $('<div/>').addClass("youtube-result").append($('<h3/>').text(title));
    videoSection.append($('<p/>').text("Published: " + publishedBy + " | " + publishedTime));
    videoSection.append($('<p/>').text(description));
    videoSection.append(iframe);

    return videoSection;
}

const renderSearchResult = response => {
    console.log(`processing ${response.items.length} results...`);
    response.items.forEach(item => $('div#search-results').append(createDOMelementForSearchResultItem(item)));
}

/***** START: BOILERPLATE CODE --> ES6 *****/

function createResource(properties) {
    var resource = {};
    var normalizedProps = properties;
    for (var p in properties) {
        var value = properties[p];
        if (p && p.substr(-2, 2) == '[]') {
            var adjustedName = p.replace('[]', '');
            if (value) {
                normalizedProps[adjustedName] = value.split(',');
            }
            delete normalizedProps[p];
        }
    }
    for (var p in normalizedProps) {
        // Leave properties that don't have values out of inserted resource.
        if (normalizedProps.hasOwnProperty(p) && normalizedProps[p]) {
            var propArray = p.split('.');
            var ref = resource;
            for (var pa = 0; pa < propArray.length; pa++) {
                var key = propArray[pa];
                if (pa == propArray.length - 1) {
                    ref[key] = normalizedProps[p];
                } else {
                    ref = ref[key] = ref[key] || {};
                }
            }
        };
    }
    return resource;
}

function removeEmptyParams(params) {
    for (var p in params) {
        if (!params[p] || params[p] == 'undefined') {
            delete params[p];
        }
    }
    return params;
}

const buildApiRequest = (requestMethod, path, params, properties) => {
    params = removeEmptyParams(params);
    let request;
    if (properties) {
        const resource = createResource(properties);
        request = gapi.client.request({
            'body': resource,
            'method': requestMethod,
            'path': path,
            'params': params
        });
    } else {
        request = gapi.client.request({
            'method': requestMethod,
            'path': path,
            'params': params
        });
    }
    return request;
}

/***** END: BOILERPLATE CODE --> ES6 *****/