console.log('Usable Kimai extension starting')

const filterFields = ['search', 'subsytem']

startListeningForDialog()

setDialogOpenedHandler(() => {
    const issueSelect = document.querySelector('#edit_issue_ID')
    setupFilter(issueSelect)
})

function setupFilter(issueSelect) {

    augmentIssueSelect(issueSelect)

    const filter = new Filter(filterFields, issueSelect)

    const container = createContainer(issueSelect)
    const searchInput = createFilterField('search', filter)

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

function createFilterField(name, filter) {
    // Parent
    const holder = document.createElement('div')

    //Label
    const label = name.charAt(0).toUpperCase() + name.slice(1);  // Capitalize
    const labelEl = document.createElement('label')
    labelEl.appendChild(document.createTextNode(`${label}:`))


    // Input field
    const input = document.createElement("input")
    const initVal = localStorage.getItem(name);
    if (initVal)
        input.value = initVal

    input.addEventListener('input', e => {
        e.preventDefault() // Just in case ;)
        const val = input.value
        filter.fieldChanged({key: name, val})
    })

    holder.appendChild(labelEl)
    holder.appendChild(input)

    return holder
}


function augmentIssueSelect(issueSelect) {
    issueSelect.setAttribute('size', '10')
}


class Filter {

    constructor(filterFields, issueSelect) {
        this.issueSelect = issueSelect
        const values = {}
        filterFields.forEach(f => values[f] = '')

        this.values = values
        this.issues = Array.from(this.issueSelect.querySelectorAll('option'))

    }

    fieldChanged({key, val}) {
        // TODO change to immutable update
        this.values[key] = val
        this.filterIssues()
    }

    /**
     * Calculates indexes (values) of visible issues
     */
    calculateVisibleIssues() {
        return this.issues
            .filter(i => this.filterPredicate(i))
            .map(i => i.value)
    }

    filterPredicate(issue) {
        const issueText = issue.text
        const text = this.values.search
        return issueText.toLowerCase().indexOf(text) > -1
    }

    /**
     * Sets the issues visibility
     */
    filterIssues() {
        const visible = this.calculateVisibleIssues()
        return this.issues.forEach(i => {
            // Reset
            i.style.display = 'block'

            // If not among visible
            if (visible.indexOf(i.value) < 0)
                i.style.display = 'none'
        })
    }
}

