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

            $("#nav-tabContent").append(` 
            <div
            class="tab-pane fade"
            id="list-${date}"
            role="tabpanel"
            aria-labelledby="list-${date}-list">
                <table class="table">
                <thead>
                    <tr>
                        <th scope="col">Exercise</th>
                        <th scope="col">Weight</th>
                        <th scope="col">Reps</th>
                    </tr>
                </thead>
                <tbody class="tableBody">
                    
                </tbody>
                </table>
                <form class="addSet" method="POST" action="/home/training/addSet">
                    <select
                    name="exercise"
                    class="exercise selectpicker"
                    data-live-search="true"
                >
                        <option>Dumbell press</option>
                        <option>Reverse fly</option>
                        <option>Barbell curl</option>
                    </select>
                    <input class="weight" name="weight" placeholder="weight" />
                    <input class="reps" name="reps" placeholder="reps" />
                    <input class="btn btn-success" value="Ok" type="submit" />
                </form>
            </div>
            `);

            //Dismiss the modal form after clicking the Save button
            $("#modalFormAddDay").modal("toggle");

            //Allows bootstrap-select to correctly render the newly created dropdown
            $(".selectpicker").selectpicker("refresh");
        })
        .catch(function (err) {
            console.error(err);
        });
});
