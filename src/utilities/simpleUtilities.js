


// https://gist.github.com/RonKbS/de2fc33bcbb591aef1024b92b9610de4
export const localGroupBy = function(data, key) { 
return data.reduce(function(storage, item) {
    let group = item[key];
    storage[group] = storage[group] || [];
    storage[group].push(item);
    return storage;
}, {});
};
