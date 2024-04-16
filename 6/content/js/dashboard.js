/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 96.34763050477035, "KoPercent": 3.652369495229648};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8167163221004249, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9457649651029678, 500, 1500, "GET  /character/id"], "isController": false}, {"data": [0.9656698594046241, 500, 1500, "DELETE /character/id"], "isController": false}, {"data": [0.9642360298915386, 500, 1500, "PUT /character/id"], "isController": false}, {"data": [0.26177230399519374, 500, 1500, "GET  /characters"], "isController": false}, {"data": [0.9597680631301628, 500, 1500, "POST /character"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 408146, 14907, 3.652369495229648, 891.9791202168034, 0, 166551, 30.0, 4001.9000000000015, 15096.0, 63080.990000000005, 1525.8878200694628, 4611.105525953245, 267.67406858454433], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET  /character/id", 81239, 3068, 3.776511281527345, 87.29944977166086, 0, 127003, 5.0, 127.0, 395.9500000000007, 1146.0, 334.7163281282189, 102.60178202638951, 39.944938951062994], "isController": false}, {"data": ["DELETE /character/id", 81226, 2752, 3.3880777091079213, 30.87933666559997, 0, 27401, 3.0, 129.0, 189.0, 295.0, 450.73220538374886, 140.15910215707873, 90.57930002455483], "isController": false}, {"data": ["PUT /character/id", 81227, 2765, 3.4040405283957305, 33.692294434116974, 0, 3641, 3.0, 156.0, 286.0, 305.0, 450.72774994034836, 134.34915818364937, 99.45828425945965], "isController": false}, {"data": ["GET  /characters", 83225, 3538, 4.2511264644037245, 4151.818756383347, 0, 166551, 1878.0, 15094.0, 31543.95, 127001.0, 311.14359524601747, 4242.398675192117, 36.685294060606175], "isController": false}, {"data": ["POST /character", 81229, 2784, 3.427347375937165, 76.149466323604, 0, 60110, 3.0, 116.0, 168.0, 432.9900000000016, 450.72884356081835, 134.56112435806554, 99.00947971750722], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["408/Request Timeout", 60, 0.4024954719259408, 0.014700621836303676], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 911, 6.111222915408868, 0.22320444154787747], "isController": false}, {"data": ["Non HTTP response code: java.net.BindException/Non HTTP response message: Can't assign requested address", 13912, 93.32528342389482, 3.408584183110946], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 24, 0.16099818877037633, 0.00588024873452147], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 408146, 14907, "Non HTTP response code: java.net.BindException/Non HTTP response message: Can't assign requested address", 13912, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 911, "408/Request Timeout", 60, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 24, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["GET  /character/id", 81239, 3068, "Non HTTP response code: java.net.BindException/Non HTTP response message: Can't assign requested address", 2805, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 263, "", "", "", "", "", ""], "isController": false}, {"data": ["DELETE /character/id", 81226, 2752, "Non HTTP response code: java.net.BindException/Non HTTP response message: Can't assign requested address", 2752, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["PUT /character/id", 81227, 2765, "Non HTTP response code: java.net.BindException/Non HTTP response message: Can't assign requested address", 2765, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET  /characters", 83225, 3538, "Non HTTP response code: java.net.BindException/Non HTTP response message: Can't assign requested address", 2806, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 648, "408/Request Timeout", 60, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 24, "", ""], "isController": false}, {"data": ["POST /character", 81229, 2784, "Non HTTP response code: java.net.BindException/Non HTTP response message: Can't assign requested address", 2784, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
