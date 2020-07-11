var initInverseRequest = function() {
    clearPanel();
    jQuery('#inverse-spinner').removeClass('d-none');
}

var displayInverseResults = function(results, order) {
    var inverseHTML = '';
    if (order < 6) {
        inverseHTML = '<div id="echelon" class="pt-4">Macierz odwrotna:'
        inverseHTML += '<table class="echelon-matrix mt-2">';
        for (let row of results.inverse) {
            inverseHTML += '<tr><td> </td>';
            for (column of row) {
                inverseHTML += ('<td>&nbsp;&nbsp;' + column + '&nbsp;&nbsp;</td>');
            }
            inverseHTML += '<td> </td></tr>';
        }
        inverseHTML += '</table>';
    }
    inverseHTML += '<div id="inverse-time" class="mt-3">' + (order < 6 ? '' : 'Otrzymano macierz odwrotną. ') + 'Czas obliczeń: ' + results.time + 's.</div>';
    jQuery('#inversion-container').append(inverseHTML);
}

var clearPanel = function() {
    jQuery('#echelon').remove();
    jQuery('#inverse-time').remove();
}

var clearChart = function() {
    updateChartData([]);
    jQuery('#diffraction-time').remove();
}