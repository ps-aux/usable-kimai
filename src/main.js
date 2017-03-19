console.log('Usable Kimai extension starting')

const filterFields = ['search', 'subsystem']

startListeningForDialog()

setDialogOpenedHandler(issueSelect => {
    setupFilter(issueSelect)
})

function setupFilter(issueSelect) {
    console.log(`Setting up issues filter.`
        + `Issue count ${issueSelect.childElementCount}`)

    augmentIssueSelect(issueSelect)

    const issues = Array.from(issueSelect.querySelectorAll('option'))
    const filter = new Filter(filterFields, issues)

    const container = createContainer(issueSelect)
    const searchField = createFilterField('search', filter)
    const subsystemField = createFilterField('subsystem', filter)

    container.appendChild(searchField)
    // container.appendChild(subsystemField)

    // To prevent original style from being broken
    container.appendChild(document.createElement('br'))
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
    input.value = filter.values[name]

    input.addEventListener('input', e => {
        e.preventDefault() // Just in case ;)
        // TODO add input delay

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

    constructor(filterFields, issuesEls) {
        const values = {}
        filterFields.forEach(name => {
            // Attempt to get from local storage
            let val = localStorage.getItem(`uk-filter-${name}`)
            if (!val)
                val = ''
            values[name] = val
        })

        this.values = values
        this.issuesEls = issuesEls
        this.issuesData = issuesEls.map(el => {
            return {text: el.text, value: el.value}
        })

        // Set the filter state according to the init vals
        this.filterIssues()
    }

    fieldChanged({key, val}) {
        // TODO change to immutable update
        this.values[key] = val
        this.filterIssues()
        localStorage.setItem(`uk-filter-${key}`, val)
    }

    /**
     * Calculates indexes (values) of visible issues
     */
    calculateVisibleIssues() {
        return this.issuesData
            .filter(i => this.filterPredicate(i))
            .map(i => i.value)
    }

    filterPredicate(issue) {
        const text = this.values.search
        return issue.text.toLowerCase().indexOf(text) > -1
    }

    /**
     * Always read from DOM as at the beginning
     * not all issues might be loaded in select element
     */

    /**
     * Sets the issues visibility
     */
    filterIssues() {
        debug('Filtering', this.values)
        const visible = this.calculateVisibleIssues()
        console.log(visible.length)
        return this.issuesEls.forEach(i => {
            // Reset
            i.style.display = 'block'

            // If not among visible
            if (visible.indexOf(i.value) < 0) {
                i.style.display = 'none'
            }
        })
    }
}

function debug() {
    console.debug(...arguments)
}
