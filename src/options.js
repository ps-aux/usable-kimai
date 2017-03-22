const subsystemCheckBox = document.querySelector('#subsystem-filter')

subsystemCheckBox.addEventListener('change',
    e => setSubsystemFilter(e.target.checked))

isSubsystemFilterOn()
    .then(on => subsystemCheckBox.checked = on)


function setSubsystemFilter(on) {
    console.log(on)
    chrome.storage.sync.set({'subsystem-filter': on}, (r) => {
        console.log('Settings saved', r)
    })
}


