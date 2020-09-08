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

var sendIntensitiesRequest = function(requestData, elA, elB) {
    jQuery('#diffraction-spinner').removeClass('d-none');
    jQuery.ajax({
        url: '/calculations', 
        type: 'post', 
        data: JSON.stringify(requestData), 
        contentType : 'application/json'
    })
    .done((data) => {
        clearChart();
        renderDiffractionResults(data, [elA, elB, requestData]);
    })
    .fail((error) => {
        console.log(error);
    })
    .always(() => {
        jQuery('#diffraction-spinner').addClass('d-none');
    });
}

var renderDiffractionResults = function(data, paramsList) {
    createChart(data.intensities, [
        paramsList[0] != '-' && paramsList[1] != '-' 
            ? paramsList[0] + ', ' + paramsList[1]
            : 'dA = ' + paramsList[2].dA + '; ' + 'dB = ' + paramsList[2].dB + '; nA = ' + paramsList[2].nA + '; mB = ' + paramsList[2].mB + '; N = ' + paramsList[2].n,
        paramsList[0] != '-' && paramsList[1] != '-' 
            ? 'nA = ' + paramsList[2].nA + '; mB = ' + paramsList[2].mB + '; N = ' + paramsList[2].n
            : '',
        paramsList[2].wA || paramsList[2].wA == 0 && paramsList[2].wB || paramsList[2].wB == 0 && paramsList[2].gA || paramsList[2].gA == 0 && paramsList[2].gB || paramsList[2].gB == 0
            ? 'WA = ' + paramsList[2].wA + '; WB = ' + paramsList[2].wB + '; gA = ' + paramsList[2].gA + '; gB = ' + paramsList[2].gB
            : '',
        paramsList[2].lambda ? '\u03BB = ' + paramsList[2].lambda + '; Błąd = ' + paramsList[2].error : ''
    ]);
    timeMessage = '<div id="diffraction-time" class="mt-3">Czas obliczeń: ' + data.time + 's.</div>';
    jQuery('#diffraction-results').append(timeMessage);
    jQuery('#y-scale-increase').removeAttr("disabled");
    jQuery('#y-scale-decrease').removeAttr("disabled");
}

var handleSearch = function(event) {
    if (event.target.value.length > 1) {
        jQuery.ajax({url: '/elements?searchTerm=' + encodeURIComponent(event.target.value.split(' ')[0]), type: 'get'})
        .done((data) => {
            displaySearchResults(data, event.target.id);
        })
        .fail((error) => {
            console.log(error);
        })
    } else if (event.target.value.length == 0) {
        hideSearchResults(event.target.id);
        if (event.target.id == 'element-a-search') {
            dA = 0;
            elementAId = '';
        } else if (event.target.id == 'element-b-search') {
            dB = 0;
            elementBId = '';
        }
    } else {
        hideSearchResults(event.target.id);
    }
}

var handleSearchResultsClick = function(event) {
    jQuery('#' + event.currentTarget.dataset.parent).val(event.currentTarget.textContent);
    switch(event.currentTarget.dataset.parent) {
        case 'element-a-search':
            dA = event.currentTarget.dataset.dhkl;
            if (jQuery('#da-input')) {
                jQuery('#da-input').val(dA);
            }
            elementAId = event.currentTarget.dataset.element;
            break;
        case 'element-b-search':
            dB = event.currentTarget.dataset.dhkl;
            if (jQuery('#db-input')) {
                jQuery('#db-input').val(dB);
            }
            elementBId = event.currentTarget.dataset.element;
    }
    hideSearchResults(event.currentTarget.dataset.parent);
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

var selectCalcRow = function(calc) {
    jQuery('#history-spinner').removeClass('d-none');
    jQuery.ajax({ url: '/calculations/' + calc[0], type: 'patch' })
    .done((data) => {
        clearChart();
        var params = {
            elementAId  : calc[1],
            elementBId  : calc[2],
            elementA    : calc[3],
            elementB    : calc[4],
            dA          : calc[5],
            dB          : calc[6],
            nA          : calc[7],
            mB          : calc[8],
            n           : calc[9],
            theta2Range : calc[10]
        }
        if (calc.length > 13) {
            Object.assign(params, {
                wA          : calc[10],
                wB          : calc[11],
                gA          : calc[12],
                gB          : calc[13],
                lambda      : calc[14],
                error       : calc[15],
                theta2Range : calc[16]
            });
        }
        setInputs(calc, params);
        $('.history-modal').modal('hide');
        renderDiffractionResults(data, [calc[3], calc[4], params]);
    })
    .fail((error) => {
        console.log(error);
    })
    .always(() => {
        jQuery('#history-spinner').addClass('d-none');
    })
}

var setInputs = function(row, params) {
    elementAId = params.elementAId;
    elementBId = params.elementBId;
    dA = params.dA;
    dB = params.dB;
    jQuery('#element-a-search').val(params.elementA);
    jQuery('#element-b-search').val(params.elementB);
    jQuery('#na-input').val(params.nA);
    jQuery('#mb-input').val(params.mB);
    jQuery('#n-input').val(params.n);
    if (row.length > 13) {
        jQuery('#da-input').val(params.dA);
        jQuery('#db-input').val(params.dB);
        jQuery('#wa-input').val(params.wA);
        jQuery('#wb-input').val(params.wB);
        jQuery('#ga-input').val(params.gA);
        jQuery('#gb-input').val(params.gB);
        jQuery('#lambda-input').val(params.lambda);
        jQuery('#error-input').val(params.error);
    }
    var theta2Range = params.theta2Range.split(' - ');
    slider.noUiSlider.set([parseFloat(theta2Range[0]), parseFloat(theta2Range[1])]);
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
        keyboardPageMultiplier: 100,
        keyboardDefaultStep: 18000,
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
            bVisible: false, aTargets: [0, 1, 2]
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