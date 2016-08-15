var form = document.forms[0];
var lf = liveForm(form);
var result = document.getElementById('result');
var socket = io('http://localhost:1350');

//var io = require('socket.io-client'),
// socket = io.connect('localhost', {
//     port: 1340
// });

lf.onChange(function () {
//    result.textContent = JSON.stringify(lf);
    
    
    //Send the change to socket
    //socket.emit('chat message', JSON.stringify(lf));
    var llf = Object.assign({}, lf);
    console.log('#####send llf:', llf);
  socket.emit('chat message', lf);

});

lf.onKeyup(function () {
   //result.textContent = JSON.stringify(lf);

   // console.log('#####send lf:', lf);
 
//   var llf = Object.assign({}, lf);
//   console.log('#####send llf:', llf);
//   socket.emit('chat message', llf);


});

socket.on('connected', function(msg){
   console.log('connected: ', msg);
   result.textContent = JSON.stringify(msg);
   updateForm(msg);
     
});


socket.on('chat message', function(msg){
    result.textContent = JSON.stringify(lf);
    //msg = JSON.parse(msg);
    updateForm(msg);
});



// setTimeout(function(){
//     console.log("HERE! fn:",lf.firstName);
//     lf.firstName = "John";
// },1000);


function updateForm(msg){
         //var obj = {};
    //var items = form.querySelectorAll("input[name]");
    if(Object.keys(msg).length === 0 && msg.constructor === Object)
        return;
    
    
    var radioArray=[];
    var rName='';
    var updated = serializeForm(form);
    console.log('##### selrialized form value: ', updated);
    console.log('##### message received:', msg);
    for (var o in updated) {        
            if(o === 'radio'){
                //if we have radio button find all radio button array
                var r = msg['radio'];
                for(var i=0; i< r.length; i++){
                      if(r[i].name !== rName){
                        rName = r[i].name;
                        var rGroup = form[rName];
                        radioArray.push(rGroup);
                    }
                    //form[rName][i].checked = r[i].checked;
                }
                //We have received an object array from server with all elements update.
                //array r = is the all radio button array info
                //array radioArray is the array of radio button group name in the dom 
                //in my example, I have to sets of radio button "gender" and "vehicle", which is 
                //the name of the radio group. so radioArray in this case is array of 2 arrays.(2 dimentional array)

                //We go thru radioArray and grab the first array
                //we go thru that array and take first element from this array
                //we go thru array of r which we got from server and compare if the 
                //radio button name == are equal and if they have the save value
                //Then we update the form radio element checked property, with the one
                // we got from server.

                for(var i=0; i< radioArray.length; i++){
                    var arr = radioArray[i];
                    for(var j= 0; j < arr.length; j++){
                        for(var k=0; k< r.length; k++){
                            if(arr[j].name === r[k].name && arr[j].value === r[k].value){
                                form[arr[j].name][j].checked = r[k].checked; 
                            }
                        }
                    }
                }

            }else{
                if(form[o]){
                form[o].value = msg[o];               
            }
  
        }
    }
}


function Person() {}

function liveForm(form) {
    
    var obj = Object.create(Person, {__cbs: { value: [] } });
    Object.defineProperty(obj, "onChange", { value: function (cb) { obj.__cbs.push(cb); } });
    Object.defineProperty(obj, "onKeyup", { value: function (cb) { obj.__cbs.push(cb); } });
   
    form.addEventListener("keyup", update);
    form.addEventListener("click", update);
                          
    function update() {
        var updated = serializeForm(form);
        for (var o in updated) {
            Object.defineProperty(obj,o,{
                enumerable:true,
                configurable:true,
                get: function(o){ return updated[o]; }.bind(null,o),
                set: function(o,val){ console.log("hi",updated[o],val);
                    updated[o] = val;
                    form[o].value = val;
                    update();
                }.bind(null,o)
            });
        }
        obj.__cbs.forEach(function (cb) { cb(obj); });
    }
    //setTimeout(update,0);
    return obj;
}

function serializeForm(form) {
    var obj = {};
    var arr = [];
    var items = form.querySelectorAll("input[name]");
    for (var i = 0; i < items.length; i++) {
        // if( items[i].type === 'text'){
        //     obj[items[i].name] = items[i].value;
        // }
        if(items[i].type === 'radio' || items[i].type === 'checkbox'){           
            var o = {};
            o.name= items[i].name;;
            o.type= items[i].type;
            o.value = items[i].value;
            o.checked = items[i].checked;
            arr.push(o);
            obj[items[i].type] = arr;
            //obj[items[i].type] = items[i].checked;
            
            //obj[items[i].name] = items[i].name;//this will give an array of all radio with same name
            //obj[items[i].value] = items[i].value;//this will give an array of all radio with same name
            //obj[items[i].checked] = items[i].checked;//this will give an array of all radio with same name

        }else{
            obj[items[i].name] = items[i].value;
        
        }

    }
    return obj;
}