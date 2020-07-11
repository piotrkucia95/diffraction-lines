var inverseGauss = function() {
    sendInverseRequest('/matrix-inverse/gauss/');
}

var inverseNumPy = function() {
    sendInverseRequest('/matrix-inverse/numpy/');
}

var sendInverseRequest = function(path) {
    clearPanel();
    jQuery('#inverse-spinner').removeClass('d-none');
    var order = jQuery('#order-input').val();
    path += order;
    jQuery.ajax({
        url: path,
        type: 'get'
    })
    .done((data) => {
        console.log(data);
        if (+order <= 5) {
             displayInversionResults(data.inverse);
        }
        jQuery('#inversion-container').append('<div id="time" class="mt-3">' + (+order <= 5 ? '' : 'Otrzymano macierz odwrotną. ') + 'Czas obliczeń: ' + ((data.time).toFixed(2)) + ' ms.</div>');
    })
    .fail((error) => {
        console.log(error);
    })
    .always(() => {
        jQuery('#inverse-spinner').addClass('d-none');
    });
};

var displayInversionResults = function(results) {
    var echelonHTML = '<div id="echelon" class="pt-4">Macierz odwrotna:'
    echelonHTML += '<table class="echelon-matrix mt-2">';
    for (let row of results) {
        echelonHTML += '<tr><td> </td>';
        for (column of row) {
            echelonHTML += ('<td>&nbsp;&nbsp;' + column + '&nbsp;&nbsp;</td>');
        }
        echelonHTML += '<td> </td></tr>';
    }
    echelonHTML += '</table>';
    jQuery('#inversion-container').append(echelonHTML);
}

var clearPanel = function() {
    jQuery('#matrix-elements').remove();
    jQuery('#equations').remove();
    jQuery('#echelon').remove();
    jQuery('#time').remove();
    jQuery('#results').remove();
}

window.onload = function () {
    var chart = new CanvasJS.Chart("chartContainer", {            
      title:{
        text: "Natężenie linii dyfrakcyjnych w zależności od kąta θ"              
      },

      data: [  //array of dataSeries     
      { //dataSeries - first quarter
   /*** Change type "column" to "bar", "area", "line" or "pie"***/        
       type: "column",
       name: "First Quarter",
       dataPoints: [
       { label: "banana", y: 58 },
       { label: "orange", y: 69 },
       { label: "apple", y: 80 },                                    
       { label: "mango", y: 74 },
       { label: "grape", y: 64 }
       ]
     },
     { //dataSeries - second quarter

      type: "column",
      name: "Second Quarter",                
      dataPoints: [
      { label: "banana", y: 63 },
      { label: "orange", y: 73 },
      { label: "apple", y: 88 },                                    
      { label: "mango", y: 77 },
      { label: "grape", y: 60 }
      ]
    }
    ]
  });

    chart.render();
  }