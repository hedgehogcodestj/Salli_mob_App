/* =========================================================
   SALLI
   Shared Expense App

   Groups
   People
   Transactions
   Settlement cycles
   History
========================================================= */


/* =========================================================
   PEOPLE COLORS
========================================================= */

const personColors = [

    {
        main: "#238B57",
        light: "#EAF6EF"
    },

    {
        main: "#E59A16",
        light: "#FFF4D9"
    },

    {
        main: "#E75480",
        light: "#FDEBF1"
    },

    {
        main: "#168F9A",
        light: "#E5F6F7"
    },

    {
        main: "#8064A2",
        light: "#F0EAF7"
    },

    {
        main: "#C56A2D",
        light: "#FAEDE3"
    },

    {
        main: "#4D78B8",
        light: "#EAF0FA"
    },

    {
        main: "#B07A3E",
        light: "#F7EEE3"
    }

];


/* =========================================================
   APP DATA
========================================================= */

/*
    Salli can have MANY groups.

    Example:

    groups
       ├── Roommates
       ├── Trip to Galle
       └── Uni Gals
*/

let groups = [];


/*
    Which group is currently open?
*/

let currentGroupId = null;


/*
    Current expense form
*/

let splitType = "equal";

let selectedPayer = null;


/* =========================================================
   LOAD DATA
========================================================= */

loadData();


/* =========================================================
   START
========================================================= */

renderGroupsPage();


/* =========================================================
   STORAGE
========================================================= */

function saveData() {

    const data = {

        groups: groups,

        currentGroupId:
            currentGroupId

    };


    localStorage.setItem(
        "salliData",
        JSON.stringify(data)
    );

}


function loadData() {

    const saved =
        localStorage.getItem(
            "salliData"
        );


    if (!saved) {

        return;

    }


    try {

        const data =
            JSON.parse(saved);


        groups =
            data.groups || [];


        currentGroupId =
            data.currentGroupId || null;

    }

    catch (error) {

        console.log(
            "Could not load Salli data."
        );

    }

}


/* =========================================================
   GET CURRENT GROUP
========================================================= */

function getCurrentGroup() {

    return groups.find(
        group =>
            group.id === currentGroupId
    );

}


/* =========================================================
   CREATE GROUP
========================================================= */

function createGroup() {

    const name =
        prompt(
            "What should this group be called?"
        );


    if (!name) {

        return;

    }


    const cleanName =
        name.trim();


    if (!cleanName) {

        return;

    }


    const newGroup = {

        id:
            Date.now(),

        name:
            cleanName,

        people: [],

        currentTransactions: [],

        history: []

    };


    groups.push(
        newGroup
    );


    currentGroupId =
        newGroup.id;


    saveData();


    showGroupPage();

}


/* =========================================================
   OPEN GROUP
========================================================= */

function openGroup(groupId) {

    currentGroupId =
        groupId;


    saveData();


    showGroupPage();

}


/* =========================================================
   DELETE / EDIT GROUP
========================================================= */

function editCurrentGroup() {

    const group =
        getCurrentGroup();


    if (!group) {

        return;

    }


    const newName =
        prompt(
            "Rename this group:",
            group.name
        );


    if (!newName) {

        return;

    }


    const cleanName =
        newName.trim();


    if (!cleanName) {

        return;

    }


    group.name =
        cleanName;


    saveData();

    renderGroupPage();

}


/* =========================================================
   GROUP HOME
========================================================= */

function renderGroupsPage() {

    document
        .getElementById(
            "groupsPage"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "groupPage"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "expensePage"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "historyPage"
        )
        .classList.add(
            "hidden"
        );


    const container =
        document.getElementById(
            "groupsList"
        );


    container.innerHTML = "";


    if (
        groups.length === 0
    ) {

        container.innerHTML = `

            <p class="empty-text">
                Create your first group.
            </p>

        `;

        return;

    }


    groups.forEach(
        group => {


            const card =
                document.createElement(
                    "button"
                );


            card.className =
                "group-card";


            card.onclick = () => {

                openGroup(
                    group.id
                );

            };


            const unsettled =
                group
                    .currentTransactions
                    .length;


            const people =
                group.people.length;


            let meta;


            if (
                people === 0
            ) {

                meta =
                    "No people yet";

            }

            else if (
                unsettled === 0
            ) {

                meta =
                    `${people} people · Settled`;

            }

            else {

                meta =
                    `${people} people · ${unsettled} unsettled`;

            }


            card.innerHTML = `

                <div
                    class="group-card-left"
                >

                    <div
                        class="group-card-name"
                    >
                        ${escapeHTML(
                            group.name
                        )}
                    </div>

                    <div
                        class="group-card-meta"
                    >
                        ${meta}
                    </div>

                </div>


                <div
                    class="group-card-arrow"
                >
                    →
                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   SHOW GROUP PAGE
========================================================= */

function showGroupPage() {

    document
        .getElementById(
            "groupsPage"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "expensePage"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "historyPage"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "groupPage"
        )
        .classList.remove(
            "hidden"
        );


    renderGroupPage();

}


/* =========================================================
   SHOW GROUP LIST
========================================================= */

function showGroupsPage() {

    saveData();

    renderGroupsPage();

}


/* =========================================================
   RENDER GROUP
========================================================= */

function renderGroupPage() {

    const group =
        getCurrentGroup();


    if (!group) {

        renderGroupsPage();

        return;

    }


    document
        .getElementById(
            "groupName"
        )
        .textContent =
            group.name;


    renderPeople();

    renderCurrentTransactions();

    renderSettlement();

    renderHistory();

    updateCycleStatus();

}


/* =========================================================
   ADD PERSON
========================================================= */

function addPerson() {

    const group =
        getCurrentGroup();


    if (!group) {

        return;

    }


    const name =
        prompt(
            "Enter the person's name:"
        );


    if (!name) {

        return;

    }


    const cleanName =
        name.trim();


    if (!cleanName) {

        return;

    }


    if (
        group.people.some(
            person =>
                person.name.toLowerCase()
                ===
                cleanName.toLowerCase()
        )
    ) {

        alert(
            "That person is already in this group."
        );

        return;

    }


    const colorIndex =
        group.people.length
        %
        personColors.length;


    group.people.push({

        name:
            cleanName,

        colorIndex:
            colorIndex

    });


    saveData();

    renderGroupPage();

}


/* =========================================================
   REMOVE PERSON
========================================================= */

function removePerson(index) {

    const group =
        getCurrentGroup();


    const person =
        group.people[index];


    const used =
        group.currentTransactions.some(
            transaction => {

                return (

                    transaction.payer
                    ===
                    person.name

                    ||

                    transaction.participants
                        .includes(
                            person.name
                        )

                );

            }
        );


    if (used) {

        alert(
            "This person is already involved in a current expense."
        );

        return;

    }


    const confirmed =
        confirm(
            `Remove ${person.name}?`
        );


    if (!confirmed) {

        return;

    }


    group.people.splice(
        index,
        1
    );


    saveData();

    renderGroupPage();

}


/* =========================================================
   PERSON COLOR
========================================================= */

function getPersonColor(name) {

    const group =
        getCurrentGroup();


    if (!group) {

        return personColors[0];

    }


    const person =
        group.people.find(
            person =>
                person.name === name
        );


    if (!person) {

        return personColors[0];

    }


    return personColors[
        person.colorIndex
        %
        personColors.length
    ];

}


/* =========================================================
   EXPENSE PAGE
========================================================= */

function showExpensePage() {

    const group =
        getCurrentGroup();


    if (!group) {

        return;

    }


    if (
        group.people.length === 0
    ) {

        alert(
            "Add people to this group first."
        );

        return;

    }


    document
        .getElementById(
            "groupPage"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "expensePage"
        )
        .classList.remove(
            "hidden"
        );


    resetExpenseForm();

}


/* =========================================================
   RESET EXPENSE
========================================================= */

function resetExpenseForm() {

    document
        .getElementById(
            "expenseName"
        )
        .value = "";


    document
        .getElementById(
            "expenseAmount"
        )
        .value = "";


    splitType =
        "equal";


    const group =
        getCurrentGroup();


    selectedPayer =
        group.people.length
            ? group.people[0].name
            : null;


    renderPayerOptions();

    renderSelectedPeople();

    updateSplitButtons();

    updateSharePreview();

}


/* =========================================================
   PAYER OPTIONS
========================================================= */

function renderPayerOptions() {

    const container =
        document.getElementById(
            "payerOptions"
        );


    container.innerHTML = "";


    const group =
        getCurrentGroup();


    group.people.forEach(
        person => {


            const colors =
                getPersonColor(
                    person.name
                );


            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "person-choice";


            if (
                selectedPayer
                ===
                person.name
            ) {

                button.classList.add(
                    "active"
                );

            }


            button.style.setProperty(
                "--person-color",
                colors.main
            );


            button.style.setProperty(
                "--person-light",
                colors.light
            );


            button.innerHTML = `

                <span
                    class="person-choice-dot person-dot"
                    style="
                        background:
                        ${colors.main}
                    "
                ></span>

                ${escapeHTML(
                    person.name
                )}

            `;


            button.onclick = () => {

                selectedPayer =
                    person.name;


                renderPayerOptions();

            };


            container.appendChild(
                button
            );

        }
    );

}


/* =========================================================
   SPLIT TYPE
========================================================= */

function selectSplitType(type) {

    splitType =
        type;


    updateSplitButtons();

    renderSelectedPeople();

    updateSharePreview();

}


function updateSplitButtons() {

    const equalButton =
        document.getElementById(
            "equalButton"
        );


    const selectedButton =
        document.getElementById(
            "selectedButton"
        );


    const selectedPeople =
        document.getElementById(
            "selectedPeople"
        );


    if (
        splitType === "equal"
    ) {

        equalButton
            .classList
            .add(
                "active"
            );


        selectedButton
            .classList
            .remove(
                "active"
            );


        selectedPeople
            .classList
            .add(
                "hidden"
            );

    }

    else {

        selectedButton
            .classList
            .add(
                "active"
            );


        equalButton
            .classList
            .remove(
                "active"
            );


        selectedPeople
            .classList
            .remove(
                "hidden"
            );

    }

}


/* =========================================================
   SELECTED PEOPLE
========================================================= */

function renderSelectedPeople() {

    const container =
        document.getElementById(
            "selectedPeople"
        );


    container.innerHTML = "";


    const group =
        getCurrentGroup();


    group.people.forEach(
        person => {


            const colors =
                getPersonColor(
                    person.name
                );


            const row =
                document.createElement(
                    "label"
                );


            row.className =
                "selected-person";


            row.innerHTML = `

                <input
                    type="checkbox"
                    value="${escapeHTML(
                        person.name
                    )}"
                    class="participant-checkbox"
                    onchange="
                        updateSharePreview()
                    "
                >

                <span
                    class="person-dot"
                    style="
                        background:
                        ${colors.main}
                    "
                ></span>

                <span>
                    ${escapeHTML(
                        person.name
                    )}
                </span>

            `;


            container.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   SELECTED PARTICIPANTS
========================================================= */

function getSelectedParticipants() {

    const checkboxes =
        document.querySelectorAll(
            ".participant-checkbox:checked"
        );


    return Array.from(
        checkboxes
    ).map(
        checkbox =>
            checkbox.value
    );

}


/* =========================================================
   SHARE PREVIEW
========================================================= */

function updateSharePreview() {

    const preview =
        document.getElementById(
            "sharePreview"
        );


    const amount =
        parseFloat(
            document
                .getElementById(
                    "expenseAmount"
                )
                .value
        );


    if (
        !amount
        ||
        amount <= 0
    ) {

        preview.classList.add(
            "hidden"
        );

        return;

    }


    const group =
        getCurrentGroup();


    let count;


    if (
        splitType
        ===
        "equal"
    ) {

        count =
            group.people.length;

    }

    else {

        count =
            getSelectedParticipants()
                .length;

    }


    if (
        count === 0
    ) {

        preview.classList.add(
            "hidden"
        );

        return;

    }


    const share =
        amount / count;


    preview.classList.remove(
        "hidden"
    );


    preview.innerHTML = `

        <p class="preview-title">
            EACH PERSON'S SHARE
        </p>

        <p class="preview-share">
            Rs.${share.toFixed(2)}
        </p>

    `;

}


/* =========================================================
   SAVE EXPENSE
========================================================= */

function saveExpense() {

    const group =
        getCurrentGroup();


    const name =
        document
            .getElementById(
                "expenseName"
            )
            .value
            .trim();


    const amount =
        parseFloat(
            document
                .getElementById(
                    "expenseAmount"
                )
                .value
        );


    if (!name) {

        alert(
            "What was the expense?"
        );

        return;

    }


    if (
        !amount
        ||
        amount <= 0
    ) {

        alert(
            "Enter a valid amount."
        );

        return;

    }


    if (!selectedPayer) {

        alert(
            "Choose who spent the money."
        );

        return;

    }


    let participants;


    if (
        splitType
        ===
        "equal"
    ) {

        participants =
            group.people.map(
                person =>
                    person.name
            );

    }

    else {

        participants =
            getSelectedParticipants();


        if (
            participants.length
            ===
            0
        ) {

            alert(
                "Choose at least one person."
            );

            return;

        }

    }


    /*
        Store money in cents.

        Rs.200
        =
        20000 cents
    */

    const amountCents =
        Math.round(
            amount * 100
        );


    const transaction = {

        id:
            Date.now(),

        name:
            name,

        amount:
            amountCents,

        payer:
            selectedPayer,

        splitType:
            splitType,

        participants:
            participants,

        createdAt:
            new Date().toISOString()

    };


    group.currentTransactions.push(
        transaction
    );


    saveData();


    showGroupPage();

}


/* =========================================================
   CURRENT TRANSACTIONS
========================================================= */

function renderCurrentTransactions() {

    const container =
        document.getElementById(
            "currentTransactions"
        );


    container.innerHTML = "";


    const group =
        getCurrentGroup();


    if (
        group.currentTransactions
            .length
        ===
        0
    ) {

        container.innerHTML = `

            <p class="empty-text">
                Nothing here yet.
            </p>

        `;

        return;

    }


    group.currentTransactions.forEach(
        transaction => {


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "transaction-item";


            const payerColor =
                getPersonColor(
                    transaction.payer
                );


            const participantsHTML =
                transaction
                    .participants
                    .map(
                        person => {


                            const color =
                                getPersonColor(
                                    person
                                );


                            return `

                                <span
                                    class="mini-person"
                                >

                                    <span
                                        class="mini-dot"
                                        style="
                                            background:
                                            ${color.main}
                                        "
                                    ></span>

                                    ${escapeHTML(
                                        person
                                    )}

                                </span>

                            `;

                        }
                    )
                    .join("");


            item.innerHTML = `

                <div
                    class="transaction-top"
                >

                    <div>

                        <div
                            class="transaction-name"
                        >
                            ${escapeHTML(
                                transaction.name
                            )}
                        </div>


                        <div
                            class="transaction-payer"
                        >

                            <span
                                class="person-dot"
                                style="
                                    display:
                                    inline-block;
                                    background:
                                    ${payerColor.main};
                                    margin-right:6px;
                                "
                            ></span>

                            Paid by
                            ${escapeHTML(
                                transaction.payer
                            )}

                        </div>

                    </div>


                    <div
                        class="transaction-amount"
                    >
                        Rs.${formatMoney(
                            transaction.amount
                        )}
                    </div>

                </div>


                <div
                    class="transaction-details"
                >

                    ${participantsHTML}

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   BALANCES
========================================================= */

function calculateBalances(
    transactions
) {

    const group =
        getCurrentGroup();


    const balances = {};


    group.people.forEach(
        person => {

            balances[
                person.name
            ] = 0;

        }
    );


    transactions.forEach(
        transaction => {


            /*
                Person who paid receives
                credit for the full amount.
            */

            balances[
                transaction.payer
            ] +=
                transaction.amount;


            const participants =
                transaction.participants;


            /*
                Everyone involved shares
                the transaction equally.
            */

            const baseShare =
                Math.floor(
                    transaction.amount
                    /
                    participants.length
                );


            let remaining =
                transaction.amount
                -
                (
                    baseShare
                    *
                    participants.length
                );


            participants.forEach(
                person => {


                    let share =
                        baseShare;


                    /*
                        Handle leftover cents.
                    */

                    if (
                        remaining > 0
                    ) {

                        share += 1;

                        remaining--;

                    }


                    balances[
                        person
                    ] -=
                        share;

                }
            );

        }
    );


    return balances;

}


/* =========================================================
   SETTLEMENT
========================================================= */

function calculateSettlement(
    transactions
) {

    const balances =
        calculateBalances(
            transactions
        );


    const creditors = [];

    const debtors = [];


    Object.keys(
        balances
    ).forEach(
        person => {


            const balance =
                balances[person];


            if (
                balance > 0
            ) {

                creditors.push({

                    name:
                        person,

                    amount:
                        balance

                });

            }


            else if (
                balance < 0
            ) {

                debtors.push({

                    name:
                        person,

                    amount:
                        Math.abs(
                            balance
                        )

                });

            }

        }
    );


    const settlements = [];


    let debtorIndex = 0;

    let creditorIndex = 0;


    while (

        debtorIndex
        <
        debtors.length

        &&

        creditorIndex
        <
        creditors.length

    ) {


        const debtor =
            debtors[
                debtorIndex
            ];


        const creditor =
            creditors[
                creditorIndex
            ];


        const payment =
            Math.min(
                debtor.amount,
                creditor.amount
            );


        settlements.push({

            from:
                debtor.name,

            to:
                creditor.name,

            amount:
                payment

        });


        debtor.amount -=
            payment;


        creditor.amount -=
            payment;


        if (
            debtor.amount
            ===
            0
        ) {

            debtorIndex++;

        }


        if (
            creditor.amount
            ===
            0
        ) {

            creditorIndex++;

        }

    }


    return settlements;

}


/* =========================================================
   RENDER SETTLEMENT
========================================================= */

function renderSettlement() {

    const group =
        getCurrentGroup();


    const container =
        document.getElementById(
            "settlementList"
        );


    const button =
        document.getElementById(
            "settleButton"
        );


    container.innerHTML = "";


    if (
        group.currentTransactions
            .length
        ===
        0
    ) {

        container.innerHTML = `

            <p class="empty-text dark-empty">
                Add an expense to see
                who owes whom.
            </p>

        `;


        button.classList.add(
            "hidden"
        );


        return;

    }


    const settlements =
        calculateSettlement(
            group.currentTransactions
        );


    if (
        settlements.length
        ===
        0
    ) {

        container.innerHTML = `

            <p class="empty-text dark-empty">
                Everyone is settled.
            </p>

        `;

    }

    else {

        settlements.forEach(
            settlement => {


                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "settlement-row";


                row.innerHTML = `

                    <span>
                        ${personHTML(
                            settlement.from
                        )}
                    </span>


                    <span
                        class="settlement-arrow"
                    >
                        →
                    </span>


                    <span>
                        ${personHTML(
                            settlement.to
                        )}
                    </span>


                    <span
                        class="settlement-amount"
                    >
                        Rs.${formatMoney(
                            settlement.amount
                        )}
                    </span>

                `;


                container.appendChild(
                    row
                );

            }
        );

    }


    button.classList.remove(
        "hidden"
    );

}


/* =========================================================
   MARK CURRENT CYCLE AS SETTLED
========================================================= */

function settleCurrentCycle() {

    const group =
        getCurrentGroup();


    if (
        group.currentTransactions
            .length
        ===
        0
    ) {

        return;

    }


    const settlements =
        calculateSettlement(
            group.currentTransactions
        );


    const confirmed =
        confirm(
            "Mark this cycle as settled?"
        );


    if (!confirmed) {

        return;

    }


    /*
        Save the whole current cycle
        into history.
    */

    group.history.unshift({

        id:
            Date.now(),

        date:
            formatDate(
                new Date()
            ),

        transactions:
            [
                ...group.currentTransactions
            ],

        settlements:
            settlements,

        settledAt:
            new Date().toISOString()

    });


    /*
        IMPORTANT:

        This is what gives you
        a fresh new cycle.

        Yesterday's transactions
        no longer participate.
    */

    group.currentTransactions = [];


    saveData();

    renderGroupPage();

}


/* =========================================================
   HISTORY
========================================================= */

function renderHistory() {

    const group =
        getCurrentGroup();


    const container =
        document.getElementById(
            "historyList"
        );


    container.innerHTML = "";


    if (
        group.history.length
        ===
        0
    ) {

        container.innerHTML = `

            <p class="empty-text">
                Settled cycles will appear here.
            </p>

        `;

        return;

    }


    group.history.forEach(
        (cycle, index) => {


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "history-item";


            item.onclick = () => {

                showHistory(index);

            };


            item.innerHTML = `

                <div
                    class="history-item-top"
                >

                    <div>

                        <div
                            class="history-date"
                        >
                            ${escapeHTML(
                                cycle.date
                            )}
                        </div>


                        <div
                            class="history-meta"
                        >
                            ${cycle.transactions.length}
                            transaction${
                                cycle.transactions.length
                                ===
                                1
                                    ? ""
                                    : "s"
                            }
                            · Settled
                        </div>

                    </div>


                    <div
                        class="history-arrow"
                    >
                        →
                    </div>

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   SHOW HISTORY DETAIL
========================================================= */

function showHistory(index) {

    const group =
        getCurrentGroup();


    const cycle =
        group.history[index];


    document
        .getElementById(
            "groupPage"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "historyPage"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "historyTitle"
        )
        .textContent =
            cycle.date;


    const container =
        document.getElementById(
            "historyDetail"
        );


    container.innerHTML = "";


    /* ---------------------------------------
       SETTLEMENT
    --------------------------------------- */

    const settlementSection =
        document.createElement(
            "section"
        );


    settlementSection.className =
        "history-detail-section";


    settlementSection.innerHTML = `

        <p class="section-label">
            SETTLEMENT
        </p>

    `;


    cycle.settlements.forEach(
        settlement => {


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "settlement-row";


            row.innerHTML = `

                <span>
                    ${personHTML(
                        settlement.from
                    )}
                </span>

                <span
                    class="settlement-arrow"
                >
                    →
                </span>

                <span>
                    ${personHTML(
                        settlement.to
                    )}
                </span>

                <span
                    class="settlement-amount"
                >
                    Rs.${formatMoney(
                        settlement.amount
                    )}
                </span>

            `;


            settlementSection.appendChild(
                row
            );

        }
    );


    container.appendChild(
        settlementSection
    );


    /* ---------------------------------------
       TRANSACTIONS
    --------------------------------------- */

    const transactionSection =
        document.createElement(
            "section"
        );


    transactionSection.className =
        "history-detail-section";


    transactionSection.innerHTML = `

        <p class="section-label">
            TRANSACTIONS
        </p>

    `;


    cycle.transactions.forEach(
        transaction => {


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "transaction-item";


            const payerColor =
                getPersonColor(
                    transaction.payer
                );


            const participantHTML =
                transaction
                    .participants
                    .map(
                        person => {


                            const color =
                                getPersonColor(
                                    person
                                );


                            return `

                                <span
                                    class="mini-person"
                                >

                                    <span
                                        class="mini-dot"
                                        style="
                                            background:
                                            ${color.main}
                                        "
                                    ></span>

                                    ${escapeHTML(
                                        person
                                    )}

                                </span>

                            `;

                        }
                    )
                    .join("");


            item.innerHTML = `

                <div
                    class="transaction-top"
                >

                    <div>

                        <div
                            class="transaction-name"
                        >
                            ${escapeHTML(
                                transaction.name
                            )}
                        </div>


                        <div
                            class="transaction-payer"
                        >

                            <span
                                class="person-dot"
                                style="
                                    display:
                                    inline-block;
                                    background:
                                    ${payerColor.main};
                                    margin-right:6px;
                                "
                            ></span>

                            Paid by
                            ${escapeHTML(
                                transaction.payer
                            )}

                        </div>

                    </div>


                    <div
                        class="transaction-amount"
                    >
                        Rs.${formatMoney(
                            transaction.amount
                        )}
                    </div>

                </div>


                <div
                    class="transaction-details"
                >

                    ${participantHTML}

                </div>

            `;


            transactionSection.appendChild(
                item
            );

        }
    );


    container.appendChild(
        transactionSection
    );

}


/* =========================================================
   STATUS
========================================================= */

function updateCycleStatus() {

    const group =
        getCurrentGroup();


    const status =
        document.getElementById(
            "cycleStatus"
        );


    const count =
        group.currentTransactions.length;


    if (
        count === 0
    ) {

        status.textContent =
            "No unsettled expenses";

        return;

    }


    status.textContent =
        `${count} unsettled expense`
        +
        (
            count === 1
                ? ""
                : "s"
        );

}


/* =========================================================
   PERSON HTML
========================================================= */

function personHTML(name) {

    const color =
        getPersonColor(name);


    return `

        <span
            style="
                display:inline-flex;
                align-items:center;
                gap:6px;
            "
        >

            <span
                style="
                    width:8px;
                    height:8px;
                    border-radius:50%;
                    background:${color.main};
                    display:inline-block;
                "
            ></span>

            ${escapeHTML(name)}

        </span>

    `;

}


/* =========================================================
   MONEY
========================================================= */

function formatMoney(cents) {

    return (
        cents / 100
    ).toFixed(2);

}


/* =========================================================
   DATE
========================================================= */

function formatDate(date) {

    return date.toLocaleDateString(
        "en-GB",
        {
            day:
                "numeric",

            month:
                "long",

            year:
                "numeric"
        }
    );

}


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}