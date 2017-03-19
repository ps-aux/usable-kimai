/**
 * Kimai integration layer
 */

var stopCheck = null

function checkModelOpened() {
    const el = document.querySelector('#floater')
    if (el.style.display === 'block') {
        dialogOpened()
    }
}

let _dialogOpenedHandler = null
function setDialogOpenedHandler(dialogOpened) {
    _dialogOpenedHandler = dialogOpened
}

function dialogOpened() {
    console.log('Dialog opened')
    stopListeningForDialog()
    const closeButton = document.querySelector('#floater_handle .right .close')
    closeButton.addEventListener('click', dialogClosed)

    _dialogOpenedHandler()

}

function dialogClosed() {
    console.log('Dialog closed')

    // Let some time for Kimai to update DOM
    setTimeout(startListeningForDialog, 2000)
}

function startListeningForDialog() {
    stopCheck = setInterval(checkModelOpened, 300)
}

function stopListeningForDialog() {
    clearInterval(stopCheck)
}

