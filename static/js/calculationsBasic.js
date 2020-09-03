var dataTableColumns = [
    { title: "Id" },
    { title: "A dhkl" },
    { title: "B dhkl" },
    { title: "A Id" },
    { title: "B Id" },
    { title: "Pierwiastek A" },
    { title: "Pierwiastek B" },
    { title: "n<sub>A</sub>" },
    { title: "m<sub>B</sub>" },
    { title: "N" },
    { title: "Zakres kąta 2θ" },
    { title: "Data" },
    { title: "" }
];

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
            elementAId   : elementAId,
            elementBId   : elementBId,
            dA           : +dA,
            dB           : +dB,
            nA           : +nA,
            mB           : +mB,
            n            : +n,
            wA           : +jQuery('#wa-input').val() || 0,
            wB           : +jQuery('#wb-input').val() || 0,
            gA           : +jQuery('#ga-input').val() || 1,
            gB           : +jQuery('#gb-input').val() || 1,
            theta2Min    : +theta2Range[0],
            theta2Max    : +theta2Range[1]
        }, jQuery('#element-a-search').val(), jQuery('#element-b-search').val());
    }
}

var sendIntensitiesRequest = function(requestData, elA, elB) {
    jQuery('#diffraction-spinner').removeClass('d-none');
    jQuery.ajax({
        url: '/diffraction-intensities', 
        type: 'post', 
        data: JSON.stringify(requestData), 
        contentType : 'application/json'
    })
    .done((data) => {
        clearChart();
        renderDiffractionResults(data, [elA, elB, requestData.nA, requestData.mB, requestData.n]);
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
        paramsList[0] + ', ' + paramsList[1],
        'nA = ' + paramsList[2] + ', mB = ' + paramsList[3] + ', N = ' + paramsList[4]
    ]);
    timeMessage = '<div id="diffraction-time" class="mt-3">Czas obliczeń: ' + data.time + 's.</div>';
    jQuery('#diffraction-results').append(timeMessage);
    jQuery('#y-scale-increase').removeAttr("disabled");
    jQuery('#y-scale-decrease').removeAttr("disabled");
}

var getCalculations = function() {
    jQuery('#history').html('');
    jQuery.ajax({ url: '/calculations', type: 'get' })
    .done((data) => {
        displayedData = [];
        data.forEach(calc => {
            var row = [
                calc.id, calc["element_a"]["dhkl"], calc["element_b"]["dhkl"],calc["element_a"]["id"], 
                calc["element_b"]["id"], calc["element_a"]["display_name"], calc["element_b"]["display_name"], 
                calc["n_a"], calc["m_b"], calc["n"], calc["theta_2_min"] + '&deg; - ' + calc["theta_2_max"] + '&deg;',  
                new Date(calc["created_date"]).toLocaleDateString(),
                `<div class="row button-column">
                    <button type="button" id="select" class="btn btn-sm btn-green">Wybierz</button>
                    <button type="button" id="delete" class="btn btn-sm btn-green ml-1">Usuń</button>
                </div>`
            ];
            displayedData.push(row);
            dataTableData = displayedData;
        });
        createDataTable(dataTableColumns, displayedData);
        addRowClickHandler();
    })
    .fail((error) => {
        console.log(error);
    })
}