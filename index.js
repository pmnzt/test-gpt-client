let isRequesting = false;

const API_URL = "https://feline-pyrite-dawn.glitch.me/api/items";
const PAGE_URL = "https://feline-pyrite-dawn.glitch.me/v";


function init() {
  const shareButton = createBtn();

  function appendShareButton() {
    const buttonsWrapper = document.querySelector(
      "#__next main form > div div:nth-of-type(1)"
    );

    buttonsWrapper.appendChild(shareButton);
  }

  appendShareButton();

  const id = setInterval(() => {
    if (
      !document.querySelector("#share-button") ||
      document.querySelector("#share-button").style.display === "none"
    ) {
      appendShareButton();
    }
  }, 500);

  const textareaElement = document.querySelector("#__next main form textarea");

  const submitButton = textareaElement.nextElementSibling;

  shareButton.addEventListener("click", async () => {
    if (isRequesting) return;
    isRequesting = true;
    shareButton.textContent = "Sharing...";
    shareButton.style.cursor = "initial";

    const threadContainer = document.getElementsByClassName(
      "flex flex-col items-center text-sm dark:bg-gray-800"
    )[0];

    // show the model for chatgpt+ users
    let model;

    const chatGptPlusElement = document.querySelector(".gold-new-button");
    const isNotChatGptPlus =
      chatGptPlusElement && chatGptPlusElement.innerText.includes("Upgrade");

    if (!isNotChatGptPlus) {
      const modelElement = threadContainer.firstChild;
      model = modelElement.innerText;
    }

    const conversationData = {
      title: document.title,
      avatarUrl: getAvatarImage(),
      model,
      items: [],
    };

    for (const node of threadContainer.children) {
      const markdown = node.querySelector(".markdown");

      // tailwind class indicates human or gpt
      if ([...node.classList].includes("dark:bg-gray-800")) {
        const warning = node.querySelector(".text-orange-500");
        if (warning) {
          conversationData.items.push({
            from: "human",
            value: warning.innerText.split("\n")[0],
          });
        } else {
          const text = node.querySelector(".whitespace-pre-wrap");
          conversationData.items.push({
            from: "human",
            value: text.textContent,
          });
        }
        // if it's a GPT response, it might contain code blocks
      } else if (markdown) {
        conversationData.items.push({
          from: "gpt",
          value: markdown.outerHTML,
        });
      }
    }

     chrome.runtime.sendMessage({ action: 'get-user-cookie' }, async function(response) {
      const userCookie = response.cookieValue; 
      const userCookieJSON = JSON.parse(userCookie);      

       const res = await fetch(API_URL, {
      body: JSON.stringify(conversationData),
      headers: { "Content-Type": "application/json", "use": "refresh_token", "authorization": `token ${userCookieJSON.refreshToken}` },
      method: "POST",
    }).catch((err) => {
      isRequesting = false;
      alert(`Error saving conversation: ${err.message}`);
    });
    
    const { id } = await res.json();
    const url = PAGE_URL + "?id=" + id;

    window.open(url, "_blank");

    setTimeout(() => {
      shareButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
      <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
    </svg>Share`;
      shareButton.style.cursor = "pointer";
      isRequesting = false;
    }, 1000);


  });


    
  });
}

function showIfNotLoading(loadingElement, newElement) {
  const timerId = setInterval(() => {
    if (loadingElement.disabled) {
      isLoading = true;
      newElement.style.display = "none";
    } else {
      isLoading = false;
      newElement.style.display = "flex";
      clearInterval(timerId);
    }
  }, 100);
}


// function setCookie(name, value) {
//   const cookieValue = encodeURIComponent(value); // Encode the value to make sure special characters are properly encoded
//   const cookieName = name + '=' + cookieValue + '; path=/'; // Construct the cookie string with the name, value, and path

//   const cookieValueIndex = document.cookie.indexOf(name + '=');

//   if(cookieValueIndex >= 0) {
//     const cookieValueEndIndex = document.cookie.indexOf(';', cookieValueIndex);
//     const cookieValueStart = cookieValueIndex + name.length + 1;
//     const cookieValueEnd = cookieValueEndIndex >= 0 ? cookieValueEndIndex : document.cookie.length;
//     const cookieString = document.cookie.substring(0, cookieValueStart) + cookieValue + document.cookie.substring(cookieValueEnd);
//     document.cookie = cookieString; // Set the updated cookie string
//   } else {
//     document.cookie = cookieName; // Set the cookie with the new value
//   }
// }

function getAvatarImage() {
  // Create a canvas element
  try {
    const canvas = document.createElement("canvas");

    const image = document.querySelectorAll("img")[1];

    // Set the canvas size to 30x30 pixels
    canvas.width = 30;
    canvas.height = 30;

    // Draw the img onto the canvas
    canvas.getContext("2d").drawImage(image, 0, 0);

    // Convert the canvas to a base64 string as a JPEG image
    const base64 = canvas.toDataURL("image/jpeg");

    return base64;
  } catch (error) {
    console.log("Error generating avatar image.");
    return null;
  }
}

function createBtn() {
  const button = document.createElement("button");

  button.id = "share-button";

  button.classList.add("btn", "flex", "gap-2", "justify-center", "btn-neutral");

  button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
  <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
</svg>Share`;

  return button;
}

init();
