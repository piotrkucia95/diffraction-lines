var chart;
var slider;
var dataTable;
var dA;
var dB;
var elementAId;
var elementBId;
var searchBlurActive = true;
var chartSubtitle = {
    fontFamily: 'sans-serif',
    fontSize: '24'            
};

var handleSearch = function(event) {
    if (event.target.value.length > 1) {
        jQuery.ajax({url: '/elements?searchTerm=' + encodeURIComponent(event.target.value.split(' ')[0]), type: 'get'})
        .done((data) => {
            displaySearchResults(data, event.target.id);
        })
        .fail((error) => {
            console.log(error);
        })
    } else {
        hideSearchResults(event.target.id);
    }
}

var handleSearchResultsClick = function(event) {
    jQuery('#' + event.currentTarget.dataset.parent).val(event.currentTarget.textContent);
    switch(event.currentTarget.dataset.parent) {
        case 'element-a-search':
            dA = event.currentTarget.dataset.dhkl;
            elementAId = event.currentTarget.dataset.element;
            break;
        case 'element-b-search':
            dB = event.currentTarget.dataset.dhkl;
            elementBId = event.currentTarget.dataset.element;
    }
    hideSearchResults(event.currentTarget.dataset.parent);
}

var selectCalcRow = function(calc) {
    clearChart();
    jQuery('#history-spinner').removeClass('d-none');
    jQuery.ajax({ url: '/calculations/' + calc[0], type: 'patch' })
    .done((data) => {
        dA = calc[1];
        dB = calc[2];
        elementAId = calc[3];
        elementBId = calc[4];
        jQuery('#element-a-search').val(calc[5]);
        jQuery('#element-b-search').val(calc[6]);
        jQuery('#na-input').val(calc[7]);
        jQuery('#mb-input').val(calc[8]);
        jQuery('#n-input').val(calc[9]);
        jQuery('#wa-input').val(calc[10]);
        jQuery('#wb-input').val(calc[11]);
        jQuery('#ga-input').val(calc[12]);
        jQuery('#gb-input').val(calc[13]);
        var theta2Range = calc[14].split(' - ');
        slider.noUiSlider.set([parseFloat(theta2Range[0]), parseFloat(theta2Range[1])]);
        $('.history-modal').modal('hide');
        renderDiffractionResults(data, [calc[5], calc[6], calc[7], calc[8], calc[9]]);
    })
    .fail((error) => {
        console.log(error);
    })
    .always(() => {
        jQuery('#history-spinner').addClass('d-none');
    })
}

var deleteCalcRow = function(id, row) {
    jQuery('#history-spinner').removeClass('d-none');
    jQuery.ajax({ url: '/calculations/' + id, type: 'delete' })
    .done((data) => {
        dataTable.row(row).remove().draw();
    })
    .fail((error) => {
        console.log(error);
    })
    .always(() => {
        jQuery('#history-spinner').addClass('d-none');
    })
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
        dropdownItemsHTML += '<li class="dropdown-item" data-dhkl="' + element["dhkl"] + '" data-element="' + element["id"] + '" data-parent="' + elementId + '" onclick="handleSearchResultsClick(event)">' + element["display_name"] + '</li>';
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

var createChart = function(intensities, chartSubtitles) {
    CanvasJS.addColorSet("aghColorSet", ['#a71930', '#00693c', '#1e1e1e', '#ffffff']);
    CanvasJS.addCultureInfo("pl", {
        savePNGText : "Pobierz PNG",
        saveJPGText : "Pobierz JPG",
        printText   : "Drukuj"
    });
    chart = new CanvasJS.Chart("chartContainer", {
        exportEnabled: true,
        animationEnabled: true,
        colorSet:  "aghColorSet",
        culture: "pl",
        axisX: {
            titleFontFamily: "sans-serif",
            titleFontSize: "20",
            title: "Kąt dyfrakcji 2θ [\u00b0]",
        },
        axisY: {
            titleFontFamily: "sans-serif",
            titleFontSize: "20",
            title: "Intensywność promieniowania",
        },
        data: [{
            type: 'splineArea',
            dataPoints: []
        }]
    });
    setChartSubtitles(chartSubtitles);
    updateChartData(intensities);
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

var createDataTable = function(columns, data) {
    dataTable = $('#history').DataTable({
        columns: columns,
        data: data,
        order: [[ data[0].length - 2, "desc" ]],
        language: {
            "emptyTable"     : "Nie znaleziono wyników",
            "info"           : "_START_ do _END_ z _TOTAL_ wyników",
            "infoEmpty"      : "Brak wyników",
            "infoFiltered"   : "(łącznie _MAX_ wyników)",
            "lengthMenu"     : "Pokaż _MENU_ wyników",
            "loadingRecords" : "Wczytuję...",
            "processing"     : "Przetwarzam...",
            "search"         : "Szukaj:",
            "zeroRecords"    : "Brak rekordów",
            "paginate"       : {
                "first"    : "Pierwsza",
                "last"     : "Ostatnia",
                "next"     : "Następna",
                "previous" : "Poprzednia"
            },
        },
        scrollY:        '57vh',
        scrollX:        '100%',
        aoColumnDefs: [{ 
            bVisible: false, aTargets: [0, 1, 2, 3, 4]
        }, {
            orderable: false, aTargets: [data[0].length - 1], 
        }]
    });
    setTimeout(() => dataTable.columns.adjust(), 150);
}

var setChartSubtitles = function(subtitleTextList) {
    chart.options.subtitles = [];
    subtitleTextList.forEach(text => {
        chartSubtitle.text = text;
        chart.options.subtitles.push({...chartSubtitle});
    });
}

var clearChart = function() {
    createChart([], ['Natężenie linii dyfrakcyjnych w zależności od kąta 2θ']);
    jQuery('#diffraction-time').remove();
    jQuery('#y-scale-increase').prop("disabled", true);
    jQuery('#y-scale-decrease').prop("disabled", true);
}

var showTooltip = function(event) {
    $('#' + event.currentTarget.id).popover('show');
}

var hideTooltip = function(event) {
    $('#' + event.currentTarget.id).popover('hide');
}

var addRowClickHandler = function() {
    $('#history tbody').on('click', 'tr', function (event) {
        var data = dataTable.row(this).data();
        if (event.target.id == 'select') {
            selectCalcRow(data);
        } else if (event.target.id == 'delete') {
            deleteCalcRow(data[0], this);
        }
    });
}

var addCloseModalHandler = function() {
    $('.history-modal').on('hidden.bs.modal', function (e) {
        $('#history').DataTable().destroy();
    })
}

var updateChartData = function(intensities) {
    chart.options.data[0].dataPoints = createDataPoints(intensities);
    chart.render();
}

var createDataPoints = function(intensities) {
    var dataPoints = [];
    intensities.forEach((intensity) => {
        dataPoints.push({
            label: intensity[0] + '°',
            y: intensity[1]
        });
    });
    return dataPoints;
}

window.onload = function () {
    createChart([], ['Natężenie linii dyfrakcyjnych w zależności od kąta 2θ']);
    createSlider();
    addCloseModalHandler();
}