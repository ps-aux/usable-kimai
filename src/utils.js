function isSubsystemFilterOn() {
    return new Promise(res => {
        chrome.storage.sync.get('subsystem-filter',
            val => {
                res(val['subsystem-filter'])
            })
    })
}

