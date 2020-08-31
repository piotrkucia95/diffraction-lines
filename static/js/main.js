var chart;
var slider;
var dataTable;
var dA;
var dB;
var elementAId;
var elementBId;

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

var handleInverseResponse = function(results, order) {
    displayInverseResults(results, order);
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

var getIntensities = function() {
    var nA = jQuery('#na-input').val();
    var mB = jQuery('#mb-input').val();
    var n = jQuery('#n-input').val();
    var theta2Range = slider.noUiSlider.get();
    if (!dA || !dB || !nA || !mB || !n) {
        jQuery('#diffraction-error').removeClass('d-none');
    } else {
        jQuery('#diffraction-error').addClass('d-none');
        jQuery('#theta-range-error').addClass('d-none');
        sendIntensitiesRequest({
            elementAId : elementAId,
            elementBId : elementBId,
            dA         : +dA,
            dB         : +dB,
            nA         : +nA,
            mB         : +mB,
            n          : +n,
            wA         : +jQuery('#wa-input').val() || 0,
            wB         : +jQuery('#wb-input').val() || 0,
            gA         : +jQuery('#ga-input').val() || 1,
            gB         : +jQuery('#gb-input').val() || 1,
            theta2Min  : +theta2Range[0],
            theta2Max  : +theta2Range[1]
        });
    }
}

var sendIntensitiesRequest = function(requestData) {
    clearChart();
    jQuery('#diffraction-spinner').removeClass('d-none');
    jQuery.ajax({
        url: '/diffraction-intensities', 
        type: 'post', 
        data: JSON.stringify(requestData), 
        contentType : 'application/json'
    })
    .done((data) => {
        createChart(data.intensities);
        timeMessage = '<div id="diffraction-time" class="mt-3">Czas obliczeń: ' + data.time + 's.</div>';
        jQuery('#diffraction-results').append(timeMessage);
        jQuery('#y-scale-increase').removeAttr("disabled");
        jQuery('#y-scale-decrease').removeAttr("disabled");
    })
    .fail((error) => {
        console.log(error);
    })
    .always(() => {
        jQuery('#diffraction-spinner').addClass('d-none');
    });
}

var getCalculations = function() {
    jQuery('#history').html('');
    jQuery.ajax({ url: '/calculations', type: 'get' })
    .done((data) => {
        displayedData = [];
        data.forEach(calc => {
            var row = [
                calc.id, calc.elementA.name, calc.elementB.name, calc.nA, 
                calc.mB, calc.n, calc.wA, calc.wB, calc.gA, calc.gB, 
                calc.theta2Min + '&deg; - ' + calc.theta2Max + '&deg;',  
                new Date(calc.createdDate).toLocaleDateString(),
                `<div class="btn-group btn-group-sm" role="group" aria-label="Basic example">
                <button type="button" id="select" class="btn btn-primary">Wybierz</button>
                <button type="button" id="delete" class="btn btn-primary">Usuń</button>
              </div>`
            ];
            displayedData.push(row);
            dataTableData = displayedData;
        });
        createDataTable(displayedData);
        addRowClickHandler();
    })
    .fail((error) => {
        console.log(error);
    })
    .always(() => {
        jQuery('#diffraction-spinner').addClass('d-none');
    });
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
    createChart([]);
    createSlider();
    addCloseModalHandler();
}

