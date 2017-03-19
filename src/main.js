console.log('Usable Kimai extension starting')

const filterFields = ['search', 'subsystem']

startListeningForDialog()

setDialogOpenedHandler(issueSelect => {
    setupFilter(issueSelect)
    adjustDialog()
})

function adjustDialog() {
    const dialogContent = document.querySelector('#floater_content')
    dialogContent.style.height = '800px'

    const dialogHolder = document.querySelector('#floater')
    dialogHolder.style.top = '0px'

}

function setupFilter(issueSelect) {
    console.log(`Setting up issues filter.`
        + `Issue count ${issueSelect.childElementCount}`)

    augmentIssueSelect(issueSelect)

    const issuesEls = Array.from(issueSelect.querySelectorAll('option'))
    const issuesData = parseIssues(issuesEls)
    const subsystems = retrieveSubsystems(issuesData)

    const filter = new Filter(filterFields, issuesEls, issuesData)

    const container = createContainer(issueSelect)
    const searchField = createFilterField('search', filter)
    const subsystemField = createFilterField('subsystem', filter, subsystems)

    container.appendChild(searchField)
    container.appendChild(subsystemField)

    // To prevent original style from being broken
    container.appendChild(document.createElement('br'))
}

const subsystemPattern = /\[.*(?=\])/

function parseIssues(issuesEls) {
    return issuesEls.map(el => {
        const text = el.text
        let subsystem = (text.match(subsystemPattern) || {})[0]
        if (subsystem)
            subsystem = subsystem.slice(1)

        return {text, value: el.value, subsystem}
    })
}

function retrieveSubsystems(issues) {
    const vals = new Set()
    vals.add('all')
    issues.forEach(i => {
        if (i.subsystem)
            vals.add(i.subsystem)
    })

    return Array.from(vals)
}


function createContainer(issueSelect) {
    const holder = issueSelect.parentElement
    const container = document.createElement("div")
    container.className = 'issue-filter'

    // Add as first
    holder.insertBefore(container, holder.firstChild)

    return container
}

function createFilterField(name, filter, values) {
    // Parent
    const holder = document.createElement('div')

    //Label
    const label = name.charAt(0).toUpperCase() + name.slice(1);  // Capitalize
    const labelEl = document.createElement('label')
    labelEl.appendChild(document.createTextNode(`${label}:`))

    const defaultValue = filter.values[name]
    const filterChanged = val => filter.fieldChanged({key: name, val})

    let el = null
    if (values) {
        const val = defaultValue ? defaultValue : values[0]
        el = createSelect(values,
            filterChanged,
            val)
    } else {
        el = createInput(filterChanged,
            defaultValue)
    }

    holder.appendChild(labelEl)
    holder.appendChild(el)

    return holder
}

function createSelect(values, onChange, defaultValue) {
    const select = document.createElement('select')
    values.forEach(v => {
        const option = document.createElement('option')
        option.text = v
        option.value = v
        select.add(option)
    })

    select.addEventListener('change', e => {
        e.preventDefault()
        // Make all value empty string
        const val = select.value === 'all' ? '' : select.value
        onChange(val)
    })

    select.value = defaultValue

    return select

}

function createInput(onChange, defaultValue) {
    const input = document.createElement('input')
    input.value = defaultValue

    input.addEventListener('input', e => {
        e.preventDefault() // Just in case ;)
        // TODO add input delay
        const val = input.value
        onChange(val)
    })

    return input
}


function augmentIssueSelect(issueSelect) {
    issueSelect.setAttribute('size', '10')
}


class Filter {

    constructor(filterFields, issuesEls, issuesData) {
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
        this.issuesData = issuesData


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
        // Contains search text
        const textMatches = issue.text.toLowerCase()
                .indexOf(this.values.search) > -1

        if (!textMatches)
            return false

        const subsytem = this.values.subsystem
        const subsystemMatches = subsytem ?
            issue.subsystem === subsytem :
            true

        return subsystemMatches
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
