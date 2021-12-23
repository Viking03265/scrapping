const vo = require('vo');
const fs = require('fs');

let _glob_instance;
// let _glob_data = [];
const goto = url => _glob_instance.goto(url).wait(5000)
const evaluate = () => {   
    let options = {};
    document.querySelectorAll('tr.productpart_options').forEach(element => {
        let sub_id = element.id;
        let sub_opts = Array.from(element.querySelectorAll('div.option')).map(e => {
            let option = e.querySelector('p.np-option').innerText;
            // let tooltip_title = e.querySelector('div.tooltip-text-title').innerText;
            // let tooltip_desc = e.querySelector('div.tooltip-text-description').innerText;
            return {option/*, tooltip_title, tooltip_desc*/};
        })
        
        options[sub_id] = sub_opts;
    }) 
    return options;  
}

const grabOptions = function * (url) {
  
    yield goto(url);       

    const options = yield _glob_instance.evaluate(evaluate);
    console.log (options);
        
    // write new data back to the file
    fs.writeFileSync(`./data/options.json`, JSON.stringify(options, null, 4));    
    

    return _glob_instance.end().then(data => {
        console.log(data);
        return data; // a value needed
    }).catch(error => {
        console.error('Search failed:', error)
    });
};

const getNotepadOptions = (url, botInstance) => {
    _glob_instance = botInstance;
    return vo([grabOptions(url)]);  
}

module.exports = {
    getNotepadOptions
}