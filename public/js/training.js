$(".addSet").on("submit", function (event) {
  event.preventDefault();
  var data = {
    date: $("a.list-group-item-action.active").text(),
    exercise: $(this).find(".filter-option-inner-inner").text(),
    weight: $(this).find(".weight").val(),
    reps: $(this).find(".reps").val(),
  };

  $(this).trigger("reset");
  $(this).find(".exercise").trigger("focus");

  $.ajax({
    data: data,
    type: "POST",
    url: "/home/training/addSet",
  })
    .then(function (res) {
      console.log(res);
      $(".tab-pane.active").find(".tableBody").append(
        `<tr>
                    <td>${res.exercise}</td>
                    <td>${res.weight}</td>
                    <td>${res.reps}</td>
                    <td><button class="deleteSet btn btn-danger btn-sm">X</button></td>
                </tr>`
      );
    })
    .catch(function (err) {
      console.error(err);
    });
});

$("#addDay").on("submit", function (event) {
  event.preventDefault();
  var data = {
    date: $(this).find(".date").val().split("T")[0],
  };

  $.ajax({
    data: data,
    type: "POST",
    url: "/home/training/addDay",
  })
    .then(function (res) {
      const date = res.date.split("T")[0];

      console.log(res);
      $("#list-tab").append(
        `
                <a
                class="list-group-item list-group-item-action"
                id="list-${date}-list"
                data-toggle="list"
                href="#list-${date}"
                role="tab"
                aria-controls="${date}"
            >
                ${date}
            </a>
                `
      );

      let $newTab = $(".tab-pane").clone(true);
      $newTab
        .attr("id", `list-${date}`)
        .attr("aria-labelledby", `list-${date}-list`);

      $newTab.find(".tableBody").empty();
      $newTab.removeClass("active");

      $("#nav-tabContent").append($newTab);

      //Dismiss the modal form after clicking the Save button
      $("#modalFormAddDay").modal("toggle");
      location.reload();
    })
    .catch(function (err) {
      console.error(err);
    });
});

$(".deleteSet").on("click", function (event) {
  event.preventDefault();
  const data = [];

  $this = $(this);

  $this
    .parent()
    .siblings("td")
    .toArray()
    .forEach((elem) => data.push(elem.innerText));

  const date = $(".list-group-item-action.active").text();

  $.ajax({
    data: {
      date: date,
      exercise: data[0],
      weight: data[1],
      reps: data[2],
    },
    type: "DELETE",
    url: "/home/training/deleteSet",
  }).then(function (res) {
    $this.parents("tr").remove();

    // Create the snackbar telling the user that the Set has been deleted
    const $elem = $("<div>", { class: "snackbar show" });
    $elem.text("Set deleted");
    $(".jumbotron").append($elem);

    // After 3 seconds, remove the show class from DIV
    setTimeout(function () {
      $elem.remove();
    }, 3000);
  });
});
