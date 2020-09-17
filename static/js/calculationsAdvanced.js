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
    { title: "W<sub>A</sub>" },
    { title: "W<sub>B</sub>" },
    { title: "g<sub>A</sub>" },
    { title: "g<sub>B</sub>" },
    { title: "&lambda; [&#8491;]" },
    { title: "Błąd [%]" },
    { title: "Zakres kąta 2θ" },
    { title: "Data" },
    { title: "" }
];

var showSelectedInputs = function(event) {
    if (event.target.value === "dhkl") {
        jQuery("#element-a-input").addClass('d-none');
        jQuery("#element-b-input").addClass('d-none');
        jQuery("#dhkl-inputs").removeClass('d-none');
    } else if (event.target.value === "elements") {
        jQuery("#element-a-input").removeClass('d-none');
        jQuery("#element-b-input").removeClass('d-none');
        jQuery("#dhkl-inputs").addClass('d-none');
    } 
}

var getIntensities = function() {
    if (jQuery("#element-a-input").hasClass('d-none')) {
        dA = jQuery('#da-input').val();
        dB = jQuery('#db-input').val();
        elementAId = '';
        elementBId = '';
    } 
    var nA = +jQuery('#na-input').val();
    var mB = +jQuery('#mb-input').val();
    var wA = jQuery('#wa-input').val();
    var wB = jQuery('#wb-input').val();
    var gA = jQuery('#ga-input').val();
    var gB = jQuery('#gb-input').val();
    var n = +jQuery('#n-input').val();
    var error = jQuery('#error-input').val();
    var lambda = jQuery('#lambda-input').val();
    var theta2Range = slider.noUiSlider.get();
    if (!dA || !dB || !nA || !mB || !n || !wA || !wB || !gA || !gB || !lambda) {
        jQuery('#diffraction-error').text('Wprowadź wszystkie wartości.');
        jQuery('#diffraction-error').removeClass('d-none');
    } else if (!Number.isInteger(nA) || !Number.isInteger(mB) || !Number.isInteger(n)) {
        jQuery('#diffraction-error').text('Wprowadź poprawne wartości.');
        jQuery('#diffraction-error').removeClass('d-none');
    } else {
        jQuery('#diffraction-error').addClass('d-none');
        sendIntensitiesRequest({
            advanced     : true,
            elementAId   : elementAId,
            elementBId   : elementBId,
            dA           : +dA,
            dB           : +dB,
            nA           : nA,
            mB           : mB,
            wA           : +wA,
            wB           : +wB,
            gA           : +gA,
            gB           : +gB,
            n            : n,
            error        : +error,
            lambda       : +lambda,
            theta2Min    : +theta2Range[0],
            theta2Max    : +theta2Range[1]
        }, jQuery('#element-a-search').val(), jQuery('#element-b-search').val());
    }
}

var getCalculations = function() {
    jQuery('#history').html('');
    jQuery.ajax({ url: '/calculations?advanced=true', type: 'get' })
    .done((data) => {
        displayedData = [];
        data.forEach(calc => {
            var row = [
                calc.id,calc["element_a"]["id"], calc["element_b"]["id"], 
                calc["element_a"]["display_name"] ? calc["element_a"]["display_name"] : '-', 
                calc["element_b"]["display_name"] ? calc["element_b"]["display_name"] : '-',
                calc["element_a"]["dhkl"] ? calc["element_a"]["dhkl"] : calc['d_a_custom'], 
                calc["element_b"]["dhkl"] ? calc["element_b"]["dhkl"] : calc['d_b_custom'], 
                calc["n_a"], calc["m_b"], calc["n"], calc["w_a"], calc["w_b"], calc["g_a"], 
                calc["g_b"], calc["lambda_length"], calc["standard_error"],
                calc["theta_2_min"] + '&deg; - ' + calc["theta_2_max"] + '&deg;',  
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