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

let _issuesLoadedHandler = null
function setIssuesLoadedHandler(dialogOpened) {
    _issuesLoadedHandler = dialogOpened
}


function dialogOpened() {
    console.log('Dialog opened')
    stopListeningForDialog()
    const closeButton = document.querySelector('#floater_handle .right .close')
    closeButton.addEventListener('click', dialogClosed)

    setupIssuesLoading()

    document.querySelector('#add_edit_zef_pct_ID')
        .addEventListener('change', e => {
            setupIssuesLoading()
        })
}

function setupIssuesLoading() {
    const issueSelect = document.querySelector('#edit_issue_ID')
    if (issueSelect.length > 1) {
        console.log('Issues already loaded')
        // Issues already loaded
        _issuesLoadedHandler(issueSelect)
    } else {
        console.log('Waiting for issues to load')
        // Issues not loaded. Wait for them to load.
        const issuesObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes') {
                    console.log('Issues loaded')
                    issuesObserver.disconnect()
                    _issuesLoadedHandler(issueSelect)
                }
            })
        })
        const config = {attributes: true, childList: true, characterData: true}
        issuesObserver.observe(issueSelect, config)
    }

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

