var searchBlurActive = true;

var initInverseRequest = function() {
    clearPanel();
    jQuery('#inverse-spinner').removeClass('d-none');
}

var displayInverseResults = function(results, order) {
    var inverseHTML = '';
    if (order < 6) {
        inverseHTML = '<div id="echelon" class="pt-2">Macierz odwrotna:'
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

var createChart = function(intensities) {
    CanvasJS.addCultureInfo("pl", {
        savePNGText : "Pobierz PNG",
        saveJPGText : "Pobierz JPG",
        printText   : "Drukuj"
    });
    chart = new CanvasJS.Chart("chartContainer", {
        exportEnabled: true,
	    animationEnabled: true,    
        title:{
            text: "Natężenie linii dyfrakcyjnych w zależności od kąta 2θ"              
        },
        culture: "pl",
        axisX: {
            title: "Kąt dyfrakcji 2θ [deg]"
        },
        axisY: {
            title: "Intensywność promieniowania"
        },
        data: [{
            type: 'splineArea',
            dataPoints: []
        }]
    });
    updateChartData(intensities);
}

var clearChart = function() {
    updateChartData([]);
    jQuery('#diffraction-time').remove();
    jQuery('#y-scale-increase').prop("disabled", true);
    jQuery('#y-scale-decrease').prop("disabled", true);
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
    elements.forEach(element => {
        dropdownItemsHTML += '<li class="dropdown-item" data-dhkl="' + element.dhkl + '" data-element="' + element.id + '" data-parent="' + elementId + '" onclick="handleSearchResultsClick(event)">' + element.displayName + '</li>';
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

var showTooltip = function(event) {
    $('#' + event.currentTarget.id).popover('show');
}

var hideTooltip = function(event) {
    $('#' + event.currentTarget.id).popover('hide');
}

var createSlider = function() {
    slider = document.getElementById('2-theta-slider');

    noUiSlider.create(slider, {
        range: {
            'min': 0,
            'max': 180
        },
        start: [20, 90],
        tooltips: true,
        keyboardPageMultiplier: 100, // Default 5
        keyboardDefaultStep: 18000, // Default 10
        connect: true,
    });
}

var increaseYScale = function() {
    for (let i=0; i < chart.options.data[0].dataPoints.length; i++) {
        chart.options.data[0].dataPoints[i].y *= 10;
    }
    chart.render();
}

var decreaseYScale = function() {
    for (let i=0; i < chart.options.data[0].dataPoints.length; i++) {
        chart.options.data[0].dataPoints[i].y /= 10;
    }
    chart.render();
}

var createDataTable = function(data) {
    dataTable = $('#history').DataTable({
        data: data,
        columns: [
            { title: "Id" },
            { title: "Pierwiastek A" },
            { title: "Pierwiastek B" },
            { title: "n<sub>A</sub>" },
            { title: "m<sub>B</sub>" },
            { title: "N" },
            { title: "W<sub>A</sub>" },
            { title: "W<sub>B</sub>" },
            { title: "g<sub>A</sub>" },
            { title: "g<sub>B</sub>" },
            { title: "Zakres kąta 2θ" },
            { title: "Data" },
            { title: "" }
        ], 
        order: [[ 11, "desc" ]],
        language: {
            "emptyTable": "Nie znaleziono wyników",
            "infoEmpty":  "Brak wyników",
            "search"    : "Szukaj:",
            "paginate"  : {
                "first"    : "Pierwsza",
                "last"     : "Ostatnia",
                "next"     : "Następna",
                "previous" : "Poprzednia"
            },
        },
        scrollY:        '57vh',
        scrollX:        '100%',
        aoColumnDefs: [{ 
            bVisible: false, aTargets: [0]
        }, {
            orderable: false, aTargets: [12], 
        }]
    });
    setTimeout(() => dataTable.columns.adjust(), 150);
}

var addRowClickHandler = function() {
    $('#history tbody').on('click', 'tr', function (event) {
        var data = dataTable.row( this ).data();
        if (event.target.id == 'select') {
            selectCalcRow(data[0]);
        } else if (event.target.id == 'delete') {
            deleteCalcRow(data[0]);
        }
    });
}

var selectCalcRow = function(calcId) {
    jQuery.ajax({ url: '/calculations/' + calcId, type: 'patch' })
    .done((data) => {
        console.log('xd');
    })
    .fail((error) => {
        console.log(error);
    })
    .always(() => {
        jQuery('#diffraction-spinner').addClass('d-none');
    });
}

var deleteCalcRow = function() {

}

var addCloseModalHandler = function() {
    $('.history-modal').on('hidden.bs.modal', function (e) {
        $('#history').DataTable().destroy();
    })
}