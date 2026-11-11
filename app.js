let dataset = [];

function processFile() {

const file =
document.getElementById("fileInput").files[0];

if(!file) return;

const ext =
file.name.split('.').pop().toLowerCase();

if(ext==="csv"){
loadCSV(file);
}else{
loadExcel(file);
}
}

function loadCSV(file){

Papa.parse(file,{
header:true,
skipEmptyLines:true,
complete:(result)=>{

dataset=result.data;

analyzeData();
}
});
}

function loadExcel(file){

const reader=new FileReader();

reader.onload=(e)=>{

const workbook=XLSX.read(
new Uint8Array(e.target.result),
{type:'array'}
);

const sheet=
workbook.SheetNames[0];

dataset=
XLSX.utils.sheet_to_json(
workbook.Sheets[sheet]
);







analyzeData()


};

reader.readAsArrayBuffer(file);
}

function analyzeData(){

const columns =
Object.keys(dataset[0]);

const rows =
dataset.length;

document.getElementById("rows")
.innerText=rows;

document.getElementById("cols")
.innerText=columns.length;

let missing=0;

dataset.forEach(row=>{

columns.forEach(col=>{

if(
row[col]==="" ||
row[col]==null
){
missing++;
}

});
});

document.getElementById("missing")
.innerText=missing;

const dupes =
rows -
new Set(
dataset.map(r=>JSON.stringify(r))
).size;

document.getElementById("duplicates")
.innerText=dupes;









generateInsights();
generateCharts();
generateMissingValueChart();
createDataTable();
}



function generateInsights(){

document.getElementById(
"insights"
).innerHTML=`

<ul>
<li>${dataset.length} records detected</li>
<li>Automatic quality scan completed</li>
<li>Interactive visualizations generated</li>
<li>Ready for Power BI analysis</li>
</ul>

`;
}

function generateCharts(){

const cols=
Object.keys(dataset[0]);

const numeric=
cols.filter(c=>

dataset.every(r=>
r[c]==="" ||
!isNaN(parseFloat(r[c]))
)

);

if(numeric.length<1) return;

const first=numeric[0];

const values=dataset
.map(r=>parseFloat(r[first]))
.filter(v=>!isNaN(v));

Plotly.newPlot(
"histogram",
[{
x:values,
type:"histogram",
marker:{color:"#00d4ff"}
}],
{
paper_bgcolor:"#171717",
plot_bgcolor:"#171717",
font:{color:"#fff"},
title:first+" Distribution"
}
);

Plotly.newPlot(
"boxplot",
[{
y:values,
type:"box",
marker:{color:"#00d4ff"}
}],
{
paper_bgcolor:"#171717",
font:{color:"#fff"},
title:"Outlier Detection"
}
);

Plotly.newPlot(
"piechart",
[{
labels:["Valid","Missing"],
values:[
values.length,
dataset.length-values.length
],
type:"pie"
}],
{
paper_bgcolor:"#171717",
font:{color:"#fff"}
}
);

if(numeric.length>=2){

const x=dataset.map(
r=>parseFloat(r[numeric[0]])
);

const y=dataset.map(
r=>parseFloat(r[numeric[1]])
);

Plotly.newPlot(
"scatterplot",
[{
x:x,
y:y,
mode:"markers",
type:"scatter",
marker:{
size:8,
color:"#00d4ff"
}
}],
{
paper_bgcolor:"#171717",
plot_bgcolor:"#171717",
font:{color:"#fff"},
title:
`${numeric[0]} vs ${numeric[1]}`
}
);
}
}
function createDataTable() {

    if (!dataset || dataset.length === 0) {
        return;
    }

    const headers = Object.keys(dataset[0]);

    if ($.fn.DataTable.isDataTable('#dataTable')) {
        $('#dataTable').DataTable().destroy();
        $('#dataTable').empty();
    }

    let headerHTML = "<thead><tr>";

    headers.forEach(col => {
        headerHTML += `<th>${col}</th>`;
    });

    headerHTML += "</tr></thead>";

    $("#dataTable").html(headerHTML);

    $('#dataTable').DataTable({

        data: dataset,

        columns: headers.map(col => ({
            data: col,
            title: col
        })),

        pageLength: 25,

        responsive: true,

        searching: true,

        ordering: true,

        paging: true,

        scrollX: true
    });
}

function generateMissingValueChart() {

    const columns = Object.keys(dataset[0]);

    let missingCounts = [];

    columns.forEach(col => {

        let count = dataset.filter(row =>

            row[col] === "" ||
            row[col] === null ||
            row[col] === undefined

        ).length;

        missingCounts.push(count);
    });

    Plotly.newPlot(
        "missingValueChart",
        [{
            x: columns,
            y: missingCounts,
            type: "bar",
            marker: {
                color: "#00d4ff"
            }
        }],
        {
            title: "Missing Values by Column",
            paper_bgcolor: "#151515",
            plot_bgcolor: "#151515",
            font: {
                color: "white"
            },
            xaxis: {
                title: "Columns"
            },
            yaxis: {
                title: "Missing Value Count"
            }
        }
    );
}