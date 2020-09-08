var dataTableColumns = [
    { title: "Id" },
    { title: "A Id" },
    { title: "B Id" },
    { title: "Pierwiastek A" },
    { title: "Pierwiastek B" },
    { title: "d<sub>A</sub> [&#8491;]" },
    { title: "d<sub>B</sub> [&#8491;]" },
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
            advanced     : false,
            elementAId   : elementAId,
            elementBId   : elementBId,
            dA           : +dA,
            dB           : +dB,
            nA           : +nA,
            mB           : +mB,
            n            : +n,
            theta2Min    : +theta2Range[0],
            theta2Max    : +theta2Range[1]
        }, jQuery('#element-a-search').val(), jQuery('#element-b-search').val());
    }
}

var getCalculations = function() {
    jQuery('#history').html('');
    jQuery.ajax({ url: '/calculations?advanced=false', type: 'get' })
    .done((data) => {
        displayedData = [];
        data.forEach(calc => {
            var row = [
                calc.id,calc["element_a"]["id"], calc["element_b"]["id"], calc["element_a"]["display_name"], 
                calc["element_b"]["display_name"], calc["element_a"]["dhkl"], calc["element_b"]["dhkl"], 
                calc["n_a"], calc["m_b"], calc["n"], calc["theta_2_min"] + '&deg; - ' + calc["theta_2_max"] + '&deg;',  
                new Date(calc["created_date"]).toLocaleDateString(),
                `<div class="row text-right buttons-column">
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