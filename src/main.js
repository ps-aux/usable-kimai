console.log('Usable Kimai extension starting')

startListeningForDialog()

setDialogOpenedHandler(() => {
    const issueSelect = document.querySelector('#edit_issue_ID')
    setupFilter(issueSelect)
})

function setupFilter(issueSelect) {

    augmentIssueSelect(issueSelect)

    const container = createContainer(issueSelect)
    const searchInput = createFilterField('search', search, issueSelect)

    container.appendChild(searchInput)
    // To prevent original style from being broken
    container.appendChild(document.createElement('br'))
}

function search(val, issueSelect) {
    localStorage.setItem("issue-search", val);
    const i = filterIssues(issueSelect, val.trim().toLowerCase())
    console.log(i)
}

function createContainer(issueSelect) {
    const holder = issueSelect.parentElement
    const container = document.createElement("div")
    container.className = 'issue-filter'

    // Add as first
    holder.insertBefore(container, holder.firstChild)

    return container
}

function createFilterField(name, onValChange, issueSelect) {
    // Parent
    const holder = document.createElement('div')

    //Label
    name = name.charAt(0).toUpperCase() + name.slice(1);  // Capitalize
    const labelEl = document.createElement('label')
    labelEl.appendChild(document.createTextNode(`${name}:`))

    // Input field
    const input = document.createElement("input")
    const initVal = localStorage.getItem(name);
    if (initVal)
        input.value = initVal

    input.addEventListener('input', e => {
        e.preventDefault() // Just in case ;)
        const val = input.value
        onValChange(val, issueSelect)
    })

    holder.appendChild(labelEl)
    holder.appendChild(input)

    return holder
}

function augmentIssueSelect(issueSelect) {
    issueSelect.setAttribute('size', '10')
}


function filterIssues(el, text) {
    const issues = Array.from(el.querySelectorAll('option'))
    return issues.forEach(i => {
        i.style.display = 'block'
        const issueText = i.text

        const containsText = issueText.toLowerCase().indexOf(text) > -1
        if (!containsText)
            i.style.display = 'none'
    })
}



