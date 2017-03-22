const options = document.querySelector('#options')

Object.keys(features)
    .forEach(f => createOptionUi(f))

function createOptionUi(option) {
    const label = document.createElement('label')
    label.appendChild(document.createTextNode(option))
    label.htmlFor = option

    const input = document.createElement('input')
    input.type = 'checkbox'
    input.value = option
    input.id = option
    input.addEventListener('change',
        e => {
            const el = e.target
            changeOption(el.value, el.checked)
        })

    const div = document.createElement('div')
    div.appendChild(label)
    div.appendChild(input)

    options.appendChild(div)
}

loadOptions()
    .then(options => {
        console.log(options)
        // Set the values to ui
        Object.keys(options)
            .forEach(o => {
                console.log(o)
                const el = document.querySelector(`#${o}`)
                el.checked = options[o]
            })

    })

function changeOption(name, on) {
    const o = {}
    o[name] = on
    chrome.storage.local.set(o, function () {
        console.debug(`Setting ${name}=${on} saved`)
    });
}


