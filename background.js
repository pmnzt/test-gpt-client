chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'get-user-cookie') {
    chrome.cookies.get({ url: 'https://feline-pyrite-dawn.glitch.me/', name: 'user' }, function(cookie) {
      if (cookie) {
        // The cookie was found
        sendResponse({ cookieValue: decodeURIComponent(cookie.value) });
      } else {
        // The cookie was not found
        sendResponse({});
      }
    });
    return true; // Required to use sendResponse asynchronously
  }
});