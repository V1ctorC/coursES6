const aGreatNumber = 10;
const aGreatObject = {
    withGreatKey: true
};

if (true){
    //aGreatNumber = 42;
    aGreatObject.withGreatKey = false;
}

setTimeout(() =>{
    console.log(aGreatNumber);
    console.log(aGreatObject);
}, 1000);

console.log('Waiting ...');