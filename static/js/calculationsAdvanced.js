var dataTableColumns = [
    { title: "Id" },
    { title: "A Id" },
    { title: "B Id" },
    { title: "Pierwiastek A" },
    { title: "Pierwiastek B" },
    { title: "d<sub>A</sub>" },
    { title: "d<sub>B</sub>" },
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
];

var showSelectedInputs = function(event) {
    if (event.target.value === "dhkl") {
        jQuery(".element-a-input").addClass('d-none');
        jQuery(".element-b-input").addClass('d-none');
        jQuery(".dhkl-inputs").removeClass('d-none');
    } else if (event.target.value === "elements") {
        jQuery(".element-a-input").removeClass('d-none');
        jQuery(".element-b-input").removeClass('d-none');
        jQuery(".dhkl-inputs").addClass('d-none');
    } 
}