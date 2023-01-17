import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import viverra.ViverraService as ViverraService

// Enabling the smart wait to wait the page fully loaded
WebUI.enableSmartWait()

// Define the collection by passing the collection ID
// def v = new ViverraService('copy the collection ID and paste here')
def v = new ViverraService('clcrdj8t8000iu7xxxxxxxxxx')

// Open your browser
// ...
// Open a page (ex: homepage)
// ...

// Do compare snapshot on viverra
// viverra.compareSnapshot(WebUI.takeScreenshot(), 'your page name')
v.compareSnapshot(WebUI.takeScreenshot(), 'homepage')

// Then open account page
// Same viverra line script with different page name for example
v.compareSnapshot(WebUI.takeScreenshot(), 'account')

// Do the rest