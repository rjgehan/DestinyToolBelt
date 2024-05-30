$(document).ready(function () {
    fetch("gunstyles.json")
        .then(response => response.json())
        .then(data => {
            const categorySelect = $("#weaponCategory");
            const styleSelect = $("#weaponStyle");

            categorySelect.append($('<option>', { value: '', text: 'Pick one', disabled: true, selected: true }));
            styleSelect.append($('<option>', { value: '', text: 'Pick one', disabled: true, selected: true }));

            for (let category in data) {
                categorySelect.append(new Option(category, category));
            }

            categorySelect.select2({ placeholder: "Select a weapon category" });
            styleSelect.select2({ placeholder: "Select a weapon style", disabled: true });

            categorySelect.on("change", function () {
                let category = $(this).val();
                styleSelect.empty().prop("disabled", false);
                styleSelect.append($('<option>', { value: '', text: 'Pick one', disabled: true, selected: true }));

                data[category].forEach(item => {
                    styleSelect.append(new Option(item.frame));
                });

                styleSelect.select2({ placeholder: "Select a weapon style" });
            });
        })
        .catch(error => console.error("Error loading the gun styles:", error));

    $("#weaponStyle").on("change", function () {
        var calculateButton = document.getElementById("calculateButton");
        calculateButton.disabled = !this.value;
    });

    // Fetch and setup activities and difficulties
    fetch('PLMulti.json')
        .then(response => response.json())
        .then(data => {
            document.getElementById('activityDisplay').textContent = "default - GoA - Phryz\'ia";
            $("#armorPL").val(1830);
            $("#weaponPL").val(1830);
            $("#totalPL").val(1830);
            $("#activity").append($('<option>', { value: '', text: 'Select an activity', disabled: true, selected: true }));
            $("#difficulty").append($('<option>', { value: '', text: 'Select a difficulty', disabled: true, selected: true }));


            const activityTypeSelect = $("#activityType");
            const activitySelect = $("#activity");
            const difficultySelect = $("#difficulty").prop('disabled', true);

            activityTypeSelect.append($('<option>', { value: '', text: 'Select an activity type', disabled: true, selected: true }));

            for (let type in data) {
                activityTypeSelect.append($('<option>', { value: type, text: type }));
            }

            activityTypeSelect.select2({ placeholder: "Select an activity type", allowClear: true });

            activityTypeSelect.on("change", function () {
                const selectedType = $(this).val();
                const selectedActivities = data[selectedType];

                activitySelect.empty().prop("disabled", !selectedType);
                activitySelect.append($('<option>', { value: '', text: 'Select an activity', disabled: true, selected: true }));

                if (selectedType) {
                    for (let activityName in selectedActivities) {
                        activitySelect.append(new Option(activityName, activityName));
                    }
                }

                activitySelect.select2({ placeholder: "Select an activity", allowClear: true });
            });

            $("#activity").on("change", function () {
                const selectedActivity = $(this).val();
                difficultySelect.prop('disabled', !selectedActivity); // Enable difficulty selection only if an activity is selected

                if (selectedActivity) {
                    // Adding options to the difficulty select element
                    difficultySelect.empty();
                    ["Normal", "Raid and Dungeon", "Master"].forEach(level => {
                        difficultySelect.append(new Option(level, level));
                    });

                    updateActivityDisplay(data); // Call updateActivityDisplay with data parameter

                    difficultySelect.on("change", function() {
                        updateActivityDisplay(data); // Ensure data is available
                    });
                } else {
                    document.getElementById('activityDisplay').textContent = 'Please select an activity to display details.';
                    difficultySelect.prop('disabled', true).empty(); // Disable and clear if no activity is selected
                }
            });
        })
        .catch(error => {
            console.error('Error loading the activities data:', error);
        });

    function updateActivityDisplay(data) {
        const selectedActivity = $("#activity").val();
        const activityTypeVal = $("#activityType").val();
        const activityDetails = activityTypeVal ? data[activityTypeVal][selectedActivity] : null;

        if (selectedActivity && activityDetails) {
            document.getElementById('activityDisplay').textContent = `${selectedActivity}, Recommended Power Level: ${activityDetails['Recommended Power Level']}`;
        } else {
            document.getElementById('activityDisplay').textContent = 'Please select an activity and difficulty to display details.';
        }
    }
});
