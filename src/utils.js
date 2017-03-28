const features = {
    issueSearch: true,
    subsystemFilter: true,
    fromLast: true,
    duration: true,
    timepicker: true
}

const keys = Array.from(Object.keys(features))

function loadOptions() {
    return new Promise(res => {
        chrome.storage.local.get(keys,
            vals => {
                console.log(vals)
                // Missing settings treated as true
                keys.forEach(f => {
                    if (!vals.hasOwnProperty(f))
                        vals[f] = true
                })
                res(vals)
            })
    })
}

