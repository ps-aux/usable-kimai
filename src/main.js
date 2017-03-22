console.log('Usable Kimai extension starting')

const logDebug = false

startListeningForDialog()

setIssuesLoadedHandler(issueSelect => {
    // Remove old container
    if (_container)
        _container.remove()

    setupFilter(issueSelect)
    adjustDialog()
})

function adjustDialog() {
    const dialogContent = document.querySelector('#floater_content')
    dialogContent.style.height = '800px'

    const dialogHolder = document.querySelector('#floater')
    dialogHolder.style.top = '0px'

}

var _container = null
function setupFilter(issueSelect) {
    console.log(`Setting up issues filter.`
        + `Issue count ${issueSelect.childElementCount}`)

    const container = createContainer(issueSelect)
    _container = container

    augmentIssueSelect(issueSelect)

    const issuesEls = Array.from(issueSelect.querySelectorAll('option'))

    const filter = new Filter(issuesEls)

    Object.keys(filter.fields).forEach(f => {
        const el = createFilterField(f, filter)
        container.appendChild(el)
    })

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

function createFilterField(name, filter) {
    // Parent
    const holder = document.createElement('div')

    //Label
    const label = name.charAt(0).toUpperCase() + name.slice(1);  // Capitalize
    const labelEl = document.createElement('label')
    labelEl.appendChild(document.createTextNode(`${label}:`))

    const defaultValue = filter.fields[name].value
    const filterChanged = val => filter.fieldChanged({key: name, val})

    let el = null
    const allowedValues = filter.fields[name].allowedValues
    if (allowedValues) {
        el = createSelect(allowedValues,
            filterChanged,
            defaultValue)
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

    let val = null
    if (defaultValue && values.indexOf(defaultValue) > -1)
        val = defaultValue
    else
        val = values[0]

    select.value = val

    return select

}

function createInput(onChange, defaultValue) {
    const input = document.createElement('input')
    input.value = defaultValue

    input.addEventListener('input', e => {
        e.preventDefault() // Just in case ;)
        // TODO add input delay
        const val = input.value
        onChange(val.toLowerCase())
    })

    return input
}


function augmentIssueSelect(issueSelect) {
    issueSelect.setAttribute('size', '10')
}


class Filter {

    constructor(issuesEls) {
        this.issuesEls = issuesEls
        this.issuesData = parseIssues(issuesEls)

        const subsystems = retrieveSubsystems(this.issuesData)

        this.fields = {
            search: {},
            subsystem: {allowedValues: subsystems}
        }

        Object.keys(this.fields).forEach(f => {
            const field = this.fields[f]
            // Attempt to get from local storage
            let val = localStorage.getItem(`uk-filter-${f}`)
            if (!val || (field.allowedValues && field.allowedValues.indexOf(val) < 0))
                val = ''

            field.value = val

        })


        // Set the filter state according to the init vals
        this.filterIssues()
    }

    fieldChanged({key, val}) {
        // TODO change to immutable update
        this.fields[key].value = val
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
                .indexOf(this.fields.search.value) > -1

        if (!textMatches)
            return false

        const subsytem = this.fields.subsystem.value
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
        debug('Filtering', JSON.stringify(this.fields))
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
    if (logDebug)
        console.debug(...arguments)
}
