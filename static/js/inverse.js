var inverseGauss = function() {
    var order = jQuery('#order-input').val();
    sendInverseRequest('/matrix-inverse/gauss/', order);
}

var inverseNumPy = function() {
    var order = jQuery('#order-input').val();
    sendInverseRequest('/matrix-inverse/numpy/', order);
}

var sendInverseRequest = function(path, order) {
    initInverseRequest();
    jQuery.ajax({url: path + order, type: 'get'})
    .done((data) => {
        handleInverseResponse(data, order);
    })
    .fail((error) => {
        console.log(error);
    })
    .always(() => {
        jQuery('#inverse-spinner').addClass('d-none');
    });
};

var initInverseRequest = function() {
    clearPanel();
    jQuery('#inverse-spinner').removeClass('d-none');
}

var handleInverseResponse = function(results, order) {
    displayInverseResults(results, order);
}

var displayInverseResults = function(results, order) {
    var inverseHTML = '';
    if (order < 6) {
        inverseHTML = '<div id="echelon">Macierz odwrotna:'
        inverseHTML += '<table class="echelon-matrix mt-2 mb-4">';
        for (let row of results.inverse) {
            inverseHTML += '<tr><td> </td>';
            for (column of row) {
                inverseHTML += ('<td>&nbsp;&nbsp;' + column + '&nbsp;&nbsp;</td>');
            }
            inverseHTML += '<td> </td></tr>';
        }
        inverseHTML += '</table>';
    }
    inverseHTML += '<div id="inverse-time">' + (order < 6 ? '' : 'Otrzymano macierz odwrotną. ') + 'Czas obliczeń: ' + results.time + 's.</div>';
    jQuery('#inversion-container').append(inverseHTML);
}

var clearPanel = function() {
    jQuery('#echelon').remove();
    jQuery('#inverse-time').remove();
}