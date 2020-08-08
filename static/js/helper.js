var searchBlurActive = true;

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

var displaySearchResults = function(elements, elementId) {
    var element;
    var dropdownItemsHTML = generateDropdownItemsHTML(elements, elementId);
    switch(elementId) {
        case 'element-a-search':
            element = jQuery('#a-search-results');
            break;
        case 'element-b-search':
            element = jQuery('#b-search-results');
    }
    element.removeClass('d-none');
    element.html(dropdownItemsHTML);
}

var generateDropdownItemsHTML = function(elements, elementId) {
    var dropdownItemsHTML = '';
    Object.keys(elements).forEach(key => {
        dropdownItemsHTML += '<li class="dropdown-item" data-value="' + elements[key] + '" data-parent="' + elementId + '" onclick="handleSearchResultsClick(event)">' + key + '</li>';
    });
    return dropdownItemsHTML;
}

var hideSearchResults = function(elementId) {
    switch(elementId) {
        case 'element-a-search':
            jQuery('#a-search-results').addClass('d-none');
            break;
        case 'element-b-search':
            jQuery('#b-search-results').addClass('d-none');
    }
}

var handleSearchBlur = function(event) {
    if (searchBlurActive) {
        hideSearchResults(event.target.id);
    }
}

var handleSearchResultsMouseDown = function(event) {
    searchBlurActive = false;
}

var handleSearchResultsMouseUp = function(event) {
    searchBlurActive = true;
}