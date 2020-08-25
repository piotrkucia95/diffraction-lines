var chart;
var slider;
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
            element_a_id : elementAId,
            element_b_id : elementBId,
            d_a          : +dA,
            d_b          : +dB,
            n_a          : +nA,
            m_b          : +mB,
            n            : +n,
            w_a          : +jQuery('#wa-input').val() || 0,
            w_b          : +jQuery('#wb-input').val() || 0,
            g_a          : +jQuery('#ga-input').val() || 1,
            g_b          : +jQuery('#gb-input').val() || 1,
            theta_2_min  : +theta2Range[0],
            theta_2_max  : +theta2Range[1]
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
        $('#history').DataTable( {
            data: data,
            columns: [
                { title: "Pierwiastek A" },
                { title: "Pierwiastek B" },
                { title: "nA" },
                { title: "mB" },
                { title: "N" },
                { title: "WA" },
                { title: "WB" },
                { title: "gA" },
                { title: "gB" },
                { title: "Zakres kąta 2θ" },
                { title: "Zakres kąta 2θ" },
                { title: "Standard" },
                { title: "Data utworzenia" }
            ]
        } );
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

window.onload = function () {
    createChart([]);
    createSlider();
}