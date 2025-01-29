
// Define language-specific strings
const languageStrings = {
  italian: {
    uk_flag_title: "Passa all'Inglese",
    it_flag_title: "Italiano",
    de_flag_title: "Passa al Tedesco",
    headerText: "PECai - Il tuo assistente di posta elettronica",
    descriptionText: "PECai utilizza un'IA avanzata per riassumere rapidamente le e-mail. Risparmia tempo e aumenta la produttività!",
    longDescriptionText: "PECai utilizza un'IA migliorata per riassumere le e-mail con facilità. Basta cliccare sul pulsante e PECai genererà per te un riassunto conciso dell'e-mail, razionalizzando così il tuo flusso di lavoro e aumentando la tua efficienza",
    aText: "Vedi di più",
    oppositeAText: "Vedi di meno",
    buttonClick_text: "Riassumi l'email",
    buttonClick_title: "Riassumi in Italiano",
    buttonClick_title_summarized: "Email già riassunta in Italiano",
    summary_placeholder: "Clicca sul pulsante per riassumere...",
  },
  english: {
      uk_flag_title: "English",
      it_flag_title: "Switch to Italian",
      de_flag_title: "Switch to German",
      headerText: "PECai - Your Email Assistant",
      descriptionText: "PECai uses advanced AI to quickly summarize emails. Streamline your workflow and increase productivity!",
      longDescriptionText: "PECai uses enhanced AI to summarize emails with ease. Just click the button and PECai will generate a concise email summary for you, streamlining your workflow and increasing your efficiency",
      aText: "Show more",
      oppositeAText: "Show less",
      buttonClick_text: "Summarize email",
      buttonClick_title: "Summarize in English",
      buttonClick_title_summarized: "Email already summarized in English",
      summary_placeholder: "Click on the button to summarize...",
  },
  german: {
      uk_flag_title: "Zu Englisch wechseln",
      it_flag_title: "Zu Italien wechseln",
      de_flag_title: "Deutsch",
      headerText: "PECai - Ihr E-Mail-Assistent",
      descriptionText: "PECai verwendet fortschrittliche KI, um E-Mails schnell zusammenzufassen. Optimieren Sie Ihren Workflow und steigern Sie die Produktivität!",
      longDescriptionText: "PECai nutzt erweiterte KI, um E-Mails einfach zusammenzufassen. Klicken Sie einfach auf die Schaltfläche und PECai erstellt für Sie eine prägnante E-Mail-Zusammenfassung, die Ihren Arbeitsablauf optimiert und Ihre Effizienz steigert",
      aText: "Mehr anzeigen",
      oppositeAText: "weniger zeigen",
      buttonClick_text: "E-Mail zusammenfassen",
      buttonClick_title: "Zusammenfassung auf Deutsch",
      buttonClick_title_summarized: "E-Mail bereits auf Deutsch zusammengefasst",
      summary_placeholder: "Klicken Sie auf die Schaltfläche, um die E-Mail zusammenzufassen...",
  }
};

// Define current language
let currentLanguage = 'english'; // Default language
// Define summary language
let summaryLanguage = 'english';// Default language

// Function to show more & less info
function showMoreLess() {
  const descriptionText = document.getElementById('descriptionText');
  const aText = document.getElementById('atext');

  // Get the current language strings
  const langData = languageStrings[currentLanguage];

  if (aText.innerHTML == langData.aText) {
    aText.innerHTML = langData.oppositeAText; // Switching between "Show more" and "Show less"
    descriptionText.textContent = langData.longDescriptionText; // Show the long description
    descriptionText.classList.remove('collapsed');
    descriptionText.classList.add('expanded');
  } else {
    aText.innerHTML = langData.aText; // Revert to the original "Show more" text
    descriptionText.textContent = langData.descriptionText; // Show the short description
    descriptionText.classList.remove('expanded');
    descriptionText.classList.add('collapsed');
  }
}

//Function to set the language of the add-in
function setLanguage(lang) {

  currentLanguage = lang;

  const it_flag = document.getElementById('it_flag');
  const uk_flag = document.getElementById('uk_flag');
  const de_flag = document.getElementById('de_flag');
  const headerText = document.getElementById('headerText');
  const descriptionText = document.getElementById('descriptionText');
  const aText = document.getElementById('atext');
  const summaryElement = document.getElementById('summaryText');
  const buttonClick = document.getElementById('buttonClick');

  if (!languageStrings[lang]) return; // Exit if language not supported

  const langData = languageStrings[lang];

  it_flag.title = langData.it_flag_title;
  uk_flag.title = langData.uk_flag_title;
  de_flag.title = langData.de_flag_title;
  headerText.textContent = langData.headerText;
  descriptionText.textContent = langData.descriptionText;
  aText.innerHTML = langData.aText;
  // Change the summaryElement text only if it matches one of the summary_placeholders
  const isPlaceholderText = Object.values(languageStrings).some(langObj => langObj.summary_placeholder === summaryElement.innerText);

  if (isPlaceholderText) {
      summaryElement.innerText = langData.summary_placeholder;
      buttonClick.title = langData.buttonClick_title;
  }else{
    if(currentLanguage === summaryLanguage){
    buttonClick.title = langData.buttonClick_title_summarized;
    }else{
      buttonClick.title = langData.buttonClick_title;
    }
  }
  buttonClick.innerText = langData.buttonClick_text;
  
  buttonClick.disabled = (summaryLanguage === currentLanguage && summaryElement.innerText !== langData.summary_placeholder);

  // Text align (right-to-left for arabic)
  if (langData.rtl) {
      document.body.style.direction = 'rtl';
      aText.style.paddingLeft = '0';
      aText.style.paddingRight = '20px';
  } else {
      document.body.style.direction = 'ltr';
      aText.style.paddingRight = '0';
      aText.style.paddingLeft = '20px'; 
  }
}

//Main function: summarizing the email content
Office.onReady(info => {
  if (info.host === Office.HostType.Outlook) {
    // Office is ready
    console.log("PECai - Mail Summarizer is ready...")
  }
});

async function summarizeEmail() {

  const item = Office.context.mailbox.item;
  // const converstationId = item.conversationId;
  // console.log("Conversation ID: ", converstationId);

  // Define the button and its initial color
  const button = document.getElementById("buttonClick");
  const initialColor = button.style.backgroundColor;

  // Define the placeholder video
  // const placeholderMessage = document.getElementById("placeholdermsg");

  // Define the summary text element
  const summaryElement = document.getElementById('summaryText');

  // Define flags
  const flags = document.getElementById("flags");

  try {

    // Disable button and change its color
    button.disabled = true;
    button.style.backgroundColor = '#95d7ef';

    // Disable flags
    flags.classList.add('disabledFlags');

    // Focus on the summary element
    summaryElement.classList.add('focused');

    // Show the placehloder video
    // placeholderMessage.style.display = 'flex';
    // placeholderMessage.scrollIntoView({ behavior : 'smooth'});

    //Stock the summary language
    summaryLanguage = currentLanguage;

    // Ensure the UI updates before the next async operation
    await new Promise(resolve => setTimeout(resolve, 0));

    // Get the body of the email
    await new Promise(resolve => {
      item.body.getAsync("text", async function (result) {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          const emailContent = result.value;
          console.log("Email content: ", emailContent);
          // Call backend to get the summary
          const response = await fetch('http://127.0.0.1:8000/summarize', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email_content: emailContent, language: currentLanguage })
          });

          if(response.ok){
            // Successful response
            const data = await response.json();

            // Clear the summary text before displaying the new summary
            summaryElement.innerText = '';

            // Change the color of the text to black
            summaryElement.style.color = 'black';

            // Split the summary text into words (regular expression to match each sequence of non-whitespaced characters followed by a whitespaced one)
            const words = data.summary.match(/\S+|[^\S\r\n]+|[\r\n]/g);

            // Display each word with a delay
            for (let i = 0; i < words.length; i++) {
              await new Promise(resolve => setTimeout(resolve, 25)); // Adjust the delay time here
              summaryElement.innerText += words[i] + (i < words.length - 1 ? ' ' : '');
            }
          }else{
            const errorData = await response.json();
            summaryElement.style.color = 'red';
            summaryElement.innerText = 'PECai faced problems. Please try again later or check the console for more info.'
            console.error("Backend error: ", errorData.error)
          }
        }
        resolve();
      });
    });
    button.title = languageStrings[currentLanguage].buttonClick_title_summarized;
  } catch (error) {
    summaryElement.style.color = 'red';
    summaryElement.innerText = 'Sorry :(, an error occured. Check the console for more info.'
    console.error("Frontend error: \nAn error occurred! ", error);
  } finally {
    // Revert button color to the initial color
    button.style.backgroundColor = initialColor;

    // // Hide the placeholder video
    // placeholderMessage.style.display = 'none';

    // Unfocus on the summary element
    summaryElement.classList.remove('focused');

    // Unable flags
    flags.classList.remove('disabledFlags');
  }
}