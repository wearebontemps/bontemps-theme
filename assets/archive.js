for (i = 0; i < id_array.length; i++){
    CartJS.addItem(id_array[i], 1,null,{
        "complete": function() {
            console.log('complete!');
        },
        "success": function(data, textStatus, jqXHR){
            console.log('success')
        },
        async: true
    })
}   