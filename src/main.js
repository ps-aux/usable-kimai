console.log('Usable Kimai extension starting')
const logDebug = false

loadOptions()
    .then(go)

const $ = window.$

function go(options) {
    console.debug('Starting with options ', options)

    startListeningForDialog()


    setIssuesLoadedHandler(issueSelect => {

        if (options.timepicker) {
            const clockOpts = {donetext: 'Pick', autoclose: true, placement: 'top'}
            $('#edit_in_time').clockpicker(clockOpts)
            $('#edit_out_time').clockpicker(clockOpts)
        }

        // Remove old ui
        document.querySelectorAll('.uk-extension')
            .forEach(el => el.remove())

        const fields = {}

        adjustDialog(issueSelect, options)

        if (options.subsystemFilter)
            fields.subsystem = true

        if (options.issueSearch) {
            fields.search = true
        }

        setupFilter(issueSelect, fields)

        if (options.duration)
            enhanceDuration()
        if (options.fromLast)
            enhanceEndpoints()
    })


}

function adjustDialog(issueSelect, options) {

    const dialogContent = document.querySelector('#floater_content')
    if (options.issueSearch) {
        dialogContent.style.height = '800px'
        const dialogHolder = document.querySelector('#floater')
        dialogHolder.style.top = '0px'
    }
    else if (options.subsystemFilter)
        dialogContent.style.height = '600px'


    if (options.issueSearch)
        issueSelect.setAttribute('size', '10')
}

function setupFilter(issueSelect, fields) {
    console.debug(`Setting up issues filter. `
        + `Issue count is ${issueSelect.childElementCount}`)

    const container = createContainer(issueSelect)

    const issuesEls = Array.from(issueSelect.querySelectorAll('option'))

    const filter = new Filter(issuesEls, fields)

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
    container.className = 'uk-extension issue-filter'

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

class Filter {

    constructor(issuesEls, fields) {
        this.issuesEls = issuesEls
        this.issuesData = parseIssues(issuesEls)

        const subsystems = retrieveSubsystems(this.issuesData)

        this.fields = {}

        if (fields.search)
            this.fields.search = {}

        if (fields.subsystem)
            this.fields.subsystem = {allowedValues: subsystems}

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
        let res = true
        // Contains search text

        if (this.fields.search) {
            const textMatches = issue.text.toLowerCase()
                    .indexOf(this.fields.search.value) > -1
            res = res && textMatches
        }

        // Shortcut
        if (!res)
            return false

        if (this.fields.subsystem) {
            const subsytem = this.fields.subsystem.value
            const subsystemMatches = subsytem ?
                issue.subsystem === subsytem :
                true

            res = res && subsystemMatches
        }

        return res

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


function enhanceDuration() {
    const input = document.querySelector("#edit_duration")
    const parent = input.parentNode

    const addButton = duration => {

        function onClick() {
            changeTimeInputValue(input, duration)
        }

        const button = createButton(`+ ${duration} min`, onClick)
        parent.appendChild(button)
    }

    addButton(15)
    addButton(30)
    addButton(60)

    const button = createButton(`Clear`, () => {
        changeInputValue(input, '00:00:00')
    })

    parent.appendChild(button)
}

function parseTime(time) {
    const nums = time.split(':')
    const h = parseInt(nums[0], 10)
    const m = nums.length > 1 ? parseInt(nums[1], 10) : 0
    const s = nums.length > 2 ? parseInt(nums[2], 10) : 0

    return 60 * 60 * h + 60 * m + s
}

function timeToStr(time) {
    let left = time
    const s = left % 60
    left = (left - s) / 60

    const m = left % 60
    left = (left - m) / 60

    const h = left

    return `${padInt(h, 2)}:${padInt(m, 2)}:${padInt(s, 2)}`
}

function padInt(num, places) {
    return ("0" + num).slice(-places);
}


function createButton(label, onClick) {
    const button = document.createElement('button')
    button.appendChild(document.createTextNode(label))
    button.onclick = e => {
        e.preventDefault()
        onClick()
    }
    button.className = 'uk-extension'

    return button
}

function enhanceEndpoints() {
    const inputFrom = document.querySelector("#edit_in_time")
    const inputTo = document.querySelector("#edit_out_time")


    const setToLast = () => {
        const last = document.querySelector('#zeftable tr:first-child td[class^="to"]')
        const time = last.textContent.trim() + ':00'
        changeInputValue(inputFrom, time)
        changeInputValue(inputTo, time)

    }

    const startPlus = minutes => {
        changeTimeInputValue(inputFrom, minutes)
        changeTimeInputValue(inputTo, minutes)
    }

    const fromLast = createButton('From last', () => {
        setToLast()
    })
    const startPlus15 = createButton('Start +15', () => {
        startPlus(15)
    })
    const startPlus30 = createButton('Start +30', () => {
        startPlus(30)
    })

    const parent = inputFrom.parentNode
    parent.appendChild(fromLast)
    parent.appendChild(startPlus15)
    parent.appendChild(startPlus30)
}


function changeTimeInputValue(input, minutes) {
    let time = parseTime(input.value)
    time += minutes * 60

    changeInputValue(input, timeToStr(time))
}

function changeInputValue(input, val) {
    input.value = val
    input.dispatchEvent(new Event('change'))
}