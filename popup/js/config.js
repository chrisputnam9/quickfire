/**
 * Config data strucutre and defaults
 **/
APP.Config = {

    url: null,
    user_id: null,
    api_key: null,

    debounce: 500, // time before acting on live input (eg. search)

    // 1 Day (24*60*60*1000)
    cache_expire: 86400000,
    // cache_expire: 5000,
    
    verbose: false
}
