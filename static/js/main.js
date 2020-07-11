var chart;

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

var getIntensities = function() {
    var dA = jQuery('#da-input').val();
    var dB = jQuery('#db-input').val();
    var nA = jQuery('#na-input').val();
    var mB = jQuery('#mb-input').val();
    var n = jQuery('#n-input').val();
    if (!dA || !dB || !nA || !mB || !n) {
        jQuery('#diffraction-error').removeClass('d-none');
    } else {
        jQuery('#diffraction-error').addClass('d-none');
        sendIntensitiesRequest('?dA=' + dA + '&dB=' + dB + '&nA=' + nA + '&mB=' + mB + '&N=' + n);
    }
}

var sendIntensitiesRequest = function(queryString) {
    clearChart();
    jQuery('#diffraction-spinner').removeClass('d-none');
    jQuery.ajax({url: '/diffraction-intensities' + queryString, type: 'get'})
    .done((data) => {
        console.log(data);
        createChart(data.intensities);
        timeMessage = '<div id="diffraction-time" class="mt-3">Czas obliczeń: ' + data.time + 's.</div>';
        jQuery('#diffraction-results').append(timeMessage);
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
    chart = new CanvasJS.Chart("chartContainer", {
        exportEnabled: true,
	    animationEnabled: true,    
        title:{
            text: "Natężenie linii dyfrakcyjnych w zależności od kąta 2θ"              
        },
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
}