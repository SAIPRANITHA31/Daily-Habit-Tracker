const habitInput = document.getElementById("habitInput");
const targetTimeInput = document.getElementById("targetTime");
const habitList = document.getElementById("habitList");
const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");
const weeklyList = document.getElementById("weeklyList");

document.addEventListener("DOMContentLoaded", () => {
    renderHabits();
    renderWeeklySummary();
    scheduleMidnightReset();
});

/* ---------- DAILY PAGE ---------- */

function addHabit() {
    const text = habitInput.value.trim();
    const targetTime = targetTimeInput.value;

    if (!text || !targetTime) return;

    const habits = getHabits();
    habits.push({
        text,
        targetTime,
        completed: false,
        completedAt: null,
        onTime: false
    });

    saveHabits(habits);
    habitInput.value = "";
    targetTimeInput.value = "";
    renderHabits();
}

function renderHabits() {
    if (!habitList) return;
    habitList.innerHTML = "";

    const habits = getHabits();

    habits.forEach((habit, index) => {
        const li = document.createElement("li");
        li.className = "habit-item";

        if (habit.completed) {
            li.classList.add(habit.onTime ? "on-time" : "late");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = habit.completed;

        checkbox.onchange = () => {
            const now = new Date();
            const completedTime = now.toTimeString().slice(0, 5);

            if (checkbox.checked) {
                habit.completed = true;
                habit.completedAt = completedTime;
                habit.onTime = completedTime <= habit.targetTime;
            } else {
                habit.completed = false;
                habit.completedAt = null;
                habit.onTime = false;
            }

            habits[index] = habit;
            saveHabits(habits);
            renderHabits();
        };

        const nameSpan = document.createElement("span");
        nameSpan.textContent = habit.text;

        const timeInfo = document.createElement("div");
        timeInfo.className = "habit-time";
        timeInfo.textContent = habit.completed
            ? `Completed at ${habit.completedAt}`
            : `Target: ${habit.targetTime}`;

        const status = document.createElement("span");
        status.className = "status";
        if (habit.completed) {
            status.textContent = habit.onTime ? "✔" : "✖";
        }

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "🗑";
        deleteBtn.className = "delete-btn";
        deleteBtn.onclick = () => {
            habits.splice(index, 1);
            saveHabits(habits);
            renderHabits();
        };

        li.append(checkbox, nameSpan, timeInfo, status, deleteBtn);
        habitList.appendChild(li);
    });

    updateProgress();
}

function updateProgress() {
    const habits = getHabits();

    if (habits.length === 0) {
        progressFill.style.width = "0%";
        progressPercent.textContent = "0%";
        return;
    }

    const onTimeCount = habits.filter(
        h => h.completed && h.onTime
    ).length;

    const percent = Math.round((onTimeCount / habits.length) * 100);

    progressFill.style.width = percent + "%";
    progressPercent.textContent = percent + "%";
}

function resetHabits() {
    const habits = getHabits();
    saveDaySummary(habits);

    const reset = habits.map(h => ({
        ...h,
        completed: false,
        completedAt: null,
        onTime: false
    }));

    saveHabits(reset);
    renderHabits();
}

/* ---------- AUTO MIDNIGHT RESET ---------- */

function scheduleMidnightReset() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    const timeUntilMidnight = midnight - now;

    setTimeout(() => {
        resetHabits();
        scheduleMidnightReset(); // schedule next reset
    }, timeUntilMidnight);
}

/* ---------- WEEKLY SUMMARY ---------- */

function saveDaySummary(habits) {
    const weekly = JSON.parse(localStorage.getItem("weeklySummary")) || [];

    const onTime = habits.filter(h => h.completed && h.onTime).length;
    const percent = habits.length
        ? Math.round((onTime / habits.length) * 100)
        : 0;

    weekly.push({
        date: new Date().toLocaleDateString("en-IN"),
        percent
    });

    localStorage.setItem("weeklySummary", JSON.stringify(weekly.slice(-7)));
}

function renderWeeklySummary() {
    if (!weeklyList) return;

    const weekly = JSON.parse(localStorage.getItem("weeklySummary")) || [];
    weeklyList.innerHTML = "";

    weekly.forEach(day => {
        const li = document.createElement("li");
        li.className = "weekly-item";
        li.textContent = `${day.date} — ${day.percent}% on-time`;
        weeklyList.appendChild(li);
    });
}

/* ---------- STORAGE ---------- */

function getHabits() {
    return JSON.parse(localStorage.getItem("habits")) || [];
}

function saveHabits(habits) {
    localStorage.setItem("habits", JSON.stringify(habits));
}
