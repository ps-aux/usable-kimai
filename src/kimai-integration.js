/**
 * Kimai integration layer
 */

let _issuesLoadedHandler = null

function setIssuesLoadedHandler(dialogOpened) {
    _issuesLoadedHandler = dialogOpened
}

function dialogOpened() {
    _dialogOpen = true
    console.debug('Dialog opened')
    setupIssuesLoading()

    document.querySelector('#add_edit_zef_pct_ID')
        .addEventListener('change', e => {
            setupIssuesLoading()
        })
}

function dialogClosed() {
    console.debug('Dialog closed')
    _dialogOpen = false
}

var _dialogOpen = false
function startListeningForDialog() {
    const dialog = document.querySelector('#floater')

    onStyleChanged(dialog, () => {
        const isVisible = dialog.style.display === 'block'

        if (_dialogOpen && !isVisible)
            dialogClosed()
        if (!_dialogOpen && isVisible)
            dialogOpened()

    })
}

function setupIssuesLoading() {
    const issueSelect = document.querySelector('#edit_issue_ID')
    if (issueSelect.length > 1) {
        console.debug('Issues already loaded')
        // Issues already loaded
        _issuesLoadedHandler(issueSelect)
    } else {
        console.debug('Waiting for issues to load')
        onChildrenAdded(issueSelect, () => {
            console.debug('Issues loaded')
            _issuesLoadedHandler(issueSelect)
        })
    }
}

function onChildrenAdded(element, cb) {
    const issuesObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes') {
                issuesObserver.disconnect()
                cb()
            }
        })
    })
    const config = {attributes: true, childList: true, characterData: true}
    issuesObserver.observe(element, config)
}

function onStyleChanged(element, cb) {
    new MutationObserver(cb)
        .observe(element, {attributes: true, attributeFilter: ['style']})
}