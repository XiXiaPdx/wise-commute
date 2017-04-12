
$(function(){
  $("#trainSelected").change(function() {
    // if the option is green then add green line stops..
    var trainRoute = $("#trainSelected").val();
    if(trainRoute === "Green Line to City Ctr") {
      $("#trainStopSelected").empty().append(
        '<option>Choose A Stop</option>' +
        '<option value="13132">Clackamas Town Center</option>' +
        '<option value="13135">Lents/SE Foster Rd</option>' +
        '<option value="8370">Gateway/NE 99th Ave</option>' +
        '<option value="8373">Hollywood/NE 42nd Ave</option>' +
        '<option value="8377">Rose Quarter</option>' +
        '<option value="7601">Union Station/NW 5th & Glisan</option>' +
        '<option value="7646">Pioneer Place/SW 5th Ave</option>' +
        '<option value="7606">PSU South/SW 5th & Jackson</option>'
      );
    } else if (trainRoute === "Green Line to Clackamas") {
      $("#trainStopSelected").empty().append(
        '<option>Choose A Stop</option>' +
        '<option value="10293">PSU South/SW 6th & College</option>' +
        '<option value="7777">Pioneer Courthouse/SW 6th Ave</option>' +
        '<option value="7763">Union Station/NW 6th & Hoyt</option>' +
        '<option value="8340">Rose Quarter</option>' +
        '<option value="8344">Hollywood/NE 42nd Ave</option>' +
        '<option value="8347">Gateway/NE 99th Ave</option>' +
        '<option value="13128">Lents/SE Foster Rd</option>' +
        '<option value="7646">Pioneer Place/SW 5th Ave</option>' +
        '<option value="13132">Clackamas Town Center</option>'
      );
    }
  });
  $("#trainStopSelected").change(function() {
    $(this).parent('form').submit();
    var trainStop = $('#trainStopSelected').find(":selected").val();
    // var trainStop = "13132";
    console.log(trainStop);
    $.ajax({
      type: "GET",
      url: "https://developer.trimet.org/ws/v2/arrivals?locIDs=" + trainStop + "&xml=true&appID=3B5160342487A47D436E90CD9",
      dataType: "xml",
      success: processXML
    });

    function processXML(xml) {
      var trainRoute = $('#trainSelected').find(":selected").val();
      var trainArray = new Array();
      console.log("working!");
      $(xml).find("arrival").each(function() {
        var shortSign = $(this).attr('shortSign');
        if(shortSign.includes(trainRoute)) {
          // Train name (fullSign)
          var fullSign = $(this).attr('fullSign');
          // console.log("Fullsign: " + fullSign);
          // Delay
          var scheduledTime = parseInt($(this).attr('scheduled'));
          var estimatedTime = parseInt($(this).attr('estimated'));
          var delay;
          if(scheduledTime > estimatedTime) {
            delay = ((scheduledTime - estimatedTime) / 1000 / 60);
          } else {
            delay = ((estimatedTime - scheduledTime) / 1000 / 60);
          }
          // console.log("Delay: " + delay);
          // Arrival Time
          var scheduledDate = new Date(0);
          scheduledDate.setUTCMilliseconds(scheduledTime);
          var arrivalTime = scheduledDate.toLocaleTimeString();
          // console.log("arrival time: " + arrivalTime);

          var trainInformation = { fullSign: fullSign, delay: delay, arrival: arrivalTime };

          trainArray.push(trainInformation);
        }
      });
      localStorage.clear();
      localStorage.setItem("trainArray", JSON.stringify(trainArray));
    }
  });
  var url = location.href;
  if(url.includes("reports")) {
    var trainArray = JSON.parse(localStorage.getItem("trainArray"));
    trainArray.forEach(function(train) {
      var count = 1;
      if(count <= 3) {
        $("#trainName" + count).text(train["fullSign"]);
        console.log(train["fullSign"]);
        console.log(train["delay"]);
        $("#trainDelay" + count).text(train["delay"]);
        $("#trainArrival" + count).text(train["arrival"]);
      }
      count++;
    });
    $(".userReports").slideDown();
  }
});
